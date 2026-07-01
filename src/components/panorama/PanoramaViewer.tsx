"use client";

import { Suspense, useRef, useState } from "react";
import { Canvas, useLoader } from "@react-three/fiber";
import * as THREE from "three";

import { scenes, SceneKey } from "@/data/scenes";

import PanoramaSphere from "./PanoramaSphere";
import CameraController from "./CameraController";
import Hotspot from "./Hotspot";

const BALCONY_DAY = "/assets/panoramas/balcony_day.avif";
const BALCONY_NIGHT = "/assets/panoramas/balcony_night.avif";

useLoader.preload(THREE.TextureLoader, BALCONY_DAY);
useLoader.preload(THREE.TextureLoader, BALCONY_NIGHT);

export default function PanoramaViewer() {
  const DEV_MODE = false;
  const [currentScene, setCurrentScene] =
    useState<SceneKey>("hall");

  const [yaw, setYaw] = useState(0);
  const [pitch, setPitch] = useState(0);

  const [balconyMode, setBalconyMode] =
    useState<"day" | "night">("day");

  const [showBalconyPrompt, setShowBalconyPrompt] =
    useState(false);

  const [isFading, setIsFading] = useState(false);

  const scene =
    currentScene === "balcony"
      ? {
          ...scenes.balcony,
          image:
            balconyMode === "day"
              ? BALCONY_DAY
              : BALCONY_NIGHT,
        }
      : scenes[currentScene];

  const transitionRef = useRef(0);

  const changeScene = (nextScene: SceneKey) => {
    const transitionId = ++transitionRef.current;

    setIsFading(true);

    setTimeout(() => {
      if (transitionRef.current !== transitionId) return;

      setCurrentScene(nextScene);

      setTimeout(() => {
        if (transitionRef.current !== transitionId) return;

        setIsFading(false);
      }, 150);
    }, 250);
  };

  return (
    <div className="relative h-full w-full touch-none select-none bg-black">
      <Canvas
        camera={{
          position: [0, 0, 0.1],
          fov: 75,
        }}
      >
        <Suspense fallback={null}>
          <PanoramaSphere image={scene.image} />

          {scene.hotspots.map((spot) => (
            <Hotspot
              key={spot.id}
              yaw={spot.yaw}
              pitch={spot.pitch}
              label={spot.label}
              onClick={() =>
                spot.target === "balcony"
                  ? setShowBalconyPrompt(true)
                  : changeScene(spot.target)
              }
            />
          ))}

          <CameraController
            onCameraChange={
              DEV_MODE
                ? (y, p) => {
                    setYaw(y);
                    setPitch(p);
                  }
                : undefined
            }
          />
        </Suspense>
      </Canvas>

      {/* Fade Transition */}
      <div
        className={`pointer-events-none absolute inset-0 bg-black transition-opacity duration-300 ${
          isFading ? "opacity-100" : "opacity-0"
        }`}
      />

  {DEV_MODE && (
  <div className="absolute left-4 top-4 rounded-lg bg-black/70 p-3 font-mono text-sm text-white">
    <div>Yaw: {yaw.toFixed(1)}°</div>
    <div>Pitch: {pitch.toFixed(1)}°</div>
    <div>Scene: {currentScene}</div>
  </div>
)}

      {/* Balcony Day / Night Toggle */}
      {currentScene === "balcony" && (
        <button
          onClick={() =>
            setBalconyMode(
              balconyMode === "day" ? "night" : "day"
            )
          }
          className="absolute right-2 top-2 rounded-lg bg-black/70 px-3 py-1.5 text-sm text-white transition hover:bg-black/90 sm:right-4 sm:top-4 sm:px-4 sm:py-2 sm:text-base"
        >
          {balconyMode === "day"
            ? "☀️ Day"
            : "🌙 Night"}
        </button>
      )}

      {/* Balcony Day / Night Prompt */}
      {showBalconyPrompt && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 p-4">
          <div className="flex w-full max-w-xs flex-col items-center gap-4 rounded-2xl bg-black/80 p-6 text-white sm:max-w-none sm:p-8">
            <p className="text-lg font-semibold">
              View Balcony
            </p>

            <div className="flex w-full gap-4 sm:w-auto">
              <button
                onClick={() => {
                  setBalconyMode("day");
                  setShowBalconyPrompt(false);
                  changeScene("balcony");
                }}
                className="flex-1 rounded-xl bg-white px-4 py-3 font-semibold text-black transition hover:bg-neutral-200 sm:flex-none sm:px-6"
              >
                ☀️ Day
              </button>

              <button
                onClick={() => {
                  setBalconyMode("night");
                  setShowBalconyPrompt(false);
                  changeScene("balcony");
                }}
                className="flex-1 rounded-xl bg-neutral-800 px-4 py-3 font-semibold text-white transition hover:bg-neutral-700 sm:flex-none sm:px-6"
              >
                🌙 Night
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}