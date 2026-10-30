import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { form, FormField, maxLength, min, minLength, required, submit } from '@angular/forms/signals';
import { NewProject } from '../../core/models';
import { WorklogStore } from '../../core/worklog-store';

const EMPTY_PROJECT: NewProject = { name: '', client: '', hourlyRate: 0, currency: 'AUD' };

@Component({
  selector: 'app-projects-page',
  imports: [FormField, CurrencyPipe],
  template: `
    <h1>Projects</h1>

    <form class="inline" novalidate (submit)="$event.preventDefault(); add()">
      <label>
        Name
        <input [formField]="form.name" [attr.aria-invalid]="showError(form.name())" />
        @if (showError(form.name())) {
          <span class="error">{{ form.name().errors()[0].message }}</span>
        }
      </label>
      <label>
        Client
        <input [formField]="form.client" placeholder="optional" />
      </label>
      <label>
        Hourly rate
        <input type="number" step="0.01" [formField]="form.hourlyRate" [attr.aria-invalid]="showError(form.hourlyRate())" />
        @if (showError(form.hourlyRate())) {
          <span class="error">{{ form.hourlyRate().errors()[0].message }}</span>
        }
      </label>
      <label>
        Currency
        <input [formField]="form.currency" [attr.aria-invalid]="showError(form.currency())" />
        @if (showError(form.currency())) {
          <span class="error">{{ form.currency().errors()[0].message }}</span>
        }
      </label>
      <button type="submit" [disabled]="form().submitting()">Add project</button>
    </form>

    @if (visible().length === 0) {
      <p class="empty">No projects yet. Add the first one above.</p>
    } @else {
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Client</th>
            <th class="num">Rate</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          @for (p of visible(); track p.id) {
            <tr [class.archived]="p.archived">
              <td>{{ p.name }}</td>
              <td class="muted">{{ p.client || '—' }}</td>
              <td class="num">{{ p.hourlyRate | currency: p.currency }}/h</td>
              <td class="num">
                <button type="button" class="danger" (click)="toggleArchived(p.id, !p.archived)">
                  {{ p.archived ? 'Restore' : 'Archive' }}
                </button>
              </td>
            </tr>
          }
        </tbody>
      </table>
    }

    @if (archivedCount() > 0) {
      <p class="muted">
        <button type="button" class="secondary" (click)="showArchived.set(!showArchived())">
          {{ showArchived() ? 'Hide' : 'Show' }} {{ archivedCount() }} archived
        </button>
      </p>
    }
  `,
  styles: `
    tr.archived td { color: var(--text-muted); text-decoration: line-through; }
    tr.archived td:last-child { text-decoration: none; }
  `,
})
export class ProjectsPage {
  private readonly store = inject(WorklogStore);

  readonly model = signal<NewProject>({ ...EMPTY_PROJECT });
  readonly form = form(this.model, (p) => {
    required(p.name, { message: 'Give the project a name' });
    min(p.hourlyRate, 0, { message: 'Rate cannot be negative' });
    required(p.currency, { message: 'Currency code is required' });
    minLength(p.currency, 3, { message: 'Use a 3-letter code like AUD' });
    maxLength(p.currency, 3, { message: 'Use a 3-letter code like AUD' });
  });

  readonly showArchived = signal(false);
  readonly archivedCount = computed(() => this.store.projects().filter((p) => p.archived).length);
  readonly visible = computed(() =>
    this.showArchived() ? this.store.projects() : this.store.activeProjects(),
  );

  async add(): Promise<void> {
    await submit(this.form, async () => {
      this.store.addProject({ ...this.model(), currency: this.model().currency.toUpperCase() });
      this.form().reset({ ...EMPTY_PROJECT });
      return undefined;
    });
  }

  toggleArchived(id: string, archived: boolean): void {
    this.store.setProjectArchived(id, archived);
  }

  /** Show an error only once the user has interacted with the field or tried to submit. */
  showError(field: { invalid(): boolean; touched(): boolean }): boolean {
    return field.invalid() && field.touched();
  }
}
