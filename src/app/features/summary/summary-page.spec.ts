import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LocalStore } from '../../core/storage';
import { WorklogStore } from '../../core/worklog-store';
import { SummaryPage } from './summary-page';

class MemoryStore {
  read<T>(_key: string, fallback: T): T {
    return fallback;
  }
  write(): void {}
}

describe('SummaryPage', () => {
  let fixture: ComponentFixture<SummaryPage>;
  let el: HTMLElement;
  let store: WorklogStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SummaryPage],
      providers: [{ provide: LocalStore, useClass: MemoryStore }],
    }).compileComponents();
    store = TestBed.inject(WorklogStore);
    fixture = TestBed.createComponent(SummaryPage);
    el = fixture.nativeElement;
    await fixture.whenStable();
  });

  it('shows an empty state for a month without entries', () => {
    expect(el.querySelector('.empty')?.textContent).toContain('No hours logged');
  });

  it('shows per-project rows and totals for the selected month', async () => {
    const p = store.addProject({ name: 'Acme', client: 'Acme Pty', hourlyRate: 100, currency: 'AUD' });
    store.addEntry({ projectId: p.id, date: '2026-10-03', hours: 2, note: '' });
    store.addEntry({ projectId: p.id, date: '2026-10-09', hours: 1.5, note: '' });
    fixture.componentInstance.month.set('2026-10');
    await fixture.whenStable();

    const cells = Array.from(el.querySelectorAll('tbody td')).map((td) => td.textContent?.trim());
    expect(cells).toEqual(['Acme Acme Pty', '3.5', 'A$100.00', 'A$350.00']);
    expect(el.querySelector('tfoot')?.textContent).toContain('A$350.00');
    expect(el.querySelector('.month')?.textContent).toContain('October 2026');
  });

  it('moves between months', async () => {
    fixture.componentInstance.month.set('2026-01');
    fixture.componentInstance.shift(-1);
    expect(fixture.componentInstance.month()).toBe('2025-12');
    fixture.componentInstance.shift(2);
    expect(fixture.componentInstance.month()).toBe('2026-02');
  });
});
