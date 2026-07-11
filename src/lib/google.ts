// Google Drive + Gmail integration (client-side OAuth via Google Identity Services)
// Scopes are read-only. Token lives in memory + localStorage, ~1hr expiry.
import { create } from "zustand";
import { persist } from "zustand/middleware";

const SCOPES = [
  "https://www.googleapis.com/auth/drive.readonly",
  "https://www.googleapis.com/auth/gmail.readonly",
].join(" ");

interface GoogleAuthState {
  clientId: string;
  token: string | null;
  tokenExpiry: number; // epoch ms
  setClientId: (id: string) => void;
  setToken: (token: string, expiresInSec: number) => void;
  disconnect: () => void;
}

export const useGoogleAuth = create<GoogleAuthState>()(
  persist(
    (set) => ({
      clientId: "",
      token: null,
      tokenExpiry: 0,
      setClientId: (clientId) => set({ clientId }),
      setToken: (token, expiresInSec) => set({ token, tokenExpiry: Date.now() + expiresInSec * 1000 }),
      disconnect: () => set({ token: null, tokenExpiry: 0 }),
    }),
    { name: "atlas-google" }
  )
);

export function isGoogleConnected() {
  const { token, tokenExpiry } = useGoogleAuth.getState();
  return !!token && Date.now() < tokenExpiry - 60000;
}

let gisLoaded: Promise<void> | null = null;
function loadGIS(): Promise<void> {
  if (gisLoaded) return gisLoaded;
  gisLoaded = new Promise((res, rej) => {
    if (document.querySelector("script[data-gis]")) return res();
    const s = document.createElement("script");
    s.src = "https://accounts.google.com/gsi/client";
    s.async = true;
    s.dataset.gis = "1";
    s.onload = () => res();
    s.onerror = () => rej(new Error("Failed to load Google Identity Services"));
    document.head.appendChild(s);
  });
  return gisLoaded;
}

interface TokenResponse { access_token?: string; expires_in?: number; error?: string }

export async function connectGoogle(): Promise<{ ok: boolean; error?: string }> {
  const { clientId, setToken } = useGoogleAuth.getState();
  if (!clientId) return { ok: false, error: "Google Client ID not set — add it in Settings → Integrations" };
  await loadGIS();
  const g = (window as unknown as { google?: { accounts?: { oauth2?: { initTokenClient: (cfg: object) => { requestAccessToken: () => void } } } } }).google;
  if (!g?.accounts?.oauth2) return { ok: false, error: "Google Identity Services not available" };

  const oauth2 = g.accounts.oauth2;
  return new Promise((res) => {
    const client = oauth2.initTokenClient({
      client_id: clientId,
      scope: SCOPES,
      callback: (resp: TokenResponse) => {
        if (resp.error || !resp.access_token) {
          res({ ok: false, error: resp.error || "No token returned" });
        } else {
          setToken(resp.access_token, resp.expires_in || 3600);
          res({ ok: true });
        }
      },
    });
    client.requestAccessToken();
  });
}

async function gFetch(url: string): Promise<Response> {
  const { token } = useGoogleAuth.getState();
  if (!token) throw new Error("Not connected to Google");
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (res.status === 401) {
    useGoogleAuth.getState().disconnect();
    throw new Error("Google session expired — reconnect in Settings");
  }
  return res;
}

// ── Drive ─────────────────────────────────────────────────────────────────────

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  modifiedTime?: string;
}

const IMPORTABLE_MIMES = [
  "application/vnd.google-apps.spreadsheet",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
  "text/csv",
  "application/pdf",
  "image/jpeg",
  "image/png",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
];

