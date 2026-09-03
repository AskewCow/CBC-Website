# Pre-launch test checklist

Work through this before pushing and before deploying to the VM. It covers the
website, the Discord bot, the integration between them, and the VM cutover.

Legend: **[W]** website · **[B]** bot · **[I]** integration · run each item and
tick it.

Setup for testing locally: website on `:8443` (`npm run dev`), Postgres up
(`npm run db:up`), bot running (`npm start` in `CBC-Discord-Bot`), a test Discord
server where you have Admin and can add a couple of alt accounts as "committee".

---

## 0. Pre-flight

- [ ] **[W]** `npm run build` passes clean (type-check + lint, no warnings you didn't expect)
- [ ] **[W]** `npm start` serves the production build on `:8443`
- [ ] **[W]** Fresh clone works with only: `npm install` → `cp .env.example .env.local` → `npm run db:setup` → `npm run dev`
- [ ] **[B]** `npm test` → **175/175 pass** (needs `cbc_test` DB — `npm run db:setup` in the website repo creates it)
- [ ] **[B]** `npm run deploy` registers **17** commands to the guild with no errors
- [ ] **[W/B]** `.env.local` / `.env` are gitignored; `.env.example` files ARE committed and current
- [ ] No secret (`REVALIDATE_SECRET`, DB passwords, `BOT_TOKEN`) appears in any committed file or the build output

---

## 1. Website — pages render (empty database)

Run `npm run db:reset` (no seed) first so every table is empty.

- [ ] `/` — hero animation runs; stats bar reads **0 / 0 / 0**; "recent builds" empty; "what's coming" empty; no crash
- [ ] `/projects` — "no projects match that filter"; filter tabs read `all (0)` etc.
- [ ] `/events` — header only, no "upcoming"/"past" sections, no error
- [ ] `/announcements` — header + trailing note only
- [ ] `/join`, `/resources` — unchanged, static
- [ ] `/does-not-exist` — terminal 404 page, and the HTTP status is actually **404** (`curl -I`)
- [ ] No console errors on any page (open devtools, click through all)

## 2. Website — pages render (with data)

`npm run db:seed` (or use real bot data).

- [ ] `/` stats bar numbers exactly match: present members, published projects, past events
- [ ] `/projects` filter tabs: counts correct; clicking each filter narrows the grid; a filter with 0 matches shows the "no projects" line
- [ ] Project card shows name, `by <builder>`, description, tags, GitHub button
- [ ] Project with **no tags** → card renders, no empty tag row
- [ ] Project with **no GitHub URL** → no GitHub button
- [ ] Project `built_with: other` → shows "other" label in stone, no "built with" line
- [ ] GitHub button opens the repo in a **new tab**
- [ ] Very long project name and 200-char description → layout holds, no overflow; home "recent builds" clamps description to 2 lines
- [ ] `/events` — upcoming sorted **soonest first**, past sorted **most recent first**
- [ ] Event with no description → renders fine
- [ ] Event with no location → shows "TBD"
- [ ] Past event with attendance → "N attended"; past event with 0 attendance → no attendance line
- [ ] Event time shows the correct **wall-clock for Dublin** (create one at a known time via the bot and compare)
- [ ] Home "what's coming" shows the **2 soonest** upcoming events

## 3. Website — announcement markdown

Post these via `/format-message` (style: Announcement) and check `/announcements`:

- [ ] `**bold**`, `*italic*`, `__x__`, `~~strike~~` → render as **plain text**, markers gone
- [ ] `# Heading` / `## Heading` at line start → plain text, no heading size
- [ ] `> quote` and `- bullet` / `1. item` → readable, no broken layout
- [ ] `` `inline code` `` and ```` ```code block``` ```` → plain text
- [ ] `[Label](https://example.com)` → real link, **sky `#6A9BCC`**, underline, opens new tab
- [ ] A bare `https://…` URL with no label → autolinks
- [ ] Multiple paragraphs (blank line between) → visible spacing between them
- [ ] **XSS:** body containing `<script>alert(1)</script>` and `<img src=x onerror=alert(1)>` → renders as inert text, nothing executes, no image tag in the DOM
- [ ] The raw markdown is still in the DB (`select body from announcements` shows the `**`, `[..](..)` etc.)

## 4. Website — revalidation API

- [ ] `POST /api/revalidate` with **no** `Authorization` → **401**
- [ ] with `Authorization: Bearer wrong` → **401**
- [ ] with the correct secret + `{"tags":["projects"]}` → **200**, and a data change made just before shows up on `/projects` within ~1–2 s
- [ ] `{"tags":["bogus"]}` → 200, `revalidated: []` (unknown tags ignored)
- [ ] malformed body (`not json`) → 200 or 400, **never 500**
- [ ] With the website process **stopped**, the bot doing a publish → bot logs `Website revalidate … failed`, but the DB write still succeeded; starting the site shows the change (after ISR window or a manual revalidate)

## 5. Website — resilience

- [ ] Stop Postgres, then load every page → pages render (empty or last-cached), **no 500**; bot-independent pages (`/join`, `/resources`) fully fine
- [ ] Start Postgres again → data reappears within the ISR window or on manual revalidate
- [ ] Unset `DATABASE_URL` and start the site → still boots, data pages empty, logs an error, no crash

## 6. Website — responsive & misc

- [ ] Mobile width (375px): nav collapses to `menu` / `close`; every page readable; **no horizontal scroll** on any page
- [ ] Tablet width (768px): layouts hold
- [ ] Nav active-link highlight matches the current route on all 5 links
- [ ] Browser tab title is "Claude Builder Club"
- [ ] Footer newsletter input is disabled with "form pending" (intentional)
- [ ] Decide: keep `robots: noindex` (still WIP) or flip it for launch — it's set in `src/app/layout.tsx`

---

## 7. Bot — startup & config

- [ ] `npm start` → logs `Bot ready`, then `Postgres (shared public data) connected`
- [ ] Stop Postgres, start the bot → logs the "Postgres unreachable at startup" error, bot **still connects to Discord**; internal (SQLite) commands still work; PG-backed ones fail with a handled error, not a crash
- [ ] `.env` missing `DATABASE_URL` → clear logged error
- [ ] `.env` with `WEBSITE_REVALIDATE_URL` blank → revalidate calls are silently skipped, everything else works
- [ ] Bot restarts cleanly (Ctrl-C, `npm start` again) with no duplicate side-effects

## 8. Bot — `/submit-project`

- [ ] Happy path: choose `built_with`, fill modal (name, description, real public GitHub URL) → embed in projects channel + a copy in review channel + auto-thread + mod-log entry; row exists in `projects` with `published = false`
- [ ] The project is **not** on the website yet
- [ ] Invalid GitHub URL (not `github.com/owner/repo`) → error embed, **no row created**
- [ ] `projects_channel` not configured → error embed pointing to `/setup-add`
- [ ] `projects_review_channel` not configured → error embed
- [ ] Optional thumbnail attachment → image shows on the embed
- [ ] Name/description with emoji, quotes, markdown, non-Latin chars → stored and shown correctly (name renders as plain text on the site)
- [ ] Description longer than 200 chars (paste past the limit) → rejected (Discord caps at 200; server-side guard also)
- [ ] Submit twice with the same name → two rows (allowed); confirm that's acceptable
- [ ] Run `/submit-project` but dismiss the modal → no row, no orphaned message

## 9. Bot — voting & auto-publish

- [ ] Three different users click **Feature It** in the review channel → embed updates live with running counts and "vote ends" time
- [ ] Same user clicks the same button again → "you have already voted"
- [ ] User clicks the opposite button → vote changes, counts update, reply says "(changed)"
- [ ] After the 7-day window, a late vote → "voting has closed"
- [ ] Vote on a project whose row was deleted → "project not found"
- [ ] **Auto-publish:** set a test project's `vote_ends_at` to a past timestamp with **net 👍−👎 ≥ 3** → within one 5-min tick: `vote_closed = true`, `published = true`, `published_at` set, tags derived, a "Published to the CBC website" notice appears in the project thread, mod log posted, site `/projects` shows it within ~1–2 s
- [ ] Net exactly **+2** at close → `vote_closed = true`, embed updated, **not published**, no revalidate
- [ ] Net **+3 with some downvotes** (e.g. 5 up / 2 down) → published
- [ ] A project already published manually before its vote closes → the scheduler's publish step is a **no-op** (no double thread notice, no double mod log)

## 10. Bot — `/publish-project` & `/unpublish-project`

- [ ] Non-committee, non-admin user → "access denied"
- [ ] `/publish-project` autocomplete lists **only unpublished** projects from **this** guild
- [ ] Publish → project on site within ~1–2 s; mod-log entry; reply includes the site URL; tags derived if the project had none
- [ ] Publish a project that **already had tags** → tags are **not** overwritten
- [ ] Publish an already-published project → "already published" error
- [ ] `/unpublish-project` autocomplete lists **only published** projects
- [ ] Unpublish → gone from site within ~1–2 s; mod-log entry
- [ ] Unpublish a project that isn't published → "not published" error
- [ ] Target a project id from another guild (if you can) → "not found in this server"
- [ ] Publish while the website is down → DB updated, revalidate fails in the log, site catches up later

## 11. Bot — GitHub tag derivation

- [ ] Repo **with topics** → its topics (up to 5) plus its primary language appear as tags
- [ ] Repo **with no topics** → top 3 languages only
- [ ] Empty repo (no topics, no languages) → publishes with **no tags**, no error
- [ ] Private or non-existent repo → publishes with no tags; log shows a warning
- [ ] GitHub URL with a trailing `.git` or a `/tree/main/...` path → owner/repo still parsed correctly
- [ ] `C++` / `C#` languages → normalised to `cpp` / `csharp`
- [ ] Set `GITHUB_TOKEN` → tag derivation still works (and you're now on the 5000/hr limit)
- [ ] No `GITHUB_TOKEN`, derive tags ~60+ times in an hour → rate-limited calls return no tags, no crash

## 12. Bot — events

**`/event-create`**
- [ ] Happy path → embed in events channel with Register button, auto-thread, organisers auto-registered, mod log; appears on site `/events` under "upcoming"
- [ ] Bad datetime format → error before the modal opens
- [ ] Datetime in the past → "must be scheduled in the future"
- [ ] `events_channel` not configured → error
- [ ] Duration below 1 → blocked by Discord's min value
- [ ] 5 organisers with a duplicate among them → deduped
- [ ] `ping: true` → a separate `@everyone` message follows the embed
- [ ] No description → optional, event still created

**Registration (buttons)**
- [ ] Click **Register** → ephemeral confirm + a DM with a Withdraw button; organisers get a DM; embed participant count +1; site `registered_count` updates; revalidate logged
- [ ] Register again → "you're already registered"
- [ ] Register for an event that has ended → "already ended"
- [ ] **Withdraw** from the DM → count −1; organisers notified; you can register again from the event message
- [ ] Withdraw when not registered → handled message, no crash
- [ ] User with DMs closed clicks Register → "enable DMs…" message, but the registration **is** recorded
- [ ] Register, then the event is deleted, then click Withdraw on the stale DM → handled ("event not found")

**Attendance (after the event ends)**
- [ ] Event end time passes → Register button disables; non-organiser participants get a "did you attend?" DM
- [ ] Click **Yes** → `attended` set; thank-you message (custom if `/event-followup` set, else default); site `attended_count` updates; mod log
- [ ] Click **No** → "hope to see you next time"; mod log
- [ ] `/event-followup` with a message + link → the link shows in the "Yes" response
- [ ] Restart the bot midway through a post-event flow → no duplicate attendance DMs or summary DMs (state in `event_attendance_sent` / `event_summary_sent`)
- [ ] Organisers + creator receive the summary DM; summary also posted to mod log

**`/event-delete`**
- [ ] Delete an upcoming event → embed shows "Cancelled", Register removed; every non-withdrawn participant gets a cancellation DM; mod log with the notified count; site `/events` no longer lists it (revalidate)
- [ ] Registrations / organisers / reminders for that event are gone (cascade)
- [ ] Autocomplete lists only non-ended events for this guild
- [ ] Non-admin → "access denied"

## 13. Bot — `/format-message` & announcements

- [ ] style **Announcement**, `embed: true` → embed posted **and** a row in `announcements`; `/announcements` shows it after revalidate
- [ ] style **Announcement**, `embed: false` → plain-text post, still persisted
- [ ] style **Reminder / Shoutout / Resource** → posted to Discord, **no row** in `announcements`
- [ ] Link label + URL fields → stored in the body as `[label](url)`, renders as a link on the site
- [ ] URL not starting with `http` → validation error, nothing posted
- [ ] `ping_everyone: true` → separate `@everyone` message
- [ ] 2000-char body → Discord caps it; stored; site renders it
- [ ] Run it in a non-announcements channel → still persists (records that channel id); confirm that's acceptable
- [ ] Postgres down when posting an Announcement → the Discord message still posts, error logged, no row (acceptable failure mode — confirm)
- [ ] Non-admin → "access denied"

## 14. Bot — members & invite leaderboard

- [ ] A real alt account joins the guild → `members` row created; site member count +1 (revalidate stats)
- [ ] That account leaves → `left_at` set; count −1
- [ ] It rejoins → `left_at` cleared; count +1
- [ ] Onboarding completes for a member → `onboarded_at` set
- [ ] Start the bot after someone has left while it was offline → reconcile marks them departed; count is correct
- [ ] `/invites` (self) and `/invites @someone` → correct active count (leavers excluded, this guild only)
- [ ] `/invite-leaderboard all_time` → ranks by active invitees, medals for top 3
- [ ] `/invite-leaderboard live` → only counts members who joined **after** the command was run
- [ ] `include_committee: false` → committee members excluded from the ranking
- [ ] Delete a live leaderboard message → it stops auto-updating on new joins
- [ ] Someone you invited leaves → your count on the next leaderboard refresh drops by 1

## 15. Bot — schedulers

- [ ] `projectScheduler` (5 min): closes expired votes and auto-publishes per §9
- [ ] `eventScheduler` (60 s): sends the **1-day** and **1-hour** reminders exactly once each
- [ ] Create an event starting in ~50 minutes → on the next tick you get the 1-hour (and 1-day, since it's also within 24h) reminder DM; not sent again on later ticks
- [ ] "Happening now" embed update fires once when an event starts
- [ ] Kill the bot during a scheduler tick, restart → no duplicated reminders / publishes / attendance DMs
- [ ] Two events processed in the same tick → both handled

## 16. Bot — internal features regression (SQLite, untouched by the migration)

- [ ] `/setup-add`, `/setup-remove`, `/setup-view` — all config keys
- [ ] Tickets: `/ticket-panel setup`, `add-option`, open a ticket, run its flow, `/ticket-close`
- [ ] Onboarding: `/onboarding-flow set-welcome` + `add` questions → an alt joins → DM flow completes → member role assigned → mod-log "Member Joined"
- [ ] `/help` renders
- [ ] `/event-followup` with no args shows current config

---

## 17. Integration & concurrency

- [ ] Full happy path in one go: `/submit-project` → 3× Feature It → `/publish-project` → refresh `/projects` (appears, with tags) → `/unpublish-project` → refresh (gone)
- [ ] Rapid publish → unpublish → publish on the same project → the site's final state matches the DB's final state
- [ ] Two committee members run `/publish-project` on the same project within a second → one succeeds, the other gets "already published" (or a clean no-op); no double mod-log
- [ ] Bot writes while the website is mid-render → next revalidate/ISR picks it up; no partial/garbled data (counts are recomputed from source each time, not incremented blindly)
- [ ] Restart the website → immediately reflects current DB state
- [ ] Leave the whole system running idle for 10+ minutes → no error spam in either log; schedulers tick quietly

---

## 18. Security

- [ ] From the website's `DATABASE_URL` (the `cbc_web` role), try `SELECT * FROM members` → **permission denied**. Same for `project_votes`, `event_registrations`, `event_organizers`.
- [ ] As `cbc_web`, try `UPDATE projects …` and `INSERT INTO projects …` → **permission denied**
- [ ] As `cbc_web`, `SELECT * FROM projects` returns **only** `published = true` rows
- [ ] As `cbc_web`, `INSERT INTO newsletter_signups …` succeeds (the one allowed write)
- [ ] `cbc_bot` credentials appear **only** in the bot's `.env`, never in the website repo or its build output
- [ ] `/api/revalidate` cannot read or write data — only busts cache — even with a valid secret
- [ ] `GITHUB_TOKEN` (if used) is a fine-grained token scoped to **public repo read only**
- [ ] Announcement bodies cannot inject HTML/JS into the site (re-verify the XSS item from §3)

---

## 19. VM deployment (follow `db/PROVISION.md`)

- [ ] Postgres 16 installed; `listen_addresses = 'localhost'`; `pg_hba.conf` is local + loopback with `scram-sha-256` only
- [ ] `cbc` database + `cbc_bot` (BYPASSRLS) / `cbc_web` roles created with **strong, unique** passwords
- [ ] `npm run db:migrate` applies `0001_init.sql`; `schema_migrations` records it
- [ ] Re-running `npm run db:migrate` is a no-op ("schema up to date")
- [ ] Run the §18 permission checks against the **VM** database
- [ ] Website `.env.local`: `DATABASE_URL` uses port **5432**, `cbc_web`; `REVALIDATE_SECRET` is a long random string
- [ ] Bot `.env`: `DATABASE_URL` port **5432**, `cbc_bot`; `WEBSITE_BASE_URL` / `WEBSITE_REVALIDATE_URL` use the real **https** domain; `WEBSITE_REVALIDATE_SECRET` **equals** the website's `REVALIDATE_SECRET`
- [ ] `npm run build` on the VM; `npm start` serves it; a reverse proxy terminates HTTPS on the domain
- [ ] `npm run deploy` run once on the VM to register commands
- [ ] Bot starts and logs `Postgres (shared public data) connected` against the VM DB
- [ ] End-to-end on the VM: submit → publish in real Discord → appears on the live site
- [ ] Nightly `pg_dump` cron in place, writing to the block volume; **do one restore test** into a scratch DB
- [ ] `bot.db` (SQLite) is also backed up
- [ ] Both processes come back automatically after a reboot (systemd unit / pm2 / equivalent)
- [ ] Firewall: only 80/443 inbound; **5432 is not exposed**
- [ ] `.next/` and `node_modules/` are not served or world-readable

---

## 20. Go / no-go

- [ ] Every box above is ticked or has a written, accepted reason
- [ ] Both repos committed and pushed
- [ ] You can `git pull` + `npm ci` + `npm run db:migrate` + restart on the VM and be confident nothing breaks
- [ ] Rollback plan: previous commit is tagged; DB has no destructive migration to undo (0001 is additive)
