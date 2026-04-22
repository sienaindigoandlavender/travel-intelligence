"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

import { Sidebar } from "@/components/Sidebar";
import type { Riad } from "@/lib/riads";

const MapView = dynamic(
  () => import("@/components/MapView").then((m) => m.MapView),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-zinc-50 text-sm text-zinc-500">
        Loading map…
      </div>
    ),
  },
);

type HomeShellProps = {
  riads: Riad[];
  accessToken: string | null;
};

export function HomeShell({ riads, accessToken }: HomeShellProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleSelect = (id: string) => {
    setSelectedId(id ? id : null);
  };

  return (
    <div className="flex h-dvh w-full flex-col md:flex-row">
      <Sidebar
        riads={riads}
        selectedId={selectedId}
        onSelect={handleSelect}
      />
      <main className="relative flex-1 min-h-[60vh]">
        {accessToken ? (
          <MapView
            riads={riads}
            selectedId={selectedId}
            onSelect={handleSelect}
            accessToken={accessToken}
          />
        ) : (
          <MissingTokenNotice />
        )}
      </main>
    </div>
  );
}

function MissingTokenNotice() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-zinc-50 p-6">
      <div className="max-w-md rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
        <p className="font-semibold">Mapbox token missing</p>
        <p className="mt-1 text-amber-800">
          Set{" "}
          <code className="rounded bg-amber-100 px-1 py-0.5 font-mono text-xs">
            NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
          </code>{" "}
          in a local{" "}
          <code className="rounded bg-amber-100 px-1 py-0.5 font-mono text-xs">
            .env.local
          </code>{" "}
          (see{" "}
          <code className="rounded bg-amber-100 px-1 py-0.5 font-mono text-xs">
            .env.example
          </code>
          ) or in your Vercel project environment variables, then reload.
        </p>
      </div>
    </div>
  );
}
