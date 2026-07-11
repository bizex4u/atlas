import { i as TSS_SERVER_FUNCTION, l as createServerFn } from "./esm-Dova13aH.mjs";
import { t as getServerFnById } from "../__23tanstack-start-server-fn-resolver-DtTNYHvd.mjs";
import { a as objectType, o as stringType } from "../_libs/zod.mjs";
import { n as create, t as persist } from "../_libs/zustand.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/sync-BlerjOYi.js
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var VerifyInput = objectType({ passphrase: stringType() });
createServerFn({ method: "POST" }).validator((d) => VerifyInput.parse(d)).handler(createSsrRpc("d3d035a05a25d2e6018b5b27937061cffb98bac2048373fa073cdee709e4b62c"));
var pullState = createServerFn({ method: "POST" }).validator((d) => VerifyInput.parse(d)).handler(createSsrRpc("9e4f3127dcbe1a764e2cc24053b99812e7aed206d067a0b8abb8ef2130c586b1"));
var PushInput = objectType({
	passphrase: stringType(),
	key: stringType(),
	value: stringType()
});
var pushState = createServerFn({ method: "POST" }).validator((d) => PushInput.parse(d)).handler(createSsrRpc("a577131a34e5e4752dbbf8628baf403edf6eee114c3b212f1114e608b1cba60d"));
var seedCustomers = [
	{
		id: "c1",
		name: "Shalimar Builders",
		contact: "R. Shalimar",
		phone: "+91 98200 12345",
		email: "sales@shalimar.in",
		gstin: "09AAACS1234A1Z5",
		city: "Lucknow",
		state: "Uttar Pradesh",
		stage: "won",
		source: "Referral",
		createdAt: "2026-04-01"
	},
	{
		id: "c2",
		name: "Awadh Motors",
		contact: "Priya Sharma",
		phone: "+91 98211 55678",
		email: "priya@awadhmotors.in",
		city: "Lucknow",
		state: "Uttar Pradesh",
		stage: "qualified",
		source: "Website",
		createdAt: "2026-05-20"
	},
	{
		id: "c3",
		name: "Ganga Foods",
		contact: "Deepak Verma",
		phone: "+91 90000 44412",
		city: "Kanpur",
		state: "Uttar Pradesh",
		stage: "contacted",
		source: "Cold call",
		createdAt: "2026-06-10"
	}
];
var seedTasks = [{
	id: "t1",
	title: "Follow up on INV-2025-001 overdue",
	dueDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
	done: false,
	priority: "high",
	customerId: "c1",
	invoiceId: "i1",
	createdAt: "2026-06-25"
}, {
	id: "t2",
	title: "Send Awadh Motors proposal for Gomti Nagar Unipole",
	dueDate: new Date(Date.now() + 2 * 864e5).toISOString().slice(0, 10),
	done: false,
	priority: "med",
	customerId: "c2",
	createdAt: "2026-06-28"
}];
var useCrm = create()(persist((set) => ({
	customers: seedCustomers,
	addCustomer: (c) => {
		const id = crypto.randomUUID();
		set((st) => ({ customers: [...st.customers, {
			...c,
			id,
			createdAt: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)
		}] }));
		return id;
	},
	updateCustomer: (id, patch) => set((st) => ({ customers: st.customers.map((c) => c.id === id ? {
		...c,
		...patch
	} : c) })),
	deleteCustomer: (id) => set((st) => ({ customers: st.customers.filter((c) => c.id !== id) }))
}), { name: "atlas-crm" }));
var useTasks = create()(persist((set) => ({
	tasks: seedTasks,
	addTask: (t) => set((st) => ({ tasks: [...st.tasks, {
		...t,
		id: crypto.randomUUID(),
		done: false,
		createdAt: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)
	}] })),
	toggle: (id) => set((st) => ({ tasks: st.tasks.map((t) => t.id === id ? {
		...t,
		done: !t.done
	} : t) })),
	updateTask: (id, patch) => set((st) => ({ tasks: st.tasks.map((t) => t.id === id ? {
		...t,
		...patch
	} : t) })),
	deleteTask: (id) => set((st) => ({ tasks: st.tasks.filter((t) => t.id !== id) }))
}), { name: "atlas-tasks" }));
var inr = (n) => "₹" + (n || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 });
var FORMAT_CODES = {
	Hoarding: "HRD",
	Unipole: "UNP",
	"Bus Shelter": "BSS",
	"Metro Panel": "MTP",
	"Mall Display": "MLD",
	Transit: "TRN",
	Digital: "DIG"
};
var cityCode = (city) => city.replace(/[^a-zA-Z]/g, "").toUpperCase().slice(0, 3).padEnd(3, "X");
function generateSiteCode(city, format, existing) {
	const prefix = `${cityCode(city)}-${FORMAT_CODES[format] ?? "GEN"}`;
	const nums = existing.filter((c) => c.startsWith(prefix)).map((c) => parseInt(c.split("-")[2] || "0", 10));
	const next = (nums.length ? Math.max(...nums) : 0) + 1;
	return `${prefix}-${String(next).padStart(3, "0")}`;
}
var formatDate = (iso) => new Date(iso).toLocaleDateString("en-IN", {
	day: "2-digit",
	month: "short",
	year: "numeric"
});
var useBookings = create()(persist((set) => ({
	bookings: [],
	addBooking: (b) => set((st) => ({ bookings: [...st.bookings, {
		...b,
		id: crypto.randomUUID(),
		createdAt: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)
	}] })),
	updateBooking: (id, patch) => set((st) => ({ bookings: st.bookings.map((x) => x.id === id ? {
		...x,
		...patch
	} : x) })),
	deleteBooking: (id) => set((st) => ({ bookings: st.bookings.filter((x) => x.id !== id) }))
}), { name: "atlas-bookings" }));
function itemStock(item) {
	return item.movements.reduce((a, m) => a + m.qty, 0);
}
var useWarehouse = create()(persist((set) => ({
	items: [],
	addItem: (i, openingQty) => set((st) => ({ items: [...st.items, {
		...i,
		id: crypto.randomUUID(),
		createdAt: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
		movements: openingQty ? [{
			id: crypto.randomUUID(),
			date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
			qty: openingQty,
			note: "Opening stock"
		}] : []
	}] })),
	updateItem: (id, patch) => set((st) => ({ items: st.items.map((x) => x.id === id ? {
		...x,
		...patch
	} : x) })),
	deleteItem: (id) => set((st) => ({ items: st.items.filter((x) => x.id !== id) })),
	move: (id, qty, note) => set((st) => ({ items: st.items.map((x) => x.id === id ? {
		...x,
		movements: [...x.movements, {
			id: crypto.randomUUID(),
			date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
			qty,
			note
		}]
	} : x) }))
}), { name: "atlas-warehouse" }));
var seedSites = [
	{
		id: "s1",
		code: "LKO-HRD-001",
		name: "Hazratganj Junction Hoarding",
		city: "Lucknow",
		format: "Hoarding",
		status: "live",
		lat: 26.8493,
		lng: 80.9462,
		monthlyRent: 85e3,
		notes: "Prime location, high footfall",
		createdAt: "2025-04-12",
		expiresAt: new Date(Date.now() + 5 * 864e5).toISOString().slice(0, 10)
	},
	{
		id: "s2",
		code: "LKO-UNP-001",
		name: "Gomti Nagar Unipole",
		city: "Lucknow",
		format: "Unipole",
		status: "free",
		lat: 26.85,
		lng: 81,
		monthlyRent: 12e4,
		createdAt: "2025-05-02"
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
		monthlyRent: 32e3,
		createdAt: "2025-06-01",
		expiresAt: new Date(Date.now() + 20 * 864e5).toISOString().slice(0, 10)
	}
];
var seedPartners = [{
	id: "p1",
	company: "Rasoi Restaurants Pvt Ltd",
	contact: "Anil Kapoor",
	phone: "+91 98100 00001",
	email: "anil@rasoi.in"
}];
var seedDeals = [{
	id: "d1",
	partnerId: "p1",
	siteIds: ["s1"],
	productsReceived: [{
		description: "Restaurant credits",
		value: 6e4
	}],
	startDate: "2026-06-01",
	endDate: new Date(Date.now() + 30 * 864e5).toISOString().slice(0, 10),
	status: "active",
	notes: "Quarterly barter"
}];
var seedInvoices = [{
	id: "i1",
	number: "INV-2025-001",
	type: "sales",
	party: "Shalimar Builders",
	gstin: "09AAACS1234A1Z5",
	date: "2026-05-15",
	dueDate: "2026-06-14",
	lines: [{
		description: "Hoarding rental — Hazratganj (May)",
		qty: 1,
		unit: "month",
		rate: 85e3
	}],
	sameState: true,
	payments: [],
	status: "Overdue"
}];
var seedSettings = {
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
	tallyHost: "http://localhost:9000"
};
function computeInvoiceStatus(inv) {
	if (inv.status === "Draft") return "Draft";
	const total = invoiceTotal(inv);
	const paid = inv.payments.reduce((a, p) => a + p.amount, 0);
	if (paid >= total) return "Paid";
	if (paid > 0) return "Partial";
	if (new Date(inv.dueDate).getTime() < Date.now()) return "Overdue";
	return "Sent";
}
function invoiceSubtotal(inv) {
	return inv.lines.reduce((a, l) => a + l.qty * l.rate, 0);
}
function invoiceTax(inv) {
	return invoiceSubtotal(inv) * .18;
}
function invoiceTotal(inv) {
	return invoiceSubtotal(inv) + invoiceTax(inv);
}
function invoiceOutstanding(inv) {
	const paid = inv.payments.reduce((a, p) => a + p.amount, 0);
	return Math.max(0, invoiceTotal(inv) - paid);
}
var useInventory = create()(persist((set, get) => ({
	sites: seedSites,
	addSite: (s) => set((st) => {
		const code = generateSiteCode(s.city, s.format, st.sites.map((x) => x.code));
		return { sites: [...st.sites, {
			...s,
			id: crypto.randomUUID(),
			code,
			createdAt: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)
		}] };
	}),
	updateSite: (id, patch) => set((st) => ({ sites: st.sites.map((s) => s.id === id ? {
		...s,
		...patch
	} : s) })),
	deleteSite: (id) => set((st) => ({ sites: st.sites.filter((s) => s.id !== id) })),
	setStatus: (id, status) => get().updateSite(id, { status })
}), { name: "atlas-inventory" }));
var useBarter = create()(persist((set) => ({
	partners: seedPartners,
	deals: seedDeals,
	addPartner: (p) => {
		const id = crypto.randomUUID();
		set((st) => ({ partners: [...st.partners, {
			...p,
			id
		}] }));
		return id;
	},
	addDeal: (d) => set((st) => ({ deals: [...st.deals, {
		...d,
		id: crypto.randomUUID(),
		status: "active"
	}] })),
	closeDeal: (id) => set((st) => ({ deals: st.deals.map((d) => d.id === id ? {
		...d,
		status: "closed"
	} : d) }))
}), { name: "atlas-barter" }));
var useAccounts = create()(persist((set) => ({
	invoices: seedInvoices,
	addInvoice: (inv) => set((st) => {
		const year = (/* @__PURE__ */ new Date()).getFullYear();
		const nums = st.invoices.filter((i) => i.number.includes(String(year))).map((i) => parseInt(i.number.split("-").pop() || "0", 10));
		const next = (nums.length ? Math.max(...nums) : 0) + 1;
		const draft = {
			...inv,
			id: crypto.randomUUID(),
			number: `INV-${year}-${String(next).padStart(3, "0")}`,
			payments: [],
			status: inv.status ?? "Sent"
		};
		return { invoices: [...st.invoices, {
			...draft,
			status: computeInvoiceStatus(draft)
		}] };
	}),
	addPayment: (invoiceId, amount) => set((st) => ({ invoices: st.invoices.map((i) => {
		if (i.id !== invoiceId) return i;
		const updated = {
			...i,
			payments: [...i.payments, {
				id: crypto.randomUUID(),
				amount,
				date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)
			}]
		};
		return {
			...updated,
			status: computeInvoiceStatus(updated)
		};
	}) })),
	deleteInvoice: (id) => set((st) => ({ invoices: st.invoices.filter((i) => i.id !== id) }))
}), { name: "atlas-accounts" }));
var MEDIA_GROUPS = {
	"OOH": [
		"Hoarding",
		"Unipole",
		"Wall Wrap",
		"Tree Guard",
		"Highway Media"
	],
	"Transit": [
		"Bus Shelter",
		"Auto Rickshaw Branding",
		"Transit Panel",
		"Metro Panel",
		"Metro Train Branding"
	],
	"Indoor": [
		"Mall Display",
		"Society Lift",
		"Multiplex Screen"
	],
	"Airport": ["Airport Terminal", "Airport Baggage Belt"],
	"Digital": ["DOOH", "Digital Screen"],
	"Print": [
		"Newspaper - National",
		"Newspaper - Regional",
		"Magazine"
	],
	"Other": [
		"Radio",
		"Event Sponsorship",
		"Cinema"
	]
};
var DEAL_STAGES = [
	{
		key: "prospect",
		label: "Prospect",
		color: "bg-muted text-muted-foreground"
	},
	{
		key: "briefed",
		label: "Briefed",
		color: "bg-blue-100 text-blue-800"
	},
	{
		key: "proposal_sent",
		label: "Proposal Sent",
		color: "bg-violet-100 text-violet-800"
	},
	{
		key: "negotiation",
		label: "Negotiation",
		color: "bg-amber-100 text-amber-800"
	},
	{
		key: "agreement",
		label: "Agreement",
		color: "bg-orange-100 text-orange-800"
	},
	{
		key: "live",
		label: "Live",
		color: "bg-green-100 text-green-800"
	},
	{
		key: "lost",
		label: "Lost",
		color: "bg-red-100 text-red-800"
	}
];
function dealValue(deal) {
	return deal.items.reduce((a, i) => a + i.units * i.ratePerUnit * i.durationMonths, 0);
}
var useBrandDeals = create()(persist((set) => ({
	deals: [],
	addDeal: (d) => {
		const id = crypto.randomUUID();
		set((st) => ({ deals: [...st.deals, {
			...d,
			id,
			items: [],
			createdAt: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
			updatedAt: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)
		}] }));
		return id;
	},
	updateDeal: (id, patch) => set((st) => ({ deals: st.deals.map((d) => d.id === id ? {
		...d,
		...patch,
		updatedAt: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)
	} : d) })),
	setStage: (id, stage) => set((st) => ({ deals: st.deals.map((d) => d.id === id ? {
		...d,
		stage,
		updatedAt: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)
	} : d) })),
	deleteDeal: (id) => set((st) => ({ deals: st.deals.filter((d) => d.id !== id) })),
	addItem: (dealId, item) => set((st) => ({ deals: st.deals.map((d) => d.id === dealId ? {
		...d,
		items: [...d.items, {
			...item,
			id: crypto.randomUUID()
		}],
		updatedAt: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)
	} : d) })),
	updateItem: (dealId, itemId, patch) => set((st) => ({ deals: st.deals.map((d) => d.id === dealId ? {
		...d,
		items: d.items.map((i) => i.id === itemId ? {
			...i,
			...patch
		} : i)
	} : d) })),
	deleteItem: (dealId, itemId) => set((st) => ({ deals: st.deals.map((d) => d.id === dealId ? {
		...d,
		items: d.items.filter((i) => i.id !== itemId)
	} : d) }))
}), { name: "atlas-brand-deals" }));
var useSettings = create()(persist((set) => ({
	settings: seedSettings,
	save: (s) => set({ settings: s })
}), { name: "atlas-settings" }));
var SERVICE_COST = {
	groq: {
		perCall: 0,
		per1kTokens: 0,
		currency: "Free"
	},
	hf: {
		perCall: 0,
		per1kTokens: 0,
		currency: "Free"
	},
	openrouter: {
		perCall: 0,
		per1kTokens: 0,
		currency: "Free (free models)"
	},
	google_places: {
		perCall: .017,
		per1kTokens: 0,
		currency: "₹"
	}
};
function estimateCost(entry) {
	const s = SERVICE_COST[entry.service];
	return s.perCall * entry.calls + s.per1kTokens * entry.tokens / 1e3;
}
var useCredits = create()(persist((set) => ({
	log: [],
	track: (service, model, action, calls = 1, tokens = 0) => set((st) => {
		const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
		const existing = st.log.find((e) => e.service === service && e.model === model && e.action === action && e.date === today);
		if (existing) return { log: st.log.map((e) => e.id === existing.id ? {
			...e,
			calls: e.calls + calls,
			tokens: e.tokens + tokens
		} : e) };
		return { log: [...st.log, {
			id: crypto.randomUUID(),
			service,
			model,
			action,
			tokens,
			calls,
			date: today
		}].slice(-500) };
	}),
	clear: () => set({ log: [] })
}), { name: "atlas-credits" }));
var useLedger = create()(persist((set) => ({
	manual: [],
	addJournal: (e) => set((st) => ({ manual: [...st.manual, {
		...e,
		id: crypto.randomUUID(),
		source: "manual"
	}] })),
	deleteJournal: (id) => set((st) => ({ manual: st.manual.filter((e) => e.id !== id) }))
}), { name: "atlas-ledger" }));
var SYNCED = [
	{
		key: "atlas-crm",
		store: useCrm
	},
	{
		key: "atlas-tasks",
		store: useTasks
	},
	{
		key: "atlas-ledger",
		store: useLedger
	},
	{
		key: "atlas-inventory",
		store: useInventory
	},
	{
		key: "atlas-barter",
		store: useBarter
	},
	{
		key: "atlas-accounts",
		store: useAccounts
	},
	{
		key: "atlas-brand-deals",
		store: useBrandDeals
	},
	{
		key: "atlas-settings",
		store: useSettings
	},
	{
		key: "atlas-credits",
		store: useCredits
	},
	{
		key: "atlas-warehouse",
		store: useWarehouse
	},
	{
		key: "atlas-bookings",
		store: useBookings
	}
];
var SYNC_KEYS = new Set(SYNCED.map((s) => s.key));
var AUTH_KEY = "atlas-auth";
function getPassphrase() {
	try {
		return localStorage.getItem(AUTH_KEY);
	} catch {
		return null;
	}
}
function setPassphrase(p) {
	try {
		localStorage.setItem(AUTH_KEY, p);
	} catch {}
}
function clearPassphrase() {
	try {
		localStorage.removeItem(AUTH_KEY);
	} catch {}
}
var started = false;
var applyingRemote = false;
var pushTimers = /* @__PURE__ */ new Map();
var origSetItem = null;
var status = "idle";
var listeners = /* @__PURE__ */ new Set();
function setStatus(s) {
	status = s;
	listeners.forEach((l) => l(s));
}
function onSyncStatus(cb) {
	listeners.add(cb);
	cb(status);
	return () => {
		listeners.delete(cb);
	};
}
var lastErrToast = 0;
function notifySyncError(msg) {
	if (Date.now() - lastErrToast < 3e4) return;
	lastErrToast = Date.now();
	import("./Toaster-UBdYQFLf.mjs").then((n) => n.n).then((n) => n.n).then(({ toast }) => toast.error("Sync issue", msg)).catch(() => {});
}
function queuePush(key, value) {
	const pass = getPassphrase();
	if (!pass) return;
	const existing = pushTimers.get(key);
	if (existing) clearTimeout(existing);
	pushTimers.set(key, setTimeout(async () => {
		pushTimers.delete(key);
		setStatus("syncing");
		try {
			const res = await pushState({ data: {
				passphrase: pass,
				key,
				value
			} });
			setStatus(res.ok ? "synced" : "error");
			if (!res.ok) notifySyncError(res.error || "Could not save to cloud");
		} catch {
			setStatus("error");
			notifySyncError("Offline — changes saved locally, will retry on next edit");
		}
	}, 800));
}
/** Pull remote state, hydrate stores. Returns true on success. */
async function pullAndHydrate(passphrase) {
	setStatus("syncing");
	let res;
	try {
		res = await pullState({ data: { passphrase } });
	} catch (e) {
		setStatus("error");
		return {
			ok: false,
			error: e instanceof Error ? e.message : "Pull failed"
		};
	}
	if (!res.ok) {
		setStatus("error");
		return {
			ok: false,
			error: res.error || "Pull failed"
		};
	}
	applyingRemote = true;
	try {
		const write = origSetItem || localStorage.setItem.bind(localStorage);
		for (const { key, store } of SYNCED) {
			const remote = res.entries[key];
			if (remote == null) continue;
			write(key, remote);
			store.persist?.rehydrate?.();
		}
	} finally {
		applyingRemote = false;
	}
	setStatus("synced");
	for (const { key } of SYNCED) if (res.entries[key] == null) try {
		const local = localStorage.getItem(key);
		if (local) queuePush(key, local);
	} catch {}
	return { ok: true };
}
/** Install the localStorage interceptor so future writes push to remote. Idempotent. */
function startSync() {
	if (started || typeof window === "undefined") return;
	started = true;
	const ls = window.localStorage;
	origSetItem = ls.setItem.bind(ls);
	ls.setItem = (key, value) => {
		origSetItem(key, value);
		if (!applyingRemote && SYNC_KEYS.has(key)) queuePush(key, value);
	};
}
//#endregion
export { useSettings as C, useInventory as S, useWarehouse as T, useAccounts as _, dealValue as a, useCredits as b, getPassphrase as c, invoiceTotal as d, itemStock as f, startSync as g, setPassphrase as h, createSsrRpc as i, inr as l, pullAndHydrate as m, MEDIA_GROUPS as n, estimateCost as o, onSyncStatus as p, clearPassphrase as r, formatDate as s, DEAL_STAGES as t, invoiceOutstanding as u, useBarter as v, useTasks as w, useCrm as x, useBrandDeals as y };
