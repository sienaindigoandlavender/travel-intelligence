"use client";

import type { Riad } from "@/lib/riads";

type SidebarProps = {
  riads: Riad[];
  selectedId: string | null;
  onSelect: (id: string) => void;
};

export function Sidebar({ riads, selectedId, onSelect }: SidebarProps) {
  return (
    <aside className="flex h-full w-full flex-col border-b border-zinc-200 bg-white md:w-80 md:border-b-0 md:border-r">
      <header className="border-b border-zinc-200 px-5 py-4">
        <h1 className="text-base font-semibold tracking-tight text-zinc-900">
          Marrakech riads
        </h1>
        <p className="mt-0.5 text-xs text-zinc-500">
          {riads.length} properties
        </p>
      </header>

      <ul className="flex-1 overflow-y-auto">
        {riads.map((riad) => {
          const isSelected = riad.id === selectedId;
          return (
            <li key={riad.id}>
              <button
                type="button"
                onClick={() => onSelect(riad.id)}
                aria-current={isSelected ? "true" : undefined}
                className={`w-full border-b border-zinc-100 px-5 py-3 text-left transition-colors ${
                  isSelected
                    ? "bg-zinc-900 text-white"
                    : "bg-white text-zinc-900 hover:bg-zinc-50"
                }`}
              >
                <span className="block text-sm font-medium">{riad.name}</span>
                <span
                  className={`mt-0.5 block text-xs ${
                    isSelected ? "text-zinc-300" : "text-zinc-500"
                  }`}
                >
                  Tripadvisor ID {riad.externalId}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
