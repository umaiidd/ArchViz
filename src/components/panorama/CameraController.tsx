"use client";

import { useThree, useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";

interface Props {
  onCameraChange?: (yaw: number, pitch: number) => void;
}

export default function CameraController({
  onCameraChange,
}: Props) {
  const { camera, gl } = useThree();

  const isDragging = useRef(false);

  const lon = useRef(0);
  const lat = useRef(0);

  const pointer = useRef({
    x: 0,
    y: 0,
  });

  useEffect(() => {
    const canvas = gl.domElement;

    function down(e: PointerEvent) {
      isDragging.current = true;

      pointer.current.x = e.clientX;
      pointer.current.y = e.clientY;
    }

function up() {
  isDragging.current = false;
}
    function move(e: PointerEvent) {
      if (!isDragging.current) return;

      const dx = e.clientX - pointer.current.x;
      const dy = e.clientY - pointer.current.y;

      pointer.current.x = e.clientX;
      pointer.current.y = e.clientY;

      lon.current -= dx * 0.15;
      lat.current += dy * 0.15;

      lat.current = Math.max(
        -85,
        Math.min(85, lat.current)
      );
    }

    canvas.addEventListener("pointerdown", down);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointermove", move);

    return () => {
      canvas.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointermove", move);
    };
  }, [gl]);

  useFrame(() => {
    const phi = THREE.MathUtils.degToRad(90 - lat.current);
    const theta = THREE.MathUtils.degToRad(lon.current);

camera.lookAt(
  new THREE.Vector3(
    500 * Math.sin(phi) * Math.cos(theta),
    500 * Math.cos(phi),
    500 * Math.sin(phi) * Math.sin(theta)
  )
);

onCameraChange?.(lon.current, lat.current);
  });

  return null;
}