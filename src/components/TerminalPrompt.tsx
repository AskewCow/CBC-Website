"use client";

import { useState, useEffect } from "react";

type Props = {
  folder: string;  // e.g. "projects" — used for both `cd /projects` and `~/projects %`
  command: string; // e.g. "ls --published"
};

const CMD_KW_COLOR = "#CD9D7D";

// Renders a partially-typed shell command with the verb highlighted.
// ./script style paths are left uncolored.
function TypedCommand({ text, chars }: { text: string; chars: number }) {
  const visible = text.slice(0, chars);
  if (!visible) return null;

  const spaceIdx = text.indexOf(" ");
  const isScript = text.startsWith("./") || text.startsWith("/submit");

  if (spaceIdx === -1 || chars <= spaceIdx) {
    return <span style={{ color: isScript ? "#FAF9F5" : CMD_KW_COLOR }}>{visible}</span>;
  }

  return (
    <>
      <span style={{ color: isScript ? "#FAF9F5" : CMD_KW_COLOR }}>{text.slice(0, spaceIdx)}</span>
      <span style={{ color: "#FAF9F5" }}>{visible.slice(spaceIdx)}</span>
    </>
  );
}

type Phase = "idle" | "cd" | "spin" | "cmd" | "done";
const SPIN_FRAMES = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧"];

function Cursor() {
  return (
    <span
      style={{ color: "#FAF9F5", display: "inline-block", width: "0.5em" }}
      className="animate-blink"
    >
      ▊
    </span>
  );
}

export default function TerminalPrompt({ folder, command }: Props) {
  const cdCmd = `cd /${folder}`;
  const [phase, setPhase] = useState<Phase>("idle");
  const [cdChars, setCdChars] = useState(0);
  const [cmdChars, setCmdChars] = useState(0);
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setPhase("cd"), 300);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (phase !== "cd") return;
    if (cdChars >= cdCmd.length) {
      const t = setTimeout(() => setPhase("spin"), 160);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setCdChars((c) => c + 1), 72);
    return () => clearTimeout(t);
  }, [phase, cdChars, cdCmd]);

  useEffect(() => {
    if (phase !== "spin") return;
    if (frame >= SPIN_FRAMES.length - 1) {
      const t = setTimeout(() => setPhase("cmd"), 120);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setFrame((f) => f + 1), 100);
    return () => clearTimeout(t);
  }, [phase, frame]);

  useEffect(() => {
    if (phase !== "cmd") return;
    if (cmdChars >= command.length) {
      setPhase("done");
      return;
    }
    const delay = cmdChars === 0 ? 380 : 68;
    const t = setTimeout(() => setCmdChars((c) => c + 1), delay);
    return () => clearTimeout(t);
  }, [phase, cmdChars, command]);

  return (
    <div
      style={{ fontFamily: "var(--font-jbmono), ui-monospace, monospace" }}
      className="text-xs mb-8 space-y-1.5 overflow-x-hidden"
    >
      {phase !== "idle" && (
        <p>
          <span style={{ color: "#D97757" }}>✦</span>
          <span style={{ color: "#788C5D" }} className="mx-1">cbc@trinity</span>
          <span style={{ color: "#B0AEA5" }}>~</span>
          <span style={{ color: "#B0AEA5" }} className="mx-1">%</span>
          <span className="ml-1"><TypedCommand text={cdCmd} chars={cdChars} /></span>
          {phase === "cd" && <Cursor />}
        </p>
      )}

      {phase === "spin" && (
        <p style={{ color: "#B0AEA5", paddingLeft: "0.25rem" }}>
          {SPIN_FRAMES[frame]}
        </p>
      )}

      {(phase === "cmd" || phase === "done") && (
        <p>
          <span style={{ color: "#D97757" }}>✦</span>
          <span style={{ color: "#788C5D" }} className="mx-1">cbc@trinity</span>
          <span style={{ color: "#B0AEA5" }}>~/{folder}</span>
          <span style={{ color: "#B0AEA5" }} className="mx-1">%</span>
          <span className="ml-1"><TypedCommand text={command} chars={cmdChars} /></span>
          {phase === "cmd" && <Cursor />}
        </p>
      )}
    </div>
  );
}
