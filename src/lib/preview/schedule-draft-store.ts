import type { SchedulePreviewPayload } from "./schedule-preview";

const globalStore = globalThis as typeof globalThis & {
  __scheduleDraftStore?: Map<string, SchedulePreviewPayload>;
};

const store = globalStore.__scheduleDraftStore ?? new Map<string, SchedulePreviewPayload>();

if (!globalStore.__scheduleDraftStore) {
  globalStore.__scheduleDraftStore = store;
}

export function setScheduleDraft(id: string, payload: SchedulePreviewPayload) {
  store.set(id, payload);
}

export function getScheduleDraft(id: string) {
  return store.get(id) ?? null;
}
