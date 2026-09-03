import { getEvents } from "@/lib/queries";
import EventsClient from "./EventsClient";

export const revalidate = 300;

export default async function EventsPage() {
  const events = await getEvents();
  return <EventsClient events={events} />;
}
