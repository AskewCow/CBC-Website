"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { mockEvents, mockProjects } from "@/data/mock";

// ── Prompt component ──────────────────────────────────────────────────────────
function PromptLine({ showCursor }: { showCursor: boolean }) {
  return (
    <span className="flex items-center flex-wrap">
      <span style={{ color: "#D97757" }}>✦</span>
      <span style={{ color: "#788C5D" }} className="ml-1.5">
        cbc@trinity
      </span>
      <span style={{ color: "#B0AEA5" }} className="mx-1">
        ~
      </span>
      <span style={{ color: "#B0AEA5" }}>%</span>
      {showCursor && (
        <span
          style={{ color: "#FAF9F5", display: "inline-block", width: "0.55em" }}
          className="ml-2 animate-blink"
        >
          ▊
        </span>
      )}
    </span>
  );
}

// ── Terminal Typewriter ───────────────────────────────────────────────────────
const COMMAND = 'claude "what is the claude builder club?"';

const RESPONSE: { text: string; color?: string }[] = [
  { text: "" },
  { text: "The Claude Builder Club is a student society at Trinity" },
  { text: "College Dublin. We build real AI applications with Claude" },
  { text: "and the Anthropic API — not demos, not experiments. Ships." },
  { text: "" },
  { text: "→  Projects shipped by members", color: "#6A9BCC" },
  { text: "→  Workshops, hackathons, research salons", color: "#6A9BCC" },
  { text: "→  Real API experience and a portfolio that shows it", color: "#6A9BCC" },
  { text: "" },
  { text: "We meet weekly. Find us on Discord." },
  { text: "" },
];

function TerminalHero({ onComplete }: { onComplete: () => void }) {
  const [cmdChars, setCmdChars] = useState(0);
  const [phase, setPhase] = useState<"idle" | "typing" | "responding" | "done">("idle");
  const [responseIdx, setResponseIdx] = useState(-1);

  useEffect(() => {
    const t = setTimeout(() => setPhase("typing"), 700);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (phase !== "typing") return;
    if (cmdChars >= COMMAND.length) {
      const t = setTimeout(() => setPhase("responding"), 450);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setCmdChars((c) => c + 1), 33);
    return () => clearTimeout(t);
  }, [phase, cmdChars]);

  useEffect(() => {
    if (phase !== "responding") return;
    const next = responseIdx + 1;
    if (next >= RESPONSE.length) {
      setPhase("done");
      onComplete();
      return;
    }
    const delay = RESPONSE[next].text === "" ? 110 : 85;
    const t = setTimeout(() => setResponseIdx(next), delay);
    return () => clearTimeout(t);
  }, [phase, responseIdx, onComplete]);

  return (
    <div
      style={{ fontFamily: "'JetBrains Mono', monospace" }}
      className="text-sm leading-7 select-none"
    >
      {/* Command line */}
      <div className="flex flex-wrap items-center">
        <PromptLine showCursor={false} />
        <span style={{ color: "#FAF9F5" }} className="ml-2">
          {COMMAND.slice(0, cmdChars)}
        </span>
        {(phase === "idle" || phase === "typing") && (
          <span
            style={{
              color: "#FAF9F5",
              display: "inline-block",
              width: "0.55em",
            }}
            className="animate-blink"
          >
            ▊
          </span>
        )}
      </div>

      {/* Response lines */}
      {RESPONSE.slice(0, responseIdx + 1).map((line, i) => (
        <div
          key={i}
          style={{
            color: line.color ?? "rgba(250,249,245,0.78)",
            minHeight: "1.75rem",
          }}
        >
          {line.text || " "}
        </div>
      ))}

      {/* Idle prompt after done */}
      {phase === "done" && (
        <div className="flex items-center">
          <PromptLine showCursor={true} />
        </div>
      )}
    </div>
  );
}

