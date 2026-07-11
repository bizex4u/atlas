import { create } from "zustand";
import { persist } from "zustand/middleware";
import { generateSiteCode } from "./format";

export type SiteStatus = "free" | "live" | "hold" | "expired";
export type SiteFormat =
  | "Hoarding"
  | "Unipole"
  | "Bus Shelter"
  | "Metro Panel"
  | "Mall Display"
  | "Transit"
  | "Digital"
  | "DOOH"
  | "Society Lift"
  | "Airport Terminal"
  | "Wall Wrap"
  | "Tree Guard"
  | "Highway Media"
  | "Radio"
  | "Newspaper"
  | "Magazine"
  | "Event Sponsorship"
  | "Cinema";

export interface Site {
  id: string;
  code: string;
  name: string;
  city: string;
  format: SiteFormat;
  status: SiteStatus;
  lat: number;
  lng: number;
  monthlyRent: number;
  notes?: string;
  createdAt: string;
  expiresAt?: string;
  /** Compressed JPEG data-URL thumbnail (~20KB). */
  photo?: string;
  /** Groq Vision analysis of the photo. */
  aiTags?: string[];
  aiDescription?: string;
  /** Media owner / vendor this site belongs to (Atlas is the broker). */
  partner?: string;
}

// ── Bookings (date-range holds & confirmed bookings per site) ────────────────

export type BookingStatus = "hold" | "booked";

export interface Booking {
  id: string;
  siteId: string;
  client: string;
  status: BookingStatus;
  startDate: string; // YYYY-MM-DD inclusive
  endDate: string;   // YYYY-MM-DD inclusive
  /** Holds auto-flag as expiring; date the hold lapses if not confirmed. */
  holdExpiry?: string;
  notes?: string;
  createdAt: string;
}

export function rangesOverlap(aStart: string, aEnd: string, bStart: string, bEnd: string) {
  return aStart <= bEnd && bStart <= aEnd;
}

export function siteBookings(bookings: Booking[], siteId: string) {
  return bookings.filter((b) => b.siteId === siteId).sort((a, b) => a.startDate.localeCompare(b.startDate));
}

/** Booking active today or next upcoming for a site. */
export function currentOrNextBooking(bookings: Booking[], siteId: string): Booking | undefined {
  const today = new Date().toISOString().slice(0, 10);
  const list = siteBookings(bookings, siteId).filter((b) => b.endDate >= today);
  return list.find((b) => b.startDate <= today) ?? list[0];
}

/** Bookings that clash with the given range on the same site. */
export function findConflicts(bookings: Booking[], siteId: string, start: string, end: string, ignoreId?: string) {
  return bookings.filter((b) =>
    b.siteId === siteId && b.id !== ignoreId && rangesOverlap(start, end, b.startDate, b.endDate)
  );
}

interface BookingsState {
  bookings: Booking[];
  addBooking: (b: Omit<Booking, "id" | "createdAt">) => void;
  updateBooking: (id: string, patch: Partial<Booking>) => void;
  deleteBooking: (id: string) => void;
}

export const useBookings = create<BookingsState>()(
  persist(
    (set) => ({
      bookings: [],
      addBooking: (b) =>
        set((st) => ({ bookings: [...st.bookings, { ...b, id: crypto.randomUUID(), createdAt: new Date().toISOString().slice(0, 10) }] })),
      updateBooking: (id, patch) =>
        set((st) => ({ bookings: st.bookings.map((x) => x.id === id ? { ...x, ...patch } : x) })),
      deleteBooking: (id) => set((st) => ({ bookings: st.bookings.filter((x) => x.id !== id) })),
    }),
    { name: "atlas-bookings" },
  ),
);

// ── Warehouse (barter goods stock) ───────────────────────────────────────────

export interface StockMovement {
  id: string;
  date: string; // YYYY-MM-DD
  qty: number;  // +in / -out
  note?: string;
}

export interface WarehouseItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  unitValue: number; // ₹ per unit (barter valuation)
  movements: StockMovement[];
  createdAt: string;
}

export function itemStock(item: WarehouseItem) {
  return item.movements.reduce((a, m) => a + m.qty, 0);
}

interface WarehouseState {
  items: WarehouseItem[];
  addItem: (i: Omit<WarehouseItem, "id" | "movements" | "createdAt">, openingQty: number) => void;
  updateItem: (id: string, patch: Partial<WarehouseItem>) => void;
  deleteItem: (id: string) => void;
  move: (id: string, qty: number, note?: string) => void;
}

