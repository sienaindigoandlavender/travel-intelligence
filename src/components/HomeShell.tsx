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
  loadError: string | null;
};

export function HomeShell({ riads, accessToken, loadError }: HomeShellProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleSelect = (id: string) => {
    setSelectedId(id ? id : null);
  };

  const mapPanel = (() => {
    if (!accessToken) return <MissingTokenNotice />;
    if (loadError) return <SupabaseErrorNotice message={loadError} />;
    if (riads.length === 0) return <EmptyNotice />;
    return (
      <MapView
        riads={riads}
        selectedId={selectedId}
        onSelect={handleSelect}
        accessToken={accessToken}
      />
    );
  })();

  return (
    <div className="flex h-dvh w-full flex-col md:flex-row">
      <Sidebar
        riads={riads}
        selectedId={selectedId}
        onSelect={handleSelect}
      />
      <main className="relative flex-1 min-h-[60vh]">{mapPanel}</main>
    </div>
  );
}

function Notice({
  tone,
  title,
  children,
}: {
  tone: "amber" | "rose" | "zinc";
  title: string;
  children: React.ReactNode;
}) {
  const palette = {
    amber: "border-amber-200 bg-amber-50 text-amber-900",
    rose: "border-rose-200 bg-rose-50 text-rose-900",
    zinc: "border-zinc-200 bg-zinc-50 text-zinc-700",
  }[tone];
  return (
    <div className="flex h-full w-full items-center justify-center bg-zinc-50 p-6">
      <div className={`max-w-md rounded-lg border p-5 text-sm ${palette}`}>
        <p className="font-semibold">{title}</p>
        <div className="mt-1">{children}</div>
      </div>
    </div>
  );
}

function MissingTokenNotice() {
  return (
    <Notice tone="amber" title="Mapbox token missing">
      <p>
        Set{" "}
        <code className="rounded bg-amber-100 px-1 py-0.5 font-mono text-xs">
          NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
        </code>{" "}
        in a local{" "}
        <code className="rounded bg-amber-100 px-1 py-0.5 font-mono text-xs">
          .env.local
        </code>{" "}
        or in your Vercel project environment variables, then reload.
      </p>
    </Notice>
  );
}

function SupabaseErrorNotice({ message }: { message: string }) {
  return (
    <Notice tone="rose" title="Could not load riads from Supabase">
      <p className="break-words">{message}</p>
      <p className="mt-2 text-xs opacity-80">
        Check <code>NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
        <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> and that RLS on{" "}
        <code>tripadvisor_listings_raw</code> allows reads.
      </p>
    </Notice>
  );
}

function EmptyNotice() {
  return (
    <Notice tone="zinc" title="No riads with coordinates yet">
      <p>
        None of the tracked riads have <code>latitude</code> /{" "}
        <code>longitude</code> in <code>tripadvisor_listings_raw</code>. Run{" "}
        <code className="rounded bg-zinc-200 px-1 py-0.5 font-mono text-xs">
          npm run geocode
        </code>{" "}
        to populate them, then reload.
      </p>
    </Notice>
  );
}
