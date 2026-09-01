"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const TRACE: { text: string; color: string }[] = [
  { text: "Error: ENOENT: no such file or directory", color: "#D97757" },
  { text: "  at Router.navigate (react-router@8.x)", color: "rgba(250,249,245,0.3)" },
  { text: "  at handleRequest (/app/src/main.tsx:12)", color: "rgba(250,249,245,0.3)" },
  { text: "  at processTicksAndRejections (node:internal)", color: "rgba(250,249,245,0.3)" },
  { text: "", color: "" },
  { text: "Resolving...", color: "#B0AEA5" },
];

const SUGGESTIONS = [
  { path: "/", label: "home" },
  { path: "/projects", label: "projects" },
  { path: "/events", label: "events" },
  { path: "/join", label: "how to join" },
];

export default function NotFoundPage() {
  const pathname = usePathname();
  const [shown, setShown] = useState(0);
  const [resolved, setResolved] = useState(false);

  useEffect(() => {
    if (shown < TRACE.length) {
      const delay = shown === 0 ? 400 : shown < 5 ? 70 : 650;
      const t = setTimeout(() => setShown((n) => n + 1), delay);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setResolved(true), 500);
    return () => clearTimeout(t);
  }, [shown]);

  return (
    <div className="pt-14 min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-lg">
        {/* Terminal window */}
        <div className="bg-surface border border-border overflow-hidden">
          <div className="bg-surface-2 border-b border-border px-4 py-2.5 flex items-center gap-3">
            <div className="flex gap-1.5">
              <div style={{ backgroundColor: "rgba(255,95,87,0.75)" }} className="w-3 h-3 rounded-full" />
              <div style={{ backgroundColor: "rgba(255,189,46,0.75)" }} className="w-3 h-3 rounded-full" />
              <div style={{ backgroundColor: "rgba(40,200,64,0.75)" }} className="w-3 h-3 rounded-full" />
            </div>
            <span
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
              className="text-xs text-stone/50 ml-1"
            >
              cbc@trinity ~ — claude
            </span>
          </div>

          <div className="p-6">
            {/* Prompt */}
            <div
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
              className="text-sm mb-5"
            >
              <span style={{ color: "#D97757" }}>✦</span>
              <span style={{ color: "#788C5D" }} className="ml-1.5">cbc@trinity</span>
              <span style={{ color: "#B0AEA5" }} className="mx-1">~</span>
              <span style={{ color: "#B0AEA5" }}>%</span>
              <span style={{ color: "#FAF9F5" }} className="ml-2">
                navigate to {pathname}
              </span>
            </div>

            {/* Trace */}
            <div
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
              className="text-xs leading-7 mb-5"
            >
              {TRACE.slice(0, shown).map((line, i) =>
                line.text ? (
                  <div key={i} style={{ color: line.color }}>{line.text}</div>
                ) : (
                  <div key={i} style={{ minHeight: "1.75rem" }} />
                )
              )}
            </div>

            {/* Resolution */}
            {resolved && (
              <div className="animate-fade-up">
                <div
                  style={{ fontFamily: "'JetBrains Mono', monospace", color: "#788C5D" }}
                  className="text-xs mb-3"
                >
                  ✓ did you mean one of these?
                </div>
                <div className="space-y-1.5 mb-6">
                  {SUGGESTIONS.map((s) => (
                    <Link
                      key={s.path}
                      href={s.path}
                      style={{ fontFamily: "'JetBrains Mono', monospace" }}
                      className="flex items-center gap-2 text-sm text-sky hover:text-foreground transition-colors"
                    >
                      <span className="text-stone/30">→</span>
                      {s.path}
                      <span className="text-stone/30">— {s.label}</span>
                    </Link>
                  ))}
                </div>
                <div className="flex items-center">
                  <span style={{ color: "#D97757" }}>✦</span>
                  <span style={{ color: "#788C5D", fontFamily: "'JetBrains Mono', monospace" }} className="ml-1.5">cbc@trinity</span>
                  <span style={{ color: "#B0AEA5", fontFamily: "'JetBrains Mono', monospace" }} className="mx-1">~</span>
                  <span style={{ color: "#B0AEA5", fontFamily: "'JetBrains Mono', monospace" }}>%</span>
                  <span
                    style={{ color: "#FAF9F5", fontFamily: "'JetBrains Mono', monospace", display: "inline-block", width: "0.55em" }}
                    className="ml-2 animate-blink"
                  >
                    ▊
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        <p
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
          className="text-xs text-stone/25 text-center mt-4"
        >
          404 · page not found
        </p>
      </div>
    </div>
  );
}
