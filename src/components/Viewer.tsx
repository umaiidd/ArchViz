// Viewer.tsx
"use client";

import Apartment3D from "./Apartment3D";

import dynamic from "next/dynamic";

const PanoramaViewer = dynamic(() => import("./panorama/PanoramaViewer"), {
  ssr: false,
});

const BalconyViewer = dynamic(() => import("./BalconyViewer"), {
  ssr: false,
});

const Room3DViewer = dynamic(() => import("./Room3DViewer"), {
  ssr: false,
});

interface Props {
  view: "3d" | "tour" | "balcony" | "room3d";
}

export default function Viewer({ view }: Props) {
  return (
    <section className="flex-1 bg-neutral-950">

      {view === "3d" && <Apartment3D />}

      {view === "tour" && <PanoramaViewer />}

      {view === "balcony" && <BalconyViewer />}

      {view === "room3d" && <Room3DViewer />}

    </section>
  );
}