export const useWarehouse = create<WarehouseState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (i, openingQty) =>
        set((st) => ({
          items: [...st.items, {
            ...i, id: crypto.randomUUID(), createdAt: new Date().toISOString().slice(0, 10),
            movements: openingQty ? [{ id: crypto.randomUUID(), date: new Date().toISOString().slice(0, 10), qty: openingQty, note: "Opening stock" }] : [],
          }],
        })),
      updateItem: (id, patch) =>
        set((st) => ({ items: st.items.map((x) => x.id === id ? { ...x, ...patch } : x) })),
      deleteItem: (id) => set((st) => ({ items: st.items.filter((x) => x.id !== id) })),
      move: (id, qty, note) =>
        set((st) => ({
          items: st.items.map((x) => x.id === id
            ? { ...x, movements: [...x.movements, { id: crypto.randomUUID(), date: new Date().toISOString().slice(0, 10), qty, note }] }
            : x),
        })),
    }),
    { name: "atlas-warehouse" },
  ),
);

export interface Partner {
  id: string;
  company: string;
  contact: string;
  phone?: string;
  email?: string;
}

export interface BarterDeal {
  id: string;
  partnerId: string;
  siteIds: string[];
  productsReceived: { description: string; value: number }[];
  startDate: string;
  endDate: string;
  status: "active" | "closed";
  notes?: string;
}

export interface InvoiceLine {
  description: string;
  qty: number;
  unit: string;
  rate: number;
}

export interface Payment {
  id: string;
  amount: number;
  date: string;
}

export type InvoiceStatus = "Draft" | "Sent" | "Partial" | "Paid" | "Overdue";

export interface Invoice {
  id: string;
  number: string;
  type: "sales" | "purchase";
  party: string;
  gstin?: string;
  date: string;
  dueDate: string;
  lines: InvoiceLine[];
  sameState: boolean;
  notes?: string;
  payments: Payment[];
  status: InvoiceStatus;
}

export interface Settings {
  company: string;
  gstin: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  contactName: string;
  email: string;
  phone: string;
  bankName: string;
  accountNumber: string;
  ifsc: string;
  openrouterKey: string;
  tallyHost: string;
}

// ---------- Seed data ----------
const seedSites: Site[] = [
  {
    id: "s1",
    code: "LKO-HRD-001",
    name: "Hazratganj Junction Hoarding",
    city: "Lucknow",
    format: "Hoarding",
    status: "live",
    lat: 26.8493,
    lng: 80.9462,
    monthlyRent: 85000,
    notes: "Prime location, high footfall",
    createdAt: "2025-04-12",
    expiresAt: new Date(Date.now() + 5 * 86400000).toISOString().slice(0, 10),
  },
  {
    id: "s2",
    code: "LKO-UNP-001",
    name: "Gomti Nagar Unipole",
    city: "Lucknow",
    format: "Unipole",
    status: "free",
    lat: 26.85,
    lng: 81.0,
    monthlyRent: 120000,
    createdAt: "2025-05-02",
  },
  {
    id: "s3",
    code: "LKO-BSS-001",
    name: "Alambagh Bus Shelter",
    city: "Lucknow",
    format: "Bus Shelter",
    status: "hold",
    lat: 26.803,
    lng: 80.897,
    monthlyRent: 32000,
    createdAt: "2025-06-01",
    expiresAt: new Date(Date.now() + 20 * 86400000).toISOString().slice(0, 10),
  },
];

const seedPartners: Partner[] = [
  { id: "p1", company: "Rasoi Restaurants Pvt Ltd", contact: "Anil Kapoor", phone: "+91 98100 00001", email: "anil@rasoi.in" },
];

const seedDeals: BarterDeal[] = [
  {
    id: "d1",
    partnerId: "p1",
    siteIds: ["s1"],
    productsReceived: [{ description: "Restaurant credits", value: 60000 }],
    startDate: "2026-06-01",
    endDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
    status: "active",
    notes: "Quarterly barter",
  },
];

const seedInvoices: Invoice[] = [
  {
    id: "i1",
    number: "INV-2025-001",
    type: "sales",
    party: "Shalimar Builders",
    gstin: "09AAACS1234A1Z5",
    date: "2026-05-15",
    dueDate: "2026-06-14",
    lines: [{ description: "Hoarding rental — Hazratganj (May)", qty: 1, unit: "month", rate: 85000 }],
    sameState: true,
    payments: [],
    status: "Overdue",
  },
];

