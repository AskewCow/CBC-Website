"use client";

import { Fragment, useState, useEffect, useRef } from "react";
import Link from "next/link";
import type { ClubStats, Roster } from "@/lib/queries";
import { DISCORD_INVITE } from "@/lib/constants";
// Static assets: Next fingerprints the filename and serves it with a
// `Cache-Control: immutable` far-future header, so it downloads once and is
// reused on every subsequent page + visit.
import cbcTrinityLogo from "./cbc-trinity.svg";
// Sponsor logos — see the SPONSORS list further down to add / remove one.
import serviceNowLogo from "./sponsors/servicenow.svg";
import solanaLogo from "./sponsors/solana.svg";
import portalLogo from "./sponsors/portal.svg";

// ── Claude Code terminal homage ─────────────────────────────────────────────
// A scripted, non-interactive transcript styled after the Claude Code TUI:
// welcome box, `>` input box, `⏺` message bullets with hanging indent, a tool
// call with a `⎿` result, and the spinner line with a token counter.

const C = {
  terra: "#D97757",
  fg: "#FAF9F5",
  dim: "#B0AEA5",
  sky: "#6A9BCC",
  green: "#3FB950",
  faint: "rgba(250,249,245,0.72)",
};

const MONO = "var(--font-jbmono), ui-monospace, monospace";

// An imported asset resolves to a URL string on some setups and a { src }
// object on others — normalise to the URL.
const asSrc = (m: unknown): string =>
  typeof m === "string" ? m : (m as { src: string }).src;

const CBC_TRINITY_LOGO_SRC = asSrc(cbcTrinityLogo);

const STAR = ["✻", "✽", "✻", "✢", "·", "✢", "✻", "✽"];
const VERBS = [
  "Envisioning",
  "Percolating",
  "Noodling",
  "Conjuring",
  "Puzzling",
  "Simmering",
  "Ruminating",
];
const fmtTok = (n: number) => (n < 1000 ? String(n) : (n / 1000).toFixed(1) + "k");

type RLine = { t: string; c?: string; href?: string };

const RESP_1: RLine[] = [
  { t: "The Claude Builder Club is a Trinity College Dublin student" },
  { t: "society. We help TCD students learn Claude properly and put" },
  { t: "it to real use, together." },
  { t: "" },
  { t: "→ Learn Claude, Claude Code, and the API", c: C.sky },
  { t: "→ Workshops, hackathons and research salons", c: C.sky },
  { t: "→ A place to share what you make", c: C.sky },
  { t: "" },
  { t: "Every member gets Claude Pro and Anthropic API credits." },
  { t: "Open to all TCD students." },
];

const RESP_2: RLine[] = [
  { t: "Three steps:" },
  { t: "" },
  { t: "1. Join the Discord — link below." },
  { t: "2. Show up to an event." },
  { t: "3. Get your free Claude Pro and API credits." },
  { t: "" },
  { t: "→ discord.gg/rFe8tJ88ww", c: C.sky, href: DISCORD_INVITE },
];

type Block =
  | { id: number; kind: "welcome" }
  | { id: number; kind: "user"; text: string }
  | { id: number; kind: "tool"; name: string; arg: string; result: string }
  | { id: number; kind: "assistant"; lines: RLine[]; shown: number };

function Cursor() {
  return (
    <span
      style={{ color: C.fg, display: "inline-block", width: "0.5em" }}
      className="animate-blink"
    >
      ▊
    </span>
  );
}

function Logo() {
  return (
    <div className="animate-fade-up">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={CBC_TRINITY_LOGO_SRC}
        alt="CBC Trinity — Claude Builder Club"
        width={1774}
        height={887}
        fetchPriority="high"
        decoding="async"
        style={{
          width: "clamp(220px, 88%, 440px)",
          maxWidth: "100%",
          height: "auto",
          display: "block",
        }}
      />
      <div
        style={{
          color: C.dim,
          opacity: 0.45,
          fontSize: "0.62rem",
          letterSpacing: "0.08em",
          marginTop: "1.1rem",
        }}
      >
        claude builder club · est. 2025 · trinity college dublin
      </div>
    </div>
  );
}

