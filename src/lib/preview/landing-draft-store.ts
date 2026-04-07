import type { LandingPreviewPayload } from "./landing-preview";

const globalStore = globalThis as typeof globalThis & {
  __landingDraftStore?: Map<string, LandingPreviewPayload>;
};

const store = globalStore.__landingDraftStore ?? new Map<string, LandingPreviewPayload>();

if (!globalStore.__landingDraftStore) {
  globalStore.__landingDraftStore = store;
}

export function setLandingDraft(id: string, payload: LandingPreviewPayload) {
  store.set(id, payload);
}

export function getLandingDraft(id: string) {
  return store.get(id) ?? null;
}
