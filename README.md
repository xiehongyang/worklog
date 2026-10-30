# worklog

A small, local-first time and invoice tracker for freelance work.

Track the projects you work on, log hours against them, and see what each month
adds up to per project. Data lives in the browser (`localStorage`) for now; a
backend API is on the roadmap.

## Stack

- Angular 22 — standalone components, zoneless change detection, signals, Signal Forms
- TypeScript 6, SCSS
- Vitest for unit tests

## Getting started

```bash
npm install
npm start          # dev server on http://localhost:4200
npm test           # unit tests (Vitest)
npm run build      # production build to dist/
```

## Project layout

```
src/app/
  core/        domain models, store, persistence
  features/    one folder per page (projects, entries, summary)
  app.ts       shell: header + navigation + router outlet
```

## Roadmap

See the bottom of this file as features land. Planned, roughly in order:

1. Projects: create, edit, archive
2. Time entries: log hours per project per day
3. Monthly summary: hours and amount per project
4. Payments: record what has been paid, show outstanding balance
5. Export: CSV for a month
6. Backend API (ASP.NET Core) replacing `localStorage`
7. SSR + hydration
8. End-to-end tests (Playwright) and CI
