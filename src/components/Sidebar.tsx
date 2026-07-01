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
    <aside className="flex w-72 flex-col bg-[#0B0B0B] text-white">

      {/* Logo */}
      <div className="border-b border-neutral-800 p-6">
        <h1 className="text-3xl font-bold tracking-wide">
          ArchViz
        </h1>
      </div>

      {/* Menu */}
      <div className="flex flex-col gap-3 p-5">
        {menu.map((item) => {
          const Icon = item.icon;

          const active = view === item.id;

          return (
            <button
              key={item.id}
              onClick={() =>
                setView(item.id as ViewType)
              }
              className={`flex items-center gap-4 rounded-xl p-4 text-left transition-all duration-300 ${
                active
                  ? "bg-white text-black shadow-lg"
                  : "bg-neutral-900 hover:bg-neutral-800"
              }`}
            >
              <Icon size={22} />

              <span className="font-medium">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-auto border-t border-neutral-800 p-5 text-xs text-neutral-500">
        ArchViz &copy; 2026. All rights reserved.
      </div>

    </aside>
  );
}