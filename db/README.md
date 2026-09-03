# Shared database

One PostgreSQL instance, used by both this site (read-only, role `cbc_web`) and
the [CBC Discord bot](https://github.com/AskewCow/CBC-Discord-Bot) (read/write,
role `cbc_bot`). The bot writes members / projects / events / announcements; the
site reads the published subset.

## Local development

```bash
npm run db:setup     # docker compose up + wait + create roles/dbs + migrate
npm run db:seed      # optional: fake data so the site renders before the bot runs
npm run db:reset     # wipe the volume and rebuild from scratch
```

Postgres runs in Docker on **localhost:5433** (5432 is usually taken by another
project). Connection strings live in `.env.local` (copy from `.env.example`).

## Files

| File | Purpose |
|---|---|
| `migrations/NNNN_*.sql` | schema, applied in filename order, tracked in `schema_migrations` |
| `bootstrap.mjs` | creates the `cbc` + `cbc_test` databases and the `cbc_bot` / `cbc_web` roles |
| `migrate.mjs` | applies pending migrations |
| `wait-for-db.mjs` | polls until Postgres accepts connections |
| `seed.dev.mjs` | dev-only fake data |
| `PROVISION.md` | standing this up on the production VM |

## Security model

`cbc_web` gets `SELECT` on published projects, all events, all announcements and
the `club_stats` view, plus `INSERT` on `newsletter_signups` — nothing else. RLS
is enabled on every table; `cbc_web` has no policy for `members`, `project_votes`,
`event_registrations`, etc., so those are simply invisible to it. `cbc_bot` is
`BYPASSRLS` with full DML. See `migrations/0001_init.sql`.

## What's NOT here

The bot's internal tables (config, tickets, onboarding, invite tracking,
`event_thank_you`) stay in the bot's own SQLite file.
