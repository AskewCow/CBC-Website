"use client";

import { useState, useEffect } from "react";

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

// The floating Claude mascot: a terracotta bot with blinking `> <` eyes and
// four little legs, bobbing on the `bot-float` keyframes (src/app/globals.css).
// Shared by the 404 page and the empty Events state.
export default function ClaudeBot() {
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
