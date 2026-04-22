# Marrakech riads map

Map-first interface for the Marrakech riad intelligence project. Shows the
tracked riads on a Mapbox map alongside a sidebar list. Selecting a riad from
either side highlights it, flies the map to its location, and opens a popup
with the property name, Tripadvisor external ID, and a link to Tripadvisor.

Built with **Next.js 16** (App Router, TypeScript, Tailwind CSS v4),
**react-map-gl v8** / **mapbox-gl**, and **@supabase/supabase-js**.

## What changed in v2

- Riads are loaded from Supabase (`tripadvisor_listings_raw`) instead of a
  hardcoded array. The UI only renders rows that have non-null
  `latitude`/`longitude`.
- A one-time `scripts/geocode-riads.ts` script geocodes the 5 tracked rows
  via Mapbox Geocoding v6 and writes coordinates back to Supabase.
- New env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
  and `SUPABASE_SERVICE_ROLE_KEY` (script only).

## Project structure

```
src/
  app/
    layout.tsx         root layout + metadata
    page.tsx           server component; reads env token, calls getRiads()
    globals.css
  components/
    HomeShell.tsx      client; owns selected state, renders Sidebar + Map,
                       renders missing-token / supabase-error / empty states
    Sidebar.tsx        client; riad list, selection highlight
    MapView.tsx        client; mapbox map with markers + popup, flyTo on select
  lib/
    riads.ts           Riad type + async getRiads() (Supabase query)
    supabase.ts        createSupabaseServerClient(), tracked external IDs
scripts/
  geocode-riads.ts     one-time Mapbox forward geocoder → Supabase update
.env.example           env template
```

## Prerequisites

- Node.js 20.9+ (Next.js 16 minimum)
- Mapbox public access token (`pk.…`)
- A Supabase project with a `tripadvisor_listings_raw` table containing the
  5 tracked rows

## Install

```bash
npm install
```

## Env setup

```bash
cp .env.example .env.local
```

Fill in at minimum:

```
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.…
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ…
```

For the geocoding script you also need:

```
SUPABASE_SERVICE_ROLE_KEY=eyJ…   # Supabase dashboard → Settings → API
```

The service role key bypasses RLS and is required to `UPDATE` the listings
table unless RLS has been explicitly relaxed for the anon role. **Never**
prefix it with `NEXT_PUBLIC_` and never expose it to the browser.

## Local run

```bash
npm run dev
```

Open http://localhost:3000. If no rows have coordinates yet, the map pane
shows an "Empty" notice — run the geocoder first (next section).

## Run the geocoding script

```bash
# Skips rows that already have lat/lng
npm run geocode

# Re-geocode everything
npm run geocode -- --force
```

What it does:

1. Selects the 5 tracked rows from `tripadvisor_listings_raw`
   (`source_name = 'tripadvisor'` and `external_id IN (…)`).
2. For each row, builds a query: `address_full` if present, otherwise
   `"<property_name>, Marrakech, Morocco"`.
3. Calls `GET https://api.mapbox.com/search/geocode/v6/forward?q=…&limit=1`.
4. Writes the first result's coordinates back to `latitude` / `longitude`.
5. Logs one line per row (`✓` / `↪︎` / `✗`) and a final summary.

Rerunning is safe: rows that already have coordinates are skipped unless
`--force` is passed.

## Production build

```bash
npm run build
npm run start
```

## Deploying to Vercel

This repo is already connected to a Vercel project that auto-deploys on push.
After updating env vars, trigger a new deploy (push a commit or hit Redeploy).

Required Vercel env vars (Production + Preview + Development):

| Name                                | Needed by        |
| ----------------------------------- | ---------------- |
| `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN`   | app (browser)    |
| `NEXT_PUBLIC_SUPABASE_URL`          | app (server)     |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`     | app (server)     |

`SUPABASE_SERVICE_ROLE_KEY` and the plain `MAPBOX_ACCESS_TOKEN` are only used
by the local geocoding script and should **not** be added to Vercel.

### Vercel CLI alternative

```bash
npm i -g vercel
vercel login
vercel link
vercel env add NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN production
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
# repeat for preview and development
vercel --prod
```

## Data contract

`getRiads()` (in `src/lib/riads.ts`) runs this query:

```sql
select id, property_name, external_id, source_url, latitude, longitude
from tripadvisor_listings_raw
where source_name = 'tripadvisor'
  and external_id in ('858018','1785056','27426915','27701674','652849')
  and latitude is not null
  and longitude is not null
```

To extend to more riads later, update `RIAD_EXTERNAL_IDS` in
`src/lib/supabase.ts` (shared with the geocoding script) and redeploy.
