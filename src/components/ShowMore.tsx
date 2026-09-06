"use client";

// Expand / collapse toggle for truncated lists (events, announcements,
// projects). Styled like the join page's action links, in the terracotta
// accent. The parent owns the boolean; this just renders the right label.
export default function ShowMore({
  expanded,
  onClick,
  className = "",
}: {
  expanded: boolean;
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
      {expanded ? "← show less" : "show more →"}
    </button>
  );
}
