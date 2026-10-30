import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { form, FormField, max, min, required, submit } from '@angular/forms/signals';
import { todayIso } from '../../core/dates';
import { NewTimeEntry } from '../../core/models';
import { WorklogStore } from '../../core/worklog-store';

@Component({
  selector: 'app-entries-page',
  imports: [FormField, DatePipe, DecimalPipe],
  template: `
    <h1>Entries</h1>

    @if (projects().length === 0) {
      <p class="empty">Add a project first, then log hours against it here.</p>
    } @else {
      <form class="inline" novalidate (submit)="$event.preventDefault(); add()">
        <label>
          Project
          <select [formField]="form.projectId" [attr.aria-invalid]="showError(form.projectId())">
            <option value="">Choose…</option>
            @for (p of projects(); track p.id) {
              <option [value]="p.id">{{ p.name }}</option>
            }
          </select>
          @if (showError(form.projectId())) {
            <span class="error">{{ form.projectId().errors()[0].message }}</span>
          }
        </label>
        <label>
          Date
          <input type="date" [formField]="form.date" [attr.aria-invalid]="showError(form.date())" />
          @if (showError(form.date())) {
            <span class="error">{{ form.date().errors()[0].message }}</span>
          }
        </label>
        <label>
          Hours
          <input type="number" step="0.25" [formField]="form.hours" [attr.aria-invalid]="showError(form.hours())" />
          @if (showError(form.hours())) {
            <span class="error">{{ form.hours().errors()[0].message }}</span>
          }
        </label>
        <label>
          Note
          <input [formField]="form.note" placeholder="optional" />
        </label>
        <button type="submit" [disabled]="form().submitting()">Log hours</button>
      </form>
    }

    @if (entries().length === 0) {
      @if (projects().length > 0) {
        <p class="empty">Nothing logged yet.</p>
      }
    } @else {
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Project</th>
            <th class="num">Hours</th>
            <th>Note</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          @for (e of entries(); track e.id) {
            <tr>
              <td>{{ e.date | date: 'EEE d MMM' }}</td>
              <td>{{ projectName(e.projectId) }}</td>
              <td class="num">{{ e.hours | number: '1.0-2' }}</td>
              <td class="muted">{{ e.note }}</td>
              <td class="num">
                <button type="button" class="danger" (click)="remove(e.id)" aria-label="Delete entry">Delete</button>
              </td>
            </tr>
          }
        </tbody>
        <tfoot>
          <tr>
            <td colspan="2">Total</td>
            <td class="num">{{ totalHours() | number: '1.0-2' }}</td>
            <td colspan="2"></td>
          </tr>
        </tfoot>
      </table>
    }
  `,
})
export class EntriesPage {
  private readonly store = inject(WorklogStore);

  readonly projects = this.store.activeProjects;
  readonly entries = this.store.entriesByDateDesc;
  readonly totalHours = computed(() => this.entries().reduce((sum, e) => sum + e.hours, 0));

  readonly model = signal<NewTimeEntry>(this.emptyEntry());
  readonly form = form(this.model, (e) => {
    required(e.projectId, { message: 'Pick a project' });
    required(e.date, { message: 'Date is required' });
    min(e.hours, 0.25, { message: 'Log at least a quarter hour' });
    max(e.hours, 24, { message: 'A day has 24 hours' });
  });

  async add(): Promise<void> {
    await submit(this.form, async () => {
      const { date } = this.model();
      this.store.addEntry(this.model());
      // Keep the date: logging several entries for the same day is the common case.
      this.form().reset({ ...this.emptyEntry(), date });
      return undefined;
    });
  }

  remove(id: string): void {
    this.store.deleteEntry(id);
  }

  projectName(id: string): string {
    return this.store.projectById().get(id)?.name ?? '(deleted project)';
  }

  showError(field: { invalid(): boolean; touched(): boolean }): boolean {
    return field.invalid() && field.touched();
  }

  private emptyEntry(): NewTimeEntry {
    return { projectId: '', date: todayIso(), hours: 0, note: '' };
  }
}
