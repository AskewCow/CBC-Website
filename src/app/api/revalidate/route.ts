import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";

// The Discord bot POSTs here after it writes to Postgres, so bot changes show
// up on the site without waiting for the ISR window.
//
//   POST /api/revalidate
//   Authorization: Bearer <REVALIDATE_SECRET>
//   { "tags": ["projects", "stats"] }

export const runtime = "nodejs";

const KNOWN_TAGS = new Set([
  "projects",
  "events",
  "announcements",
  "stats",
  "roster",
]);

// Coarse in-memory rate limit — the endpoint has exactly one legitimate caller
// (the bot). Survives as long as the server process does; that's enough.
const RATE_LIMIT = 30; // requests
const RATE_WINDOW_MS = 60_000;
let windowStart = 0;
let windowCount = 0;

function rateLimited(): boolean {
  const now = Date.now();
  if (now - windowStart > RATE_WINDOW_MS) {
    windowStart = now;
    windowCount = 0;
  }
  windowCount += 1;
  return windowCount > RATE_LIMIT;
}

function secretMatches(provided: string): boolean {
  const expected = process.env.REVALIDATE_SECRET ?? "";
  if (!expected || !provided) return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request: Request): Promise<Response> {
  if (rateLimited()) {
    return NextResponse.json({ error: "rate limited" }, { status: 429 });
  }

  const header = request.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";

  if (!secretMatches(token)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const requested =
    body && typeof body === "object" && Array.isArray((body as { tags?: unknown }).tags)
      ? (body as { tags: unknown[] }).tags.filter((t): t is string => typeof t === "string")
      : [];

  const revalidated: string[] = [];
  for (const tag of requested) {
    if (KNOWN_TAGS.has(tag)) {
      revalidateTag(tag);
      revalidated.push(tag);
    }
  }

  return NextResponse.json({ revalidated });
}