const seedSettings: Settings = {
  company: "BIZEX4U",
  gstin: "09ABCDE1234F1Z5",
  address: "Hazratganj",
  city: "Lucknow",
  state: "Uttar Pradesh",
  pincode: "226001",
  contactName: "Yash Mehrotra",
  email: "yash@bizex4u.com",
  phone: "+91 98000 00000",
  bankName: "HDFC Bank",
  accountNumber: "50100XXXXXXXXX",
  ifsc: "HDFC0000123",
  openrouterKey: "",
  tallyHost: "http://localhost:9000",
};

// ---------- Helpers ----------
export function computeInvoiceStatus(inv: Invoice): InvoiceStatus {
  if (inv.status === "Draft") return "Draft";
  const total = invoiceTotal(inv);
  const paid = inv.payments.reduce((a, p) => a + p.amount, 0);
  if (paid >= total) return "Paid";
  if (paid > 0) return "Partial";
  if (new Date(inv.dueDate).getTime() < Date.now()) return "Overdue";
  return "Sent";
}

export function invoiceSubtotal(inv: Invoice) {
  return inv.lines.reduce((a, l) => a + l.qty * l.rate, 0);
}
export function invoiceTax(inv: Invoice) {
  return invoiceSubtotal(inv) * 0.18;
}
export function invoiceTotal(inv: Invoice) {
  return invoiceSubtotal(inv) + invoiceTax(inv);
}
export function invoiceOutstanding(inv: Invoice) {
  const paid = inv.payments.reduce((a, p) => a + p.amount, 0);
  return Math.max(0, invoiceTotal(inv) - paid);
}

// ---------- Stores ----------
interface InventoryState {
  sites: Site[];
  addSite: (s: Omit<Site, "id" | "code" | "createdAt">) => void;
  updateSite: (id: string, patch: Partial<Site>) => void;
  deleteSite: (id: string) => void;
  setStatus: (id: string, status: SiteStatus) => void;
}

export const useInventory = create<InventoryState>()(
  persist(
    (set, get) => ({
      sites: seedSites,
      addSite: (s) =>
        set((st) => {
          const code = generateSiteCode(
            s.city,
            s.format,
            st.sites.map((x) => x.code),
          );
          return {
            sites: [
              ...st.sites,
              {
                ...s,
                id: crypto.randomUUID(),
                code,
                createdAt: new Date().toISOString().slice(0, 10),
              },
            ],
          };
        }),
      updateSite: (id, patch) =>
        set((st) => ({ sites: st.sites.map((s) => (s.id === id ? { ...s, ...patch } : s)) })),
      deleteSite: (id) => set((st) => ({ sites: st.sites.filter((s) => s.id !== id) })),
      setStatus: (id, status) => get().updateSite(id, { status }),
    }),
    { name: "atlas-inventory" },
  ),
);

interface BarterState {
  partners: Partner[];
  deals: BarterDeal[];
  addPartner: (p: Omit<Partner, "id">) => string;
  addDeal: (d: Omit<BarterDeal, "id" | "status">) => void;
  closeDeal: (id: string) => void;
}

export const useBarter = create<BarterState>()(
  persist(
    (set) => ({
      partners: seedPartners,
      deals: seedDeals,
      addPartner: (p) => {
        const id = crypto.randomUUID();
        set((st) => ({ partners: [...st.partners, { ...p, id }] }));
        return id;
      },
      addDeal: (d) =>
        set((st) => ({
          deals: [...st.deals, { ...d, id: crypto.randomUUID(), status: "active" }],
        })),
      closeDeal: (id) =>
        set((st) => ({
          deals: st.deals.map((d) => (d.id === id ? { ...d, status: "closed" } : d)),
        })),
    }),
    { name: "atlas-barter" },
  ),
);

interface AccountsState {
  invoices: Invoice[];
  addInvoice: (inv: Omit<Invoice, "id" | "number" | "payments" | "status"> & { status?: InvoiceStatus }) => void;
  addPayment: (invoiceId: string, amount: number) => void;
  deleteInvoice: (id: string) => void;
}

