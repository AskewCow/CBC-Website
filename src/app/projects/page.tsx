"use client";

import { useState } from "react";
import { mockProjects, type Project } from "@/data/mock";
import TerminalPrompt from "@/components/TerminalPrompt";

const TOOL_LABEL: Record<Project["builtWith"], string> = {
  "claude-api": "Claude API",
  "claude-code": "Claude Code",
  "claude-web": "Claude Web",
  other: "Other",
};

const TOOL_COLOR: Record<Project["builtWith"], string> = {
  "claude-api": "#D97757",
  "claude-code": "#6A9BCC",
  "claude-web": "#788C5D",
  other: "#B0AEA5",
};

type Filter = "all" | Project["builtWith"];
const FILTERS: Filter[] = ["all", "claude-api", "claude-code", "claude-web"];

export default function ProjectsPage() {
  const [filter, setFilter] = useState<Filter>("all");

  const visible =
    filter === "all"
      ? mockProjects
      : mockProjects.filter((p) => p.builtWith === filter);

  return (
    <div className="pt-14 min-h-screen">
      {/* ── Page header ── */}
      <div className="max-w-7xl mx-auto px-6 pt-8 md:pt-14 pb-10 border-b border-border">
        <TerminalPrompt folder="projects" command="ls --published" />

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div>
            <h1 className="font-sans text-4xl font-semibold mb-2">Project Showcase</h1>
            <p className="font-sans text-base text-stone">
              Member builds shipped from Discord.
            </p>
          </div>

          {/* Filters */}
          <div className="flex gap-0 flex-wrap shrink-0">
            {FILTERS.map((f) => {
              const count =
                f === "all"
                  ? mockProjects.length
                  : mockProjects.filter((p) => p.builtWith === f).length;
              return (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  className={`text-xs px-4 py-2 border-b-2 transition-all mr-2 ${
                    filter === f
                      ? "border-terracotta text-foreground"
                      : "border-transparent text-stone hover:text-foreground"
                  }`}
                >
                  {f === "all" ? `all (${count})` : `${TOOL_LABEL[f as Exclude<Filter,"all">]} (${count})`}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Card grid ── */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {visible.length === 0 ? (
          <p
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
            className="text-sm text-stone/40 py-16 text-center"
          >
            no projects match that filter
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-6">
            {visible.map((p, idx) => (
              <ProjectCard key={p.id} project={p} idx={idx} />
            ))}
          </div>
        )}

        <p
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
          className="text-xs text-stone/25 mt-14 pt-8 border-t border-border"
        >
          projects are submitted via /submit-project in Discord and published after committee review
        </p>
      </div>
    </div>
  );
}

function ProjectCard({ project, idx }: { project: Project; idx: number }) {
  const accentColor = TOOL_COLOR[project.builtWith];

  return (
    <div className="group relative bg-surface hover:bg-surface-2 transition-colors overflow-hidden flex flex-col">
      {/* Colored top accent stripe */}
      <div style={{ backgroundColor: accentColor, height: "3px", flexShrink: 0 }} />

      <div className="p-5 sm:p-8 flex flex-col flex-1 relative">
        {/* Decorative index number — background element */}
        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            color: "#FAF9F5",
            opacity: 0.04,
            fontSize: "7rem",
            lineHeight: 1,
            position: "absolute",
            top: "0.5rem",
            right: "1rem",
            userSelect: "none",
            pointerEvents: "none",
            fontWeight: 700,
          }}
        >
          {String(idx + 1).padStart(2, "0")}
        </span>

        {/* Tool label */}
        <div className="mb-6">
          {project.builtWith === "other" ? (
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                color: accentColor,
                fontSize: "0.65rem",
                letterSpacing: "0.05em",
              }}
            >
              other
            </span>
          ) : (
            <div className="flex flex-col gap-0.5">
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  color: accentColor,
                  fontSize: "0.55rem",
                  letterSpacing: "0.07em",
                  opacity: 0.7,
                }}
              >
                built with
              </span>
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  color: accentColor,
                  fontSize: "0.65rem",
                  letterSpacing: "0.05em",
                }}
              >
                {TOOL_LABEL[project.builtWith]}
              </span>
            </div>
          )}
        </div>

        {/* Name */}
        <h3 className="font-sans text-xl font-semibold leading-snug mb-2">
          {project.name}
        </h3>

        {/* Builder */}
        <p
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
          className="text-xs text-stone mb-5"
        >
          by {project.builder}
        </p>

        {/* Description */}
        <p className="font-sans text-sm text-stone leading-relaxed flex-1 mb-6">
          {project.description}
        </p>

        {/* Tags + GitHub */}
        <div className="flex items-end justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <span
                key={tag}
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
                className="text-xs text-stone/40 border border-border px-2 py-0.5"
              >
                {tag}
              </span>
            ))}
          </div>
          <a
            href={project.github}
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
            className="shrink-0 text-xs opacity-0 group-hover:opacity-100 transition-all px-3 py-1.5 border border-sky/40 text-sky hover:bg-sky/10"
          >
            github ↗
          </a>
        </div>
      </div>
    </div>
  );
}
