"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  frames,
  TOTAL_FRAMES,
  TimeOfDay,
} from "@/data/frames";

const EASE = 0.18;
const FRICTION = 0.92;

function wrap(value: number, total: number) {
  return ((value % total) + total) % total;
}

function shortestDiff(
  target: number,
  current: number,
  total: number
) {
  let diff = (target - current) % total;

  if (diff > total / 2) diff -= total;
  else if (diff < -total / 2) diff += total;

  return diff;
}

function drawContain(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  canvasWidth: number,
  canvasHeight: number
) {
  if (
    canvasWidth === 0 ||
    canvasHeight === 0 ||
    !img.complete ||
    img.naturalWidth === 0
  ) {
    return;
  }

  const imgRatio = img.naturalWidth / img.naturalHeight;
  const canvasRatio = canvasWidth / canvasHeight;

  let drawWidth: number;
  let drawHeight: number;

  if (imgRatio > canvasRatio) {
    drawWidth = canvasWidth;
    drawHeight = canvasWidth / imgRatio;
  } else {
    drawHeight = canvasHeight;
    drawWidth = canvasHeight * imgRatio;
  }

  const offsetX = (canvasWidth - drawWidth) / 2;
  const offsetY = (canvasHeight - drawHeight) / 2;

  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  ctx.drawImage(
    img,
    offsetX,
    offsetY,
    drawWidth,
    drawHeight
  );
}

