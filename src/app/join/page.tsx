"use client";

import Link from "next/link";
import TerminalPrompt from "@/components/TerminalPrompt";
import { DISCORD_INVITE } from "@/lib/constants";

type Block =
  | { type: "cmd"; text: string; comment?: string; href?: string }
  | { type: "action"; text: string };

const STEPS: {
  n: string;
  title: string;
  body: string;
  blocks: Block[];
  link: { label: string; href: string; external: boolean } | null;
}[] = [
  {
    n: "01",
    title: "Join the Discord",
    body: "Everything runs through Discord first: events, project submissions, announcements, and support. It's the only thing you need to do right now.",
    blocks: [{ type: "cmd", text: `open ${DISCORD_INVITE}`, href: DISCORD_INVITE }],
    link: null,
  },
  {
    n: "02",
    title: "Complete onboarding",
    body: "As soon as you join, the CBC bot will DM you with a few quick questions. Answer the questions to get verified and gain access to the server.",
    blocks: [
      { type: "action", text: "cbc-bot opened a DM: \"a few quick questions before you get started\"" },
    ],
    link: null,
  },
  {
    n: "03",
    title: "Start building",
    body: "Check the Resources and Projects pages for API setup and inspiration. Need help? Head over to Discord, open a ticket in #help and select from the help panel. Ready to showcase your project? Run /submit-project in Discord to submit it.",
    blocks: [
      {
        type: "cmd",
        text: "/submit-project",
        comment: "fill in name, description & repo in the popup",
      },
    ],
    link: { label: "api setup guide →", href: "/resources", external: false },
  },
  {
    n: "04",
    title: "Come to events",
    body: "Workshops, hackathons, and research salons every term. Register for events directly in the Discord server through #events. Stay up to date with upcoming events and opportunities to get involved.",
    blocks: [
      { type: "action", text: "attend at least one event to qualify for Claude Pro and API credits." },
    ],
    link: { label: "view upcoming events →", href: "/events", external: false },
  },
];

// Splits a command into keyword + rest and renders the keyword in accent color.
// When `href` is set, only the argument (e.g. the URL) is a link — underlined,
// same colour as the surrounding text.
function CmdText({ text, href }: { text: string; href?: string }) {
  const spaceIdx = text.indexOf(" ");
  if (spaceIdx === -1) {
    return <span style={{ color: "#CD9D7D" }}>{text}</span>;
  }
  const keyword = text.slice(0, spaceIdx);
  const rest = text.slice(spaceIdx + 1);
  return (
    <>
      <span style={{ color: "#CD9D7D" }}>{keyword}</span>{" "}
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "#FAF9F5", textDecoration: "underline" }}
        >
          {rest}
        </a>
      ) : (
        <span style={{ color: "#FAF9F5" }}>{rest}</span>
      )}
    </>
  );
}

export default function JoinPage() {
  return (
    <div className="pt-14 min-h-screen">
      {/* ── Page header ── */}
      <div className="max-w-7xl mx-auto px-6 pt-8 md:pt-14 pb-8 md:pb-12 border-b border-border grid md:grid-cols-2 gap-8 items-end">
        <div>
          <TerminalPrompt folder="join" command="cat HOW_TO_JOIN.md" />
          <h1 className="font-sans text-4xl font-semibold mb-3">How to Join</h1>
          <p className="font-sans text-base text-stone max-w-sm leading-relaxed">
            Open to all Trinity College Dublin students. No prior AI or programming
            experience needed.
          </p>
        </div>

        <div className="flex flex-col items-start md:items-end">
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
        </div>
      </div>

      {/* ── Steps ── */}
      <div className="max-w-7xl mx-auto px-6">
        {STEPS.map((step) => (
          <StepPanel key={step.n} step={step} />
        ))}
      </div>

      {/* ── Membership form notice ── */}
      <div className="max-w-7xl mx-auto px-6 py-14 border-t border-border grid md:grid-cols-2 gap-10 items-start mb-8">
        <div>
          <p
            style={{ fontFamily: "var(--font-jbmono), ui-monospace, monospace" }}
            className="text-xs text-stone/40 uppercase tracking-widest mb-5"
          >
            formal membership form
          </p>
          <p className="font-sans text-base text-stone leading-relaxed mb-2 max-w-sm">
            The official membership form is being updated. For now, joining Discord
            and getting the member role is everything you need.
          </p>
          <p
            style={{ fontFamily: "var(--font-jbmono), ui-monospace, monospace" }}
            className="text-xs text-stone/25 mt-3"
          >
            expected: Hilary term 2026
          </p>
        </div>
        <div className="flex flex-col gap-2.5 md:pt-10">
          <input
            type="text"
            placeholder="Full name"
            disabled
            className="bg-surface border border-border font-sans text-sm px-4 py-3 text-stone/25 placeholder:text-stone/15 cursor-not-allowed"
          />
          <input
            type="email"
            placeholder="TCD email (you@tcd.ie)"
            disabled
            className="bg-surface border border-border font-sans text-sm px-4 py-3 text-stone/25 placeholder:text-stone/15 cursor-not-allowed"
          />
          <button
            disabled
            className="font-sans text-sm py-3 border border-border text-stone/20 cursor-not-allowed"
          >
            form pending
          </button>
        </div>
      </div>
    </div>
  );
}

