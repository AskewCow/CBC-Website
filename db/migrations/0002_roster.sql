-- Public roster projection — the ambassador + committee members shown in the
-- site's home-page sidebar.
--
-- The Discord bot rebuilds this table from role membership (see the bot repo's
-- src/utils/roster.js) whenever the relevant roles or a member's nickname
-- change; the website reads it as the narrow cbc_web role.
--
-- display_name is the member's *server* display name (nickname, falling back to
-- global name, then username) — the club asks members to /nick to their real
-- name, so this is the human-readable name we want to show.

begin;

create table roster (
  guild_id     text    not null,
  discord_id   text    not null,
  display_name text    not null,
  position     text    not null check (position in ('ambassador', 'committee')),
  sort_order   integer not null default 0,
  updated_at   bigint  not null,               -- epoch seconds
  primary key (guild_id, discord_id)
);
create index roster_position_idx on roster (position, sort_order, display_name);

alter table roster enable row level security;

create policy web_read_roster on roster
  for select to cbc_web using (true);

grant select, insert, update, delete on roster to cbc_bot;
grant select on roster to cbc_web;

commit;
