/** A piece of work you bill time against. */
export interface Project {
  id: string;
  name: string;
  /** Who the work is for. Free text, may be empty. */
  client: string;
  hourlyRate: number;
  /** ISO 4217 code, e.g. "AUD". */
  currency: string;
  archived: boolean;
}

/** Hours worked on one project on one day. */
export interface TimeEntry {
  id: string;
  projectId: string;
  /** Calendar day as `YYYY-MM-DD`. */
  date: string;
  hours: number;
  note: string;
}

export type NewProject = Omit<Project, 'id' | 'archived'>;
export type NewTimeEntry = Omit<TimeEntry, 'id'>;
