"use client";

import { useEffect, useRef, useState } from "react";
import {
  frames,
  TOTAL_FRAMES,
  TimeOfDay,
} from "@/data/frames";

export default function Apartment3D() {
  const [frame, setFrame] = useState(0);
  const [timeOfDay, setTimeOfDay] =
    useState<TimeOfDay>("day");
  const [loadedTimeOfDay, setLoadedTimeOfDay] =
    useState<TimeOfDay | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const loaded = loadedTimeOfDay === timeOfDay;

  const dragging = useRef(false);

  const startX = useRef(0);
  const lastFrame = useRef(0);

  const lastX = useRef(0);
  const lastTime = useRef(0);

  const velocity = useRef(0);
  const animationRef = useRef<number | undefined>(
    undefined
  );

  useEffect(() => {
    let cancelled = false;
    let loadedImages = 0;

    frames[timeOfDay].forEach((src) => {
      const img = new Image();

      img.src = src;

      const markLoaded = () => {
        loadedImages++;

        if (loadedImages === TOTAL_FRAMES && !cancelled) {
          setLoadedTimeOfDay(timeOfDay);
        }
      };

      img.onload = markLoaded;
      img.onerror = markLoaded;
    });

    return () => {
      cancelled = true;
    };
  }, [timeOfDay]);

  const updateFrame = (clientX: number) => {
    if (!dragging.current) return;

    const now = performance.now();

    const dx = clientX - lastX.current;
    const dt = Math.max(now - lastTime.current, 1);

    velocity.current = (dx / dt) * 1.2;

    lastX.current = clientX;
    lastTime.current = now;

    const sensitivity = 10;

    const delta = clientX - startX.current;

    let nextFrame =
      lastFrame.current +
      Math.floor(delta / sensitivity);

    nextFrame =
      ((nextFrame % TOTAL_FRAMES) +
        TOTAL_FRAMES) %
      TOTAL_FRAMES;

    setFrame(nextFrame);
  };

  useEffect(() => {
    const animate = () => {
      if (
        !dragging.current &&
        Math.abs(velocity.current) > 0.01
      ) {
        setFrame((prev) => {
          let next =
            prev + velocity.current;

          next =
            ((next % TOTAL_FRAMES) +
              TOTAL_FRAMES) %
            TOTAL_FRAMES;

          return Math.round(next);
        });

        velocity.current *= 0.92;
      }

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
  }, []);

  return (
    <div
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
        lastFrame.current = frame;

        lastX.current = e.clientX;
        lastTime.current = performance.now();
      }}
      onMouseMove={(e) =>
        updateFrame(e.clientX)
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

        lastFrame.current = frame;

        lastX.current =
          e.touches[0].clientX;

        lastTime.current = performance.now();
      }}
      onTouchMove={(e) =>
        updateFrame(
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
      <img
        src={frames[timeOfDay][frame]}
        draggable={false}
        alt="Apartment"
        className={`max-h-full max-w-full object-contain transition-opacity duration-200 ${
          loaded
            ? "opacity-100"
            : "opacity-0"
        }`}
      />
    </div>
  );
}