import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { monthOf, todayIso } from '../../core/dates';
import { monthsWithEntries, summarizeMonth } from '../../core/summary';
import { WorklogStore } from '../../core/worklog-store';

@Component({
  selector: 'app-summary-page',
  imports: [CurrencyPipe, DatePipe, DecimalPipe],
  template: `
    <h1>Summary</h1>

    <div class="month-nav">
      <button type="button" class="secondary" (click)="shift(-1)" aria-label="Previous month">‹</button>
      <span class="month">{{ month() + '-01' | date: 'MMMM yyyy' }}</span>
      <button type="button" class="secondary" (click)="shift(1)" aria-label="Next month">›</button>
      @if (months().length > 0) {
        <select aria-label="Jump to month" [value]="month()" (change)="month.set($any($event.target).value)">
          @for (m of months(); track m) {
            <option [value]="m">{{ m + '-01' | date: 'MMM yyyy' }}</option>
          }
          @if (!months().includes(month())) {
            <option [value]="month()">{{ month() + '-01' | date: 'MMM yyyy' }}</option>
          }
        </select>
      }
    </div>

    @if (summary().rows.length === 0) {
      <p class="empty">No hours logged in this month.</p>
    } @else {
      <table>
        <thead>
          <tr>
            <th>Project</th>
            <th class="num">Hours</th>
            <th class="num">Rate</th>
            <th class="num">Amount</th>
          </tr>
        </thead>
        <tbody>
          @for (row of summary().rows; track row.project.id) {
            <tr>
              <td>{{ row.project.name }} <span class="muted">{{ row.project.client }}</span></td>
              <td class="num">{{ row.hours | number: '1.0-2' }}</td>
              <td class="num">{{ row.project.hourlyRate | currency: row.project.currency }}</td>
              <td class="num">{{ row.amount | currency: row.project.currency }}</td>
            </tr>
          }
        </tbody>
        <tfoot>
          <tr>
            <td>Total</td>
            <td class="num">{{ summary().totalHours | number: '1.0-2' }}</td>
            <td></td>
            <td class="num">
              @for (t of summary().totalsByCurrency; track t.currency) {
                <div>{{ t.amount | currency: t.currency }}</div>
              }
            </td>
          </tr>
        </tfoot>
      </table>
    }
  `,
  styles: `
    .month-nav { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem; }
    .month { min-width: 10rem; text-align: center; font-weight: 600; }
    .month-nav select { margin-left: auto; }
  `,
})
export class SummaryPage {
  private readonly store = inject(WorklogStore);

  readonly month = signal(monthOf(todayIso()));
  readonly months = computed(() => monthsWithEntries(this.store.entries()));
  readonly summary = computed(() => summarizeMonth(this.store.projects(), this.store.entries(), this.month()));

  shift(delta: number): void {
    const [y, m] = this.month().split('-').map(Number);
    const next = new Date(y, m - 1 + delta, 1);
    this.month.set(`${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}`);
  }
}
