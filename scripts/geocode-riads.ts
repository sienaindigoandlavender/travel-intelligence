/**
 * One-time geocoder for the 5 tracked Marrakech riads.
 *
 * Reads rows from `tripadvisor_listings_raw` (source_name = 'tripadvisor',
 * external_id in the hardcoded list), calls Mapbox forward geocoding v6 with
 * limit=1, and writes latitude/longitude back into the row.
 *
 * Idempotent: skips rows that already have coordinates unless --force is
 * passed on the command line.
 *
 * Usage:
 *   npm run geocode            # skip rows that already have lat/lng
 *   npm run geocode -- --force # re-geocode every row
 *
 * Required env (loaded from .env.local):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY      (preferred; needed to bypass RLS on UPDATE)
 *     or NEXT_PUBLIC_SUPABASE_ANON_KEY as fallback if RLS permits UPDATE
 *   MAPBOX_ACCESS_TOKEN            (or NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN)
 */

import { config as loadEnv } from "dotenv";
import { createClient } from "@supabase/supabase-js";

loadEnv({ path: ".env.local" });
loadEnv({ path: ".env", override: false });

// Keep in sync with RIAD_EXTERNAL_IDS in src/lib/supabase.ts
const RIAD_EXTERNAL_IDS = [
  "858018",
  "1785056",
  "27426915",
  "27701674",
  "652849",
];

type ListingRow = {
  id: string;
  property_name: string | null;
  external_id: string | null;
  address_full: string | null;
  latitude: number | null;
  longitude: number | null;
};

type GeocodeFeature = {
  geometry?: { coordinates?: [number, number] };
  properties?: { full_address?: string; name?: string };
};

type GeocodeResponse = {
  features?: GeocodeFeature[];
  message?: string;
};

function requireEnv(name: string, ...fallbacks: string[]): string {
  for (const key of [name, ...fallbacks]) {
    const value = process.env[key];
    if (value && value.trim().length > 0) return value;
  }
  const shown = [name, ...fallbacks].join(" or ");
  throw new Error(`Missing required env var: ${shown}`);
}

async function geocode(
  query: string,
  token: string,
): Promise<{ lng: number; lat: number; matched: string } | null> {
  const url = new URL("https://api.mapbox.com/search/geocode/v6/forward");
  url.searchParams.set("q", query);
  url.searchParams.set("limit", "1");
  url.searchParams.set("access_token", token);

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Mapbox ${res.status}: ${await res.text()}`);
  }
  const body = (await res.json()) as GeocodeResponse;
  const feature = body.features?.[0];
  const coords = feature?.geometry?.coordinates;
  if (!coords || coords.length !== 2) return null;
  const [lng, lat] = coords;
  const matched =
    feature?.properties?.full_address ?? feature?.properties?.name ?? query;
  return { lng, lat, matched };
}

async function main() {
  const force = process.argv.includes("--force");

  const supabaseUrl = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  const supabaseKey = requireEnv(
    "SUPABASE_SERVICE_ROLE_KEY",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  );
  const mapboxToken = requireEnv(
    "MAPBOX_ACCESS_TOKEN",
    "NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN",
  );

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await supabase
    .from("tripadvisor_listings_raw")
    .select("id, property_name, external_id, address_full, latitude, longitude")
    .eq("source_name", "tripadvisor")
    .in("external_id", RIAD_EXTERNAL_IDS);

  if (error) throw new Error(`Supabase select failed: ${error.message}`);
  const rows = (data ?? []) as ListingRow[];

  if (rows.length === 0) {
    console.warn("No matching rows found in tripadvisor_listings_raw.");
    return;
  }

  let ok = 0;
  let skipped = 0;
  let failed = 0;

  for (const row of rows) {
    const label = `${row.property_name ?? "(unnamed)"} [${row.external_id ?? row.id}]`;

    if (!force && row.latitude !== null && row.longitude !== null) {
      console.log(
        `↪︎  ${label}: already geocoded (${row.latitude}, ${row.longitude}); skipping`,
      );
      skipped++;
      continue;
    }

    const query =
      row.address_full && row.address_full.trim().length > 0
        ? row.address_full.trim()
        : `${row.property_name ?? ""}, Marrakech, Morocco`;

    try {
      const hit = await geocode(query, mapboxToken);
      if (!hit) {
        console.warn(`✗  ${label}: no results for "${query}"`);
        failed++;
        continue;
      }

      const { error: updateErr } = await supabase
        .from("tripadvisor_listings_raw")
        .update({ latitude: hit.lat, longitude: hit.lng })
        .eq("id", row.id);

      if (updateErr) {
        console.error(`✗  ${label}: update failed — ${updateErr.message}`);
        failed++;
        continue;
      }

      console.log(
        `✓  ${label}: ${hit.lat.toFixed(5)}, ${hit.lng.toFixed(5)}  (${hit.matched})`,
      );
      ok++;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`✗  ${label}: ${message}`);
      failed++;
    }
  }

  console.log(
    `\nDone. updated=${ok}, skipped=${skipped}, failed=${failed}, total=${rows.length}`,
  );

  if (failed > 0) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