// ── Stats ─────────────────────────────────────────────────────────────────────
function Stats({ animate }: { animate: boolean }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!animate) return;
    const t = setTimeout(() => setShow(true), 300);
    return () => clearTimeout(t);
  }, [animate]);

  return (
    <section className="border-t border-border">
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
          className="text-xs text-stone/40 mb-12"
        >
          <span style={{ color: "#D97757" }}>✦</span>
          <span style={{ color: "#788C5D" }} className="ml-1.5">cbc@trinity</span>
          <span style={{ color: "#B0AEA5" }} className="mx-1">~</span>
          <span style={{ color: "#B0AEA5" }}>%</span>
          <span style={{ color: "#FAF9F5" }} className="ml-2">cbc stats --live</span>
        </div>

        {!show ? (
          <p
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
            className="text-xs text-stone/30 animate-pulse"
          >
            fetching...
          </p>
        ) : (
          <div className="grid grid-cols-3 divide-x divide-border">
            {[
              { n: "47", label: "members" },
              { n: "23", label: "projects shipped" },
              { n: "12", label: "events run" },
            ].map((s, i) => (
              <div
                key={i}
                className={`${i > 0 ? "pl-8 md:pl-14" : ""} ${i < 2 ? "pr-8 md:pr-14" : ""} animate-fade-up`}
                style={{ animationDelay: `${i * 90}ms` }}
              >
                <div
                  style={{ fontFamily: "'JetBrains Mono', monospace", color: "#D97757" }}
                  className="text-5xl sm:text-6xl md:text-7xl font-bold leading-none mb-2"
                >
                  {s.n}
                </div>
                <div
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  className="text-xs text-stone"
                >
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// ── Recent Builds ─────────────────────────────────────────────────────────────
const TOOL_LABEL: Record<string, string> = {
  "claude-api": "Claude API",
  "claude-code": "Claude Code",
  "claude-web": "Claude Web",
  other: "Other",
};
const TOOL_COLOR: Record<string, string> = {
  "claude-api": "#D97757",
  "claude-code": "#6A9BCC",
  "claude-web": "#788C5D",
  other: "#B0AEA5",
};

function RecentBuilds() {
  const recent = mockProjects.slice(0, 4);

  return (
    <section className="border-t border-border">
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="flex items-baseline justify-between mb-12">
          <span
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
            className="text-xs text-stone/40 uppercase tracking-widest"
          >
            recent builds
          </span>
          <Link
            href="/projects"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
            className="text-xs text-sky hover:text-foreground transition-colors"
          >
            all {mockProjects.length} projects →
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          {recent.map((p) => {
            const accent = TOOL_COLOR[p.builtWith];
            return (
              <div
                key={p.id}
                className="bg-surface hover:bg-surface-2 transition-colors overflow-hidden group"
              >
                <div style={{ backgroundColor: accent, height: "3px" }} />
                <div className="p-7">
                  <div className="flex items-center justify-between mb-5">
                    <span
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        color: accent,
                        fontSize: "0.65rem",
                      }}
                    >
                      {TOOL_LABEL[p.builtWith]}
                    </span>
                    <a
                      href={p.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontFamily: "'JetBrains Mono', monospace" }}
                      className="text-xs text-stone/25 hover:text-sky transition-colors opacity-0 group-hover:opacity-100"
                    >
                      ↗
                    </a>
                  </div>
                  <h3 className="font-sans text-lg font-semibold mb-1.5 leading-snug">
                    {p.name}
                  </h3>
                  <p
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                    className="text-xs text-stone mb-4"
                  >
                    by {p.builder}
                  </p>
                  <p
                    className="font-sans text-sm text-stone leading-relaxed"
                    style={{
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {p.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ── Upcoming ──────────────────────────────────────────────────────────────────
function UpcomingEvents() {
  const upcoming = mockEvents.filter((e) => e.upcoming).slice(0, 2);

  function parseDate(dateStr: string) {
    const d = new Date(dateStr + "T00:00:00");
    return {
      day: d.toLocaleDateString("en-IE", { day: "2-digit" }),
      mon: d.toLocaleDateString("en-IE", { month: "short" }).toUpperCase(),
    };
  }

  return (
    <section className="border-t border-border">
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="flex items-baseline justify-between mb-12">
          <span
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
            className="text-xs text-stone/40 uppercase tracking-widest"
          >
            what's coming
          </span>
          <Link
            href="/events"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
            className="text-xs text-sky hover:text-foreground transition-colors"
          >
            all events →
          </Link>
        </div>

        <div className="divide-y divide-border">
          {upcoming.map((ev) => {
            const { day, mon } = parseDate(ev.date);
            return (
              <div
                key={ev.id}
                className="py-10 grid md:grid-cols-[120px_1fr] gap-8 items-start"
              >
                <div style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  <div
                    style={{ color: "#D97757", fontSize: "4rem", lineHeight: 1, fontWeight: 700 }}
                  >
                    {day}
                  </div>
                  <div className="text-stone text-sm mt-2">{mon}</div>
                </div>
                <div className="pt-1">
                  <h3 className="font-sans text-xl font-semibold mb-2">{ev.title}</h3>
                  <p
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                    className="text-xs text-stone/50 mb-3"
                  >
                    {ev.time} · {ev.location}
                  </p>
                  <p className="font-sans text-sm text-stone leading-relaxed max-w-xl">
                    {ev.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ── Join CTA ──────────────────────────────────────────────────────────────────
function JoinCTA() {
  return (
    <section className="border-t border-border">
      <div className="max-w-7xl mx-auto px-6 py-24 grid md:grid-cols-2 gap-12 items-end">
        <div>
          <p
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
            className="text-xs text-stone/40 uppercase tracking-widest mb-6"
          >
            open to all tcd students
          </p>
          <h2 className="font-sans text-4xl md:text-5xl font-semibold leading-tight mb-5">
            Build something real.
          </h2>
          <p className="font-sans text-base text-stone leading-relaxed max-w-sm">
            No slides-only sessions. No demo-only projects. If you build it with
            Claude, you ship it — and it lives here.
          </p>
        </div>

        <div className="flex flex-col items-start md:items-end gap-4">
          <a
            href="https://discord.com/invite/rFe8tJ88ww"
            target="_blank"
            rel="noopener noreferrer"
            className="font-sans text-sm font-medium px-8 py-3.5 transition-colors"
            style={{ backgroundColor: "#D97757", color: "#141413" }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLElement).style.backgroundColor = "#CD9D7D")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLElement).style.backgroundColor = "#D97757")
            }
          >
            Join on Discord
          </a>
          <Link
            href="/join"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
            className="text-xs text-stone hover:text-foreground transition-colors"
          >
            how it works →
          </Link>
        </div>
      </div>
    </section>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function HomePage() {
  const [terminalDone, setTerminalDone] = useState(false);

  return (
    <div>
      {/* ── Hero — unchanged ── */}
      <section className="min-h-screen flex flex-col pt-14">
        <div className="flex-1 max-w-7xl mx-auto w-full px-6 grid lg:grid-cols-[1fr_240px] gap-10 items-start pt-12 pb-8">
          <div>
            <p
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
              className="text-xs text-stone/40 mb-4 uppercase tracking-widest"
            >
              ✦ claude builder club · session active
            </p>

            <div className="bg-surface border border-border overflow-hidden">
              <div className="bg-surface-2 border-b border-border px-4 py-2.5 flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div
                    style={{ backgroundColor: "rgba(255,95,87,0.75)" }}
                    className="w-3 h-3 rounded-full"
                  />
                  <div
                    style={{ backgroundColor: "rgba(255,189,46,0.75)" }}
                    className="w-3 h-3 rounded-full"
                  />
                  <div
                    style={{ backgroundColor: "rgba(40,200,64,0.75)" }}
                    className="w-3 h-3 rounded-full"
                  />
                </div>
                <span
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  className="text-xs text-stone/50 ml-1"
                >
                  cbc@trinity ~ — claude
                </span>
              </div>
              <div className="p-6 min-h-64">
                <TerminalHero onComplete={() => setTerminalDone(true)} />
              </div>
            </div>
          </div>

          <div
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
            className="hidden lg:block pt-12 text-sm"
          >
            <p className="text-stone/30 text-xs mb-6 uppercase tracking-widest">
              est. 2025
            </p>
            <p className="font-medium text-foreground leading-snug mb-1">
              claude
              <br />
              builder
              <br />
              club
            </p>
            <p className="text-stone text-xs mb-8">Trinity College Dublin</p>

            <div className="space-y-2 text-xs">
              <p style={{ color: "#788C5D" }}>✓ active</p>
              <p className="text-stone">hilary term 2026</p>
              <p className="text-stone/50 mt-4">discord.gg/rFe8tJ88ww</p>
            </div>

            <div className="mt-8 pt-6 border-t border-border space-y-1.5 text-xs text-stone/40">
              <Link href="/projects" className="block hover:text-foreground transition-colors">
                /projects
              </Link>
              <Link href="/events" className="block hover:text-foreground transition-colors">
                /events
              </Link>
              <Link href="/join" className="block hover:text-foreground transition-colors">
                /join
              </Link>
              <Link href="/resources" className="block hover:text-foreground transition-colors">
                /resources
              </Link>
            </div>
          </div>
        </div>

        <div
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
          className="text-center pb-6 text-xs text-stone/25"
        >
          scroll ↓
        </div>
      </section>

      <Stats animate={terminalDone} />
      <RecentBuilds />
      <UpcomingEvents />
      <JoinCTA />
    </div>
  );
}
