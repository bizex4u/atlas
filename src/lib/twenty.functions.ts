import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createClient, type Client } from "@libsql/client/web";

// ── Twenty CRM ↔ Atlas integration ───────────────────────────────────────────
// Atlas pulls Twenty's companies/opportunities/people via GraphQL and caches them
// in Turso; can also push Atlas brand deals into Twenty. All config via env:
//   TWENTY_API_URL  (default http://localhost:3000/graphql; prod: https://crm.bizex4u.com/graphql)
//   TWENTY_API_KEY  (Twenty → Settings → API & Webhooks → API key)

function twentyUrl() { return process.env.TWENTY_API_URL || "http://localhost:3000/graphql"; }
function twentyKey() { return process.env.TWENTY_API_KEY || ""; }

async function gql<T>(query: string, variables?: Record<string, unknown>): Promise<{ data?: T; error?: string }> {
  const key = twentyKey();
  if (!key) return { error: "TWENTY_API_KEY not set" };
  try {
    const res = await fetch(twentyUrl(), {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({ query, variables }),
      signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) return { error: `Twenty HTTP ${res.status}` };
    const json = (await res.json()) as { data?: T; errors?: { message: string }[] };
    if (json.errors?.length) return { error: json.errors.map((e) => e.message).join("; ") };
    return { data: json.data };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Twenty request failed" };
  }
}

// ── Turso cache table ─────────────────────────────────────────────────────────

let _client: Client | null = null;
let _ready: Promise<void> | null = null;
function db(): Client | null {
  const url = process.env.TURSO_DATABASE_URL;
  if (!url) return null;
  if (!_client) _client = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN });
  return _client;
}
async function ensure(c: Client) {
  if (!_ready) {
    _ready = c.execute(
      `CREATE TABLE IF NOT EXISTS twenty_records (
        twenty_id TEXT PRIMARY KEY,
        kind TEXT NOT NULL,
        name TEXT NOT NULL,
        payload TEXT NOT NULL,
        synced_at INTEGER NOT NULL
      )`
    ).then(() => undefined);
  }
  return _ready;
}

export interface CrmRecord { id: string; kind: "company" | "opportunity" | "person"; name: string; payload: string; syncedAt: number }

// ── Status ────────────────────────────────────────────────────────────────────

export const twentyStatus = createServerFn({ method: "POST" })
  .validator(() => ({}))
  .handler(async () => {
    if (!twentyKey()) return { connected: false, error: "TWENTY_API_KEY not set", url: twentyUrl() };
    const res = await gql<{ companies: { totalCount?: number } }>(`query { companies(first: 1) { totalCount } }`);
    if (res.error) return { connected: false, error: res.error, url: twentyUrl() };
    return { connected: true, error: null, url: twentyUrl() };
  });

// ── Sync: pull Twenty → Turso ─────────────────────────────────────────────────

interface Edge<T> { edges: { node: T }[] }
interface TwCompany { id: string; name: string; domainName?: { primaryLinkUrl?: string }; address?: { addressCity?: string; addressState?: string }; createdAt?: string; employees?: number }
interface TwOpp { id: string; name: string; amount?: { amountMicros?: string; currencyCode?: string }; stage?: string; closeDate?: string; company?: { id: string; name: string } }
interface TwPerson { id: string; name?: { firstName?: string; lastName?: string }; jobTitle?: string; emails?: { primaryEmail?: string }; company?: { name?: string } }

