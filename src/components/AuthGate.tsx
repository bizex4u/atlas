import { useEffect, useState, type ReactNode } from "react";
import { Lock, Loader2, Cloud, CloudOff } from "lucide-react";
import {
  getPassphrase, setPassphrase, clearPassphrase, pullAndHydrate, startSync,
} from "@/lib/sync";

type Phase = "loading" | "locked" | "unlocked";

export function AuthGate({ children }: { children: ReactNode }) {
  const [phase, setPhase] = useState<Phase>("loading");
  const [pass, setPass] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // On mount: stored passphrase → sync + unlock; else a prior "offline" choice
  // keeps this device unlocked so a refresh doesn't re-prompt.
  useEffect(() => {
    const stored = getPassphrase();
    if (!stored) {
      try { if (localStorage.getItem("atlas-offline") === "1") { setPhase("unlocked"); return; } } catch { /* ignore */ }
      setPhase("locked"); return;
    }
    (async () => {
      const res = await pullAndHydrate(stored);
      if (res.ok) { startSync(); setPhase("unlocked"); }
      else { clearPassphrase(); setError(res.error || null); setPhase("locked"); }
    })();
  }, []);

  async function unlock(e: React.FormEvent) {
    e.preventDefault();
    if (!pass.trim()) return;
    setBusy(true); setError(null);
    const res = await pullAndHydrate(pass.trim());
    setBusy(false);
    if (res.ok) {
      setPassphrase(pass.trim());
      startSync();
      setPhase("unlocked");
    } else {
      setError(res.error || "Could not unlock");
    }
  }

  function useOffline() {
    // Local-only mode: no sync, this device's localStorage only. Persist the
    // choice so a refresh doesn't drop back to the passphrase gate.
    try { localStorage.setItem("atlas-offline", "1"); } catch { /* ignore */ }
    setPhase("unlocked");
  }

  if (phase === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (phase === "locked") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-sm">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl gradient-primary text-primary-foreground">
              <Lock className="h-6 w-6" />
            </div>
            <h1 className="text-xl font-semibold">Atlas</h1>
            <p className="mt-1 text-sm text-muted-foreground">Enter passphrase to sync your workspace</p>
          </div>
          <form onSubmit={unlock} className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <input
              type="password"
              autoFocus
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              placeholder="Workspace passphrase"
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
            />
            {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
            <button
              type="submit"
              disabled={busy || !pass.trim()}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl gradient-primary px-4 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-60"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Cloud className="h-4 w-4" />}
              {busy ? "Unlocking…" : "Unlock & sync"}
            </button>
          </form>
          <button
            onClick={useOffline}
            className="mt-3 flex w-full items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <CloudOff className="h-3.5 w-3.5" /> Use offline on this device only
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
