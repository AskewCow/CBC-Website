I need help designing a website for my Claude Builder Club. I want to see what you can make of it. The only thing that I want to be done UI//UX wise is the front page to look like a minimized terminal that types out. From there it is all up to you. In the guide I give different pages and what not, but feel free to merge pages together to make them feel more full/interconnected if you want. The color scheme is just a suggestion, you do not need to stick to it: ✳ cbc@trinity ~ % claude "describe the website"

CBC Website Brief
A ground-up rebuild of the Claude Builder Club site — the public face of a Trinity College Dublin student club that ships real applications with Claude. Read-only, no login: every page is something a member or a prospective member reads.

Trinity College Dublin
Direction agreed
Forms: placeholder
DB migration pending
01 — Overview

What it is
The Claude Builder Club (CBC) is a student society at Trinity College Dublin focused on building genuine AI applications with Claude and the Anthropic API. This is a complete rebuild from scratch — the earlier plan was to patch the old site, but the decision changed to a clean rebuild for full design freedom.

The site’s job is narrow: show what the club is and what its members make. Projects, events, and announcements all originate in the club’s Discord server and flow to the site through a shared database. There is no dashboard, no account system, and nothing to log into — the Discord server remains the place where things actually happen.

Companion project

The CBC Discord bot (C:\Users\Adam\Documents\CBC-Discord-Bot) is already built and past beta. It is the sole source of the site’s live content.

02 — Design direction

“A terminal that got excited about building”
The Claude star — the orange starburst — is the mark. The interface leans into a terminal / Claude Code aesthetic as its core differentiator, not as a garnish. Dark mode is the default, with a light mode available via next-themes.

The home screen
The page opens on a terminal hero: on load, a terminal types out the club’s introduction as a prompt-and-response, $ claude "what is the claude builder club?" style. This is the signature moment and the first thing a visitor sees — deliberately not an oversized marketing hero.

Directly beneath sits the CLI stats bar — a strip that “fetches” the club’s live numbers (members, projects shipped, events run) and prints them with ✓ checkmarks, as though a command just resolved:

$ cbc stats --live
✓ members     — from Supabase
✓ projects    — from Supabase
✓ events      — from Supabase
Below that, entry points to the showcase, events, and joining — on an asymmetric grid with oversized numerals for the stats, never a centered row of feature cards.

Aesthetic rules
Monospace for code, stats, and labels; a clean sans-serif for body copy.
Asymmetric grids; oversized type for numbers; motion used surgically, only where it carries meaning.
Real data on screen at all times — the site should feel alive, not like marketing copy.
Actively avoiding: hero → three feature cards → CTA → footer; gradient blobs; generic icon sets; the default component-library look; anything that reads as templated.
Palette
Shared with the Discord bot’s embed colours, so both surfaces read as one brand.

Terracotta
#D97757
Primary accent — close to the Claude star
Sky
#6A9BCC
Links, secondary accent
Sage
#788C5D
Success states, attended badges
Sand
#CD9D7D
Hover states, warm highlights
Black
#141413
Dark ground / light-mode text
White
#FAF9F5
Warm off-white — light ground
Stone
#B0AEA5
Muted text, borders
Mist
#E8E6DC
Subtle surfaces, light mode
Recurring terminal components
Hero terminal — types the club intro on page load.
CLI stats bar — club stats printed with ✓ checkmarks.
Resources terminal — step through the API-setup commands one at a time, each with a copy button.
404 terminal — a fake error trace that resolves into a helpful redirect.
03 — Pages

The site, page by page
Home
/
Terminal hero + CLI stats bar + entry points to the rest of the site.

feeds — member / project / event counts
Project showcase
/projects
A gallery of member builds that have been published from Discord (see section 04). Read-only — there is no voting on the site. Each entry shows name, description, what it was built with (Claude Code / Claude Web / Other), the builder, a GitHub link, and a thumbnail.

feeds — projects (published only)
Events
/events
Upcoming and past club events — workshops, hackathons, research salons, committee meetings, tabling — as a list / calendar with date, location, and description.

feeds — events, event_registrations
Announcements
/announcements
A feed mirroring the Discord #announcements channel: title, body, date, pinned items first.

feeds — announcements
How to join
/join
A plain-language guide that replaces the old, confusing two-form process, alongside a live Discord server widget. The join form itself is a placeholder until the club’s updated forms are released.

feeds — live Discord widget · form pending
Resources / Getting started
/resources
An interactive terminal that walks through setting up Anthropic API access, one copyable command at a time.

static content
Newsletter signup
footer / join
A quiet background signup — no dedicated page. Placeholder for now, pending the updated form; wire up the write path once it exists.

writes — newsletter_signups · form pending
404
*
A terminal error-trace page that resolves into a link back to something useful.

static content
Explicitly excluded

No leaderboard on the website. The Discord invite leaderboard stays in Discord only.

04 — Content flow

How a project reaches the site
A member submits a build with /submit-project in Discord.
The committee reviews and votes on it in Discord (👍 Feature It / 👎 Pass). All voting happens in Discord — never on the website.
A project is published to the site automatically when either its vote total crosses an agreed threshold, or a committee member runs a publish command in Discord.
Once published, it appears in the showcase. The site only ever reads projects that have been marked published.
Needs building on the bot

A published flag on the project record, the vote-threshold trigger, and the manual publish command. Today the bot only closes voting after 7 days and recolours the review embed — it marks nothing as website-ready. Events and announcements need matching write paths too (see section 05).

05 — Data & infrastructure

One database, two clients
The bot currently keeps everything in a local SQLite file. Phase 0 of the website work is migrating the public-facing tables to Supabase (PostgreSQL) so the bot and the site read the same data.

Moves to Supabase (bot writes, site reads): members, events, event_registrations, projects, project_votes, announcements. Plus newsletter_signups (site-only).
Stays in the bot’s SQLite (internal, the site never needs it): tickets, config, onboarding sessions, invites, shoutout log.
Access: the bot uses a Supabase service key (full access); the site uses an anon key that can only read published rows (row-level security).
Known gaps

The bot does not persist announcements yet — /format-message only posts to Discord — and it never sets a published flag on projects. Both need bot changes before the Announcements and Showcase pages have anything to read.

06 — Tech stack

Confirmed choices
Framework
Next.js 15 (App Router), TypeScript
Database
Supabase (PostgreSQL), shared with the bot
Styling
Tailwind CSS v4, Framer Motion for animation
UI primitives
Radix UI (unstyled) — to stay clear of a generic component-library look
Auth
None for v1 — the site is entirely read-only and public. The earlier plan carried Discord OAuth for on-site voting; with voting staying in Discord, it is not needed unless a later feature calls for it.
Hosting
Vercel