// Dev-only seed data so the site has something to render before the bot is
// wired up. Safe to re-run: it truncates the public tables first.
//   node --env-file=.env.local db/seed.dev.mjs

import { Client } from "pg";

const base = process.env.DATABASE_ADMIN_URL ?? "postgres://postgres:postgres@localhost:5433/postgres";
const url = new URL(base);
url.pathname = "/" + (process.env.DB_NAME ?? "cbc");

const now = Math.floor(Date.now() / 1000);
const days = (n) => n * 86400;

const client = new Client({ connectionString: url.toString() });
await client.connect();

try {
  await client.query(
    "truncate members, projects, project_votes, events, event_organizers, event_registrations, announcements, roster restart identity cascade",
  );

  // members — 47 present, a few departed
  const memberValues = [];
  for (let i = 1; i <= 47; i++) memberValues.push(`('m${i}', 'member${i}', ${now - days(120) + i * 3600}, ${now - days(119)}, null)`);
  for (let i = 48; i <= 51; i++) memberValues.push(`('m${i}', 'left${i}', ${now - days(200)}, null, ${now - days(30)})`);
  await client.query(
    `insert into members (discord_id, username, joined_at, onboarded_at, left_at) values ${memberValues.join(",")}`,
  );

  // projects — 8 published, 2 still under review (unpublished)
  const projects = [
    ["TCD Course Planner", "Parses the Trinity module handbook and recommends course combinations based on your CAO points, major, and career goals. Handles prerequisite chains automatically.", "Sarah Chen", "claude_api", "https://github.com/sarahchen/tcd-course-planner", ["education", "typescript", "next.js"], true],
    ["Research Paper Summarizer", "Batch-processes PDFs from arXiv or DOI links, generates structured summaries with key findings, methodology, and limitations. Built for postgrad researchers.", "James O'Brien", "claude_api", "https://github.com/jamesobrien/paper-summarizer", ["research", "python", "fastapi"], true],
    ["Lab Report Assistant", "Guides science students through lab report structure — formats results tables, suggests discussion points, checks against departmental rubrics.", "Priya Nair", "claude_code", "https://github.com/priyanair/lab-report-ai", ["education", "react", "claude-code"], true],
    ["Trinity Events Bot", "Scrapes the college events calendar, clusters related events, and sends personalised daily digests via Discord. 120 active subscribers in first week.", "Adam Walsh", "claude_api", "https://github.com/adamwalsh/trinity-events-bot", ["discord", "python", "scraping"], true],
    ["Code Review Companion", "Reviews pull requests using Claude Code, leaves structured inline comments, checks for common security issues, and suggests test cases for uncovered branches.", "Liu Wei", "claude_code", "https://github.com/liuwei/code-review-companion", ["devtools", "typescript", "github-actions"], true],
    ["Cúpla Focal", "Irish language conversation partner. Corrects grammar in real time, explains idioms, and tracks vocabulary growth over sessions. Built for Leaving Cert prep.", "Seán Byrne", "claude_api", "https://github.com/seanbyrne/cupla-focal", ["language", "education", "svelte"], true],
    ["Student Budget Tracker", "Categorises bank statement exports, flags unusual spending, and generates a plain-English monthly summary. Trained on typical Dublin student expense patterns.", "Maria Kovač", "claude_web", "https://github.com/mariakovac/student-budget", ["fintech", "vue", "python"], true],
    ["Dissertation Outline Generator", "Turns a thesis statement and bibliography into a structured chapter outline with argument flows and suggested evidence slots. Supports 12 citation styles.", "Aoife Murphy", "claude_api", "https://github.com/aoifemurphy/dissertation-ai", ["academia", "react", "node.js"], true],
    ["Grade Predictor (under review)", "Estimates final module grades from continuous-assessment marks and historical grade distributions.", "Test Submitter", "other", "https://github.com/example/grade-predictor", [], false],
    ["Timetable Optimiser (under review)", "Solves for a conflict-free timetable given module choices and preferred free days.", "Another Submitter", "claude_code", "https://github.com/example/timetable-opt", [], false],
  ];
  for (let i = 0; i < projects.length; i++) {
    const [name, desc, builder, builtWith, gh, tags, published] = projects[i];
    await client.query(
      `insert into projects (name, description, builder_name, submitter_tag, submitted_by, submitted_at, built_with, github_url, tags, vote_closed, published, published_at)
       values ($1,$2,$3,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
      [name, desc, builder, `u${i}`, now - days(60 - i * 5), builtWith, gh, tags, published, published, published ? now - days(58 - i * 5) : null],
    );
  }

  // events — 3 upcoming, 3 past
  const events = [
    ["Hackathon: Build in 48h", "hackathon", "Lloyd Institute, Room 1.05", now + days(10), 2880, "48-hour hackathon. Ship something real with Claude by Sunday evening. Teams of 2–4 or solo. API credits provided. Judged on ambition and execution.", 0, 0],
    ["Workshop: Claude API for Beginners", "workshop", "Hamilton Building, Room G01", now + days(4), 90, "Zero-to-deployed in 90 minutes. We'll wire up an Anthropic API key, write a basic chat loop, and deploy it to Vercel. Bring a laptop.", 0, 0],
    ["Research Salon: LLMs in Academia", "research_salon", "Ussher Library, Seminar Room 2", now + days(18), 120, "Roundtable on how large language models are changing research workflows. Members present 5-minute lightning demos followed by open discussion.", 0, 0],
    ["Tabling: Freshers' Week", "tabling", "Front Square", now - days(20), 300, "Come say hello at our Freshers' Week table. Ask questions, see what members have built, and sign up for the club. No experience needed.", 40, 34],
    ["Workshop: Getting Started with Claude Code", "workshop", "Science Gallery, Seminar Room", now - days(35), 120, "First meeting of the year. We'll cover Claude Code setup, basic prompting strategies, and the club's project submission process. Bring a laptop.", 31, 28],
    ["Project Showcase: End of Hilary Term", "workshop", "Lloyd Institute, Lecture Theatre 2", now - days(120), 120, "End-of-term showcase. Members present completed projects to an audience of students and a panel of guests from industry.", 44, 41],
  ];
  for (const [name, type, loc, startsAt, dur, desc, reg, att] of events) {
    await client.query(
      `insert into events (name, type, location, starts_at, ends_at, duration_minutes, created_by, created_at, registered_count, attended_count)
       values ($1,$2,$3,$4,$5,$6,'seed',$7,$8,$9)`,
      [name, type, loc, startsAt, startsAt + dur * 60, dur, startsAt - days(14), reg, att],
    );
  }

  // announcements
  const announcements = [
    ["Hackathon registrations now open", "Sign up for the hackathon in #hackathon-signup on Discord. Teams of 2–4 or solo. We're providing $50 in Anthropic API credits per team. Deadline is next week — slots are limited.", now - days(2)],
    ["API credits available for active members", "We've secured a grant of API credits for members actively working on a club project. DM a committee member on Discord with a one-line description of what you're building and we'll sort you out.", now - days(9)],
    ["Welcome to Michaelmas term", "New year, new builds. Eight projects from last year are now live in the showcase — check them out at /projects. This term we're running a hackathon in October and a research salon series. See you in Discord.", now - days(30)],
  ];
  for (const [title, body, postedAt] of announcements) {
    await client.query(
      `insert into announcements (title, body, author_id, author_tag, posted_at) values ($1,$2,'100000000000000001','Adam Walsh',$3)`,
      [title, body, postedAt],
    );
  }

  // roster — the ambassador + committee list the bot keeps in sync from Discord
  // role membership. display_name is the member's server nickname.
  const roster = [
    ["Rían Murphy", "ambassador", 0],
    ["Aoife Brennan", "ambassador", 1],
    ["Ciarán Kelly", "committee", 0],
    ["Niamh Walsh", "committee", 1],
    ["Seán O'Brien", "committee", 2],
    ["Caoimhe Ryan", "committee", 3],
    ["Fionnuala Mac Diarmada", "committee", 4],
    ["Tadhg Burke", "committee", 5],
    ["Eimear Collins", "committee", 6],
  ];
  for (let i = 0; i < roster.length; i++) {
    const [name, position, sortOrder] = roster[i];
    await client.query(
      `insert into roster (guild_id, discord_id, display_name, position, sort_order, updated_at)
       values ('seed', $1, $2, $3, $4, $5)`,
      [`r${i}`, name, position, sortOrder, now],
    );
  }

  const stats = await client.query("select * from club_stats");
  console.log("seeded. club_stats:", stats.rows[0]);
} finally {
  await client.end();
}
