"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

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
      <div className="w-full px-6 h-14 grid grid-cols-[1fr_auto_1fr] md:grid-cols-3 items-center">
        {/* Left: logo */}
        <Link href="/" className="flex items-center gap-2 font-mono text-sm">
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
            href="https://discord.gg/rFe8tJ88ww"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:flex items-center gap-1 font-mono text-xs px-3 py-1.5 border border-border text-stone hover:text-foreground hover:border-stone/40 transition-colors"
          >
            discord
            <span className="ml-0.5 text-sky">↗</span>
          </a>

          <button
            onClick={() => setOpen((o) => !o)}
            className="md:hidden font-mono text-xs text-stone hover:text-foreground transition-colors"
            aria-label="Toggle navigation"
          >
            {open ? "close" : "menu"}
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
            href="https://discord.gg/rFe8tJ88ww"
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
