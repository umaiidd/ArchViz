"use client";

import {
  Building2,
  Box,
  Camera,
  LayoutGrid,
} from "lucide-react";

import { ViewType } from "@/app/page";

interface Props {
  view: ViewType;
  setView: (view: ViewType) => void;
}

export default function Sidebar({
  view,
  setView,
}: Props) {
  const menu = [
    {
      id: "3d",
      label: "Apartment 3D",
      icon: Box,
    },
    {
      id: "tour",
      label: "Apartment Tour",
      icon: Camera,
    },
    {
      id: "balcony",
      label: "Balcony",
      icon: Building2,
    },
    {
      id: "room3d",
      label: "Room 3D",
      icon: LayoutGrid,
    },
  ] as const;

  return (
    <aside className="z-30 flex shrink-0 flex-col bg-[#0B0B0B] text-white md:w-72">

      {/* Logo */}
      <div className="hidden border-b border-neutral-800 p-6 md:block">
        <h1 className="text-3xl font-bold tracking-wide">
          ArchViz
        </h1>
      </div>

      {/* Menu */}
      <div className="flex gap-1 p-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] md:flex-col md:gap-3 md:p-5">
        {menu.map((item) => {
          const Icon = item.icon;

          const active = view === item.id;

          return (
            <button
              key={item.id}
              onClick={() =>
                setView(item.id as ViewType)
              }
              className={`flex flex-1 flex-col items-center gap-1 rounded-xl p-2 text-center transition-all duration-300 md:flex-none md:flex-row md:gap-4 md:p-4 md:text-left ${
                active
                  ? "bg-white text-black shadow-lg"
                  : "bg-neutral-900 hover:bg-neutral-800"
              }`}
            >
              <Icon size={20} className="shrink-0 md:size-5.5" />

              <span className="text-[11px] font-medium leading-tight md:text-base">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-auto hidden border-t border-neutral-800 p-5 text-xs text-neutral-500 md:block">
        ArchViz &copy; 2026. All rights reserved.
      </div>

    </aside>
  );
}