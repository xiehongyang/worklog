import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'entries' },
  {
    path: 'projects',
    title: 'Projects · worklog',
    loadComponent: () => import('./features/projects/projects-page').then((m) => m.ProjectsPage),
  },
  {
    path: 'entries',
    title: 'Entries · worklog',
    loadComponent: () => import('./features/entries/entries-page').then((m) => m.EntriesPage),
  },
  {
    path: 'summary',
    title: 'Summary · worklog',
    loadComponent: () => import('./features/summary/summary-page').then((m) => m.SummaryPage),
  },
  { path: '**', redirectTo: 'entries' },
];
