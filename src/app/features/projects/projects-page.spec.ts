import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LocalStore } from '../../core/storage';
import { WorklogStore } from '../../core/worklog-store';
import { ProjectsPage } from './projects-page';

class MemoryStore {
  read<T>(_key: string, fallback: T): T {
    return fallback;
  }
  write(): void {}
}

function setInput(el: HTMLElement, selector: string, value: string): void {
  const input = el.querySelector<HTMLInputElement>(selector)!;
  input.value = value;
  input.dispatchEvent(new Event('input', { bubbles: true }));
  input.dispatchEvent(new Event('blur', { bubbles: true }));
}

describe('ProjectsPage', () => {
  let fixture: ComponentFixture<ProjectsPage>;
  let el: HTMLElement;
  let store: WorklogStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectsPage],
      providers: [{ provide: LocalStore, useClass: MemoryStore }],
    }).compileComponents();
    fixture = TestBed.createComponent(ProjectsPage);
    el = fixture.nativeElement;
    store = TestBed.inject(WorklogStore);
    await fixture.whenStable();
  });

  it('shows an empty state when there are no projects', () => {
    expect(el.querySelector('.empty')?.textContent).toContain('No projects yet');
    expect(el.querySelector('table')).toBeNull();
  });

  it('adds a project through the form', async () => {
    setInput(el, 'input[type="number"]', '95');
    const inputs = el.querySelectorAll<HTMLInputElement>('input');
    inputs[0].value = 'Acme site';
    inputs[0].dispatchEvent(new Event('input', { bubbles: true }));

    el.querySelector<HTMLButtonElement>('button[type="submit"]')!.click();
    await fixture.whenStable();

    expect(store.projects().map((p) => [p.name, p.hourlyRate, p.currency])).toEqual([['Acme site', 95, 'AUD']]);
    expect(el.querySelectorAll('tbody tr').length).toBe(1);
    // form is reset after a successful submit
    expect(inputs[0].value).toBe('');
  });

  it('refuses an empty name and shows the message', async () => {
    el.querySelector<HTMLButtonElement>('button[type="submit"]')!.click();
    await fixture.whenStable();

    expect(store.projects()).toEqual([]);
    expect(el.querySelector('.error')?.textContent).toContain('Give the project a name');
  });

  it('archives a project and hides it by default', async () => {
    store.addProject({ name: 'Old', client: '', hourlyRate: 10, currency: 'AUD' });
    await fixture.whenStable();

    el.querySelector<HTMLButtonElement>('button.danger')!.click();
    await fixture.whenStable();

    expect(el.querySelectorAll('tbody tr').length).toBe(0);
    expect(el.textContent).toContain('Show 1 archived');
  });
});
