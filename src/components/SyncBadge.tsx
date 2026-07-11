import { useEffect, useState } from "react";
import { Cloud, CloudOff, Loader2, AlertCircle } from "lucide-react";
import { onSyncStatus, getPassphrase } from "@/lib/sync";

type S = "idle" | "syncing" | "synced" | "error";

export function SyncBadge() {
  const [status, setStatus] = useState<S>("idle");
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    setOffline(!getPassphrase());
    return onSyncStatus((s) => setStatus(s));
  }, []);

  if (offline && status === "idle") {
    return (
      <span className="hidden items-center gap-1.5 rounded-full border border-border bg-background px-2.5 py-1 text-[11px] text-muted-foreground lg:flex" title="Local only — data not synced to cloud">
        <CloudOff className="h-3 w-3" /> Offline
      </span>
    );
  }

  const map: Record<S, { icon: React.ReactNode; label: string; cls: string }> = {
    idle: { icon: <Cloud className="h-3 w-3" />, label: "Cloud", cls: "text-muted-foreground" },
    syncing: { icon: <Loader2 className="h-3 w-3 animate-spin" />, label: "Syncing", cls: "text-primary" },
    synced: { icon: <Cloud className="h-3 w-3" />, label: "Synced", cls: "text-success" },
    error: { icon: <AlertCircle className="h-3 w-3" />, label: "Sync error", cls: "text-destructive" },
  };
  const m = map[status];
  return (
    <span className={`hidden items-center gap-1.5 rounded-full border border-border bg-background px-2.5 py-1 text-[11px] lg:flex ${m.cls}`} title="Workspace sync status">
      {m.icon} {m.label}
    </span>
  );
}
