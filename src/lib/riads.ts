import {
  createSupabaseServerClient,
  RIAD_EXTERNAL_IDS,
  RIAD_SOURCE_NAME,
} from "./supabase";

export type Riad = {
  id: string;
  name: string;
  externalId: string;
  tripadvisorUrl: string;
  lng: number;
  lat: number;
};

export const MARRAKECH_CENTER: { lng: number; lat: number; zoom: number } = {
  lng: -7.9811,
  lat: 31.6295,
  zoom: 14,
};

type TripadvisorListingRow = {
  id: string;
  property_name: string | null;
  external_id: string | null;
  source_url: string | null;
  latitude: number | null;
  longitude: number | null;
};

export type RiadsResult = {
  riads: Riad[];
  error: string | null;
};

export async function getRiads(): Promise<RiadsResult> {
  const supabase = createSupabaseServerClient();
  if (!supabase) {
    return {
      riads: [],
      error:
        "Supabase env vars are not configured (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY).",
    };
  }

  const { data, error } = await supabase
    .from("tripadvisor_listings_raw")
    .select("id, property_name, external_id, source_url, latitude, longitude")
    .eq("source_name", RIAD_SOURCE_NAME)
    .in("external_id", RIAD_EXTERNAL_IDS as unknown as string[])
    .not("latitude", "is", null)
    .not("longitude", "is", null);

  if (error) {
    return { riads: [], error: error.message };
  }

  const rows = (data ?? []) as TripadvisorListingRow[];
  const riads: Riad[] = rows
    .filter(
      (r): r is TripadvisorListingRow & {
        property_name: string;
        external_id: string;
        source_url: string;
        latitude: number;
        longitude: number;
      } =>
        r.property_name !== null &&
        r.external_id !== null &&
        r.source_url !== null &&
        r.latitude !== null &&
        r.longitude !== null,
    )
    .map((r) => ({
      id: r.id,
      name: r.property_name,
      externalId: r.external_id,
      tripadvisorUrl: r.source_url,
      lng: r.longitude,
      lat: r.latitude,
    }));

  return { riads, error: null };
}
