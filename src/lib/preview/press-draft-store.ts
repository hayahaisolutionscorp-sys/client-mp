import type { PressPreviewPayload } from "./press-preview";

const globalStore = globalThis as typeof globalThis & {
  __pressDraftStore?: Map<string, PressPreviewPayload>;
};

const store = globalStore.__pressDraftStore ?? new Map<string, PressPreviewPayload>();

if (!globalStore.__pressDraftStore) {
  globalStore.__pressDraftStore = store;
}

export function setPressDraft(id: string, payload: PressPreviewPayload) {
  store.set(id, payload);
}

export function getPressDraft(id: string) {
  return store.get(id) ?? null;
}
