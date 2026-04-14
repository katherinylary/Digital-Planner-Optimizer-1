# Meu Planner Digital

## Overview

A digital personal planner web app with a feminine pink/rose aesthetic. All data is stored in localStorage (no backend needed). Built with React + Vite + Tailwind CSS.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite + Tailwind CSS v4 + shadcn/ui
- **Routing**: wouter
- **Data persistence**: localStorage
- **Fonts**: Outfit (sans), Playfair Display (serif)
- **Language**: Portuguese (pt-BR)

## Architecture

Frontend-only app — no backend API needed. All data hooks use a `useLocalStorage` pattern under `src/hooks/`.

## Pages

- `/` — Home (daily overview, goals, mood, water, tasks)
- `/schedule` — Agenda (timeline + calendar views)
- `/tasks` — Tasks with categories (custom tabs)
- `/habits` — Habit tracker with frequency + streaks
- `/monthly-checklist` — Monthly progress review
- `/self-care` — Self-care rituals with frequency
- `/university` — College activities with priority
- `/professional` — Work activities, reports, reminders
- `/diary` — Journal with stickers/emojis
- `/books` — Reading tracker (want/reading/finished)
- `/important-dates` — Important dates calendar
- `/courses` — Course management with certificates
- `/settings` — Export/import data, clear data

## Key Files

- `artifacts/planner/src/App.tsx` — Router + layout
- `artifacts/planner/src/components/layout.tsx` — Sidebar navigation
- `artifacts/planner/src/hooks/` — All data hooks (localStorage)
- `artifacts/planner/src/pages/` — All page components
- `artifacts/planner/src/index.css` — Theme (pink/rose palette)

## Key Commands

- `pnpm --filter @workspace/planner run dev` — run planner locally
- `pnpm run typecheck` — full typecheck across all packages
