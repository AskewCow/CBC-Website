"use client";

import { useState } from "react";
import TerminalPrompt from "@/components/TerminalPrompt";

type Lang = "sh" | "py" | "ts";

type Step = {
  n: number;
  title: string;
  description: string;
  blocks: { code: string; comment?: string; lang: Lang }[];
};

const STEPS: Step[] = [
  {
    n: 1,
    title: "Get an API key",
    description:
      "Create a free account at console.anthropic.com. Navigate to API Keys and generate a new key — you only see it once. Under Billing, add a small amount of credit; API calls are not free.",
    blocks: [
      {
        lang: "sh",
        code: "open https://console.anthropic.com/settings/keys",
        comment: "# API Keys → New Key · add credit under Billing",
      },
    ],
  },
  {
    n: 2,
    title: "Install the SDK",
    description:
      "Install the official Anthropic SDK for your language. Python and TypeScript are the most common choices.",
    blocks: [
      { lang: "sh", code: "pip install anthropic", comment: "# Python" },
      {
        lang: "sh",
        code: "npm install @anthropic-ai/sdk",
        comment: "# Node.js  ·  or: pnpm add @anthropic-ai/sdk",
      },
    ],
  },
  {
    n: 3,
    title: "Set your key",
    description:
      "Export the key as an environment variable. Add it to ~/.zshrc or ~/.bashrc so you only need to do it once.",
    blocks: [
      {
        lang: "sh",
        code: 'export ANTHROPIC_API_KEY="sk-ant-..."',
        comment: "# replace with your actual key",
      },
      {
        lang: "sh",
        code: "echo 'export ANTHROPIC_API_KEY=\"sk-ant-...\"' >> ~/.zshrc",
        comment: "# persist across sessions",
      },
    ],
  },
  {
    n: 4,
    title: "Send your first message",
    description:
      "Send a message to Claude and print the response. This confirms your key is working.",
    blocks: [
      {
        lang: "py",
        comment: "# Python",
        code: `import anthropic

client = anthropic.Anthropic()  # reads ANTHROPIC_API_KEY

msg = client.messages.create(
    model="claude-sonnet-5",
    max_tokens=256,
    messages=[{"role": "user", "content": "Hello, Claude!"}],
)
print(msg.content[0].text)`,
      },
      {
        lang: "ts",
        comment: "// TypeScript — run with: npx tsx index.ts",
        code: `import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic(); // reads ANTHROPIC_API_KEY

const msg = await client.messages.create({
  model: "claude-sonnet-5",
  max_tokens: 256,
  messages: [{ role: "user", content: "Hello, Claude!" }],
});

const first = msg.content[0];
if (first.type === "text") console.log(first.text);`,
      },
    ],
  },
  {
    n: 5,
    title: "Ship it",
    description:
      "Run /submit-project in Discord — it opens a form for the project name, description, and GitHub link. Optionally set built_with: and attach a thumbnail:. It posts to the projects channel with its own discussion thread; the committee reviews it there.",
    blocks: [
      {
        lang: "sh",
        code: "/submit-project",
        comment: "# in Discord · built_with: and thumbnail: are optional",
      },
    ],
  },
];

// ── Syntax highlighting ───────────────────────────────────────────────────────
const H = {
  kw:  "#6A9BCC",  // sky    — keywords
  str: "#CD9D7D",  // sand   — strings
  cmt: "#788C5D",  // sage   — comments
  cmd: "#CD9D7D",  // sand   — shell verbs (matches JoinPage CmdText)
  env: "#6A9BCC",  // sky    — env var names
  num: "#E8E6DC",  // mist   — numbers
  def: "#FAF9F5",  // fg     — default
};

const SH_VERBS = new Set(["open", "pip", "npm", "pnpm", "export", "echo", "source", "brew"]);
const PY_KW    = new Set(["import","from","as","if","else","elif","for","in","return","def","class","print","await","async","with","not","True","False","None"]);
const TS_KW    = new Set(["import","from","const","let","var","new","if","else","return","await","async","function","class","export","default","console","type"]);

// Tokenise a single line into { text, color } pairs using a priority-ordered regex scanner.
// Pattern order: double-quote string, single-quote string, ts-comment, py/sh-comment,
// number, identifier, anything-else.
const TOKEN_RE = /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|\/\/.*$|#.*$|\b\d+\b|[a-zA-Z_$/][a-zA-Z0-9_$/-]*|[\s\S])/g;

function tokeniseLine(line: string, lang: Lang, isFirstLine: boolean): { text: string; color: string }[] {
  const kws = lang === "py" ? PY_KW : lang === "ts" ? TS_KW : null;
  const tokens: { text: string; color: string }[] = [];
  let firstWord = true;

  for (const m of line.matchAll(TOKEN_RE)) {
    const tok = m[0];
    let color = H.def;

    if (tok.startsWith('"') || tok.startsWith("'")) {
      color = H.str;
    } else if (tok.startsWith("//") || tok.startsWith("#")) {
      color = H.cmt;
    } else if (/^\d+$/.test(tok)) {
      color = H.num;
    } else if (/^[a-zA-Z_$\/]/.test(tok)) {
      if (lang === "sh") {
        if (firstWord && isFirstLine) {
          color = (SH_VERBS.has(tok) || tok.startsWith("/")) ? H.cmd : H.def;
          firstWord = false;
        } else if (/^[A-Z][A-Z0-9_]{2,}$/.test(tok)) {
          color = H.env;
        }
      } else if (kws && kws.has(tok)) {
        color = H.kw;
      }
    }

    tokens.push({ text: tok, color });
  }

  return tokens;
}

