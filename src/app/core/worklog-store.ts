import { computed, effect, inject, Service, signal } from '@angular/core';
import { NewProject, NewTimeEntry, Project, TimeEntry } from './models';
import { LocalStore } from './storage';

const PROJECTS_KEY = 'worklog.projects';
const ENTRIES_KEY = 'worklog.entries';

/**
 * Single source of truth for app state. Pages read signals from here and call the
 * mutation methods; persistence happens as a side effect of state changes.
 */
@Service()
export class WorklogStore {
  private readonly store = inject(LocalStore);

  readonly projects = signal<Project[]>(this.store.read(PROJECTS_KEY, []));
  readonly entries = signal<TimeEntry[]>(this.store.read(ENTRIES_KEY, []));

  readonly activeProjects = computed(() => this.projects().filter((p) => !p.archived));

  readonly projectById = computed(() => new Map(this.projects().map((p) => [p.id, p])));

  /** Entries newest first, which is how every list wants them. */
  readonly entriesByDateDesc = computed(() =>
    [...this.entries()].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0)),
  );

  constructor() {
    effect(() => this.store.write(PROJECTS_KEY, this.projects()));
    effect(() => this.store.write(ENTRIES_KEY, this.entries()));
  }

  addProject(input: NewProject): Project {
    const project: Project = { ...input, id: newId(), archived: false };
    this.projects.update((list) => [...list, project]);
    return project;
  }

  updateProject(id: string, patch: Partial<NewProject>): void {
    this.projects.update((list) => list.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }

  setProjectArchived(id: string, archived: boolean): void {
    this.projects.update((list) => list.map((p) => (p.id === id ? { ...p, archived } : p)));
  }

  addEntry(input: NewTimeEntry): TimeEntry {
    const entry: TimeEntry = { ...input, id: newId() };
    this.entries.update((list) => [...list, entry]);
    return entry;
  }

  deleteEntry(id: string): void {
    this.entries.update((list) => list.filter((e) => e.id !== id));
  }
}

function newId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
