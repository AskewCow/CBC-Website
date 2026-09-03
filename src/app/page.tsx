import { getClubStats, getRoster } from "@/lib/queries";
import HomeClient from "./HomeClient";

export const revalidate = 300;

export default async function HomePage() {
  const [stats, roster] = await Promise.all([getClubStats(), getRoster()]);

  return <HomeClient stats={stats} roster={roster} />;
}