function SyntaxCode({ code, lang }: { code: string; lang: Lang }) {
  const lines = code.split("\n");
  return (
    <>
      {lines.map((line, i) => {
        const tokens = tokeniseLine(line, lang, i === 0);
        return (
          <div key={i}>
            {tokens.map((tok, j) => (
              <span key={j} style={{ color: tok.color }}>{tok.text}</span>
            ))}
          </div>
        );
      })}
    </>
  );
}

// ── Copy button ───────────────────────────────────────────────────────────────
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch { /* noop */ }
  };
  return (
    <button
      onClick={copy}
      style={{ fontFamily: "'JetBrains Mono', monospace" }}
      className={`text-xs px-3 py-1.5 transition-colors border ${
        copied
          ? "text-sage border-sage/30"
          : "text-stone/30 border-transparent hover:text-stone hover:border-border"
      }`}
    >
      {copied ? "✓ copied" : "copy"}
    </button>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function ResourcesPage() {
  const [active, setActive] = useState(1);
  const step = STEPS.find((s) => s.n === active)!;

  return (
    <div className="pt-14 min-h-screen">
      {/* ── Page header ── */}
      <div className="max-w-7xl mx-auto px-6 pt-8 md:pt-14 pb-10 border-b border-border">
        <TerminalPrompt folder="resources" command="./api-setup.sh" />
        <h1 className="font-sans text-4xl font-semibold mb-2">Getting Started</h1>
        <p className="font-sans text-base text-stone">
          Anthropic API setup, one step at a time. Copy each command and run it in your terminal.
        </p>
      </div>

      {/* ── Progress tabs ── */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center border-b border-border overflow-x-auto no-scrollbar">
          {STEPS.map((s) => (
            <button
              key={s.n}
              onClick={() => setActive(s.n)}
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
              className={`flex items-center gap-2 px-5 py-4 text-xs whitespace-nowrap border-b-2 transition-all -mb-px ${
                s.n === active
                  ? "border-terracotta text-foreground"
                  : s.n < active
                  ? "border-transparent text-sage"
                  : "border-transparent text-stone/40 hover:text-stone"
              }`}
            >
              <span
                style={{
                  color: s.n < active ? "#788C5D" : s.n === active ? "#D97757" : undefined,
                }}
              >
                {s.n < active ? "✓" : `0${s.n}`}
              </span>
              <span className="hidden sm:inline">{s.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Step content ── */}
      <div className="max-w-7xl mx-auto px-6 py-8 md:py-14">
        <div className="grid md:grid-cols-[1fr_2fr] gap-12 md:gap-16 items-start">
          {/* Left: step header */}
          <div>
            <div
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                color: "#D97757",
                fontSize: "clamp(2.5rem, 8vw, 5rem)",
                lineHeight: 1,
                fontWeight: 700,
              }}
            >
              0{step.n}
            </div>
            <h2 className="font-sans text-2xl font-semibold mt-4 mb-4 leading-snug">
              {step.title}
            </h2>
            <p className="font-sans text-base text-stone leading-relaxed">
              {step.description}
            </p>

            <div
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                borderLeft: "2px solid rgba(106,155,204,0.3)",
              }}
              className="pl-4 mt-8 text-xs text-stone/40 leading-relaxed"
            >
              stuck? ask in{" "}
              <a
                href="https://discord.com/invite/rFe8tJ88ww"
                className="text-sky hover:text-foreground transition-colors"
              >
                #help
              </a>{" "}
              on Discord
            </div>
          </div>

          {/* Right: code blocks */}
          <div className="space-y-4">
            {step.blocks.map((block, i) => (
              <div key={i} className="bg-surface border border-border overflow-hidden">
                {block.comment && (
                  <div
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      color: "#788C5D",
                    }}
                    className="text-xs px-5 pt-4 pb-2"
                  >
                    {block.comment}
                  </div>
                )}
                <div className="flex items-start justify-between gap-4">
                  <pre
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                    className="text-sm px-5 py-4 flex-1 whitespace-pre leading-relaxed no-scrollbar overflow-x-auto"
                  >
                    <SyntaxCode code={block.code} lang={block.lang} />
                  </pre>
                  <div className="pt-3 pr-3 shrink-0">
                    <CopyButton text={block.code} />
                  </div>
                </div>
              </div>
            ))}

            {/* Navigation */}
            <div className="flex items-center justify-between pt-4">
              {active > 1 ? (
                <button
                  onClick={() => setActive((a) => a - 1)}
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  className="text-sm text-stone hover:text-foreground transition-colors px-5 py-2.5 border border-border hover:border-stone/40"
                >
                  ← prev
                </button>
              ) : (
                <div />
              )}

              <div className="flex gap-2">
                {STEPS.map((s) => (
                  <button
                    key={s.n}
                    onClick={() => setActive(s.n)}
                    className="w-1.5 h-1.5 rounded-full transition-colors"
                    style={{
                      backgroundColor:
                        s.n === active
                          ? "#D97757"
                          : s.n < active
                          ? "#788C5D"
                          : "rgba(176,174,165,0.2)",
                    }}
                  />
                ))}
              </div>

              {active < STEPS.length ? (
                <button
                  onClick={() => setActive((a) => Math.min(STEPS.length, a + 1))}
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  className="text-sm text-foreground hover:text-terracotta transition-colors px-5 py-2.5 border border-border hover:border-terracotta/40"
                >
                  next →
                </button>
              ) : (
                <a
                  href="https://discord.com/invite/rFe8tJ88ww"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  className="text-sm text-sky hover:text-foreground transition-colors px-5 py-2.5 border border-border"
                >
                  join discord →
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
