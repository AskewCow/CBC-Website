import type { Event } from "@/lib/queries";
import { DISCORD_INVITE, DISCORD_INVITE_LABEL } from "@/lib/constants";
import TerminalPrompt from "@/components/TerminalPrompt";

const MONO = "var(--font-jbmono), ui-monospace, monospace";

const TYPE_COLOR: Record<Event["type"], string> = {
  hackathon: "#D97757",
  workshop: "#6A9BCC",
  salon: "#788C5D",
  tabling: "#B0AEA5",
  committee: "#CD9D7D",
};

function parseDate(str: string) {
  const d = new Date(str + "T00:00:00");
  return {
    day: d.toLocaleDateString("en-IE", { day: "2-digit" }),
    mon: d.toLocaleDateString("en-IE", { month: "short" }).toUpperCase(),
    year: d.getFullYear(),
    weekday: d.toLocaleDateString("en-IE", { weekday: "long" }),
  };
}

export default function EventsClient({ events }: { events: Event[] }) {
  const upcoming = [...events.filter((e) => e.upcoming)].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  const past = [...events.filter((e) => !e.upcoming)].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="pt-14 min-h-screen">
      {/* ── Page header ── */}
      <div className="max-w-7xl mx-auto px-6 pt-8 md:pt-14 pb-10 border-b border-border">
        <TerminalPrompt folder="events" command="ls --upcoming --past" />

        <h1 className="font-sans text-3xl md:text-4xl font-semibold mb-3">Events</h1>
        <p className="font-sans text-base text-stone mb-5">
          Workshops, hackathons, and research salons.
        </p>

        {/* Registration notice */}
        <div
          style={{
            fontFamily: MONO,
            borderLeft: "2px solid rgba(106,155,204,0.4)",
          }}
          className="pl-4 flex flex-wrap items-center gap-2 text-xs text-stone/50"
        >
          <span>To register for any event, join our Discord —</span>
          <a
            href={DISCORD_INVITE}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sky hover:text-foreground transition-colors"
          >
            {DISCORD_INVITE_LABEL} ↗
          </a>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        {/* ── Upcoming ── */}
        {upcoming.length > 0 && (
          <div className="py-8 md:py-12 border-b border-border">
            <p
              style={{ fontFamily: MONO }}
              className="text-base text-stone/70 mb-10 tracking-wide"
            >
              upcoming —{" "}
              <span
                style={{
                  color: "#D97757",
                  fontSize: "1.15rem",
                  fontWeight: 700,
                }}
              >
                {upcoming.length}
              </span>
            </p>

            <div className="divide-y divide-border">
              {upcoming.map((ev) => (
                <UpcomingEventPanel key={ev.id} ev={ev} />
              ))}
            </div>
          </div>
        )}

        {/* ── Past ── */}
        {past.length > 0 && (
          <div className="py-12 pb-16">
            <p
              style={{ fontFamily: MONO }}
              className="text-xs text-stone/40 uppercase tracking-widest mb-8"
            >
              past — {past.length}
            </p>

            <div className="divide-y divide-border">
              {past.map((ev) => (
                <PastEventRow key={ev.id} ev={ev} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function UpcomingEventPanel({ ev }: { ev: Event }) {
  const { day, mon, weekday } = parseDate(ev.date);
  const accentColor = TYPE_COLOR[ev.type];

  return (
    <div className="py-8 md:py-12 grid md:grid-cols-[180px_1fr] gap-6 md:gap-16 items-start">
      <div>
        <div
          style={{
            fontFamily: MONO,
            color: "#D97757",
            lineHeight: 1,
          }}
          className="text-[3.5rem] md:text-[5.5rem] font-bold"
        >
          {day}
        </div>
        <div
          style={{ fontFamily: MONO }}
          className="text-stone text-sm mt-2"
        >
          {mon}
        </div>
        <div
          style={{ fontFamily: MONO }}
          className="text-stone/40 text-xs mt-1"
        >
          {weekday}
        </div>
        <div className="mt-6">
          <span
            style={{
              fontFamily: MONO,
              color: accentColor,
              fontSize: "0.65rem",
              borderBottom: `1px solid ${accentColor}`,
              paddingBottom: "1px",
            }}
          >
            {ev.type}
          </span>
        </div>
      </div>

      <div className="pt-1">
        <h3 className="font-sans text-xl md:text-3xl font-semibold mb-3 leading-tight">
          {ev.title}
        </h3>
        <p
          style={{ fontFamily: MONO }}
          className="text-xs text-stone/60 mb-6"
        >
          {ev.time} · {ev.location}
        </p>
        <p className="font-sans text-base text-stone leading-relaxed max-w-xl">
          {ev.description}
        </p>
      </div>
    </div>
  );
}

function PastEventRow({ ev }: { ev: Event }) {
  const { day, mon } = parseDate(ev.date);
  const accentColor = TYPE_COLOR[ev.type];

  return (
    <div className="py-8 grid md:grid-cols-[90px_1fr] gap-6 md:gap-10 items-start opacity-55 hover:opacity-80 transition-opacity">
      <div style={{ fontFamily: MONO }}>
        <div style={{ color: "#D97757" }} className="text-2xl font-bold leading-none">
          {day}
        </div>
        <div className="text-xs text-stone mt-1.5">{mon}</div>
      </div>

      <div>
        <div className="mb-2">
          <span
            style={{
              fontFamily: MONO,
              color: accentColor,
              fontSize: "0.65rem",
            }}
          >
            {ev.type}
          </span>
        </div>
        <h3 className="font-sans text-base font-semibold mb-2 leading-snug">
          {ev.title}
        </h3>
        <p
          style={{ fontFamily: MONO }}
          className="text-xs text-stone/50 mb-3"
        >
          {ev.time} · {ev.location}
          {ev.attendees != null && (
            <> · <span style={{ color: "#B0AEA5" }}>{ev.attendees} attended</span></>
          )}
        </p>
        <p className="font-sans text-base text-stone leading-relaxed max-w-xl">
          {ev.description}
        </p>
      </div>
    </div>
  );
}
