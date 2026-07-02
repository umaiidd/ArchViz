"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Viewer from "@/components/Viewer";

export type ViewType = "3d" | "tour" | "balcony" | "room3d";

export default function Home() {
  const [view, setView] = useState<ViewType>("3d");

  return (
    <main className="flex h-dvh w-screen flex-col-reverse overflow-hidden bg-neutral-900 md:flex-row">
      <Sidebar view={view} setView={setView} />
      <Viewer view={view} />
    </main>
  );
}