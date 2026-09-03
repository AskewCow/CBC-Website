-- CBC shared schema — the "public subgraph" the Discord bot writes and the
-- website reads.
--
-- Timestamps are epoch SECONDS stored as bigint, matching the bot's existing
-- Discord-timestamp handling (<t:unix:F>). The bot's genuinely internal tables
-- (config, tickets, onboarding, event_thank_you) stay in its SQLite file and
-- are intentionally absent here.
--
-- Roles cbc_bot (BYPASSRLS, full DML) and cbc_web (narrow, read-only public
-- data) are created by db/bootstrap.mjs before this runs.

begin;

-- ── members ──────────────────────────────────────────────────────────────────
create table members (
  discord_id    text primary key,
  username      text not null,
  joined_at     bigint not null,           -- epoch seconds
  onboarded_at  bigint,
  invite_code   text,
  left_at       bigint
);
create index members_present_idx on members (left_at) where left_at is null;

-- ── projects ─────────────────────────────────────────────────────────────────
create table projects (
  id                bigint generated always as identity primary key,
  name              text not null,
  description       text not null,
  github_url        text,
  builder_name      text not null,
  submitted_by      text not null,
  submitter_tag     text,
  submitted_at      bigint not null,
  built_with        text check (built_with in ('claude_code', 'claude_web', 'claude_api', 'other', 'none')),
  thumbnail_url     text,
  tags              text[] not null default '{}',
  guild_id          text,
  message_id        text,
  thread_id         text,
  review_message_id text,
  vote_ends_at      bigint,
  vote_closed       boolean not null default false,
  published         boolean not null default false,
  published_at      bigint
);
create index projects_published_idx on projects (published) where published;

create table project_votes (
  project_id  bigint not null references projects (id) on delete cascade,
  discord_id  text not null,
  vote        text not null check (vote in ('up', 'down')),
  voted_at    bigint not null,
  primary key (project_id, discord_id)
);

-- ── events ───────────────────────────────────────────────────────────────────
create table events (
  id                bigint generated always as identity primary key,
  name              text not null,
  type              text not null default 'workshop'
                      check (type in ('workshop', 'hackathon', 'research_salon', 'committee_meeting', 'tabling')),
  description       text,
  location          text,
  starts_at         bigint not null,        -- epoch seconds
  ends_at           bigint,
  duration_minutes  integer not null default 60,
  ping              boolean not null default false,
  ongoing_notified  boolean not null default false,
  created_by        text not null,
  guild_id          text,
  message_id        text,
  event_channel_id  text,
  created_at        bigint not null,
  registered_count  integer not null default 0,  -- denormalised: non-withdrawn registrations
  attended_count    integer not null default 0   -- denormalised: registrations with attended = true
);
create index events_starts_at_idx on events (starts_at);

create table event_organizers (
  event_id    bigint not null references events (id) on delete cascade,
  discord_id  text not null,
  primary key (event_id, discord_id)
);

create table event_registrations (
  id            bigint generated always as identity primary key,
  event_id      bigint not null references events (id) on delete cascade,
  discord_id    text not null,
  registered_at bigint not null,
  attended      boolean not null default false,
  withdrawn     boolean not null default false,
  dm_message_id text,
  unique (event_id, discord_id)
);

create table event_reminders (
  event_id  bigint not null references events (id) on delete cascade,
  type      text not null,
  sent      boolean not null default false,
  primary key (event_id, type)
);

create table event_attendance_sent (
  event_id    bigint not null references events (id) on delete cascade,
  discord_id  text not null,
  sent        boolean not null default false,
  primary key (event_id, discord_id)
);

create table event_summary_sent (
  event_id  bigint primary key references events (id) on delete cascade,
  sent      boolean not null default false
);

-- ── announcements ────────────────────────────────────────────────────────────
create table announcements (
  id          bigint generated always as identity primary key,
  title       text not null,
  body        text not null,
  author_id   text not null,
  author_tag  text,
  channel_id  text,
  message_id  text,
  posted_at   bigint not null,
  pinned      boolean not null default false
);
create index announcements_posted_at_idx on announcements (posted_at desc);

-- Note: invites, invite_leaderboards and shoutout_log stay in the bot's SQLite.
-- Only `members` is shared; the invite-leaderboard queries join the two stores
-- in application code (see inviteUtils.js).

-- ── newsletter (website-only write path) ─────────────────────────────────────
create table newsletter_signups (
  id          bigint generated always as identity primary key,
  email       text not null unique,
  created_at  bigint not null
);

-- ── public stats view for the website ────────────────────────────────────────
-- Runs with the view owner's privileges (the migration superuser), so cbc_web
-- gets aggregate counts without any row access to members.
create view club_stats as
  select
    (select count(*) from members  where left_at is null) as members,
    (select count(*) from projects where published)       as projects_shipped,
    (select count(*) from events
       where starts_at + duration_minutes * 60 < extract(epoch from now())) as events_run;

-- ── row-level security ───────────────────────────────────────────────────────
alter table members               enable row level security;
alter table projects              enable row level security;
alter table project_votes         enable row level security;
alter table events                enable row level security;
alter table event_organizers      enable row level security;
alter table event_registrations   enable row level security;
alter table event_reminders       enable row level security;
alter table event_attendance_sent enable row level security;
alter table event_summary_sent    enable row level security;
alter table announcements          enable row level security;
alter table newsletter_signups    enable row level security;

-- cbc_web: the only rows it may ever read, plus one insert path
create policy web_read_published_projects on projects
  for select to cbc_web using (published);

create policy web_read_events on events
  for select to cbc_web using (true);

create policy web_read_announcements on announcements
  for select to cbc_web using (true);

create policy web_insert_newsletter on newsletter_signups
  for insert to cbc_web with check (true);

-- ── grants ───────────────────────────────────────────────────────────────────
revoke all on all tables in schema public from public;

grant usage on schema public to cbc_bot, cbc_web;

-- bot: full DML across the subgraph (BYPASSRLS covers row visibility)
grant select, insert, update, delete on all tables in schema public to cbc_bot;
grant usage, select on all sequences in schema public to cbc_bot;

-- web: narrow surface, RLS-gated
grant select on projects, events, announcements, club_stats to cbc_web;
grant insert on newsletter_signups to cbc_web;

commit;