function InputBox({ text, idle }: { text: string; idle: boolean }) {
  return (
    <div>
      <div
        style={{
          border: `1px solid ${
            idle ? "rgba(176,174,165,0.22)" : "rgba(217,119,87,0.45)"
          }`,
          borderRadius: 8,
          padding: "0.5rem 0.7rem",
        }}
      >
        <span style={{ color: C.terra }}>&gt;</span>{" "}
        <span style={{ color: C.fg }}>{text}</span>
        <Cursor />
      </div>
      {idle && (
        <div
          style={{
            color: C.dim,
            opacity: 0.5,
            marginTop: "0.35rem",
            fontSize: "0.72rem",
          }}
        >
          ? for shortcuts
        </div>
      )}
    </div>
  );
}

function BlockView({ block }: { block: Block }) {
  if (block.kind === "welcome") {
    return (
      <div
        className="animate-fade-up"
        style={{
          border: "1px solid rgba(217,119,87,0.32)",
          borderRadius: 8,
          padding: "0.7rem 0.95rem",
        }}
      >
        <div>
          <span style={{ color: C.terra }}>✻</span>{" "}
          <span style={{ color: C.fg }}>Welcome to Claude Code</span>
        </div>
        <div style={{ color: C.dim, marginTop: "0.55rem" }}>
          /help for help, /status for your setup
        </div>
        <div style={{ color: C.dim, marginTop: "0.3rem" }}>cwd: ~/cbc-trinity</div>
      </div>
    );
  }

  if (block.kind === "user") {
    return (
      <div style={{ color: C.dim }} className="animate-fade-up">
        &gt; {block.text}
      </div>
    );
  }

  if (block.kind === "tool") {
    return (
      <div className="animate-fade-up" style={{ display: "flex", gap: "0.5em" }}>
        <span style={{ color: C.terra }}>⏺</span>
        <div>
          <span style={{ color: C.fg }}>{block.name}</span>
          <span style={{ color: C.dim }}>({block.arg})</span>
          <div style={{ color: C.dim, marginTop: "0.15rem" }}>
            ⎿&nbsp;&nbsp;{block.result}{" "}
            <span style={{ opacity: 0.5 }}>(ctrl+o to expand)</span>
          </div>
        </div>
      </div>
    );
  }

  const shown = block.lines.slice(0, block.shown);
  return (
    <div style={{ display: "flex", gap: "0.5em" }}>
      <span style={{ color: C.terra }}>⏺</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        {shown.map((ln, i) =>
          ln.t === "" ? (
            <div key={i} style={{ height: "0.7rem" }} />
          ) : ln.href ? (
            <div key={i}>
              <a
                href={ln.href}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: ln.c ?? C.faint, textDecoration: "none" }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLElement).style.color = C.fg)
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLElement).style.color = ln.c ?? C.faint)
                }
              >
                {ln.t}
              </a>
            </div>
          ) : (
            <div key={i} style={{ color: ln.c ?? C.faint }}>
              {ln.t}
            </div>
          )
        )}
      </div>
    </div>
  );
}

