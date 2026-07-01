"use client";

import { Suspense, useState } from "react";
import { Canvas, useLoader } from "@react-three/fiber";
import * as THREE from "three";

import PanoramaSphere from "./panorama/PanoramaSphere";
import CameraController from "./panorama/CameraController";

const BALCONY_DAY = "/assets/panoramas/balcony_day.avif";
const BALCONY_NIGHT = "/assets/panoramas/balcony_night.avif";

useLoader.preload(THREE.TextureLoader, BALCONY_DAY);
useLoader.preload(THREE.TextureLoader, BALCONY_NIGHT);

export default function BalconyViewer() {
  const [mode, setMode] = useState<"day" | "night">("day");

  const image = mode === "day" ? BALCONY_DAY : BALCONY_NIGHT;

  return (
    <div className="relative h-full w-full touch-none select-none bg-black">
      <Canvas
        camera={{
          position: [0, 0, 0.1],
          fov: 75,
        }}
      >
        <Suspense fallback={null}>
          <PanoramaSphere image={image} />
          <CameraController />
        </Suspense>
      </Canvas>

      <button
        onClick={() =>
          setMode(mode === "day" ? "night" : "day")
        }
        className="absolute right-2 top-2 rounded-lg bg-black/70 px-3 py-1.5 text-sm text-white transition hover:bg-black/90 sm:right-4 sm:top-4 sm:px-4 sm:py-2 sm:text-base"
      >
        {mode === "day" ? "☀️ Day" : "🌙 Night"}
      </button>
    </div>
  );
}
