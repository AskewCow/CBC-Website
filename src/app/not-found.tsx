"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const MONO = "var(--font-jbmono), ui-monospace, monospace";

// ── Eye animation sequence ────────────────────────────────────────────────────
type Eye = { l: string; r: string; ms: number };
const EYES: Eye[] = [
  { l: ">", r: "<", ms: 2600 },
  { l: "-", r: "-", ms: 130 },
  { l: ">", r: "<", ms: 1800 },
  { l: ">", r: "<", ms: 3200 },
  { l: "-", r: "-", ms: 130 },
  { l: ">", r: "<", ms: 2000 },
  { l: "x", r: "x", ms: 200 },
  { l: ">", r: "<", ms: 2400 },
];

// ── Claude bot ────────────────────────────────────────────────────────────────
function ClaudeBot() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setIdx((i) => (i + 1) % EYES.length), EYES[idx].ms);
    return () => clearTimeout(t);
  }, [idx]);

  const { l, r } = EYES[idx];
  const B = 5;

  return (
    <div
      style={{
        animation: "bot-float 3.4s ease-in-out infinite",
        display: "inline-block",
        filter: "drop-shadow(0 0 20px rgba(217,119,87,0.3))",
      }}
    >
      {/* Body */}
      <div
        style={{
          width: 136,
          height: 94,
          backgroundColor: "#D97757",
          border: `${B}px solid rgba(255,255,255,0.85)`,
          borderRadius: 6,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            fontFamily: MONO,
            fontSize: 28,
            fontWeight: 800,
            color: "#141413",
            letterSpacing: 10,
            userSelect: "none",
          }}
        >
          {l}&nbsp;{r}
        </span>
      </div>

      {/* Legs */}
      <div style={{ display: "flex", justifyContent: "space-evenly", marginTop: -B }}>
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              width: 22,
              height: 26,
              backgroundColor: "#D97757",
              border: `${B}px solid rgba(255,255,255,0.85)`,
              borderTop: "none",
              borderRadius: "0 0 4px 4px",
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ── Terminal error ────────────────────────────────────────────────────────────
const LINES = [
  { text: "cat /404/index.tsx", kind: "cmd" },
  { text: "cat: /404/index.tsx: No such file or directory", kind: "err" },
  { text: "process exited with code 1", kind: "muted" },
] as const;

function TerminalError() {
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (shown >= LINES.length) return;
    const t = setTimeout(() => setShown((s) => s + 1), shown === 0 ? 900 : 520);
    return () => clearTimeout(t);
  }, [shown]);

  return (
    <div
      style={{
        fontFamily: MONO,
        backgroundColor: "#1C1C1A",
        border: "1px solid rgba(176,174,165,0.1)",
        borderLeft: "3px solid rgba(217,119,87,0.35)",
      }}
      className="text-xs text-left px-5 py-4 w-full max-w-xs space-y-1.5"
    >
      <p>
        <span style={{ color: "#D97757" }}>✦</span>
        <span style={{ color: "#788C5D" }} className="mx-1">cbc@trinity</span>
        <span style={{ color: "#B0AEA5" }}>~</span>
        <span style={{ color: "#B0AEA5" }} className="mx-1">%</span>
        {shown >= 1 && (
          <span style={{ color: "#CD9D7D" }} className="ml-1">
            {LINES[0].text}
          </span>
        )}
      </p>
      {shown >= 2 && (
        <p style={{ color: "#D97757" }}>{LINES[1].text}</p>
      )}
      {shown >= 3 && (
        <p style={{ color: "rgba(176,174,165,0.35)" }}>{LINES[2].text}</p>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function NotFound() {
  return (
    <div className="pt-14 min-h-screen flex items-center justify-center relative overflow-hidden">

      {/* Static scanlines */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.013) 3px, rgba(255,255,255,0.013) 4px)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Moving scan highlight */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: 80,
          background:
            "linear-gradient(to bottom, transparent, rgba(255,255,255,0.016), transparent)",
          animation: "scanmove 7s linear infinite",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      {/* Ghost 404 watermark */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          fontFamily: MONO,
          fontSize: "clamp(10rem, 36vw, 26rem)",
          fontWeight: 700,
          lineHeight: 1,
          color: "#D97757",
          opacity: 0.05,
          userSelect: "none",
          pointerEvents: "none",
          letterSpacing: "-0.04em",
        }}
      >
        404
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-6 px-6 text-center">
        <ClaudeBot />

        {/* Glitchy 404 */}
        <div
          style={{
            fontFamily: MONO,
            fontSize: "clamp(5rem, 18vw, 11rem)",
            fontWeight: 700,
            lineHeight: 1,
            color: "#FAF9F5",
            animation: "glitch404 6s infinite",
            letterSpacing: "-0.02em",
            userSelect: "none",
          }}
        >
          404
        </div>

        <p
          style={{ fontFamily: MONO }}
          className="text-xs text-stone/40 tracking-widest uppercase -mt-2"
        >
          page not found
        </p>

        <TerminalError />

        <Link
          href="/"
          style={{ fontFamily: MONO }}
          className="text-sm text-stone/40 hover:text-terracotta transition-colors mt-1"
        >
          ← go home
        </Link>
      </div>
    </div>
  );
}