function TerminalHero({ onComplete }: { onComplete: () => void }) {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [typed, setTyped] = useState("");
  const [inputActive, setInputActive] = useState(false);
  const [idle, setIdle] = useState(false);
  const [spin, setSpin] = useState<
    { verb: string; s: number; tok: number; frame: number } | null
  >(null);
  const idRef = useRef(0);
  const doneRef = useRef(false);
  // Auto-scroll the page to follow the transcript as it types — until the user
  // scrolls themselves, at which point we back off for the rest of the run.
  const followRef = useRef(true);
  const anchorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    let sawHidden =
      typeof document !== "undefined" && document.visibilityState === "hidden";
    const rm =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const sleep = (ms: number) =>
      new Promise<void>((r) => setTimeout(r, Math.max(0, ms)));
    const nextId = () => (idRef.current += 1);
    const stop = () => cancelled || doneRef.current;

    // Render the whole transcript at once — used for reduced-motion and when a
    // backgrounded tab has throttled the scripted timers into a stall.
    const finishNow = () => {
      if (doneRef.current) return;
      doneRef.current = true;
      setSpin(null);
      setTyped("");
      setInputActive(false);
      setBlocks([
        { id: 1, kind: "welcome" },
        { id: 2, kind: "user", text: "what is the claude builder club?" },
        {
          id: 3,
          kind: "tool",
          name: "Read",
          arg: "README.md",
          result: "Read 42 lines",
        },
        { id: 4, kind: "assistant", lines: RESP_1, shown: RESP_1.length },
        { id: 5, kind: "user", text: "how do I get started?" },
        { id: 6, kind: "assistant", lines: RESP_2, shown: RESP_2.length },
      ]);
      setIdle(true);
      onComplete();
    };

    const onVis = () => {
      if (document.visibilityState === "hidden") sawHidden = true;
      else if (sawHidden) finishNow();
    };
    document.addEventListener("visibilitychange", onVis);

    const typeUser = async (text: string) => {
      setInputActive(true);
      for (let i = 1; i <= text.length; i++) {
        await sleep(26 + Math.random() * 34);
        if (stop()) return;
        setTyped(text.slice(0, i));
      }
      await sleep(380);
      if (stop()) return;
      setBlocks((b) => [...b, { id: nextId(), kind: "user", text }]);
      setTyped("");
      setInputActive(false);
    };

    const runSpin = async (durationMs: number, targetTok: number) => {
      const start = Date.now();
      let vi = Math.floor(Math.random() * VERBS.length);
      let lastSwap = start;
      setSpin({ verb: VERBS[vi], s: 1, tok: 0, frame: 0 });
      while (Date.now() - start < durationMs) {
        await sleep(110);
        if (stop()) return;
        const el = Date.now() - start;
        if (Date.now() - lastSwap > 700) {
          vi = (vi + 1) % VERBS.length;
          lastSwap = Date.now();
        }
        setSpin({
          verb: VERBS[vi],
          s: Math.max(1, Math.round(el / 1000)),
          tok: Math.round((el / durationMs) * targetTok),
          frame: Math.round(el / 110),
        });
      }
      setSpin(null);
    };

    const revealResp = async (lines: RLine[]) => {
      const id = nextId();
      setBlocks((b) => [...b, { id, kind: "assistant", lines, shown: 1 }]);
      for (let i = 2; i <= lines.length; i++) {
        await sleep(lines[i - 1].t === "" ? 90 : 62);
        if (stop()) return;
        setBlocks((b) =>
          b.map((x) =>
            x.id === id && x.kind === "assistant" ? { ...x, shown: i } : x
          )
        );
      }
    };

    (async () => {
      if (rm || sawHidden) {
        finishNow();
        return;
      }
      await sleep(450);
      if (stop()) return;
      setBlocks((b) => [...b, { id: nextId(), kind: "welcome" }]);
      await sleep(950);
      if (stop()) return;

      await typeUser("what is the claude builder club?");
      if (stop()) return;
      await runSpin(1500, 1400);
      if (stop()) return;
      setBlocks((b) => [
        ...b,
        {
          id: nextId(),
          kind: "tool",
          name: "Read",
          arg: "README.md",
          result: "Read 42 lines",
        },
      ]);
      await sleep(560);
      if (stop()) return;
      await revealResp(RESP_1);
      if (stop()) return;

      await sleep(900);
      if (stop()) return;
      await typeUser("how do I get started?");
      if (stop()) return;
      await runSpin(1500, 2700);
      if (stop()) return;
      await revealResp(RESP_2);
      if (stop()) return;

      await sleep(450);
      if (stop()) return;
      doneRef.current = true;
      setIdle(true);
      onComplete();
    })();

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVis);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cancel auto-follow the instant the reader takes control of the scroll
  // position (wheel, touch drag, or a scrolling key). Reduced-motion opts out
  // entirely.
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      followRef.current = false;
      return;
    }
    const stop = () => {
      followRef.current = false;
    };
    const SCROLL_KEYS = new Set([
      "ArrowUp",
      "ArrowDown",
      "PageUp",
      "PageDown",
      "Home",
      "End",
      " ",
      "Spacebar",
    ]);
    const onKey = (e: KeyboardEvent) => {
      if (SCROLL_KEYS.has(e.key)) stop();
    };
    window.addEventListener("wheel", stop, { passive: true });
    window.addEventListener("touchmove", stop, { passive: true });
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("wheel", stop);
      window.removeEventListener("touchmove", stop);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  // As new output lands, keep the tail of the transcript comfortably in view.
  useEffect(() => {
    if (!followRef.current || doneRef.current) return;
    const el = anchorRef.current;
    if (!el) return;
    const overshoot =
      el.getBoundingClientRect().bottom - (window.innerHeight - 96);
    if (overshoot > 4) window.scrollBy({ top: overshoot, behavior: "smooth" });
  }, [blocks, spin, typed, idle]);

  return (
    <div
      style={{ fontFamily: MONO }}
      className="text-[13px] leading-[1.7] select-none"
    >
      <Logo />
      <div className="mt-7 space-y-4">
        {blocks.map((b) => (
          <BlockView key={b.id} block={b} />
        ))}
        {spin && (
          <div>
            <span style={{ color: C.terra }}>
              {STAR[spin.frame % STAR.length]}
            </span>{" "}
            <span style={{ color: C.fg }}>{spin.verb}…</span>{" "}
            <span style={{ color: C.dim }}>
              ({spin.s}s · ↑ {fmtTok(spin.tok)} tokens ·{" "}
              <span style={{ opacity: 0.65 }}>esc to interrupt</span>)
            </span>
          </div>
        )}
        {(inputActive || idle) && <InputBox text={typed} idle={idle} />}
        <div ref={anchorRef} aria-hidden="true" />
      </div>
    </div>
  );
}