export default function Apartment3D() {
  const [timeOfDay, setTimeOfDay] =
    useState<TimeOfDay>("day");
  const [loadedTimeOfDay, setLoadedTimeOfDay] =
    useState<TimeOfDay | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const loaded = loadedTimeOfDay === timeOfDay;

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(
    null
  );

  const preloadedImages = useRef<
    Record<TimeOfDay, HTMLImageElement[]>
  >({ day: [], noon: [], dusk: [], night: [] });

  const timeOfDayRef = useRef<TimeOfDay>("day");

  // Where the pointer wants the rotation to be.
  const targetFrame = useRef(0);
  // What is actually drawn each tick, easing toward targetFrame.
  const currentFrame = useRef(0);
  // Carries momentum into targetFrame after release.
  const velocity = useRef(0);

  const dragging = useRef(false);

  const startX = useRef(0);
  const startFrame = useRef(0);

  const lastX = useRef(0);
  const lastTime = useRef(0);

  const animationRef = useRef<number | undefined>(
    undefined
  );

  useEffect(() => {
    timeOfDayRef.current = timeOfDay;
  }, [timeOfDay]);

  const drawFrame = useCallback(
    (time: TimeOfDay, frame: number) => {
      const canvas = canvasRef.current;
      const ctx = ctxRef.current;
      const img = preloadedImages.current[time][frame];

      if (!canvas || !ctx || !img) return;

      drawContain(
        ctx,
        img,
        canvas.clientWidth,
        canvas.clientHeight
      );
    },
    []
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;

    if (!canvas || !container) return;

    ctxRef.current = canvas.getContext("2d");

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const width = container.clientWidth;
      const height = container.clientHeight;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctxRef.current?.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0
      );

      drawFrame(
        timeOfDayRef.current,
        Math.round(currentFrame.current)
      );
    };

    resize();

    const observer = new ResizeObserver(resize);
    observer.observe(container);

    return () => observer.disconnect();
  }, [drawFrame]);

  // Preload + fully decode every frame for the active time of day.
  useEffect(() => {
    let cancelled = false;
    let loadedImages = 0;
    const images: HTMLImageElement[] = [];

    frames[timeOfDay].forEach((src, i) => {
      const img = new Image();

      img.src = src;
      images[i] = img;

      const markLoaded = () => {
        loadedImages++;

        if (loadedImages === TOTAL_FRAMES && !cancelled) {
          setLoadedTimeOfDay(timeOfDay);
        }
      };

      img
        .decode()
        .then(markLoaded)
        .catch(markLoaded);
    });

    preloadedImages.current[timeOfDay] = images;

    return () => {
      cancelled = true;
    };
  }, [timeOfDay]);

  useEffect(() => {
    if (loaded) {
      drawFrame(
        timeOfDay,
        Math.round(currentFrame.current)
      );
    }
  }, [timeOfDay, loaded, drawFrame]);

  const sensitivity = 10;

  const updateTarget = (clientX: number) => {
    if (!dragging.current) return;

    const now = performance.now();

    const dx = clientX - lastX.current;
    const dt = Math.max(now - lastTime.current, 1);

    velocity.current = ((dx / dt) * 1.2) / sensitivity;

    lastX.current = clientX;
    lastTime.current = now;

    const delta = clientX - startX.current;

    targetFrame.current = wrap(
      startFrame.current + delta / sensitivity,
      TOTAL_FRAMES
    );
  };

  // Animation-driven render loop: always running, decoupled from
  // pointer events. currentFrame eases toward targetFrame every
  // tick; momentum after release just keeps nudging targetFrame.
  useEffect(() => {
    const animate = () => {
      if (
        !dragging.current &&
        Math.abs(velocity.current) > 0.001
      ) {
        targetFrame.current = wrap(
          targetFrame.current + velocity.current,
          TOTAL_FRAMES
        );

        velocity.current *= FRICTION;
      }

      const diff = shortestDiff(
        targetFrame.current,
        currentFrame.current,
        TOTAL_FRAMES
      );

      currentFrame.current = wrap(
        currentFrame.current + diff * EASE,
        TOTAL_FRAMES
      );

      const frameIndex =
        Math.round(currentFrame.current) %
        TOTAL_FRAMES;

      drawFrame(timeOfDayRef.current, frameIndex);

      animationRef.current =
        requestAnimationFrame(animate);
    };

    animationRef.current =
      requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(
          animationRef.current
        );
      }
    };
  }, [drawFrame]);

  return (
    <div
      ref={containerRef}
      className={`relative flex h-full w-full touch-none items-center justify-center overflow-hidden bg-black select-none ${
        isDragging
          ? "cursor-grabbing"
          : "cursor-grab"
      }`}
      onMouseDown={(e) => {
        dragging.current = true;
        setIsDragging(true);

        velocity.current = 0;

        startX.current = e.clientX;
        startFrame.current = currentFrame.current;
        targetFrame.current = currentFrame.current;

        lastX.current = e.clientX;
        lastTime.current = performance.now();
      }}
      onMouseMove={(e) =>
        updateTarget(e.clientX)
      }
      onMouseUp={() => {
        dragging.current = false;
        setIsDragging(false);
      }}
      onMouseLeave={() => {
        dragging.current = false;
        setIsDragging(false);
      }}
      onTouchStart={(e) => {
        dragging.current = true;
        setIsDragging(true);

        velocity.current = 0;

        startX.current =
          e.touches[0].clientX;

        startFrame.current = currentFrame.current;
        targetFrame.current = currentFrame.current;

        lastX.current =
          e.touches[0].clientX;

        lastTime.current = performance.now();
      }}
      onTouchMove={(e) =>
        updateTarget(
          e.touches[0].clientX
        )
      }
      onTouchEnd={() => {
        dragging.current = false;
        setIsDragging(false);
      }}
    >
      {/* Time Switcher */}
      <div className="absolute right-2 top-2 z-20 flex gap-1 sm:right-4 sm:top-4 sm:gap-2">
        {(
          ["day", "noon", "dusk", "night"] as TimeOfDay[]
        ).map((time) => (
          <button
            key={time}
            onClick={() =>
              setTimeOfDay(time)
            }
            className={`rounded-xl px-2.5 py-1.5 text-xs font-semibold shadow-lg transition-all duration-300 sm:px-5 sm:py-2 sm:text-sm ${
              time === timeOfDay
                ? "bg-white text-black"
                : "bg-black/70 text-white hover:bg-black"
            }`}
          >
            {time.charAt(0).toUpperCase() +
              time.slice(1)}
          </button>
        ))}
      </div>

      {/* Loading */}
      {!loaded && (
        <div className="absolute z-10 flex flex-col items-center gap-4 text-white">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-white border-t-transparent" />
          <p className="text-lg font-medium">
            Loading Apartment...
          </p>
        </div>
      )}

      {/* Apartment */}
      <canvas
        ref={canvasRef}
        className={`h-full w-full transition-opacity duration-200 ${
          loaded
            ? "opacity-100"
            : "opacity-0"
        }`}
      />
    </div>
  );
}
