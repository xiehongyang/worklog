import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LocalStore } from '../../core/storage';
import { WorklogStore } from '../../core/worklog-store';
import { EntriesPage } from './entries-page';

class MemoryStore {
  read<T>(_key: string, fallback: T): T {
    return fallback;
  }
  write(): void {}
}

function set(el: HTMLElement, selector: string, value: string): void {
  const input = el.querySelector<HTMLInputElement | HTMLSelectElement>(selector)!;
  input.value = value;
  input.dispatchEvent(new Event('input', { bubbles: true }));
  input.dispatchEvent(new Event('change', { bubbles: true }));
}

describe('EntriesPage', () => {
  let fixture: ComponentFixture<EntriesPage>;
  let el: HTMLElement;
  let store: WorklogStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EntriesPage],
      providers: [{ provide: LocalStore, useClass: MemoryStore }],
    }).compileComponents();
    store = TestBed.inject(WorklogStore);
    fixture = TestBed.createComponent(EntriesPage);
    el = fixture.nativeElement;
    await fixture.whenStable();
  });

  it('asks for a project before showing the form', () => {
    expect(el.querySelector('form')).toBeNull();
    expect(el.querySelector('.empty')?.textContent).toContain('Add a project first');
  });

  it('logs hours against a project and keeps the date for the next entry', async () => {
    const p = store.addProject({ name: 'Acme', client: '', hourlyRate: 100, currency: 'AUD' });
    await fixture.whenStable();

    set(el, 'select', p.id);
    set(el, 'input[type="date"]', '2026-10-05');
    set(el, 'input[type="number"]', '2.5');
    set(el, 'input:not([type])', 'wireframes');
    el.querySelector<HTMLButtonElement>('button[type="submit"]')!.click();
    await fixture.whenStable();

    expect(store.entries()).toMatchObject([{ projectId: p.id, date: '2026-10-05', hours: 2.5, note: 'wireframes' }]);
    expect(el.querySelector('tbody')?.textContent).toContain('Acme');
    expect(el.querySelector('tfoot')?.textContent).toContain('2.5');
    expect(el.querySelector<HTMLInputElement>('input[type="date"]')!.value).toBe('2026-10-05');
    expect(el.querySelector<HTMLSelectElement>('select')!.value).toBe('');
  });

  it('rejects an entry with no hours', async () => {
    const p = store.addProject({ name: 'Acme', client: '', hourlyRate: 100, currency: 'AUD' });
    await fixture.whenStable();

    set(el, 'select', p.id);
    el.querySelector<HTMLButtonElement>('button[type="submit"]')!.click();
    await fixture.whenStable();

    expect(store.entries()).toEqual([]);
    expect(el.querySelector('.error')?.textContent).toContain('quarter hour');
  });

  it('deletes an entry', async () => {
    const p = store.addProject({ name: 'Acme', client: '', hourlyRate: 100, currency: 'AUD' });
    store.addEntry({ projectId: p.id, date: '2026-10-01', hours: 1, note: '' });
    await fixture.whenStable();

    el.querySelector<HTMLButtonElement>('button.danger')!.click();
    await fixture.whenStable();

    expect(store.entries()).toEqual([]);
    expect(el.querySelector('table')).toBeNull();
  });
});
