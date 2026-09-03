import { getAnnouncements } from "@/lib/queries";
import TerminalPrompt from "@/components/TerminalPrompt";
import AnnouncementBody from "@/components/AnnouncementBody";

const ACCENT_COLORS = ["#D97757", "#6A9BCC", "#788C5D", "#CD9D7D", "#B0AEA5"];

export const revalidate = 300;

export default async function AnnouncementsPage() {
  const sorted = await getAnnouncements();

  return (
    <div className="pt-14 min-h-screen">
      {/* ── Page header ── */}
      <div className="max-w-5xl mx-auto px-6 pt-8 md:pt-14 pb-10 border-b border-border">
        <TerminalPrompt folder="announcements" command="cat feed.log" />
        <h1 className="font-sans text-3xl md:text-4xl font-semibold mb-2">Announcements</h1>
        <p className="font-sans text-base text-stone">
          News from the club, as it happens.
        </p>
      </div>

      {/* ── Feed ── */}
      <div className="max-w-5xl mx-auto px-6 pb-20">
        {sorted.map((ann, i) => {
          const accent = ACCENT_COLORS[i % ACCENT_COLORS.length];
          return (
            <article key={ann.id} className="relative py-10 md:py-14 border-b border-border">
              {/* Colored left accent bar */}
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: "2rem",
                  bottom: "2rem",
                  width: "3px",
                  backgroundColor: accent,
                }}
              />

              <div className="pl-6">
                {/* Meta row */}
                <div className="flex flex-wrap items-center gap-4 mb-4">
                  <span
                    style={{ fontFamily: "var(--font-jbmono), ui-monospace, monospace" }}
                    className="text-xs text-stone/40"
                  >
                    {ann.date}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-jbmono), ui-monospace, monospace",
                      color: accent,
                      fontSize: "0.65rem",
                      letterSpacing: "0.06em",
                    }}
                  >
                    posted by {ann.postedBy}
                  </span>
                </div>

                {/* Title */}
                <h2 className="font-sans text-xl md:text-3xl font-semibold leading-snug mb-4 md:mb-6 max-w-2xl">
                  {ann.title}
                </h2>

                {/* Body */}
                <AnnouncementBody>{ann.body}</AnnouncementBody>
              </div>
            </article>
          );
        })}

        <p
          style={{ fontFamily: "var(--font-jbmono), ui-monospace, monospace" }}
          className="text-xs text-stone/25 pt-10"
        >
          announcements are posted by committee members and synced here automatically
        </p>
      </div>
    </div>
  );
}
