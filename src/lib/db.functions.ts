import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
// Web (HTTP-only) client — no native bindings, safe for Vercel serverless tracing.
import { createClient, type Client } from "@libsql/client/web";

// ── Turso (libSQL) sync backend ──────────────────────────────────────────────
// Single shared workspace, gated by a passphrase (ATLAS_PASSPHRASE env).
// Each Zustand persisted store is stored as one row: (workspace, key, value JSON).

let _client: Client | null = null;
let _schemaReady: Promise<void> | null = null;

function db(): Client | null {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;
  if (!url) return null;
  if (!_client) _client = createClient({ url, authToken });
  return _client;
}

async function ensureSchema(client: Client) {
  if (!_schemaReady) {
    _schemaReady = client
      .execute(
        `CREATE TABLE IF NOT EXISTS store (
          workspace TEXT NOT NULL,
          key TEXT NOT NULL,
          value TEXT NOT NULL,
          updated_at INTEGER NOT NULL,
          PRIMARY KEY (workspace, key)
        )`
      )
      .then(() => undefined);
  }
  return _schemaReady;
}

// Constant-time-ish compare so passphrase check doesn't leak length/prefix via timing.
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function checkPass(passphrase: string): { ok: boolean; error?: string } {
  const secret = process.env.ATLAS_PASSPHRASE;
  if (!secret) return { ok: false, error: "Sync not configured — ATLAS_PASSPHRASE not set on server" };
  if (!safeEqual(passphrase, secret)) return { ok: false, error: "Wrong passphrase" };
  return { ok: true };
}

const WORKSPACE = "default";

const VerifyInput = z.object({ passphrase: z.string() });

export const verifyPassphrase = createServerFn({ method: "POST" })
  .validator((d: unknown) => VerifyInput.parse(d))
  .handler(async ({ data }) => {
    const client = db();
    if (!client) return { ok: false, error: "Sync not configured — TURSO_DATABASE_URL not set" };
    const chk = checkPass(data.passphrase);
    return { ok: chk.ok, error: chk.error };
  });

export const pullState = createServerFn({ method: "POST" })
  .validator((d: unknown) => VerifyInput.parse(d))
  .handler(async ({ data }) => {
    const client = db();
    if (!client) return { ok: false, error: "Sync not configured", entries: {} as Record<string, string> };
    const chk = checkPass(data.passphrase);
    if (!chk.ok) return { ok: false, error: chk.error, entries: {} as Record<string, string> };
    await ensureSchema(client);
    const res = await client.execute({
      sql: "SELECT key, value FROM store WHERE workspace = ?",
      args: [WORKSPACE],
    });
    const entries: Record<string, string> = {};
    for (const row of res.rows) entries[String(row.key)] = String(row.value);
    return { ok: true, error: null, entries };
  });

const PushInput = z.object({
  passphrase: z.string(),
  key: z.string(),
  value: z.string(),
});

export const pushState = createServerFn({ method: "POST" })
  .validator((d: unknown) => PushInput.parse(d))
  .handler(async ({ data }) => {
    const client = db();
    if (!client) return { ok: false, error: "Sync not configured" };
    const chk = checkPass(data.passphrase);
    if (!chk.ok) return { ok: false, error: chk.error };
    await ensureSchema(client);
    await client.execute({
      sql: `INSERT INTO store (workspace, key, value, updated_at)
            VALUES (?, ?, ?, ?)
            ON CONFLICT(workspace, key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
      args: [WORKSPACE, data.key, data.value, Date.now()],
    });
    return { ok: true, error: null };
  });
