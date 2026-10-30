import { TestBed } from '@angular/core/testing';
import { LocalStore } from './storage';
import { WorklogStore } from './worklog-store';

class FakeLocalStore {
  data = new Map<string, unknown>();
  read<T>(key: string, fallback: T): T {
    return (this.data.get(key) as T) ?? fallback;
  }
  write(key: string, value: unknown): void {
    this.data.set(key, value);
  }
}

describe('WorklogStore', () => {
  let fake: FakeLocalStore;
  let store: WorklogStore;

  beforeEach(() => {
    fake = new FakeLocalStore();
    TestBed.configureTestingModule({ providers: [{ provide: LocalStore, useValue: fake }] });
    store = TestBed.inject(WorklogStore);
  });

  it('starts empty when nothing is persisted', () => {
    expect(store.projects()).toEqual([]);
    expect(store.entries()).toEqual([]);
  });

  it('adds a project with an id and persists it', () => {
    const project = store.addProject({ name: 'Acme', client: 'Acme Pty', hourlyRate: 90, currency: 'AUD' });

    expect(project.id).toBeTruthy();
    expect(project.archived).toBe(false);
    expect(store.projects()).toEqual([project]);

    TestBed.tick(); // run the persistence effect
    expect(fake.data.get('worklog.projects')).toEqual([project]);
  });

  it('archives a project and drops it from activeProjects', () => {
    const p = store.addProject({ name: 'A', client: '', hourlyRate: 1, currency: 'AUD' });
    store.setProjectArchived(p.id, true);

    expect(store.activeProjects()).toEqual([]);
    expect(store.projects()[0].archived).toBe(true);
  });

  it('adds and deletes entries, keeping newest first', () => {
    const p = store.addProject({ name: 'A', client: '', hourlyRate: 1, currency: 'AUD' });
    const older = store.addEntry({ projectId: p.id, date: '2026-10-01', hours: 2, note: '' });
    const newer = store.addEntry({ projectId: p.id, date: '2026-10-05', hours: 3, note: '' });

    expect(store.entriesByDateDesc().map((e) => e.id)).toEqual([newer.id, older.id]);

    store.deleteEntry(older.id);
    expect(store.entries()).toEqual([newer]);
  });

  it('restores persisted state on construction', () => {
    fake.data.set('worklog.projects', [{ id: 'p1', name: 'X', client: '', hourlyRate: 5, currency: 'AUD', archived: false }]);
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [{ provide: LocalStore, useValue: fake }] });

    const restored = TestBed.inject(WorklogStore);
    expect(restored.projects().map((p) => p.name)).toEqual(['X']);
  });
});
