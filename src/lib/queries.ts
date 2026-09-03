import { unstable_cache } from "next/cache";
import { query } from "./db";

// ── View-model types (what the components render) ─────────────────────────────
export type Project = {
  id: number;
  name: string;
  description: string;
  builder: string;
  builtWith: "claude-api" | "claude-code" | "claude-web" | "other";
  github: string | null;
  tags: string[];
};

export type Event = {
  id: number;
  title: string;
  date: string; // YYYY-MM-DD, Europe/Dublin
  time: string; // HH:MM, 24h
  location: string;
  type: "hackathon" | "workshop" | "salon" | "tabling" | "committee";
  description: string;
  upcoming: boolean;
  attendees?: number;
};

export type Announcement = {
  id: number;
  title: string;
  body: string;
  date: string; // YYYY-MM-DD
  pinned: boolean;
  postedBy: string;
};

export type ClubStats = {
  members: number;
  projectsShipped: number;
  eventsRun: number;
};

export type RosterMember = { discordId: string; name: string };
export type Roster = { ambassadors: RosterMember[]; committee: RosterMember[] };

// ── Enum mapping: bot's canonical values → the website's ──────────────────────
const BUILT_WITH: Record<string, Project["builtWith"]> = {
  claude_api: "claude-api",
  claude_code: "claude-code",
  claude_web: "claude-web",
  other: "other",
  none: "other",
};

const EVENT_TYPE: Record<string, Event["type"]> = {
  workshop: "workshop",
  hackathon: "hackathon",
  research_salon: "salon",
  committee_meeting: "committee",
  tabling: "tabling",
};

// ── Helpers ──────────────────────────────────────────────────────────────────
// One formatter, reused — constructing Intl.DateTimeFormat is the expensive bit.
const DUBLIN_FMT = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Europe/Dublin",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

function dublinParts(epochSeconds: number): { date: string; time: string } {
  const parts = DUBLIN_FMT.formatToParts(new Date(epochSeconds * 1000));
  const p = (t: string) => parts.find((x) => x.type === t)?.value ?? "";
  return {
    date: `${p("year")}-${p("month")}-${p("day")}`,
    time: `${p("hour").replace("24", "00")}:${p("minute")}`,
  };
}

// Wrap a data loader in the ISR cache + a swallow-and-fallback guard, so a
// Postgres blip renders an empty page instead of a 500.
function cached<T>(keyParts: string[], tag: string, loader: () => Promise<T>, fallback: T) {
  return unstable_cache(
    async () => {
      try {
        return await loader();
      } catch (err) {
        console.error(`query [${tag}] failed:`, err);
        return fallback;
      }
    },
    keyParts,
    { tags: [tag], revalidate: 300 },
  );
}

// ── Projects ─────────────────────────────────────────────────────────────────
type ProjectRow = {
  id: string;
  name: string;
  description: string;
  builder_name: string;
  submitter_tag: string | null;
  built_with: string | null;
  github_url: string | null;
  tags: string[] | null;
};

export const getPublishedProjects = cached<Project[]>(
  ["published-projects"],
  "projects",
  async () => {
    const rows = await query<ProjectRow>(
      `select id, name, description, builder_name, submitter_tag,
              built_with, github_url, tags
         from projects
        where published
        order by published_at desc nulls last, submitted_at desc`,
    );
    return rows.map((r) => ({
      id: Number(r.id),
      name: r.name,
      description: r.description,
      builder: r.submitter_tag || r.builder_name,
      builtWith: BUILT_WITH[r.built_with ?? "other"] ?? "other",
      github: r.github_url,
      tags: r.tags ?? [],
    }));
  },
  [],
);

// ── Events ───────────────────────────────────────────────────────────────────
type EventRow = {
  id: string;
  name: string;
  type: string;
  description: string | null;
  location: string | null;
  starts_at: string;
  duration_minutes: number;
  attended_count: number;
  registered_count: number;
};

export const getEvents = cached<Event[]>(
  ["events"],
  "events",
  async () => {
    const rows = await query<EventRow>(
      `select id, name, type, description, location, starts_at,
              duration_minutes, attended_count, registered_count
         from events
        order by starts_at desc
        limit 500`,
    );
    const now = Date.now();
    return rows.map((r) => {
      const startsAt = Number(r.starts_at);
      const endsAt = startsAt + r.duration_minutes * 60;
      const upcoming = endsAt * 1000 > now;
      const { date, time } = dublinParts(startsAt);
      return {
        id: Number(r.id),
        title: r.name,
        date,
        time,
        location: r.location || "TBD",
        type: EVENT_TYPE[r.type] ?? "workshop",
        description: r.description ?? "",
        upcoming,
        attendees: !upcoming && r.attended_count > 0 ? r.attended_count : undefined,
      };
    });
  },
  [],
);

// ── Announcements ────────────────────────────────────────────────────────────
type AnnouncementRow = {
  id: string;
  title: string;
  body: string;
  author_id: string;
  author_tag: string | null;
  posted_at: string;
  pinned: boolean;
};

export const getAnnouncements = cached<Announcement[]>(
  ["announcements"],
  "announcements",
  async () => {
    const rows = await query<AnnouncementRow>(
      `select id, title, body, author_id, author_tag, posted_at, pinned
         from announcements
        order by pinned desc, posted_at desc
        limit 200`,
    );
    return rows.map((r) => ({
      id: Number(r.id),
      title: r.title,
      body: r.body,
      date: dublinParts(Number(r.posted_at)).date,
      pinned: r.pinned,
      postedBy: r.author_tag || "the committee",
    }));
  },
  [],
);

// ── Club stats (for the home CLI stats bar) ──────────────────────────────────
type StatsRow = { members: string; projects_shipped: string; events_run: string };

export const getClubStats = cached<ClubStats>(
  ["club-stats"],
  "stats",
  async () => {
    const [row] = await query<StatsRow>(
      `select members, projects_shipped, events_run from club_stats`,
    );
    return {
      members: Number(row?.members ?? 0),
      projectsShipped: Number(row?.projects_shipped ?? 0),
      eventsRun: Number(row?.events_run ?? 0),
    };
  },
  { members: 0, projectsShipped: 0, eventsRun: 0 },
);

// ── Roster (ambassadors + committee, for the home sidebar) ───────────────────
// The Discord bot rebuilds the `roster` table from role membership; we just
// split it into the two lists the sidebar renders. `display_name` is the
// member's server nickname.
type RosterRow = { discord_id: string; display_name: string; position: string };

export const getRoster = cached<Roster>(
  ["roster"],
  "roster",
  async () => {
    const rows = await query<RosterRow>(
      `select discord_id, display_name, position
         from roster
        order by sort_order, lower(display_name)`,
    );
    const pick = (position: string) =>
      rows
        .filter((r) => r.position === position)
        .map((r) => ({ discordId: r.discord_id, name: r.display_name }));
    return { ambassadors: pick("ambassador"), committee: pick("committee") };
  },
  { ambassadors: [], committee: [] },
);
