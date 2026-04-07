import type { AboutPreviewPayload } from "./about-preview";

const globalStore = globalThis as typeof globalThis & {
  __aboutDraftStore?: Map<string, AboutPreviewPayload>;
};

const store = globalStore.__aboutDraftStore ?? new Map<string, AboutPreviewPayload>();

if (!globalStore.__aboutDraftStore) {
  globalStore.__aboutDraftStore = store;
}

export function setAboutDraft(id: string, payload: AboutPreviewPayload) {
  store.set(id, payload);
}

export function getAboutDraft(id: string) {
  return store.get(id) ?? null;
}
