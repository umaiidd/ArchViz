"use client";

import { Html } from "@react-three/drei";
import * as THREE from "three";

interface Props {
  yaw: number;
  pitch: number;
  label: string;
  onClick: () => void;
}

export default function Hotspot({
  yaw,
  pitch,
  label,
  onClick,
}: Props) {
    const radius = 480;

const phi = THREE.MathUtils.degToRad(90 - pitch);
const theta = THREE.MathUtils.degToRad(yaw);

const position: [number, number, number] = [
  radius * Math.sin(phi) * Math.sin(theta),
  radius * Math.cos(phi),
  radius * Math.sin(phi) * Math.cos(theta),
];
  return (
    <Html position={position} center>
      <div className="flex flex-col items-center">
        <button
          onClick={onClick}
          className="cursor-pointer border-0 bg-transparent p-0"
        >
          <img
            src="/assets/icons/marker_icon.png"
            alt={label}
            width={48}
            height={48}
            draggable={false}
            className="cursor-pointer transition-all duration-300 hover:scale-125 hover:-translate-y-1 active:scale-95"
          />
        </button>

        <div className="mt-2 rounded bg-black/70 px-2 py-1 text-xs text-white">
          {label}
        </div>
      </div>
    </Html>
  );
}