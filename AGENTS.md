# CBC Website

The public site for the Claude Builder Club (Trinity College Dublin). Read-only,
no login. Projects, events, and announcements originate in the club's Discord
server and reach the site through a shared Supabase database (bot writes, site
reads). See `src/imports/pasted_text/cbc-website-brief.md` for the full brief.

The UI was designed in Figma Make (exported as a Vite SPA) and ported to
Next.js 15 on 2026-09-01. All content is currently stubbed in `src/data/mock.ts`;
the Supabase wiring is the next phase of work.

## Stack

- **Next.js 15** (App Router), React 19, TypeScript
- **Tailwind CSS v4** via `@tailwindcss/postcss` (`postcss.config.mjs`). No
  Tailwind config file — theme tokens are defined with `@theme` in
  `src/app/globals.css`. Colours are also hardcoded as hex literals throughout
  the components (matches the original export).
- Fonts: JetBrains Mono + Inter, loaded via `@import url(...)` at the top of
  `src/app/globals.css`.
- Package manager: **npm** (`package-lock.json`). The machine has no pnpm.

## Commands

- `npm run dev` — dev server on port 8443
- `npm run build` — production build (also runs `tsc` type-checking)
- `npm start` — serve the production build on port 8443
- `npm run format` — oxfmt

## Structure

- `src/app/` — App Router. `layout.tsx` (root layout: `<html>`, `<Nav/>`,
  `<main>`, `<Footer/>`), one `page.tsx` per route, `not-found.tsx` for 404,
  `globals.css`.
- `src/components/` — `Nav.tsx` (client; active link via `usePathname`),
  `Footer.tsx` (server), `TerminalPrompt.tsx` (client; the animated
  `cd`/`ls` prompt reused across pages).
- `src/data/mock.ts` — stub data + types (`Project`, `Event`, `Announcement`).
- `src/imports/` — design reference images from Figma Make; not wired into any
  page.

Pages that run typewriter/stepper animations (`/`, `/projects`, `/events`,
`/join`, `/resources`, `not-found`) are `"use client"`. `/announcements` is a
server component. When Supabase is added, pages should fetch on the server and
pass data into small client components for the animated bits.

## Code quality

- Use double quotes for strings containing apostrophes, or escape them.
- Ensure JSX tags are closed and braces balanced.
- Page components are default exports.