export const twentySync = createServerFn({ method: "POST" })
  .validator(() => ({}))
  .handler(async () => {
    if (!twentyKey()) return { ok: false, error: "TWENTY_API_KEY not set", counts: { company: 0, opportunity: 0, person: 0 } };
    const client = db();

    const q = `query {
      companies(first: 200) { edges { node { id name domainName { primaryLinkUrl } address { addressCity addressState } employees createdAt } } }
      opportunities(first: 200) { edges { node { id name amount { amountMicros currencyCode } stage closeDate company { id name } } } }
      people(first: 200) { edges { node { id name { firstName lastName } jobTitle emails { primaryEmail } company { name } } } }
    }`;
    const res = await gql<{ companies: Edge<TwCompany>; opportunities: Edge<TwOpp>; people: Edge<TwPerson> }>(q);
    if (res.error || !res.data) return { ok: false, error: res.error || "No data", counts: { company: 0, opportunity: 0, person: 0 } };

    const now = Date.now();
    const rows: { id: string; kind: string; name: string; payload: string }[] = [];
    for (const { node } of res.data.companies.edges)
      rows.push({ id: node.id, kind: "company", name: node.name || "Untitled", payload: JSON.stringify(node) });
    for (const { node } of res.data.opportunities.edges)
      rows.push({ id: node.id, kind: "opportunity", name: node.name || "Untitled", payload: JSON.stringify(node) });
    for (const { node } of res.data.people.edges) {
      const nm = [node.name?.firstName, node.name?.lastName].filter(Boolean).join(" ") || "Unnamed";
      rows.push({ id: node.id, kind: "person", name: nm, payload: JSON.stringify(node) });
    }

    if (client) {
      await ensure(client);
      // Upsert in batches
      for (let i = 0; i < rows.length; i += 50) {
        const batch = rows.slice(i, i + 50);
        await client.batch(
          batch.map((r) => ({
            sql: `INSERT INTO twenty_records (twenty_id, kind, name, payload, synced_at) VALUES (?,?,?,?,?)
                  ON CONFLICT(twenty_id) DO UPDATE SET name=excluded.name, payload=excluded.payload, synced_at=excluded.synced_at`,
            args: [r.id, r.kind, r.name, r.payload, now],
          })),
          "write"
        );
      }
    }

    return {
      ok: true, error: null,
      counts: {
        company: res.data.companies.edges.length,
        opportunity: res.data.opportunities.edges.length,
        person: res.data.people.edges.length,
      },
      persisted: !!client,
    };
  });

// ── List: read cached records from Turso ──────────────────────────────────────

const ListInput = z.object({ kind: z.enum(["company", "opportunity", "person"]).optional() });

export const twentyList = createServerFn({ method: "POST" })
  .validator((d: unknown) => ListInput.parse(d))
  .handler(async ({ data }) => {
    const client = db();
    if (!client) return { records: [] as CrmRecord[], error: "Turso not configured" };
    await ensure(client);
    const res = data.kind
      ? await client.execute({ sql: "SELECT * FROM twenty_records WHERE kind = ? ORDER BY synced_at DESC LIMIT 500", args: [data.kind] })
      : await client.execute("SELECT * FROM twenty_records ORDER BY synced_at DESC LIMIT 500");
    const records: CrmRecord[] = res.rows.map((r) => ({
      id: String(r.twenty_id), kind: String(r.kind) as CrmRecord["kind"], name: String(r.name),
      payload: String(r.payload), syncedAt: Number(r.synced_at),
    }));
    return { records, error: null };
  });

// ── Push: Atlas brand deal → Twenty (company + opportunity) ───────────────────

const PushInput = z.object({
  brand: z.string(),
  category: z.string().default(""),
  city: z.string().default(""),
  contactName: z.string().default(""),
  value: z.number().default(0),
});

// Atlas 7 barter stages → Twenty's 5-stage enum
const STAGE_MAP: Record<string, string> = {
  prospect: "NEW", briefed: "SCREENING", proposal_sent: "MEETING",
  negotiation: "PROPOSAL", agreement: "PROPOSAL", live: "CUSTOMER", lost: "NEW",
};

