# CBC Website

The public site for the **Claude Builder Club** at Trinity College Dublin.
Read-only, no login. Projects, events and announcements originate in the club's
Discord server and reach the site through a shared PostgreSQL database that the
[CBC Discord bot](https://github.com/AskewCow/CBC-Discord-Bot) writes to and the
site reads from.

- **Framework:** Next.js 15 (App Router), React 19, TypeScript
- **Styling:** Tailwind CSS v4 (`@theme` tokens in `src/app/globals.css`)
- **Data:** PostgreSQL, shared with the bot — the site connects as a narrow
  read-only role (`cbc_web`)
- **Dev server / prod server:** port **8443**

---

## 1. Prerequisites

| Tool | Version | Notes |
|---|---|---|
| Node.js | 20+ | `node -v` |
| npm | 10+ | ships with Node |
| Docker | any recent | only for **local** Postgres; production runs Postgres directly on the VM |

---

## 2. Run the website locally

```bash
git clone https://github.com/AskewCow/CBC-Website.git
cd CBC-Website
npm install

# environment
cp .env.example .env.local          # the defaults already match the local docker setup

# database: start Postgres in Docker, create roles + schema
npm run db:setup

# optional: load fake projects/events/announcements so the site isn't empty
npm run db:seed

# dev server → http://localhost:8443
npm run dev
```

That's it. `npm run db:setup` runs, in order:

1. `docker compose up -d` — Postgres 16 on **localhost:5433** (5433, not 5432, to
   avoid clashing with any other local Postgres)
2. waits for it to accept connections
3. creates the `cbc` + `cbc_test` databases and the `cbc_bot` / `cbc_web` roles
4. applies `db/migrations/*.sql`

### Production build

```bash
npm run build      # also type-checks
npm start          # serves the build on :8443
```

> **Do not run `npm run build` while `npm run dev` is running** — they share the
> `.next/` directory and building under a live dev server corrupts its webpack
> chunk cache (`Cannot find module './NNN.js'`). If that happens:
> `rm -rf .next` and restart the dev server.

### Database commands

| Command | Does |
|---|---|
| `npm run db:setup` | full local setup from nothing |
| `npm run db:migrate` | apply any new migration files |
| `npm run db:seed` | reload dev fixture data (truncates first) |
| `npm run db:reset` | destroy the volume and rebuild from scratch |
| `npm run db:down` | stop the container (keeps the data volume) |

More detail in [`db/README.md`](db/README.md). Standing this up on the Oracle VM:
[`db/PROVISION.md`](db/PROVISION.md).

---

## 3. Environment variables

### Website — `.env.local` (gitignored; template in `.env.example`)

| Var | Purpose |
|---|---|
| `DATABASE_URL` | connection as the read-only `cbc_web` role. Local: `postgres://cbc_web:cbc_web_dev@localhost:5433/cbc` |
| `DATABASE_ADMIN_URL` | superuser connection — used **only** by the `db:*` tooling scripts, not the running app |
| `DB_NAME` | database name (`cbc`) |
| `BOT_DB_PASSWORD` / `WEB_DB_PASSWORD` | passwords the bootstrap script sets on the two roles |
| `REVALIDATE_SECRET` | shared secret the bot presents to `POST /api/revalidate`. **Must equal the bot's `WEBSITE_REVALIDATE_SECRET`.** |

---

## 4. Connect the Discord bot

The bot lives in a separate repo (`../CBC-Discord-Bot`). Both processes talk to
the **same Postgres** — the bot as `cbc_bot` (full read/write), the site as
`cbc_web` (read-only). The bot also calls the site's `/api/revalidate` endpoint
so its writes appear immediately.

### One-time

```bash
cd ../CBC-Discord-Bot
npm install
cp .env.example .env        # then fill in the values below
```

Edit `CBC-Discord-Bot/.env`:

| Var | Value (local dev) |
|---|---|
| `BOT_TOKEN`, `CLIENT_ID`, `GUILD_ID` | from the Discord developer portal (unchanged) |
| `DB_PATH` | `./data/bot.db` — the bot's **internal** SQLite (config, tickets, onboarding, invite tracking). Not shared. |
| `DATABASE_URL` | `postgres://cbc_bot:cbc_bot_dev@localhost:5433/cbc` — the shared Postgres, `cbc_bot` role |
| `WEBSITE_BASE_URL` | `http://localhost:8443` |
| `WEBSITE_REVALIDATE_URL` | `http://localhost:8443/api/revalidate` |
| `WEBSITE_REVALIDATE_SECRET` | **the same string** as the website's `REVALIDATE_SECRET` |
| `GITHUB_TOKEN` | optional — a fine-grained token with public-repo read access. Raises the GitHub API limit used for project tag derivation from 60/hr to 5000/hr. |

### Every run

```bash
# from CBC-Website: make sure Postgres + the site are up
npm run db:up          # (or db:setup the first time)
npm run dev            # http://localhost:8443

# from CBC-Discord-Bot:
npm run deploy         # register slash commands with your guild (run after adding/changing commands)
npm start              # or: npm run dev  (nodemon)
```

Healthy startup logs from the bot:

```
Bot ready: CBC Bot#XXXX
Postgres (shared public data) connected
```

After any project / event / announcement action you should see:

```
Website revalidated: projects, stats
```

---

## 5. How the integration works

```
Discord  ──/submit-project, /event-create, /format-message, votes──▶  bot
   bot  ──writes──▶  Postgres (members, projects, events, announcements, …)
   bot  ──POST /api/revalidate {tags}──▶  website   (busts the ISR cache)
website ──reads (cbc_web, RLS: published/public rows only)──▶  Postgres
```

**Content flow**

| On the site | Comes from |
|---|---|
| `/projects` | `projects` where `published = true`. A project publishes **automatically** when its 7-day committee vote closes with **net 👍 − 👎 ≥ 3**, or **manually** via `/publish-project`. `/unpublish-project` reverses it. |
| project **tags** | derived on publish from the repo's GitHub **topics** + top **languages** (up to 6). Manual publish never overwrites tags already set. |
| `/events` | `events` — created by `/event-create`, deleted by `/event-delete`. "Upcoming vs past" and the attendee count are computed from the row. |
| `/announcements` | `announcements` — only `/format-message` posts with **style: 📢 Announcement** are mirrored here. Markdown in the body is flattened to plain text on the site (bold/headings/etc. lose their weight — it reads cleaner); links render as real links in the sky accent. The raw markdown is kept in the DB. |
| home stats bar | `club_stats` view — present member count, published project count, past event count. Aggregates only; no member rows are exposed to `cbc_web`. |

**Caching:** pages are ISR with a 5-minute floor (`export const revalidate = 300`)
and cache tags (`projects`, `events`, `announcements`, `stats`). The bot's
`POST /api/revalidate` call (Bearer `REVALIDATE_SECRET`) invalidates the relevant
tags on demand, so changes normally appear within a second.

---

## 6. Security model

`cbc_web` — the role the website uses — can only:

- `SELECT` published projects, all events, all announcements, and the
  `club_stats` view
- `INSERT` into `newsletter_signups`

Row-Level Security is on for every table; `cbc_web` has **no** policy for
`members`, `project_votes`, `event_registrations`, etc., so those are invisible
to it, and it has no `UPDATE`/`DELETE` anywhere. If the site's DB credentials
leaked, an attacker could read exactly what the public site already shows.

`cbc_bot` is `BYPASSRLS` with full DML and is used **only** by the bot, which is
a server process no visitor can reach.

---

## 7. Project structure

```
src/app/                     App Router
  page.tsx / HomeClient.tsx     home (server fetch → client component for the animations)
  projects|events/…             same pattern: page.tsx fetches, *Client.tsx animates
  announcements/page.tsx        server component (no client interactivity)
  api/revalidate/route.ts       the bot's cache-bust endpoint
  globals.css                   Tailwind v4 @theme tokens
src/components/               Nav, Footer, TerminalPrompt, AnnouncementBody
src/lib/db.ts                 pg Pool (cbc_web)
src/lib/queries.ts            cached data-access functions + view-model types
db/                           migrations + tooling + PROVISION.md
docker-compose.yml            local Postgres
```

---

## 8. Troubleshooting

| Symptom | Fix |
|---|---|
| `Cannot find module './NNN.js'` on a page | stale `.next` from building under a live dev server — `rm -rf .next`, restart `npm run dev` |
| site shows 0 members after starting the bot | expected — on connect the bot reconciles `members` against the real guild and marks the seed's fake members as departed. `npm run db:seed` re-adds them (survives until the next bot restart). |
| bot log: `Postgres unreachable at startup` | Postgres isn't up or `DATABASE_URL` is wrong — `npm run db:up` in the website repo |
| bot log: `Website revalidate … failed` | the site isn't running on `WEBSITE_REVALIDATE_URL`, or the secret doesn't match `REVALIDATE_SECRET` |
| `permission denied for table members` from the site | working as intended — the site must never read that table |
| port 5433 already in use | another Postgres is on 5433; change the host port in `docker-compose.yml` and the `localhost:5433` in `.env.local` |
```
