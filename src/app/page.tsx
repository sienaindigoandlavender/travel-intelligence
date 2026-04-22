import { HomeShell } from "@/components/HomeShell";
import { getRiads } from "@/lib/riads";

export default async function Page() {
  const riads = await getRiads();
  const accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ?? null;

  return <HomeShell riads={riads} accessToken={accessToken} />;
}
