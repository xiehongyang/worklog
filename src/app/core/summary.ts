import { monthOf } from './dates';
import { Project, TimeEntry } from './models';

export interface ProjectSummary {
  project: Project;
  hours: number;
  amount: number;
}

export interface MonthSummary {
  month: string;
  rows: ProjectSummary[];
  totalHours: number;
  /** One total per currency, since projects may bill in different ones. */
  totalsByCurrency: { currency: string; amount: number }[];
}

/** Hours and billable amount per project for one `YYYY-MM` month. Pure; safe to call from `computed`. */
export function summarizeMonth(projects: readonly Project[], entries: readonly TimeEntry[], month: string): MonthSummary {
  const byId = new Map(projects.map((p) => [p.id, p]));
  const hoursByProject = new Map<string, number>();

  for (const entry of entries) {
    if (monthOf(entry.date) !== month) continue;
    hoursByProject.set(entry.projectId, (hoursByProject.get(entry.projectId) ?? 0) + entry.hours);
  }

  const rows: ProjectSummary[] = [];
  for (const [projectId, hours] of hoursByProject) {
    const project = byId.get(projectId);
    if (!project) continue;
    rows.push({ project, hours, amount: round2(hours * project.hourlyRate) });
  }
  rows.sort((a, b) => b.amount - a.amount || a.project.name.localeCompare(b.project.name));

  const totals = new Map<string, number>();
  for (const row of rows) {
    totals.set(row.project.currency, round2((totals.get(row.project.currency) ?? 0) + row.amount));
  }

  return {
    month,
    rows,
    totalHours: rows.reduce((sum, r) => sum + r.hours, 0),
    totalsByCurrency: [...totals].map(([currency, amount]) => ({ currency, amount })),
  };
}

/** Months (`YYYY-MM`) that have at least one entry, newest first. */
export function monthsWithEntries(entries: readonly TimeEntry[]): string[] {
  return [...new Set(entries.map((e) => monthOf(e.date)))].sort().reverse();
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
