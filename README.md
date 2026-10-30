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

## Status

Done:

- Projects: create, archive/restore, hourly rate per project
- Time entries: log hours per project per day, delete
- Monthly summary: hours and amount per project, totals per currency
- Unit tests (Vitest) and CI (GitHub Actions)

## Roadmap

Roughly in order:

1. Edit a project in place (name, rate) and an entry (hours, note)
2. Payments: record what has been paid, show outstanding balance per project
3. Filter entries by project and month; CSV export for a month
4. Replace `localStorage` with a backend API (ASP.NET Core) using the Resource API (`httpResource`)
5. SSR + hydration
6. End-to-end tests with Playwright

## Notes on the Angular side

This is also where I try the current Angular (v22) way of doing things rather than the
NgModule/RxJS patterns I know from older apps:

- state as signals in a `@Service()` store, derived views with `computed()`
- forms with `@angular/forms/signals` (schema-based validation, `[formField]`)
- native control flow, lazy `loadComponent` routes, zoneless by default
- Vitest instead of Karma/Jasmine
