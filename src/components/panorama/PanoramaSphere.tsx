"use client";

import { useMemo } from "react";
import { useLoader } from "@react-three/fiber";
import * as THREE from "three";

interface Props {
  image: string;
}

export default function PanoramaSphere({ image }: Props) {
  const rawTexture = useLoader(
    THREE.TextureLoader,
    image
  );

  const texture = useMemo(() => {
    const clone = rawTexture.clone();

    clone.colorSpace = THREE.SRGBColorSpace;
    clone.flipY = true;
    clone.needsUpdate = true;

    return clone;
  }, [rawTexture]);

  return (
    <mesh rotation={[0, Math.PI, 0]} scale={[-1, 1, 1]}>
      <sphereGeometry args={[500, 64, 64]} />
      <meshBasicMaterial
        map={texture}
        side={THREE.BackSide}
      />
    </mesh>
  );
}