export const useAccounts = create<AccountsState>()(
  persist(
    (set) => ({
      invoices: seedInvoices,
      addInvoice: (inv) =>
        set((st) => {
          const year = new Date().getFullYear();
          const nums = st.invoices
            .filter((i) => i.number.includes(String(year)))
            .map((i) => parseInt(i.number.split("-").pop() || "0", 10));
          const next = (nums.length ? Math.max(...nums) : 0) + 1;
          const draft: Invoice = {
            ...inv,
            id: crypto.randomUUID(),
            number: `INV-${year}-${String(next).padStart(3, "0")}`,
            payments: [],
            status: inv.status ?? "Sent",
          };
          return { invoices: [...st.invoices, { ...draft, status: computeInvoiceStatus(draft) }] };
        }),
      addPayment: (invoiceId, amount) =>
        set((st) => ({
          invoices: st.invoices.map((i) => {
            if (i.id !== invoiceId) return i;
            const updated = {
              ...i,
              payments: [
                ...i.payments,
                { id: crypto.randomUUID(), amount, date: new Date().toISOString().slice(0, 10) },
              ],
            };
            return { ...updated, status: computeInvoiceStatus(updated) };
          }),
        })),
      deleteInvoice: (id) => set((st) => ({ invoices: st.invoices.filter((i) => i.id !== id) })),
    }),
    { name: "atlas-accounts" },
  ),
);

// ── Brand Deals ───────────────────────────────────────────────────────────────

export type MediaType =
  | "Hoarding" | "Unipole" | "Wall Wrap" | "Tree Guard" | "Highway Media"
  | "Bus Shelter" | "Auto Rickshaw Branding" | "Transit Panel"
  | "Mall Display" | "Society Lift" | "Multiplex Screen"
  | "Airport Terminal" | "Airport Baggage Belt"
  | "Metro Panel" | "Metro Train Branding"
  | "DOOH" | "Digital Screen"
  | "Newspaper - National" | "Newspaper - Regional" | "Magazine"
  | "Radio" | "Event Sponsorship" | "Cinema";

export const MEDIA_TYPES: MediaType[] = [
  "Hoarding", "Unipole", "Wall Wrap", "Tree Guard", "Highway Media",
  "Bus Shelter", "Auto Rickshaw Branding", "Transit Panel",
  "Mall Display", "Society Lift", "Multiplex Screen",
  "Airport Terminal", "Airport Baggage Belt",
  "Metro Panel", "Metro Train Branding",
  "DOOH", "Digital Screen",
  "Newspaper - National", "Newspaper - Regional", "Magazine",
  "Radio", "Event Sponsorship", "Cinema",
];

export const MEDIA_GROUPS: Record<string, MediaType[]> = {
  "OOH": ["Hoarding", "Unipole", "Wall Wrap", "Tree Guard", "Highway Media"],
  "Transit": ["Bus Shelter", "Auto Rickshaw Branding", "Transit Panel", "Metro Panel", "Metro Train Branding"],
  "Indoor": ["Mall Display", "Society Lift", "Multiplex Screen"],
  "Airport": ["Airport Terminal", "Airport Baggage Belt"],
  "Digital": ["DOOH", "Digital Screen"],
  "Print": ["Newspaper - National", "Newspaper - Regional", "Magazine"],
  "Other": ["Radio", "Event Sponsorship", "Cinema"],
};

export type DealStage = "prospect" | "briefed" | "proposal_sent" | "negotiation" | "agreement" | "live" | "lost";

export const DEAL_STAGES: { key: DealStage; label: string; color: string }[] = [
  { key: "prospect", label: "Prospect", color: "bg-muted text-muted-foreground" },
  { key: "briefed", label: "Briefed", color: "bg-blue-100 text-blue-800" },
  { key: "proposal_sent", label: "Proposal Sent", color: "bg-violet-100 text-violet-800" },
  { key: "negotiation", label: "Negotiation", color: "bg-amber-100 text-amber-800" },
  { key: "agreement", label: "Agreement", color: "bg-orange-100 text-orange-800" },
  { key: "live", label: "Live", color: "bg-green-100 text-green-800" },
  { key: "lost", label: "Lost", color: "bg-red-100 text-red-800" },
];

export interface MediaPlanItem {
  id: string;
  mediaType: MediaType;
  description: string;
  city: string;
  partner: string;
  units: number;
  ratePerUnit: number;
  durationMonths: number;
  siteId?: string;
  status: "proposed" | "approved" | "on_hold" | "rejected";
  notes?: string;
}