export const pushDealToTwenty = createServerFn({ method: "POST" })
  .validator((d: unknown) => PushInput.parse(d))
  .handler(async ({ data }) => {
    if (!twentyKey()) return { ok: false, error: "TWENTY_API_KEY not set" };

    // 1. Create company
    const cRes = await gql<{ createCompany: { id: string } }>(
      `mutation ($name: String!) { createCompany(data: { name: $name }) { id } }`,
      { name: data.brand }
    );
    if (cRes.error || !cRes.data) return { ok: false, error: cRes.error || "Company create failed" };
    const companyId = cRes.data.createCompany.id;

    // 2. Create opportunity linked to the company (amount only when we have one)
    const oRes = data.value > 0
      ? await gql<{ createOpportunity: { id: string } }>(
          `mutation ($name: String!, $companyId: UUID!, $amount: BigFloat!) {
            createOpportunity(data: { name: $name, companyId: $companyId, amount: { amountMicros: $amount, currencyCode: "INR" } }) { id }
          }`,
          { name: `${data.brand} — barter`, companyId, amount: String(data.value * 1_000_000) }
        )
      : await gql<{ createOpportunity: { id: string } }>(
          `mutation ($name: String!, $companyId: UUID!) {
            createOpportunity(data: { name: $name, companyId: $companyId }) { id }
          }`,
          { name: `${data.brand} — barter`, companyId }
        );
    if (oRes.error) return { ok: true, error: `Company created; opportunity failed: ${oRes.error}`, companyId };

    return { ok: true, error: null, companyId, opportunityId: oRes.data?.createOpportunity.id };
  });

// ── Promote an Atlas opportunity → Twenty, with provenance mapping in Turso ────
// The productized M1 flow: create company + opportunity in Twenty (system of
// record), then record the Atlas→Twenty id mapping + why-now provenance in
// atlas_twenty_map. This is the explicit, audited promotion of an AI suggestion
// into a CRM record (ADR-003). Called as the natural close of the pitch flow.

const PromoteInput = z.object({
  brand: z.string(),
  category: z.string().default(""),
  city: z.string().default(""),
  value: z.number().default(0),
  whyNow: z.string().default(""),
  barterAngle: z.string().default(""),
  origin: z.string().default("daily_briefing"),
});

export const promoteOpportunity = createServerFn({ method: "POST" })
  .validator((d: unknown) => PromoteInput.parse(d))
  .handler(async ({ data }) => {
    if (!twentyKey()) return { ok: false as const, error: "TWENTY_API_KEY not set" };

    const cRes = await gql<{ createCompany: { id: string } }>(
      `mutation ($name: String!) { createCompany(data: { name: $name }) { id } }`,
      { name: data.brand }
    );
    if (cRes.error || !cRes.data) return { ok: false as const, error: cRes.error || "Company create failed" };
    const companyId = cRes.data.createCompany.id;

    const oRes = await gql<{ createOpportunity: { id: string } }>(
      `mutation ($name: String!, $companyId: UUID!, $amount: BigFloat) {
        createOpportunity(data: { name: $name, companyId: $companyId, amount: { amountMicros: $amount, currencyCode: "INR" } }) { id }
      }`,
      { name: `${data.brand} — barter${data.city ? ` (${data.city})` : ""}`, companyId, amount: data.value > 0 ? data.value * 1_000_000 : null }
    );
    const opportunityId = oRes.data?.createOpportunity.id;
    if (oRes.error || !opportunityId) return { ok: false as const, error: oRes.error || "Opportunity create failed", companyId };

    // Provenance mapping — Atlas artifact ↔ Twenty ids (Turso owns the link).
    const c = db();
    if (c) {
      await c.execute(
        `CREATE TABLE IF NOT EXISTS atlas_twenty_map (atlas_ref TEXT PRIMARY KEY, brand TEXT, city TEXT,
          twenty_company_id TEXT, twenty_opportunity_id TEXT, origin TEXT, intel TEXT, created_at TEXT)`
      );
      await c.execute({
        sql: `INSERT INTO atlas_twenty_map VALUES (?,?,?,?,?,?,?,?)`,
        args: [crypto.randomUUID(), data.brand, data.city, companyId, opportunityId, data.origin,
               JSON.stringify({ whyNow: data.whyNow, barterAngle: data.barterAngle, value: data.value }), new Date().toISOString()],
      });
    }
    return { ok: true as const, error: null, companyId, opportunityId };
  });
