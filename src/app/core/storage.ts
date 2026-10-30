import { DOCUMENT } from '@angular/common';
import { inject, Service } from '@angular/core';

/**
 * Thin wrapper over `localStorage` so the rest of the app never touches the global directly.
 * Missing storage (SSR, private mode, quota errors) degrades to in-memory behaviour.
 */
@Service()
export class LocalStore {
  private readonly storage = inject(DOCUMENT).defaultView?.localStorage ?? null;

  read<T>(key: string, fallback: T): T {
    if (!this.storage) return fallback;
    try {
      const raw = this.storage.getItem(key);
      return raw === null ? fallback : (JSON.parse(raw) as T);
    } catch {
      return fallback;
    }
  }

  write(key: string, value: unknown): void {
    if (!this.storage) return;
    try {
      this.storage.setItem(key, JSON.stringify(value));
    } catch {
      // Quota exceeded or storage disabled: keep running with in-memory state.
    }
  }
}
