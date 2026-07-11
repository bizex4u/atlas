// Client sync layer — mirrors Zustand persisted stores to Turso via server functions.
// Strategy: intercept localStorage writes to atlas-* keys → debounced push to remote.
// On unlock: pull remote → write localStorage → rehydrate each store.
import { pullState, pushState } from "./db.functions";
import { useCrm, useTasks } from "./crm";
import { useLedger } from "./ledger";
import {
  useInventory, useBarter, useAccounts, useBrandDeals, useSettings, useCredits, useWarehouse, useBookings,
} from "./stores";

// Stores that sync across devices. Excludes atlas-google (per-device OAuth token) and atlas-auth.
const SYNCED = [
  { key: "atlas-crm", store: useCrm },
  { key: "atlas-tasks", store: useTasks },
  { key: "atlas-ledger", store: useLedger },
  { key: "atlas-inventory", store: useInventory },
  { key: "atlas-barter", store: useBarter },
  { key: "atlas-accounts", store: useAccounts },
  { key: "atlas-brand-deals", store: useBrandDeals },
  { key: "atlas-settings", store: useSettings },
  { key: "atlas-credits", store: useCredits },
  { key: "atlas-warehouse", store: useWarehouse },
  { key: "atlas-bookings", store: useBookings },
] as const;

const SYNC_KEYS = new Set<string>(SYNCED.map((s) => s.key));

const AUTH_KEY = "atlas-auth"; // holds passphrase locally (NOT synced)

export function getPassphrase(): string | null {
  try { return localStorage.getItem(AUTH_KEY); } catch { return null; }
}
export function setPassphrase(p: string) {
  try { localStorage.setItem(AUTH_KEY, p); } catch { /* ignore */ }
}
export function clearPassphrase() {
  try { localStorage.removeItem(AUTH_KEY); } catch { /* ignore */ }
}

let started = false;
let applyingRemote = false;
const pushTimers = new Map<string, ReturnType<typeof setTimeout>>();
let origSetItem: ((key: string, value: string) => void) | null = null;

type SyncStatus = "idle" | "syncing" | "synced" | "error";
let status: SyncStatus = "idle";
const listeners = new Set<(s: SyncStatus) => void>();
function setStatus(s: SyncStatus) { status = s; listeners.forEach((l) => l(s)); }
export function onSyncStatus(cb: (s: SyncStatus) => void) { listeners.add(cb); cb(status); return () => { listeners.delete(cb); }; }
export function getSyncStatus() { return status; }

let lastErrToast = 0;
function notifySyncError(msg: string) {
  // Throttle to one toast per 30s so a burst of failed pushes doesn't spam.
  if (Date.now() - lastErrToast < 30000) return;
  lastErrToast = Date.now();
  import("@/components/Toaster").then(({ toast }) => toast.error("Sync issue", msg)).catch(() => {});
}

function queuePush(key: string, value: string) {
  const pass = getPassphrase();
  if (!pass) return;
  const existing = pushTimers.get(key);
  if (existing) clearTimeout(existing);
  pushTimers.set(key, setTimeout(async () => {
    pushTimers.delete(key);
    setStatus("syncing");
    try {
      const res = await pushState({ data: { passphrase: pass, key, value } });
      setStatus(res.ok ? "synced" : "error");
      if (!res.ok) notifySyncError(res.error || "Could not save to cloud");
    } catch { setStatus("error"); notifySyncError("Offline — changes saved locally, will retry on next edit"); }
  }, 800));
}

/** Pull remote state, hydrate stores. Returns true on success. */
export async function pullAndHydrate(passphrase: string): Promise<{ ok: boolean; error?: string }> {
  setStatus("syncing");
  let res;
  try {
    res = await pullState({ data: { passphrase } });
  } catch (e) {
    setStatus("error");
    return { ok: false, error: e instanceof Error ? e.message : "Pull failed" };
  }
  if (!res.ok) { setStatus("error"); return { ok: false, error: res.error || "Pull failed" }; }

  applyingRemote = true;
  try {
    const write = origSetItem || localStorage.setItem.bind(localStorage);
    for (const { key, store } of SYNCED) {
      const remote = res.entries[key];
      if (remote == null) continue; // no remote value yet — keep local, will push up
      write(key, remote);
      // Rehydrate the store from the freshly written localStorage
      const persist = (store as unknown as { persist?: { rehydrate?: () => void } }).persist;
      persist?.rehydrate?.();
    }
  } finally {
    applyingRemote = false;
  }
  setStatus("synced");

  // Push up any local stores that had no remote value (first-time seed from this device)
  for (const { key } of SYNCED) {
    if (res.entries[key] == null) {
      try {
        const local = localStorage.getItem(key);
        if (local) queuePush(key, local);
      } catch { /* ignore */ }
    }
  }
  return { ok: true };
}

/** Install the localStorage interceptor so future writes push to remote. Idempotent. */
export function startSync() {
  if (started || typeof window === "undefined") return;
  started = true;
  const ls = window.localStorage;
  origSetItem = ls.setItem.bind(ls);
  ls.setItem = (key: string, value: string) => {
    origSetItem!(key, value);
    if (!applyingRemote && SYNC_KEYS.has(key)) queuePush(key, value);
  };
}
