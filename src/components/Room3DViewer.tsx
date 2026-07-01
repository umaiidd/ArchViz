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

function wrapPosition(position: number) {
  return (
    ((position % ROOM3D_TOTAL_FRAMES) +
      ROOM3D_TOTAL_FRAMES) %
    ROOM3D_TOTAL_FRAMES
  );
}

export default function Room3DViewer() {
  const [frame, setFrame] = useState(0);
  const [blend, setBlend] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const dragging = useRef(false);

  const startX = useRef(0);
  const lastPosition = useRef(0);

  const position = useRef(0);

  const lastX = useRef(0);
  const lastTime = useRef(0);

  const velocity = useRef(0);
  const animationRef = useRef<number | undefined>(
    undefined
  );

  const applyPosition = (nextPosition: number) => {
    const wrapped = wrapPosition(nextPosition);

    position.current = wrapped;

    setFrame(Math.floor(wrapped));
    setBlend(wrapped - Math.floor(wrapped));
  };

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

    applyPosition(lastPosition.current + delta / sensitivity);
  };

  useEffect(() => {
    const animate = () => {
      if (
        !dragging.current &&
        Math.abs(velocity.current) > 0.01
      ) {
        applyPosition(position.current + velocity.current);

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
      className={`relative flex h-full w-full touch-none items-center justify-center overflow-hidden bg-black select-none ${
        isDragging ? "cursor-grabbing" : "cursor-grab"
      }`}
      onMouseDown={(e) => {
        dragging.current = true;
        setIsDragging(true);

        velocity.current = 0;

        startX.current = e.clientX;
        lastPosition.current = position.current;

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
        lastPosition.current = position.current;

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
      <div
        className={`relative h-full w-full transition-opacity duration-200 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
      >
        <img
          src={room3dFrames[frame]}
          draggable={false}
          alt="3D Room"
          className="absolute inset-0 h-full w-full object-contain"
          style={{ opacity: 1 - blend }}
        />

        <img
          src={
            room3dFrames[
              (frame + 1) % ROOM3D_TOTAL_FRAMES
            ]
          }
          draggable={false}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-contain"
          style={{ opacity: blend }}
        />
      </div>

      <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 rounded-lg bg-black/70 px-4 py-2 text-sm text-white">
        Drag to rotate
      </div>
    </div>
  );
}