// ── Stats ─────────────────────────────────────────────────────────────────────
function Stats({ animate, stats }: { animate: boolean; stats: ClubStats }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!animate) return;
    const t = setTimeout(() => setShow(true), 300);
    return () => clearTimeout(t);
  }, [animate]);

  const rows = [
    { n: String(stats.members), label: "members" },
    { n: String(stats.projectsShipped), label: "projects shipped" },
    { n: String(stats.eventsRun), label: "events run" },
  ];

  return (
    <section className="border-t border-border">
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div
          style={{ fontFamily: "var(--font-jbmono), ui-monospace, monospace" }}
          className="text-xs mb-12"
        >
          <span style={{ color: "#D97757" }}>&gt;</span>
          <span style={{ color: "#FAF9F5" }} className="ml-2">cbc stats --live</span>
        </div>

        {!show ? (
          <p
            style={{ fontFamily: "var(--font-jbmono), ui-monospace, monospace" }}
            className="text-xs text-stone/30 animate-pulse"
          >
            fetching...
          </p>
        ) : (
          <div className="grid grid-cols-3 divide-x divide-border">
            {rows.map((s, i) => (
              <div
                key={i}
                className={`${i > 0 ? "pl-8 md:pl-14" : ""} ${i < 2 ? "pr-8 md:pr-14" : ""} animate-fade-up`}
                style={{ animationDelay: `${i * 90}ms` }}
              >
                <div
                  style={{ fontFamily: "var(--font-jbmono), ui-monospace, monospace", color: "#D97757" }}
                  className="text-5xl sm:text-6xl md:text-7xl font-bold leading-none mb-2"
                >
                  {s.n}
                </div>
                <div
                  style={{ fontFamily: "var(--font-jbmono), ui-monospace, monospace" }}
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

// ── Sponsors ─────────────────────────────────────────────────────────────────
// To add / remove a sponsor:
//   1. drop its logo (SVG preferred) in src/app/sponsors/
//   2. add an `import` for it at the top of this file
//   3. add / delete a row below — list order = left-to-right page order
// Each logo is its sponsor's own vector mark, imported so Next fingerprints +
// immutable-caches it. Use a light-on-dark ("reversed") logo where one exists.
type Sponsor = {
  name: string;
  logo: string;
  intrinsic: readonly [number, number]; // the SVG's own width/height (for CLS)
  displayWidth: number; // px it renders at on the page
};

const SPONSORS: Sponsor[] = [
  {
    name: "ServiceNow",
    logo: asSrc(serviceNowLogo),
    intrinsic: [623, 91],
    displayWidth: 150,
  },
  {
    name: "Solana",
    logo: asSrc(solanaLogo),
    intrinsic: [2190, 409],
    displayWidth: 152,
  },
  {
    // Square badge mark (not a wordmark) — sized by height to sit level with
    // the wordmarks rather than by the 150px width the others use.
    name: "The Portal — Trinity Innovation & Enterprise",
    logo: asSrc(portalLogo),
    intrinsic: [200, 200],
    displayWidth: 64,
  },
];

function SponsorsSection() {
  return (
    <section className="border-t border-border">
      <div className="max-w-7xl mx-auto px-6 py-20 sm:py-24">
        <div style={{ fontFamily: MONO }} className="text-xs mb-4">
          <span style={{ color: C.terra }}>&gt;</span>
          <span style={{ color: C.fg }} className="ml-2">
            cbc sponsors --list
          </span>
        </div>
        <p className="font-sans text-sm md:text-base text-stone leading-relaxed max-w-md mb-12">
          The club is backed by partners who care about students learning to use
          AI thoughtfully and responsibly.
        </p>

        <div className="flex flex-wrap items-center gap-y-4 -ml-6">
          {SPONSORS.map((s, i) => (
            <Fragment key={s.name}>
              {i > 0 && (
                // Taller + higher-contrast than the old faint `bg-border`
                // rule, which was hard to see on mid-size screens. On mobile
                // the logos stack and the vertical gap separates them.
                <div className="hidden sm:block w-px h-12 shrink-0 self-center bg-stone/35" />
              )}
              <div className="px-6 py-4 opacity-60 transition-opacity duration-300 hover:opacity-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={s.logo}
                  alt={s.name}
                  width={s.intrinsic[0]}
                  height={s.intrinsic[1]}
                  decoding="async"
                  style={{
                    width: s.displayWidth,
                    height: "auto",
                    display: "block",
                  }}
                />
              </div>
            </Fragment>
          ))}
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
            style={{ fontFamily: "var(--font-jbmono), ui-monospace, monospace" }}
            className="text-xs text-stone/40 uppercase tracking-widest mb-6"
          >
            open to all tcd students
          </p>
          <h2 className="font-sans text-4xl md:text-5xl font-semibold leading-tight mb-5">
            Learn. Explore. Create.
          </h2>
          <p className="font-sans text-base text-stone leading-relaxed max-w-sm">
            A community for TCD students exploring what&rsquo;s possible with
            Claude. Learn new tools, share ideas, and experiment with AI
            together.
          </p>
        </div>

        <div className="flex flex-col items-start md:items-end gap-4">
          <a
            href={DISCORD_INVITE}
            target="_blank"
            rel="noopener noreferrer"
            className="font-sans text-sm font-medium px-8 py-4 transition-opacity w-fit"
            style={{ backgroundColor: "#D97757", color: "#141413" }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLElement).style.opacity = "0.85")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLElement).style.opacity = "1")
            }
          >
            Join on Discord
          </a>
          <Link
            href="/join"
            style={{ fontFamily: "var(--font-jbmono), ui-monospace, monospace" }}
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
export default function HomeClient({
  stats,
  roster,
}: {
  stats: ClubStats;
  roster: Roster;
}) {
  const [terminalDone, setTerminalDone] = useState(false);

  return (
    <div>
      {/* ── Hero — unchanged ── */}
      <section className="min-h-screen flex flex-col pt-14">
        <div className="flex-1 max-w-7xl mx-auto w-full px-6 grid lg:grid-cols-[1fr_240px] gap-10 items-start pt-12 pb-8">
          <div>
            <p
              style={{ fontFamily: "var(--font-jbmono), ui-monospace, monospace" }}
              className="text-xs mb-4 uppercase tracking-widest text-stone/40"
            >
              ✦ claude builder club{"  "}
              <span
                style={{ color: C.green }}
                className="animate-status-pulse mx-1"
              >
                ●
              </span>{" "}
              <span style={{ color: C.green }}>session active</span>
            </p>

            <div className="bg-surface border border-border rounded-xl overflow-hidden">
              <div className="px-5 py-6 sm:px-8 sm:py-8 min-h-[600px]">
                <TerminalHero onComplete={() => setTerminalDone(true)} />
              </div>
            </div>
          </div>

          {/* Sidebar column — ambassadors + committee, synced from Discord
              roles by the bot (see src/lib/queries.ts#getRoster). */}
          <div
            style={{ fontFamily: "var(--font-jbmono), ui-monospace, monospace" }}
            className="hidden lg:block pt-12 text-xs"
          >
            {roster.ambassadors.length > 0 && (
              <>
                <p className="text-stone/35 uppercase tracking-widest mb-3">
                  ambassadors
                </p>
                <div className="space-y-2 mb-8">
                  {roster.ambassadors.map((m) => (
                    <p key={m.discordId} style={{ color: "#D97757" }}>
                      {m.name}
                    </p>
                  ))}
                </div>
              </>
            )}

            {roster.ambassadors.length > 0 && roster.committee.length > 0 && (
              <div className="border-t border-border mb-8" />
            )}

            {roster.committee.length > 0 && (
              <>
                <p className="text-stone/35 uppercase tracking-widest mb-3">
                  committee
                </p>
                <div className="space-y-2">
                  {roster.committee.map((m) => (
                    <p key={m.discordId} className="text-stone">
                      {m.name}
                    </p>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <div
          style={{ fontFamily: "var(--font-jbmono), ui-monospace, monospace" }}
          className="text-center pb-6 text-xs text-stone/25"
        >
          scroll ↓
        </div>
      </section>

      <JoinCTA />
      <Stats animate={terminalDone} stats={stats} />
      <SponsorsSection />
    </div>
  );
}