function StepPanel({ step }: { step: (typeof STEPS)[number] }) {
  return (
    <div className="py-10 md:py-16 border-b border-border grid md:grid-cols-[120px_1fr] gap-6 md:gap-16 items-start">
      {/* Step number */}
      <div>
        <span
          style={{
            fontFamily: "var(--font-jbmono), ui-monospace, monospace",
            color: "#D97757",
            fontSize: "clamp(2.5rem, 8vw, 4.5rem)",
            lineHeight: 1,
            fontWeight: 700,
            display: "block",
          }}
        >
          {step.n}
        </span>
      </div>

      {/* Content */}
      <div>
        <h3 className="font-sans text-xl md:text-3xl font-semibold mb-4 md:mb-5">
          {step.title}
        </h3>

        <p className="font-sans text-base text-stone leading-relaxed mb-8 max-w-lg">
          {step.body}
        </p>

        {/* Blocks */}
        <div className="flex flex-col gap-3 mb-6 max-w-lg">
          {step.blocks.map((block, i) =>
            block.type === "cmd" ? (
              <div key={i}>
                {block.comment && (
                  <p
                    style={{ fontFamily: "var(--font-jbmono), ui-monospace, monospace", color: "#788C5D" }}
                    className="text-xs mb-1.5 pl-1"
                  >
                    # {block.comment}
                  </p>
                )}
                <div
                  style={{
                    fontFamily: "var(--font-jbmono), ui-monospace, monospace",
                    backgroundColor: "#1C1C1A",
                    borderLeft: "3px solid rgba(217,119,87,0.4)",
                  }}
                  className="flex items-baseline gap-2 px-5 py-3.5 text-sm w-full overflow-x-auto"
                >
                  <span style={{ color: "#788C5D" }}>$</span>
                  <CmdText text={block.text} href={block.href} />
                </div>
              </div>
            ) : (
              <div
                key={i}
                style={{
                  fontFamily: "var(--font-jbmono), ui-monospace, monospace",
                  backgroundColor: "#1C1C1A",
                  borderLeft: "3px solid rgba(106,155,204,0.4)",
                }}
                className="flex items-baseline gap-2 px-5 py-3.5 text-sm w-full overflow-x-auto"
              >
                <span style={{ color: "#6A9BCC" }}>→</span>
                <span style={{ color: "#FAF9F5", opacity: 0.7 }}>{block.text}</span>
              </div>
            )
          )}
        </div>

        {/* Action link */}
        {step.link && (
          <div>
            {step.link.external ? (
              <a
                href={step.link.href}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontFamily: "var(--font-jbmono), ui-monospace, monospace" }}
                className="text-sm text-sky hover:text-foreground transition-colors"
              >
                {step.link.label}
              </a>
            ) : (
              <Link
                href={step.link.href}
                style={{ fontFamily: "var(--font-jbmono), ui-monospace, monospace" }}
                className="text-sm text-sky hover:text-foreground transition-colors"
              >
                {step.link.label}
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