export async function listDriveFiles(search: string): Promise<DriveFile[]> {
  const mimeQ = IMPORTABLE_MIMES.map((m) => `mimeType='${m}'`).join(" or ");
  const nameQ = search.trim() ? ` and name contains '${search.replace(/'/g, "\\'")}'` : "";
  const q = encodeURIComponent(`(${mimeQ})${nameQ} and trashed=false`);
  const res = await gFetch(
    `https://www.googleapis.com/drive/v3/files?q=${q}&orderBy=modifiedTime desc&pageSize=30&fields=files(id,name,mimeType,size,modifiedTime)`
  );
  if (!res.ok) throw new Error(`Drive error ${res.status}`);
  const json = (await res.json()) as { files?: DriveFile[] };
  return json.files || [];
}

function bufToBase64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let bin = "";
  const CHUNK = 0x8000;
  for (let i = 0; i < bytes.length; i += CHUNK) {
    bin += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
  }
  return btoa(bin);
}

/** Download Drive file as a browser File object (Google Sheets exported as xlsx). */
export async function downloadDriveFile(f: DriveFile): Promise<File> {
  const isGSheet = f.mimeType === "application/vnd.google-apps.spreadsheet";
  const url = isGSheet
    ? `https://www.googleapis.com/drive/v3/files/${f.id}/export?mimeType=application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
    : `https://www.googleapis.com/drive/v3/files/${f.id}?alt=media`;
  const res = await gFetch(url);
  if (!res.ok) throw new Error(`Drive download error ${res.status}`);
  const buf = await res.arrayBuffer();
  const mime = isGSheet
    ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    : f.mimeType;
  const name = isGSheet ? `${f.name}.xlsx` : f.name;
  return new File([buf], name, { type: mime });
}

// ── Gmail ─────────────────────────────────────────────────────────────────────

export interface GmailAttachment {
  messageId: string;
  attachmentId: string;
  filename: string;
  mimeType: string;
  size: number;
  from: string;
  subject: string;
  date: string;
}

export async function listGmailAttachments(search: string): Promise<GmailAttachment[]> {
  const q = encodeURIComponent(`has:attachment (filename:xlsx OR filename:xls OR filename:csv OR filename:pdf OR filename:jpg OR filename:jpeg OR filename:png OR filename:pptx) ${search}`.trim());
  const listRes = await gFetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${q}&maxResults=15`);
  if (!listRes.ok) throw new Error(`Gmail error ${listRes.status}`);
  const list = (await listRes.json()) as { messages?: { id: string }[] };
  if (!list.messages?.length) return [];

  const out: GmailAttachment[] = [];
  await Promise.all(list.messages.slice(0, 15).map(async (m) => {
    const res = await gFetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${m.id}`);
    if (!res.ok) return;
    const msg = (await res.json()) as {
      payload?: {
        headers?: { name: string; value: string }[];
        parts?: { filename?: string; mimeType?: string; body?: { attachmentId?: string; size?: number }; parts?: unknown[] }[];
      };
    };
    type Part = { filename?: string; mimeType?: string; body?: { attachmentId?: string; size?: number }; parts?: unknown[] };
    const h = (name: string) => msg.payload?.headers?.find((x) => x.name.toLowerCase() === name)?.value || "";
    const walk = (parts: Part[] | undefined) => {
      for (const p of parts || []) {
        if (p.filename && p.body?.attachmentId) {
          out.push({
            messageId: m.id,
            attachmentId: p.body.attachmentId,
            filename: p.filename,
            mimeType: p.mimeType || "application/octet-stream",
            size: p.body.size || 0,
            from: h("from"),
            subject: h("subject"),
            date: h("date"),
          });
        }
        if (p.parts) walk(p.parts as Part[]);
      }
    };
    walk(msg.payload?.parts);
  }));
  return out;
}

export async function downloadGmailAttachment(a: GmailAttachment): Promise<File> {
  const res = await gFetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${a.messageId}/attachments/${a.attachmentId}`);
  if (!res.ok) throw new Error(`Gmail attachment error ${res.status}`);
  const json = (await res.json()) as { data?: string };
  const b64 = (json.data || "").replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new File([bytes], a.filename, { type: a.mimeType });
}
