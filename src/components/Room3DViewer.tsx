"use client";

import { useEffect, useRef, useState } from "react";
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

export default function Room3DViewer() {
  const [frame, setFrame] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

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
    let loadedImages = 0;

    room3dFrames.forEach((src) => {
      const img = new Image();

      img.src = src;

      const markLoaded = () => {
        loadedImages++;

        if (loadedImages === ROOM3D_TOTAL_FRAMES) {
          setLoaded(true);
        }
      };

      img.onload = markLoaded;
      img.onerror = markLoaded;
    });
  }, []);

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
      ((nextFrame % ROOM3D_TOTAL_FRAMES) +
        ROOM3D_TOTAL_FRAMES) %
      ROOM3D_TOTAL_FRAMES;

    setFrame(nextFrame);
  };

  useEffect(() => {
    const animate = () => {
      if (
        !dragging.current &&
        Math.abs(velocity.current) > 0.01
      ) {
        setFrame((prev) => {
          let next = prev + velocity.current;

          next =
            ((next % ROOM3D_TOTAL_FRAMES) +
              ROOM3D_TOTAL_FRAMES) %
            ROOM3D_TOTAL_FRAMES;

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
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const heading = (frame / ROOM3D_TOTAL_FRAMES) * 360;

  return (
    <div
      className={`relative flex h-full w-full items-center justify-center overflow-hidden bg-black select-none ${
        isDragging ? "cursor-grabbing" : "cursor-grab"
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
        lastFrame.current = frame;

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
      <div className="absolute top-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-6 rounded-full bg-black/70 px-6 py-2 text-sm font-semibold tracking-widest text-white">
        <span className="text-neutral-400">
          {directionForHeading(
            (heading - 45 + 360) % 360
          )}
        </span>
        <span className="text-base text-white">
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
      <img
        src={room3dFrames[frame]}
        draggable={false}
        alt="3D Room"
        className={`max-h-full max-w-full object-contain transition-opacity duration-200 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
      />

      <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 rounded-lg bg-black/70 px-4 py-2 text-sm text-white">
        Drag to rotate
      </div>
    </div>
  );
}
