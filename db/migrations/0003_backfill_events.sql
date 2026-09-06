-- Backfill of past events from the 2025/26 academic year that predate the
-- Discord bot's event tracking. These would normally be created by the bot from
-- a Discord scheduled event; here they are entered by hand.
--
--   created_by       = 'manual'  (distinguishes them from bot-created rows)
--   guild_id/message_id/event_channel_id = null  (no Discord origin)
--   registered_count = attended_count  (only a headcount is known)
--   created_at       = one week before the event
--
-- starts_at is epoch SECONDS. Times below were converted from Europe/Dublin
-- local time: GMT (UTC+0) for the Jan–Mar dates, IST (UTC+1) for 1 Apr 2026
-- (EU DST began 29 Mar 2026).
--
-- Safe to re-run: a row is skipped if an event with the same name and start
-- time already exists.

begin;

with incoming (name, type, description, location, starts_at, duration_minutes, attended_count) as (
  values
    (
      'CBC First Event – Online Kickoff',
      'committee_meeting',
      'Whether you''re curious about CBC or interested in joining the committee, this is the perfect place to start. See you there!',
      'Online',
      1769698800::bigint,   -- 2026-01-29 15:00 Europe/Dublin
      30::int,
      56::int
    ),
    (
      'Claude Code Workshop',
      'workshop',
      'If you''ve been curious about AI-powered development tools or want to level up your coding skills, this is your chance. No more copy-pasting from the website, Claude Code navigates your entire codebase.',
      'Boland Library Group Study Rooms',
      1770818400,           -- 2026-02-11 14:00 Europe/Dublin
      120,
      28
    ),
    (
      'When Do Language Models Refuse?',
      'research_salon',
      'Introduction for AI interpretability, investigating refusal direction in LLM weights, and more!',
      'Hamilton Glassroom',
      1772024400,           -- 2026-02-25 13:00 Europe/Dublin
      60,
      34
    ),
    (
      'CBC Hackathon – Build Something That Matters',
      'hackathon',
      'A social impact hackathon where members come together to build creative AI-powered solutions to real-world challenges across health, education, governance, and creativity.',
      'The Portal, Trinity Business School',
      1774605600,           -- 2026-03-27 10:00 Europe/Dublin
      480,
      92
    ),
    (
      'Claude Code Workshop #2',
      'workshop',
      'Continuation on the first Claude Code workshop, covering advanced features of Claude Code.',
      'O''Reilly Institute',
      1775044800,           -- 2026-04-01 13:00 Europe/Dublin (IST)
      60,
      24
    )
)
insert into events (
  name, type, description, location, starts_at, ends_at,
  duration_minutes, ping, created_by, created_at,
  registered_count, attended_count
)
select
  i.name, i.type, i.description, i.location, i.starts_at,
  i.starts_at + i.duration_minutes * 60,
  i.duration_minutes, false, 'manual', i.starts_at - 604800,
  i.attended_count, i.attended_count
from incoming i
where not exists (
  select 1 from events e
  where e.name = i.name and e.starts_at = i.starts_at
);

commit;
