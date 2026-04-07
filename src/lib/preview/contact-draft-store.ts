import type { ContactPreviewPayload } from "./contact-preview";

const globalStore = globalThis as typeof globalThis & {
  __contactDraftStore?: Map<string, ContactPreviewPayload>;
};

const store = globalStore.__contactDraftStore ?? new Map<string, ContactPreviewPayload>();

if (!globalStore.__contactDraftStore) {
  globalStore.__contactDraftStore = store;
}

export function setContactDraft(id: string, payload: ContactPreviewPayload) {
  store.set(id, payload);
}

export function getContactDraft(id: string) {
  return store.get(id) ?? null;
}
