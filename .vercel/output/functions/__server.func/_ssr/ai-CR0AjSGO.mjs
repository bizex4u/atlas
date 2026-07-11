import { o as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { _ as Sparkles, b as Send, dt as Bot } from "../_libs/lucide-react.mjs";
import { S as useInventory, T as useWarehouse, _ as useAccounts, f as itemStock, u as invoiceOutstanding, v as useBarter, y as useBrandDeals } from "./sync-BlerjOYi.mjs";
import { d as useServerFn, t as aiChat } from "./ai.functions-KpadgdAQ.mjs";
import { t as AppShell } from "./AppShell-Dr6oCPq7.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ai-CR0AjSGO.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var PROMPTS = [
	"Cheapest hoardings in Guwahati?",
	"Which cities do we cover and at what rates?",
	"What's in the warehouse worth most?",
	"Summarize overdue invoices"
];
function AiPage() {
	const sites = useInventory((s) => s.sites);
	const deals = useBarter((s) => s.deals);
	const invoices = useAccounts((s) => s.invoices);
	const chat = useServerFn(aiChat);
	const [messages, setMessages] = (0, import_react.useState)([]);
	const [input, setInput] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const warehouse = useWarehouse((s) => s.items);
	const brandDeals = useBrandDeals((s) => s.deals);
	const context = (0, import_react.useMemo)(() => {
		const overdue = invoices.filter((i) => i.status === "Overdue");
		const byCity = /* @__PURE__ */ new Map();
		for (const s of sites) {
			const arr = byCity.get(s.city) || [];
			arr.push(s);
			byCity.set(s.city, arr);
		}
		const cityLines = [...byCity.entries()].map(([city, arr]) => {
			const free = arr.filter((s) => s.status === "free");
			const rents = arr.map((s) => s.monthlyRent).filter(Boolean).sort((a, b) => a - b);
			const formats = [...new Set(arr.map((s) => s.format))].join("/");
			const cheapest = [...arr].filter((s) => s.monthlyRent > 0).sort((a, b) => a.monthlyRent - b.monthlyRent).slice(0, 2).map((s) => `${s.name} ₹${s.monthlyRent.toLocaleString("en-IN")}`).join(", ");
			const premium = [...arr].sort((a, b) => b.monthlyRent - a.monthlyRent)[0];
			const tags = [...new Set(arr.flatMap((s) => s.aiTags || []))].slice(0, 6).join(",");
			return `${city}: ${arr.length} sites (${free.length} free) [${formats}] rent ₹${rents[0]?.toLocaleString("en-IN") ?? 0}–₹${rents[rents.length - 1]?.toLocaleString("en-IN") ?? 0}/mo | cheapest: ${cheapest || "n/a"} | premium: ${premium ? `${premium.name} ₹${premium.monthlyRent.toLocaleString("en-IN")}` : "n/a"}${tags ? ` | photo-tags: ${tags}` : ""}`;
		});
		const whLines = warehouse.map((i) => {
			const stock = itemStock(i);
			return `${i.sku} ${i.name} (${i.category}): ${stock} units @ ₹${i.unitValue.toLocaleString("en-IN")} = ₹${(stock * i.unitValue).toLocaleString("en-IN")}`;
		});
		const pipeline = brandDeals.filter((d) => !["lost"].includes(d.stage));
		return [
			`INVENTORY (${sites.length} sites across ${byCity.size} cities — per city):`,
			...cityLines,
			`\nWAREHOUSE (barter goods, ${warehouse.length} SKUs):`,
			whLines.length ? whLines.join("\n") : "empty",
			`\nBRAND PIPELINE: ${pipeline.length} active deals, ${brandDeals.filter((d) => d.stage === "live").length} live`,
			`Active barter deals: ${deals.filter((d) => d.status === "active").length}`,
			`Overdue invoices: ${overdue.length}, total ₹${overdue.reduce((a, i) => a + invoiceOutstanding(i), 0).toLocaleString("en-IN")}`,
			`Total outstanding sales: ₹${invoices.filter((i) => i.type === "sales").reduce((a, i) => a + invoiceOutstanding(i), 0).toLocaleString("en-IN")}`
		].join("\n");
	}, [
		sites,
		deals,
		invoices,
		warehouse,
		brandDeals
	]);
	async function send(text) {
		const msg = text.trim();
		if (!msg || busy) return;
		setInput("");
		setMessages((m) => [...m, {
			role: "user",
			content: msg
		}]);
		setBusy(true);
		try {
			const res = await chat({ data: {
				message: msg,
				context,
				history: messages.slice(-8)
			} });
			setMessages((m) => [...m, {
				role: "assistant",
				content: res.reply
			}]);
		} catch {
			setMessages((m) => [...m, {
				role: "assistant",
				content: "Sorry, I couldn't reach the AI service."
			}]);
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto flex h-[calc(100vh-3.5rem-4rem)] max-w-3xl flex-col p-4 md:h-[calc(100vh-3.5rem)] md:p-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-4 flex items-center gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid h-10 w-10 place-items-center rounded-2xl gradient-primary text-primary-foreground",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-5 w-5" })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-lg font-semibold",
					children: "Atlas AI"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground",
					children: "Grounded on your live inventory, barters & invoices"
				})] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex-1 overflow-y-auto rounded-2xl border border-border bg-card p-4 shadow-card",
				children: messages.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid h-full place-items-center",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-center",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bot, { className: "mx-auto mb-3 h-10 w-10 text-primary" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted-foreground",
								children: "Ask me anything to get started."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-5 flex flex-wrap justify-center gap-2",
								children: PROMPTS.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: () => send(p),
									className: "rounded-full border border-border bg-background px-3 py-1.5 text-xs hover:bg-muted",
									children: p
								}, p))
							})
						]
					})
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-3",
					children: [messages.map((m, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-2 " + (m.role === "user" ? "justify-end" : ""),
						children: [
							m.role === "assistant" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "grid h-8 w-8 shrink-0 place-items-center rounded-xl gradient-primary text-primary-foreground",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bot, { className: "h-4 w-4" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm " + (m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"),
								children: m.content
							}),
							m.role === "user" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "grid h-8 w-8 shrink-0 place-items-center rounded-full bg-secondary text-xs font-semibold",
								children: "Y"
							})
						]
					}, i)), busy && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-xs text-muted-foreground",
						children: "Atlas is thinking…"
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					value: input,
					onChange: (e) => setInput(e.target.value),
					onKeyDown: (e) => e.key === "Enter" && send(input),
					placeholder: "Ask about sites, barters, invoices…",
					className: "h-11 flex-1 rounded-2xl border border-border bg-card px-4 text-sm outline-none focus:border-primary/40"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: () => send(input),
					disabled: busy || !input.trim(),
					className: "grid h-11 w-11 place-items-center rounded-2xl gradient-primary text-primary-foreground disabled:opacity-50",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "h-4 w-4" })
				})]
			})
		]
	}) });
}
//#endregion
export { AiPage as component };