export interface BrandDeal {
  id: string;
  brandName: string;
  category: string;
  contactName: string;
  contactEmail?: string;
  contactPhone?: string;
  stage: DealStage;
  objective?: string;
  targetCities: string[];
  targetAudience?: string;
  totalBudget: number;
  startDate?: string;
  durationMonths: number;
  items: MediaPlanItem[];
  nextFollowUp?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export function dealValue(deal: BrandDeal) {
  return deal.items.reduce((a, i) => a + i.units * i.ratePerUnit * i.durationMonths, 0);
}

interface BrandDealsState {
  deals: BrandDeal[];
  addDeal: (d: Omit<BrandDeal, "id" | "items" | "createdAt" | "updatedAt">) => string;
  updateDeal: (id: string, patch: Partial<BrandDeal>) => void;
  setStage: (id: string, stage: DealStage) => void;
  deleteDeal: (id: string) => void;
  addItem: (dealId: string, item: Omit<MediaPlanItem, "id">) => void;
  updateItem: (dealId: string, itemId: string, patch: Partial<MediaPlanItem>) => void;
  deleteItem: (dealId: string, itemId: string) => void;
}

export const useBrandDeals = create<BrandDealsState>()(
  persist(
    (set) => ({
      deals: [],
      addDeal: (d) => {
        const id = crypto.randomUUID();
        set((st) => ({
          deals: [...st.deals, {
            ...d, id, items: [],
            createdAt: new Date().toISOString().slice(0, 10),
            updatedAt: new Date().toISOString().slice(0, 10),
          }],
        }));
        return id;
      },
      updateDeal: (id, patch) =>
        set((st) => ({
          deals: st.deals.map((d) => d.id === id ? { ...d, ...patch, updatedAt: new Date().toISOString().slice(0, 10) } : d),
        })),
      setStage: (id, stage) =>
        set((st) => ({
          deals: st.deals.map((d) => d.id === id ? { ...d, stage, updatedAt: new Date().toISOString().slice(0, 10) } : d),
        })),
      deleteDeal: (id) => set((st) => ({ deals: st.deals.filter((d) => d.id !== id) })),
      addItem: (dealId, item) =>
        set((st) => ({
          deals: st.deals.map((d) =>
            d.id === dealId
              ? { ...d, items: [...d.items, { ...item, id: crypto.randomUUID() }], updatedAt: new Date().toISOString().slice(0, 10) }
              : d
          ),
        })),
      updateItem: (dealId, itemId, patch) =>
        set((st) => ({
          deals: st.deals.map((d) =>
            d.id === dealId
              ? { ...d, items: d.items.map((i) => i.id === itemId ? { ...i, ...patch } : i) }
              : d
          ),
        })),
      deleteItem: (dealId, itemId) =>
        set((st) => ({
          deals: st.deals.map((d) =>
            d.id === dealId ? { ...d, items: d.items.filter((i) => i.id !== itemId) } : d
          ),
        })),
    }),
    { name: "atlas-brand-deals" },
  ),
);

interface SettingsState {
  settings: Settings;
  save: (s: Settings) => void;
}
export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      settings: seedSettings,
      save: (s) => set({ settings: s }),
    }),
    { name: "atlas-settings" },
  ),
);

// ── Credit / Usage Tracker ────────────────────────────────────────────────────

export type ApiService = "groq" | "hf" | "openrouter" | "google_places";

export interface UsageEntry {
  id: string;
  service: ApiService;
  model: string;
  action: string;
  tokens: number;
  calls: number;
  date: string; // YYYY-MM-DD
}

const SERVICE_COST: Record<ApiService, { perCall: number; per1kTokens: number; currency: string }> = {
  groq:          { perCall: 0,     per1kTokens: 0,      currency: "Free" },
  hf:            { perCall: 0,     per1kTokens: 0,      currency: "Free" },
  openrouter:    { perCall: 0,     per1kTokens: 0,      currency: "Free (free models)" },
  google_places: { perCall: 0.017, per1kTokens: 0,      currency: "₹" },
};

export function estimateCost(entry: UsageEntry): number {
  const s = SERVICE_COST[entry.service];
  return s.perCall * entry.calls + (s.per1kTokens * entry.tokens) / 1000;
}

interface CreditsState {
  log: UsageEntry[];
  track: (service: ApiService, model: string, action: string, calls?: number, tokens?: number) => void;
  clear: () => void;
}

export const useCredits = create<CreditsState>()(
  persist(
    (set) => ({
      log: [],
      track: (service, model, action, calls = 1, tokens = 0) =>
        set((st) => {
          const today = new Date().toISOString().slice(0, 10);
          const existing = st.log.find(
            (e) => e.service === service && e.model === model && e.action === action && e.date === today
          );
          if (existing) {
            return {
              log: st.log.map((e) =>
                e.id === existing.id
                  ? { ...e, calls: e.calls + calls, tokens: e.tokens + tokens }
                  : e
              ),
            };
          }
          return {
            log: [
              ...st.log,
              { id: crypto.randomUUID(), service, model, action, tokens, calls, date: today },
            ].slice(-500), // keep last 500 entries
          };
        }),
      clear: () => set({ log: [] }),
    }),
    { name: "atlas-credits" },
  ),
);
