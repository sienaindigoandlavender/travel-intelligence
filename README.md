# Marrakech riads map

Map-first interface for the Marrakech riad intelligence project. Shows 5 riads
on a Mapbox map alongside a sidebar list. Selecting a riad from either side
highlights it, flies the map to its location, and opens a popup with the
property name, Tripadvisor external ID, and a link to Tripadvisor.

Built with **Next.js 16** (App Router, TypeScript, Tailwind CSS v4) and
**react-map-gl v8** / **mapbox-gl**. Data is kept in a local typed array
(`src/lib/riads.ts`) for v1 so Supabase can be wired in later without
restructuring the UI.

## Project structure

```
src/
  app/
    layout.tsx        // root layout + metadata
    page.tsx          // server component; reads env token, loads riads
    globals.css
  components/
    HomeShell.tsx     // client; owns selected state, composes Sidebar + Map
    Sidebar.tsx       // client; riad list, selection highlight
    MapView.tsx       // client; mapbox map with markers + popup, flyTo on select
  lib/
    riads.ts          // Riad type, MARRAKECH_CENTER, riads[], getRiads()
.env.example          // env template
```

## Prerequisites

- Node.js 20.9+ (Next.js 16 minimum)
- A Mapbox public access token (`pk.…`) from https://account.mapbox.com/access-tokens/

## Install

```bash
npm install
```

## Env setup

Copy the example file and fill in your Mapbox token:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.your_token_here
```

The `NEXT_PUBLIC_` prefix is required so the token is available to the browser,
which is necessary for Mapbox GL JS. If the variable is missing at runtime the
app renders a clear notice in the map panel instead of a broken map.

## Local run

```bash
npm run dev
```

Open http://localhost:3000.

## Production build

```bash
npm run build
npm run start
```

## Deploying to Vercel

### Option A — Vercel CLI

```bash
npm i -g vercel
vercel login
vercel link           # first time: pick or create the project
vercel env add NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN production
vercel env add NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN preview
vercel env add NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN development
vercel --prod         # deploy
```

### Option B — Vercel dashboard

1. Push this branch to GitHub.
2. On https://vercel.com/new, import the repository.
3. In **Settings → Environment Variables**, add
   `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` for Production, Preview, and Development.
4. Trigger a redeploy if the env variable was added after the first build.

## Extending to Supabase (later)

`src/lib/riads.ts` exposes an `async getRiads()` function and a `Riad` type.
Replace the body of `getRiads` with a Supabase query — the UI layer already
consumes it as `async`, so the server component in `src/app/page.tsx` won't
need to change. Geocoded `lat`/`lng` coming from Supabase will flow straight
into the existing markers.
