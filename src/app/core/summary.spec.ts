import { Project, TimeEntry } from './models';
import { monthsWithEntries, summarizeMonth } from './summary';

const acme: Project = { id: 'a', name: 'Acme', client: '', hourlyRate: 100, currency: 'AUD', archived: false };
const zed: Project = { id: 'z', name: 'Zed', client: '', hourlyRate: 80, currency: 'USD', archived: false };

const entries: TimeEntry[] = [
  { id: '1', projectId: 'a', date: '2026-10-01', hours: 2, note: '' },
  { id: '2', projectId: 'a', date: '2026-10-15', hours: 1.5, note: '' },
  { id: '3', projectId: 'z', date: '2026-10-20', hours: 3, note: '' },
  { id: '4', projectId: 'a', date: '2026-09-30', hours: 8, note: '' },
  { id: '5', projectId: 'gone', date: '2026-10-02', hours: 1, note: '' },
];

describe('summarizeMonth', () => {
  it('sums hours and amount per project for the month, highest amount first', () => {
    const s = summarizeMonth([acme, zed], entries, '2026-10');

    expect(s.rows.map((r) => [r.project.name, r.hours, r.amount])).toEqual([
      ['Acme', 3.5, 350],
      ['Zed', 3, 240],
    ]);
    expect(s.totalHours).toBe(6.5);
  });

  it('totals per currency and ignores entries for unknown projects', () => {
    const s = summarizeMonth([acme, zed], entries, '2026-10');
    expect(s.totalsByCurrency).toEqual([
      { currency: 'AUD', amount: 350 },
      { currency: 'USD', amount: 240 },
    ]);
  });

  it('returns an empty summary for a month with no entries', () => {
    const s = summarizeMonth([acme], entries, '2026-01');
    expect(s.rows).toEqual([]);
    expect(s.totalHours).toBe(0);
    expect(s.totalsByCurrency).toEqual([]);
  });

  it('rounds money to cents', () => {
    const s = summarizeMonth([{ ...acme, hourlyRate: 33.33 }], [{ id: 'x', projectId: 'a', date: '2026-10-01', hours: 1.25, note: '' }], '2026-10');
    expect(s.rows[0].amount).toBe(41.66);
  });
});

describe('monthsWithEntries', () => {
  it('lists distinct months newest first', () => {
    expect(monthsWithEntries(entries)).toEqual(['2026-10', '2026-09']);
  });
});
