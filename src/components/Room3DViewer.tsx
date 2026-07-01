"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  room3dFrames,
  ROOM3D_TOTAL_FRAMES,
} from "@/data/room3dFrames";

const COMPASS_DIRECTIONS = [
  "N",
  "NE",
  "E",
  "SE",
  "S",
  "SW",
  "W",
  "NW",
];

function directionForHeading(heading: number) {
  const index =
    Math.round(heading / 45) % COMPASS_DIRECTIONS.length;

  return COMPASS_DIRECTIONS[index];
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

export default function Room3DViewer() {
  const [heading, setHeading] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(
    null
  );

  const preloadedImages = useRef<HTMLImageElement[]>([]);

  const frameRef = useRef(0);

  const dragging = useRef(false);

  const startX = useRef(0);
  const lastFrame = useRef(0);

  const lastX = useRef(0);
  const lastTime = useRef(0);

  const velocity = useRef(0);
  const animationRef = useRef<number | undefined>(
    undefined
  );

  const drawFrame = useCallback((frame: number) => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    const img = preloadedImages.current[frame];

    if (!canvas || !ctx || !img) return;

    drawContain(
      ctx,
      img,
      canvas.clientWidth,
      canvas.clientHeight
    );
  }, []);

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

      drawFrame(frameRef.current);
    };

    resize();

    const observer = new ResizeObserver(resize);
    observer.observe(container);

    return () => observer.disconnect();
  }, [drawFrame]);

  useEffect(() => {
    let loadedImages = 0;
    const images: HTMLImageElement[] = [];

    room3dFrames.forEach((src, i) => {
      const img = new Image();

      img.src = src;
      images[i] = img;

      const markLoaded = () => {
        loadedImages++;

        if (loadedImages === ROOM3D_TOTAL_FRAMES) {
          setLoaded(true);
          drawFrame(frameRef.current);
        }
      };

      img.decode().then(markLoaded).catch(markLoaded);
    });

    preloadedImages.current = images;
  }, [drawFrame]);

  const applyFrame = useCallback(
    (nextFrame: number) => {
      frameRef.current = nextFrame;
      drawFrame(nextFrame);

      setHeading(
        (nextFrame / ROOM3D_TOTAL_FRAMES) * 360
      );
    },
    [drawFrame]
  );

  const sensitivity = 10;

  const updateFrame = (clientX: number) => {
    if (!dragging.current) return;

    const now = performance.now();

    const dx = clientX - lastX.current;
    const dt = Math.max(now - lastTime.current, 1);

    velocity.current = ((dx / dt) * 1.2) / sensitivity;

    lastX.current = clientX;
    lastTime.current = now;

    const delta = clientX - startX.current;

    let nextFrame =
      lastFrame.current +
      Math.floor(delta / sensitivity);

    nextFrame =
      ((nextFrame % ROOM3D_TOTAL_FRAMES) +
        ROOM3D_TOTAL_FRAMES) %
      ROOM3D_TOTAL_FRAMES;

    applyFrame(nextFrame);
  };

  useEffect(() => {
    const animate = () => {
      if (
        !dragging.current &&
        Math.abs(velocity.current) > 0.01
      ) {
        let next = frameRef.current + velocity.current;

        next =
          ((next % ROOM3D_TOTAL_FRAMES) +
            ROOM3D_TOTAL_FRAMES) %
          ROOM3D_TOTAL_FRAMES;

        applyFrame(Math.round(next));

        velocity.current *= 0.92;
      }

      animationRef.current =
        requestAnimationFrame(animate);
    };

    animationRef.current =
      requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [applyFrame]);

  return (
    <div
      ref={containerRef}
      className={`relative flex h-full w-full touch-none items-center justify-center overflow-hidden bg-black select-none ${
        isDragging ? "cursor-grabbing" : "cursor-grab"
      }`}
      onMouseDown={(e) => {
        dragging.current = true;
        setIsDragging(true);

        velocity.current = 0;

        startX.current = e.clientX;
        lastFrame.current = frameRef.current;

        lastX.current = e.clientX;
        lastTime.current = performance.now();
      }}
      onMouseMove={(e) => updateFrame(e.clientX)}
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

        startX.current = e.touches[0].clientX;
        lastFrame.current = frameRef.current;

        lastX.current = e.touches[0].clientX;
        lastTime.current = performance.now();
      }}
      onTouchMove={(e) => updateFrame(e.touches[0].clientX)}
      onTouchEnd={() => {
        dragging.current = false;
        setIsDragging(false);
      }}
    >
      {/* Compass Dial */}
      <div className="absolute top-2 left-1/2 z-20 flex -translate-x-1/2 items-center gap-3 rounded-full bg-black/70 px-4 py-1.5 text-xs font-semibold tracking-widest text-white sm:top-4 sm:gap-6 sm:px-6 sm:py-2 sm:text-sm">
        <span className="text-neutral-400">
          {directionForHeading(
            (heading - 45 + 360) % 360
          )}
        </span>
        <span className="text-sm text-white sm:text-base">
          {directionForHeading(heading)}
        </span>
        <span className="text-neutral-400">
          {directionForHeading((heading + 45) % 360)}
        </span>
      </div>

      {/* Loading */}
      {!loaded && (
        <div className="absolute z-10 flex flex-col items-center gap-4 text-white">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-white border-t-transparent" />
          <p className="text-lg font-medium">
            Loading Room...
          </p>
        </div>
      )}

      {/* Room */}
      <canvas
        ref={canvasRef}
        className={`h-full w-full transition-opacity duration-200 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
      />

      <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 rounded-lg bg-black/70 px-4 py-2 text-sm text-white">
        Drag to rotate
      </div>
    </div>
  );
}
