"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DISCORD_INVITE } from "@/lib/constants";

export default function Nav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const links = [
    { to: "/projects", label: "projects" },
    { to: "/events", label: "events" },
    { to: "/announcements", label: "announcements" },
    { to: "/join", label: "join" },
    { to: "/resources", label: "resources" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="w-full px-6 h-14 grid grid-cols-[1fr_auto] md:grid-cols-3 items-center">
        {/* Left: logo */}
        <Link
          href="/"
          className="justify-self-start flex items-center gap-2 font-mono text-sm whitespace-nowrap"
        >
          <span style={{ color: "#D97757", fontSize: "1.1rem" }}>✦</span>
          <span className="font-medium text-foreground">claude builder club</span>
        </Link>

        {/* Center: nav links */}
        <div className="hidden md:flex items-center justify-center gap-7">
          {links.map(({ to, label }) => {
            const isActive = pathname === to;
            return (
              <Link
                key={to}
                href={to}
                className={`font-mono text-xs tracking-wide transition-colors ${
                  isActive
                    ? "text-terracotta"
                    : "text-stone hover:text-foreground"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </div>

        {/* Right: discord + mobile menu */}
        <div className="flex items-center justify-end">
          <a
            href={DISCORD_INVITE}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:flex items-center gap-1 font-mono text-xs px-3 py-1.5 border border-border text-stone hover:text-foreground hover:border-stone/40 transition-colors"
          >
            discord
            <span className="ml-0.5 text-sky">↗</span>
          </a>

          <button
            onClick={() => setOpen((o) => !o)}
            className="md:hidden -mr-1 p-1 text-stone hover:text-foreground transition-colors"
            aria-label={open ? "Close navigation" : "Open navigation"}
            aria-expanded={open}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 22 22"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              aria-hidden="true"
            >
              {open ? (
                <>
                  <line x1="4.5" y1="4.5" x2="17.5" y2="17.5" />
                  <line x1="17.5" y1="4.5" x2="4.5" y2="17.5" />
                </>
              ) : (
                <>
                  <line x1="3" y1="6.5" x2="19" y2="6.5" />
                  <line x1="3" y1="11" x2="19" y2="11" />
                  <line x1="3" y1="15.5" x2="19" y2="15.5" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-border bg-background px-6 py-4 flex flex-col gap-3">
          {links.map(({ to, label }) => {
            const isActive = pathname === to;
            return (
              <Link
                key={to}
                href={to}
                onClick={() => setOpen(false)}
                className={`font-mono text-sm py-1 transition-colors ${
                  isActive ? "text-terracotta" : "text-stone hover:text-foreground"
                }`}
              >
                {label}
              </Link>
            );
          })}
          <a
            href={DISCORD_INVITE}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-sm text-sky mt-1"
          >
            discord ↗
          </a>
        </div>
      )}
    </nav>
  );
}
