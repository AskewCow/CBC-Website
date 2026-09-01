"use client";

import { useState, useEffect } from "react";
import { mockEvents, type Event } from "@/data/mock";

const CMD_KW_COLOR = "#CD9D7D";

function TypedCommand({ text, chars }: { text: string; chars: number }) {
  const visible = text.slice(0, chars);
  if (!visible) return null;
  const spaceIdx = text.indexOf(" ");
  if (spaceIdx === -1 || chars <= spaceIdx) {
    return <span style={{ color: CMD_KW_COLOR }}>{visible}</span>;
  }
  return (
    <>
      <span style={{ color: CMD_KW_COLOR }}>{text.slice(0, spaceIdx)}</span>
      <span style={{ color: "#FAF9F5" }}>{visible.slice(spaceIdx)}</span>
    </>
  );
}

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

// ── Animated terminal prompt ──────────────────────────────────────────────────
type TPhase = "idle" | "cd" | "spin" | "ls" | "done";
const SPIN_FRAMES = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧"];
const CD_CMD = "cd /events";
const LS_CMD = "ls --upcoming --past";

function TerminalPrompt() {
  const [phase, setPhase] = useState<TPhase>("idle");
  const [cdChars, setCdChars] = useState(0);
  const [lsChars, setLsChars] = useState(0);
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setPhase("cd"), 300);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (phase !== "cd") return;
    if (cdChars >= CD_CMD.length) {
      const t = setTimeout(() => setPhase("spin"), 160);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setCdChars((c) => c + 1), 72);
    return () => clearTimeout(t);
  }, [phase, cdChars]);

  useEffect(() => {
    if (phase !== "spin") return;
    if (frame >= SPIN_FRAMES.length - 1) {
      const t = setTimeout(() => setPhase("ls"), 120);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setFrame((f) => f + 1), 100);
    return () => clearTimeout(t);
  }, [phase, frame]);

  useEffect(() => {
    if (phase !== "ls") return;
    if (lsChars >= LS_CMD.length) {
      const t = setTimeout(() => setPhase("done"), 60);
      return () => clearTimeout(t);
    }
    const delay = lsChars === 0 ? 380 : 68;
    const t = setTimeout(() => setLsChars((c) => c + 1), delay);
    return () => clearTimeout(t);
  }, [phase, lsChars]);

  const Cursor = () => (
    <span
      style={{ color: "#FAF9F5", display: "inline-block", width: "0.5em" }}
      className="animate-blink"
    >
      ▊
    </span>
  );

  return (
    <div
      style={{ fontFamily: "'JetBrains Mono', monospace" }}
      className="text-xs mb-8 space-y-1.5 overflow-x-hidden"
    >
      {/* line 1: cd /events/ */}
      {phase !== "idle" && (
        <p>
          <span style={{ color: "#D97757" }}>✦</span>
          <span style={{ color: "#788C5D" }} className="mx-1">cbc@trinity</span>
          <span style={{ color: "#B0AEA5" }}>~</span>
          <span style={{ color: "#B0AEA5" }} className="mx-1">%</span>
          <span className="ml-1"><TypedCommand text={CD_CMD} chars={cdChars} /></span>
          {phase === "cd" && <Cursor />}
        </p>
      )}

      {/* line 2: spinner while switching directory */}
      {phase === "spin" && (
        <p style={{ color: "#B0AEA5", paddingLeft: "0.25rem" }}>
          {SPIN_FRAMES[frame]}
        </p>
      )}

      {/* line 2: ls --upcoming --past */}
      {(phase === "ls" || phase === "done") && (
        <p>
          <span style={{ color: "#D97757" }}>✦</span>
          <span style={{ color: "#788C5D" }} className="mx-1">cbc@trinity</span>
          <span style={{ color: "#B0AEA5" }}>~/events</span>
          <span style={{ color: "#B0AEA5" }} className="mx-1">%</span>
          <span className="ml-1"><TypedCommand text={LS_CMD} chars={lsChars} /></span>
          {phase === "ls" && <Cursor />}
        </p>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function EventsPage() {
  const upcoming = [...mockEvents.filter((e) => e.upcoming)].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  const past = [...mockEvents.filter((e) => !e.upcoming)].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="pt-14 min-h-screen">
      {/* ── Page header ── */}
      <div className="max-w-7xl mx-auto px-6 pt-8 md:pt-14 pb-10 border-b border-border">
        <TerminalPrompt />

        <h1 className="font-sans text-3xl md:text-4xl font-semibold mb-3">Events</h1>
        <p className="font-sans text-base text-stone mb-5">
          Workshops, hackathons, and research salons.
        </p>

        {/* Registration notice */}
        <div
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            borderLeft: "2px solid rgba(106,155,204,0.4)",
          }}
          className="pl-4 flex flex-wrap items-center gap-2 text-xs text-stone/50"
        >
          <span>To register for any event, join our Discord —</span>
          <a
            href="https://discord.com/invite/rFe8tJ88ww"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sky hover:text-foreground transition-colors"
          >
            discord.gg/rFe8tJ88ww ↗
          </a>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        {/* ── Upcoming ── */}
        {upcoming.length > 0 && (
          <div className="py-8 md:py-12 border-b border-border">
            <p
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
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
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
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
            fontFamily: "'JetBrains Mono', monospace",
            color: "#D97757",
            lineHeight: 1,
          }}
          className="text-[3.5rem] md:text-[5.5rem] font-bold"
        >
          {day}
        </div>
        <div
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
          className="text-stone text-sm mt-2"
        >
          {mon}
        </div>
        <div
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
          className="text-stone/40 text-xs mt-1"
        >
          {weekday}
        </div>
        <div className="mt-6">
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
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
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
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
      <div style={{ fontFamily: "'JetBrains Mono', monospace" }}>
        <div style={{ color: "#D97757" }} className="text-2xl font-bold leading-none">
          {day}
        </div>
        <div className="text-xs text-stone mt-1.5">{mon}</div>
      </div>

      <div>
        <div className="mb-2">
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
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
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
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
