import type { LoginPreviewPayload } from "./login-preview";

const globalStore = globalThis as typeof globalThis & {
  __loginDraftStore?: Map<string, LoginPreviewPayload>;
};

const store = globalStore.__loginDraftStore ?? new Map<string, LoginPreviewPayload>();

if (!globalStore.__loginDraftStore) {
  globalStore.__loginDraftStore = store;
}

export function setLoginDraft(id: string, payload: LoginPreviewPayload) {
  store.set(id, payload);
}

export function getLoginDraft(id: string) {
  return store.get(id) ?? null;
}
