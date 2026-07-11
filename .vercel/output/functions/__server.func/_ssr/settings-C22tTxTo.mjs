import { o as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { P as LoaderCircle, Q as Cloud, S as RefreshCw, Y as Download, d as Trash2, et as CircleX, i as WifiOff, nt as CircleAlert, ot as Check, r as Wifi, st as ChartNoAxesColumn, tt as CircleCheck } from "../_libs/lucide-react.mjs";
import { n as create, t as persist } from "../_libs/zustand.mjs";
import { C as useSettings, _ as useAccounts, b as useCredits, o as estimateCost } from "./sync-BlerjOYi.mjs";
import { d as useServerFn, u as tallySync } from "./ai.functions-KpadgdAQ.mjs";
import { t as AppShell } from "./AppShell-Dr6oCPq7.mjs";
import { r as inputCls, t as Field } from "./ui-DZC8LrNE.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/settings-C22tTxTo.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var SCOPES = ["https://www.googleapis.com/auth/drive.readonly", "https://www.googleapis.com/auth/gmail.readonly"].join(" ");
var useGoogleAuth = create()(persist((set) => ({
	clientId: "",
	token: null,
	tokenExpiry: 0,
	setClientId: (clientId) => set({ clientId }),
	setToken: (token, expiresInSec) => set({
		token,
		tokenExpiry: Date.now() + expiresInSec * 1e3
	}),
	disconnect: () => set({
		token: null,
		tokenExpiry: 0
	})
}), { name: "atlas-google" }));
function isGoogleConnected() {
	const { token, tokenExpiry } = useGoogleAuth.getState();
	return !!token && Date.now() < tokenExpiry - 6e4;
}
var gisLoaded = null;
function loadGIS() {
	if (gisLoaded) return gisLoaded;
	gisLoaded = new Promise((res, rej) => {
		if (document.querySelector("script[data-gis]")) return res();
		const s = document.createElement("script");
		s.src = "https://accounts.google.com/gsi/client";
		s.async = true;
		s.dataset.gis = "1";
		s.onload = () => res();
		s.onerror = () => rej(/* @__PURE__ */ new Error("Failed to load Google Identity Services"));
		document.head.appendChild(s);
	});
	return gisLoaded;
}
async function connectGoogle() {
	const { clientId, setToken } = useGoogleAuth.getState();
	if (!clientId) return {
		ok: false,
		error: "Google Client ID not set — add it in Settings → Integrations"
	};
	await loadGIS();
	const g = window.google;
	if (!g?.accounts?.oauth2) return {
		ok: false,
		error: "Google Identity Services not available"
	};
	const oauth2 = g.accounts.oauth2;
	return new Promise((res) => {
		oauth2.initTokenClient({
			client_id: clientId,
			scope: SCOPES,
			callback: (resp) => {
				if (resp.error || !resp.access_token) res({
					ok: false,
					error: resp.error || "No token returned"
				});
				else {
					setToken(resp.access_token, resp.expires_in || 3600);
					res({ ok: true });
				}
			}
		}).requestAccessToken();
	});
}
function SettingsPage() {
	const [tab, setTab] = (0, import_react.useState)("company");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-3xl p-4 md:p-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mb-1 text-2xl font-semibold",
				children: "Settings"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mb-5 text-sm text-muted-foreground",
				children: "Configure Atlas for BIZEX4U"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mb-6 inline-flex rounded-xl border border-border bg-card p-1",
				children: [
					{
						id: "company",
						label: "Company"
					},
					{
						id: "integrations",
						label: "AI & APIs"
					},
					{
						id: "tally",
						label: "Tally Sync"
					},
					{
						id: "credits",
						label: "Usage & Credits"
					}
				].map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: () => setTab(t.id),
					className: "rounded-lg px-4 py-1.5 text-sm transition-colors " + (tab === t.id ? "bg-primary text-primary-foreground font-medium" : "text-muted-foreground hover:text-foreground"),
					children: t.label
				}, t.id))
			}),
			tab === "company" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CompanyTab, {}),
			tab === "integrations" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IntegrationsTab, {}),
			tab === "tally" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TallyTab, {}),
			tab === "credits" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreditsTab, {})
		]
	}) });
}
function CompanyTab() {
	const settings = useSettings((s) => s.settings);
	const save = useSettings((s) => s.save);
	const [form, setForm] = (0, import_react.useState)(settings);
	const [saved, setSaved] = (0, import_react.useState)(false);
	function update(k, v) {
		setForm((f) => ({
			...f,
			[k]: v
		}));
	}
	function submit(e) {
		e.preventDefault();
		save(form);
		setSaved(true);
		setTimeout(() => setSaved(false), 2e3);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		onSubmit: submit,
		className: "space-y-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
				title: "Company details",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-3 sm:grid-cols-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Company name",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								value: form.company,
								onChange: (e) => update("company", e.target.value),
								className: inputCls
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "GSTIN",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								value: form.gstin,
								onChange: (e) => update("gstin", e.target.value),
								className: inputCls
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Address",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								value: form.address,
								onChange: (e) => update("address", e.target.value),
								className: inputCls
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "City",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								value: form.city,
								onChange: (e) => update("city", e.target.value),
								className: inputCls
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "State",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								value: form.state,
								onChange: (e) => update("state", e.target.value),
								className: inputCls
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Pincode",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								value: form.pincode,
								onChange: (e) => update("pincode", e.target.value),
								className: inputCls
							})
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
				title: "Contact",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-3 sm:grid-cols-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Contact name",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								value: form.contactName,
								onChange: (e) => update("contactName", e.target.value),
								className: inputCls
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Email",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								value: form.email,
								onChange: (e) => update("email", e.target.value),
								className: inputCls
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Phone",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								value: form.phone,
								onChange: (e) => update("phone", e.target.value),
								className: inputCls
							})
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
				title: "Bank details",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-3 sm:grid-cols-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Bank name",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								value: form.bankName,
								onChange: (e) => update("bankName", e.target.value),
								className: inputCls
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Account number",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								value: form.accountNumber,
								onChange: (e) => update("accountNumber", e.target.value),
								className: inputCls
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "IFSC",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								value: form.ifsc,
								onChange: (e) => update("ifsc", e.target.value),
								className: inputCls
							})
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "rounded-xl gradient-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-card",
					children: "Save changes"
				}), saved && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "inline-flex items-center gap-1 text-sm text-success",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-4 w-4" }), " Saved"]
				})]
			})
		]
	});
}
function GoogleSection() {
	const clientId = useGoogleAuth((s) => s.clientId);
	const setClientId = useGoogleAuth((s) => s.setClientId);
	const token = useGoogleAuth((s) => s.token);
	const disconnect = useGoogleAuth((s) => s.disconnect);
	const connected = !!token && isGoogleConnected();
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [err, setErr] = (0, import_react.useState)(null);
	async function doConnect() {
		setBusy(true);
		setErr(null);
		const res = await connectGoogle();
		if (!res.ok) setErr(res.error || "Failed");
		setBusy(false);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
		title: "Google Drive + Gmail — Cloud Import",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mb-3 text-xs text-muted-foreground",
				children: "Import rate cards, costing Excels and site photos directly from Drive and Gmail attachments into Partner Import. Read-only access."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-3 rounded-xl bg-muted/50 px-3 py-2 text-[11px] text-muted-foreground space-y-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: "1. console.cloud.google.com → APIs & Services → Credentials" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						"2. Create OAuth Client ID → Web application → add ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
							className: "rounded bg-muted px-1",
							children: "http://localhost:8080"
						}),
						" to Authorized JavaScript origins"
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						"3. Enable ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Google Drive API" }),
						" + ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Gmail API" }),
						" in API Library"
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: "4. Paste Client ID below, click Connect, approve the Google popup" })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Google OAuth Client ID",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					value: clientId,
					onChange: (e) => setClientId(e.target.value.trim()),
					placeholder: "xxxx.apps.googleusercontent.com",
					className: inputCls
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 flex items-center gap-3",
				children: connected ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "flex items-center gap-1.5 text-xs text-success",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-3.5 w-3.5" }), " Connected — Drive + Gmail readable"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: disconnect,
					className: "rounded-xl border border-border px-3 py-1.5 text-xs hover:bg-muted",
					children: "Disconnect"
				})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: doConnect,
					disabled: busy || !clientId,
					className: "inline-flex items-center gap-1.5 rounded-xl border border-border px-4 py-2 text-xs font-medium hover:bg-muted disabled:opacity-50",
					children: [busy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cloud, { className: "h-3.5 w-3.5" }), "Connect Google Account"]
				})
			}),
			err && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-2 rounded-xl bg-destructive/10 px-3 py-2 text-xs text-destructive",
				children: err
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-2 text-[11px] text-muted-foreground",
				children: "Token expires after ~1 hour — reconnect when prompted. Scopes: drive.readonly, gmail.readonly."
			})
		]
	});
}
function IntegrationsTab() {
	const settings = useSettings((s) => s.settings);
	const save = useSettings((s) => s.save);
	const [form, setForm] = (0, import_react.useState)({
		openrouterKey: settings.openrouterKey || "",
		tallyHost: settings.tallyHost || "http://localhost:9000"
	});
	const [saved, setSaved] = (0, import_react.useState)(false);
	function submit(e) {
		e.preventDefault();
		save({
			...settings,
			...form
		});
		setSaved(true);
		setTimeout(() => setSaved(false), 2e3);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		onSubmit: submit,
		className: "space-y-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GoogleSection, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
				title: "Groq Vision — Partner Import (Free)",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mb-3 text-xs text-muted-foreground",
					children: [
						"Powers Partner Import with ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "llama-4-scout-17b" }),
						" — free vision model for images, PDFs, PPTs. Uses the existing ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
							className: "rounded bg-muted px-1 py-0.5 text-[11px]",
							children: "GROQ_API_KEY"
						}),
						" in .env — no extra setup."
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2 rounded-xl bg-success/10 border border-success/20 px-3 py-2.5 text-xs text-success",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-4 w-4 shrink-0" }), "Groq Vision active · llama-4-scout-17b-16e-instruct · Free"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
				title: "OpenRouter — Fallback Vision",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mb-4 text-xs text-muted-foreground",
						children: ["Fallback if HF fails. Uses Qwen2.5-VL-72B (larger, better quality). Free tier available at ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-primary",
							children: "openrouter.ai"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "OpenRouter API Key",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "password",
							value: form.openrouterKey,
							onChange: (e) => setForm((f) => ({
								...f,
								openrouterKey: e.target.value
							})),
							placeholder: "sk-or-...",
							className: inputCls
						})
					}),
					form.openrouterKey ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-2 flex items-center gap-1.5 text-xs text-success",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-3.5 w-3.5" }), " Key set — fallback parsing enabled"]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-2 flex items-center gap-1.5 text-xs text-muted-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "h-3.5 w-3.5" }), " Optional — HF is primary, OpenRouter is fallback"]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
				title: "Groq AI — Chat & Analysis (Free)",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mb-3 text-xs text-muted-foreground",
					children: [
						"Powers Atlas AI assistant + Area Intelligence on map. Key stored in ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
							className: "rounded bg-muted px-1 py-0.5 text-[11px]",
							children: ".env"
						}),
						" — no change needed."
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2 rounded-xl bg-success/10 border border-success/20 px-3 py-2.5 text-xs text-success",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-4 w-4 shrink-0" }), "Groq connected · llama-3.3-70b-versatile · Free tier"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
				title: "Google Places API — Map Intelligence",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mb-3 text-xs text-muted-foreground",
					children: [
						"Used for Area Intelligence on map — nearby businesses, footfall, SEC scoring. Key stored in ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
							className: "rounded bg-muted px-1 py-0.5 text-[11px]",
							children: ".env"
						}),
						". Free credit: ₹16,700/month (actual usage ~₹400/month)."
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2 rounded-xl bg-success/10 border border-success/20 px-3 py-2.5 text-xs text-success",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-4 w-4 shrink-0" }), "Google Places API key set · Nearby Search enabled"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "rounded-xl gradient-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-card",
					children: "Save keys"
				}), saved && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "inline-flex items-center gap-1 text-sm text-success",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-4 w-4" }), " Saved"]
				})]
			})
		]
	});
}
function TallyTab() {
	const settings = useSettings((s) => s.settings);
	const save = useSettings((s) => s.save);
	const addInvoice = useAccounts((s) => s.addInvoice);
	const [host, setHost] = (0, import_react.useState)(settings.tallyHost || "http://localhost:9000");
	const [pingStatus, setPingStatus] = (0, import_react.useState)("idle");
	const [pingMsg, setPingMsg] = (0, import_react.useState)("");
	const [syncing, setSyncing] = (0, import_react.useState)(false);
	const [syncResult, setSyncResult] = (0, import_react.useState)([]);
	const [syncError, setSyncError] = (0, import_react.useState)("");
	const [fromDate, setFromDate] = (0, import_react.useState)((/* @__PURE__ */ new Date(Date.now() - 90 * 864e5)).toISOString().slice(0, 10));
	const [toDate, setToDate] = (0, import_react.useState)((/* @__PURE__ */ new Date()).toISOString().slice(0, 10));
	const [importing, setImporting] = (0, import_react.useState)(false);
	const [imported, setImported] = (0, import_react.useState)(0);
	const sync = useServerFn(tallySync);
	async function testConnection() {
		setPingStatus("testing");
		setPingMsg("");
		save({
			...settings,
			tallyHost: host
		});
		const r = await sync({ data: {
			host,
			type: "ping"
		} });
		if (r.ok) {
			setPingStatus("ok");
			setPingMsg(r.company || "Connected");
		} else {
			setPingStatus("fail");
			setPingMsg(r.error || "Failed");
		}
	}
	async function fetchVouchers() {
		setSyncing(true);
		setSyncResult([]);
		setSyncError("");
		const r = await sync({ data: {
			host,
			type: "vouchers",
			fromDate,
			toDate
		} });
		if (r.ok && r.vouchers) setSyncResult(r.vouchers);
		else setSyncError(r.error || "Failed");
		setSyncing(false);
	}
	function importToAccounts() {
		setImporting(true);
		let count = 0;
		for (const v of syncResult) {
			const isSales = v.type?.toLowerCase().includes("sales") || v.type?.toLowerCase().includes("receipt");
			addInvoice({
				type: isSales ? "sales" : "purchase",
				party: v.party || "Unknown",
				gstin: "",
				date: v.date ? `${v.date.slice(0, 4)}-${v.date.slice(4, 6)}-${v.date.slice(6, 8)}` : (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
				dueDate: new Date(Date.now() + 30 * 864e5).toISOString().slice(0, 10),
				sameState: true,
				notes: `Imported from Tally · ${v.type} · ${v.number}`,
				lines: [{
					description: v.type || "Tally voucher",
					qty: 1,
					unit: "item",
					rate: Math.abs(v.amount)
				}]
			});
			count++;
		}
		setImported(count);
		setSyncResult([]);
		setImporting(false);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
				title: "Tally Connection",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mb-4 text-xs text-muted-foreground",
						children: ["TallyPrime must be open on this machine with HTTP server enabled. Enable via: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
							className: "rounded bg-muted px-1 py-0.5 text-[11px]",
							children: "F12 → Configure → Advanced → Enable ODBC Server"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex gap-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "TallyPrime URL",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								value: host,
								onChange: (e) => setHost(e.target.value),
								className: inputCls
							})
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 flex items-center gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: testConnection,
								disabled: pingStatus === "testing",
								className: "inline-flex items-center gap-1.5 rounded-xl border border-border px-4 py-2 text-sm hover:bg-muted disabled:opacity-60",
								children: pingStatus === "testing" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin" }), " Testing…"] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wifi, { className: "h-4 w-4" }), " Test connection"] })
							}),
							pingStatus === "ok" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "inline-flex items-center gap-1.5 text-sm text-success",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-4 w-4" }),
									" ",
									pingMsg
								]
							}),
							pingStatus === "fail" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "inline-flex items-center gap-1.5 text-sm text-destructive",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WifiOff, { className: "h-4 w-4" }),
									" ",
									pingMsg
								]
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
				title: "Import Vouchers",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-4 grid grid-cols-2 gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "From date",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "date",
								value: fromDate,
								onChange: (e) => setFromDate(e.target.value),
								className: inputCls
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "To date",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "date",
								value: toDate,
								onChange: (e) => setToDate(e.target.value),
								className: inputCls
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: fetchVouchers,
						disabled: syncing || pingStatus !== "ok",
						className: "inline-flex items-center gap-1.5 rounded-xl gradient-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60",
						children: syncing ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin" }), " Fetching from Tally…"] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "h-4 w-4" }), " Fetch vouchers"] })
					}),
					pingStatus !== "ok" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-xs text-muted-foreground",
						children: "Test connection first"
					}),
					syncError && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 flex items-center gap-2 rounded-xl bg-destructive/10 px-3 py-2.5 text-xs text-destructive",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleX, { className: "h-4 w-4 shrink-0" }),
							" ",
							syncError
						]
					}),
					syncResult.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mb-2 flex items-center justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-sm font-medium",
								children: [syncResult.length, " vouchers fetched"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								onClick: importToAccounts,
								disabled: importing,
								className: "inline-flex items-center gap-1.5 rounded-xl gradient-primary px-3 py-1.5 text-xs font-medium text-primary-foreground",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "h-3.5 w-3.5" }), " Import all to Accounts"]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "max-h-64 overflow-y-auto rounded-xl border border-border",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
								className: "w-full text-xs",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
									className: "border-b border-border bg-muted",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "px-3 py-2 text-left font-medium",
											children: "#"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "px-3 py-2 text-left font-medium",
											children: "Party"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "px-3 py-2 text-left font-medium",
											children: "Type"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "px-3 py-2 text-right font-medium",
											children: "Amount"
										})
									] })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
									className: "divide-y divide-border",
									children: syncResult.slice(0, 50).map((v, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
										className: "hover:bg-muted/50",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "px-3 py-2 text-muted-foreground",
												children: v.number
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "px-3 py-2 font-medium max-w-[120px] truncate",
												children: v.party
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "px-3 py-2 text-muted-foreground",
												children: v.type
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
												className: "px-3 py-2 text-right font-medium",
												children: ["₹", Math.abs(v.amount).toLocaleString("en-IN")]
											})
										]
									}, i))
								})]
							})
						})]
					}),
					imported > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 flex items-center gap-2 rounded-xl bg-success/10 border border-success/20 px-3 py-2.5 text-sm text-success",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-4 w-4 shrink-0" }),
							imported,
							" vouchers imported to Accounts"
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
				title: "How Tally sync works",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ol", {
					className: "space-y-2 text-xs text-muted-foreground",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-semibold text-foreground",
								children: "1."
							}), " Open TallyPrime on this computer"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-semibold text-foreground",
								children: "2."
							}), " Enable HTTP server via F12 → Configure → Advanced Config"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-semibold text-foreground",
								children: "3."
							}), " Click \"Test connection\" above"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-semibold text-foreground",
								children: "4."
							}), " Set date range and fetch vouchers"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-semibold text-foreground",
								children: "5."
							}), " Import to Atlas Accounts — GST fields auto-filled"]
						})
					]
				})
			})
		]
	});
}
var SERVICE_META = {
	groq: {
		label: "Groq (Chat + Analysis)",
		color: "bg-orange-100 text-orange-800",
		cost: "Free"
	},
	hf: {
		label: "HuggingFace Vision",
		color: "bg-blue-100 text-blue-800",
		cost: "Free (~1K req/day)"
	},
	openrouter: {
		label: "OpenRouter Vision",
		color: "bg-violet-100 text-violet-800",
		cost: "Free (free models)"
	},
	google_places: {
		label: "Google Places API",
		color: "bg-green-100 text-green-800",
		cost: "₹1.40/1K calls"
	}
};
function CreditsTab() {
	const { log, clear } = useCredits();
	const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
	const thisMonth = today.slice(0, 7);
	const todayLog = log.filter((e) => e.date === today);
	const monthLog = log.filter((e) => e.date.startsWith(thisMonth));
	function sumBy(entries) {
		const byService = {};
		for (const e of entries) {
			if (!byService[e.service]) byService[e.service] = {
				calls: 0,
				tokens: 0,
				cost: 0
			};
			byService[e.service].calls += e.calls;
			byService[e.service].tokens += e.tokens;
			byService[e.service].cost += estimateCost(e);
		}
		return byService;
	}
	const todaySums = sumBy(todayLog);
	const monthSums = sumBy(monthLog);
	const allServices = [
		"groq",
		"hf",
		"openrouter",
		"google_places"
	];
	const totalMonthlyCost = Object.values(monthSums).reduce((a, s) => a + s.cost, 0);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
			title: "API Usage & Cost Tracker",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-4 flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground",
					children: "All usage logged locally. Costs are estimates based on public pricing."
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					onClick: () => {
						if (confirm("Clear all usage history?")) clear();
					},
					className: "flex items-center gap-1.5 rounded-xl border border-border px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted hover:text-destructive",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3 w-3" }), " Clear log"]
				})]
			}), log.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col items-center justify-center py-10 text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartNoAxesColumn, { className: "mb-2 h-8 w-8 text-muted-foreground/30" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: "No API calls tracked yet"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground/60",
						children: "Usage will appear here after first AI call"
					})
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-4 rounded-xl bg-primary/5 border border-primary/20 px-4 py-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-xs text-muted-foreground",
						children: "This month total estimated cost"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-2xl font-bold text-primary",
						children: totalMonthlyCost === 0 ? "₹0 (all free)" : `₹${totalMonthlyCost.toFixed(2)}`
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "overflow-hidden rounded-xl border border-border",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
						className: "w-full text-xs",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "border-b border-border bg-muted/50 text-[10px] text-muted-foreground",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-3 py-2 text-left",
									children: "Service"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-3 py-2 text-right",
									children: "Today calls"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-3 py-2 text-right",
									children: "Month calls"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-3 py-2 text-right",
									children: "Month tokens"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-3 py-2 text-right",
									children: "Est. cost"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-3 py-2 text-left",
									children: "Pricing"
								})
							]
						}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
							className: "divide-y divide-border",
							children: allServices.map((svc) => {
								const meta = SERVICE_META[svc];
								const td = todaySums[svc] || {
									calls: 0,
									tokens: 0,
									cost: 0
								};
								const mo = monthSums[svc] || {
									calls: 0,
									tokens: 0,
									cost: 0
								};
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
									className: "hover:bg-muted/30",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-3 py-2.5",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: `rounded-full px-2 py-0.5 text-[10px] font-medium ${meta.color}`,
												children: meta.label
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-3 py-2.5 text-right font-medium",
											children: td.calls || "—"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-3 py-2.5 text-right font-medium",
											children: mo.calls || "—"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-3 py-2.5 text-right text-muted-foreground",
											children: mo.tokens > 0 ? mo.tokens.toLocaleString("en-IN") : "—"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-3 py-2.5 text-right font-medium",
											children: mo.cost > 0 ? `₹${mo.cost.toFixed(2)}` : "₹0"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-3 py-2.5 text-muted-foreground",
											children: meta.cost
										})
									]
								}, svc);
							})
						})]
					})
				}),
				log.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mb-2 text-xs font-medium text-muted-foreground",
						children: "Recent calls (last 20)"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "max-h-48 overflow-y-auto rounded-xl border border-border divide-y divide-border",
						children: [...log].reverse().slice(0, 20).map((e) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2 px-3 py-2 text-[11px]",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: `shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${SERVICE_META[e.service]?.color}`,
									children: e.service
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-muted-foreground flex-1 truncate",
									children: e.action
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-muted-foreground",
									children: [
										e.calls,
										" call",
										e.calls > 1 ? "s" : ""
									]
								}),
								e.tokens > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-muted-foreground",
									children: [e.tokens.toLocaleString(), " tok"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-muted-foreground/60",
									children: e.date
								})
							]
						}, e.id))
					})]
				})
			] })]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
			title: "Free tier limits",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-2 text-xs",
				children: [
					{
						service: "Groq",
						limit: "14,400 req/day, 6,000 tokens/min — effectively unlimited for Atlas",
						color: "text-orange-600"
					},
					{
						service: "HuggingFace",
						limit: "~1,000 vision requests/day free · Cold start ~20s if model idle",
						color: "text-blue-600"
					},
					{
						service: "OpenRouter",
						limit: "Free models have no hard cap but may queue during peak hours",
						color: "text-violet-600"
					},
					{
						service: "Google Places",
						limit: "₹16,700 free credit/month · Atlas usage ~₹400/month",
						color: "text-green-600"
					}
				].map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: `shrink-0 font-semibold ${r.color} w-24`,
						children: r.service
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-muted-foreground",
						children: r.limit
					})]
				}, r.service))
			})
		})]
	});
}
function Section({ title, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-2xl border border-border bg-card p-5 shadow-card",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "mb-4 text-base font-semibold",
			children: title
		}), children]
	});
}
//#endregion
export { SettingsPage as component };
