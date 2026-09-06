"use client";

// "show more →" toggle for truncated lists (events, announcements, projects).
// Styled like the join page's action links, in the terracotta accent.
export default function ShowMore({
  onClick,
  className = "",
}: {
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        fontFamily: "var(--font-jbmono), ui-monospace, monospace",
        color: "#D97757",
      }}
      className={`text-sm transition-opacity hover:opacity-70 ${className}`}
    >
      show more →
    </button>
  );
}
