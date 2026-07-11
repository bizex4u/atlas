import { o as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { C as Radar, P as LoaderCircle, S as RefreshCw, _ as Sparkles } from "../_libs/lucide-react.mjs";
import { a as dealValue, b as useCredits, y as useBrandDeals } from "./sync-BlerjOYi.mjs";
import { c as marketIntel, d as useServerFn } from "./ai.functions-KpadgdAQ.mjs";
import { t as AppShell } from "./AppShell-Dr6oCPq7.mjs";
import { r as inputCls } from "./ui-DZC8LrNE.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/intel-CEMJBa7E.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function IntelPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IntelContent, {}) });
}
function IntelContent() {
	const deals = useBrandDeals((s) => s.deals);
	const track = useCredits((s) => s.track);
	const intel = useServerFn(marketIntel);
	const [city, setCity] = (0, import_react.useState)("Lucknow");
	const [loading, setLoading] = (0, import_react.useState)(false);
	const [report, setReport] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)(null);
	async function run() {
		setLoading(true);
		setError(null);
		try {
			const res = await intel({ data: {
				city,
				dealHistory: deals.map((d) => ({
					brand: d.brandName,
					category: d.category,
					stage: d.stage,
					value: dealValue(d)
				}))
			} });
			if (res.error) setError(res.error);
			else setReport(res.report);
			track("groq", "llama-3.3-70b-versatile", "market_intel", 1, 0);
		} catch (e) {
			setError(e instanceof Error ? e.message : "Intel failed");
		} finally {
			setLoading(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-[900px] p-4 md:p-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-5 flex flex-wrap items-end justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-2xl font-semibold",
					children: "Market Intel"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted-foreground",
					children: "Who's spending, who to pitch next, seasonal angles — AI market analysis"
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: city,
						onChange: (e) => setCity(e.target.value),
						placeholder: "City",
						className: inputCls + " w-36"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: run,
						disabled: loading || !city.trim(),
						className: "inline-flex items-center gap-2 rounded-xl gradient-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60",
						children: [loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : report ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "h-4 w-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Radar, { className: "h-4 w-4" }), loading ? "Analyzing…" : report ? "Refresh" : "Run Intel"]
					})]
				})]
			}),
			error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mb-4 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive",
				children: error
			}),
			!report && !loading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid place-items-center rounded-2xl border border-dashed border-border bg-card/50 p-16 text-center",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Radar, { className: "mx-auto h-10 w-10 text-muted-foreground/40" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-3 text-sm text-muted-foreground",
					children: [
						"Analyzes seasonal spend patterns, active brand categories in ",
						city || "your city",
						",",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
						"hot prospects to call this month, and gaps in your pipeline (",
						deals.length,
						" deals tracked)."
					]
				})] })
			}),
			report && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-2xl border border-border bg-card p-6 shadow-card",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-4 flex items-center gap-2 text-xs text-muted-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-3.5 w-3.5 text-primary" }), "AI market analysis — estimates from market patterns, not verified spend data"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MarkdownLite, { text: report })]
			})
		]
	});
}
function MarkdownLite({ text }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "space-y-1.5 text-sm leading-relaxed",
		children: text.split("\n").map((line, i) => {
			const t = line.trim();
			if (!t) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-2" }, i);
			if (t.startsWith("## ")) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "pt-3 text-base font-semibold text-primary",
				children: t.slice(3)
			}, i);
			if (t.startsWith("# ")) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "pt-3 text-base font-semibold text-primary",
				children: t.slice(2)
			}, i);
			const bolded = t.split(/\*\*(.*?)\*\*/g).map((seg, j) => j % 2 === 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: seg }, j) : seg);
			if (/^[-*•]\s/.test(t)) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-2 pl-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-primary",
					children: "•"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t.replace(/^[-*•]\s/, "").split(/\*\*(.*?)\*\*/g).map((seg, j) => j % 2 === 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: seg }, j) : seg) })]
			}, i);
			if (/^\d+\.\s/.test(t)) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-2 pl-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "font-medium text-primary",
					children: [t.match(/^\d+/)?.[0], "."]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t.replace(/^\d+\.\s/, "").split(/\*\*(.*?)\*\*/g).map((seg, j) => j % 2 === 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: seg }, j) : seg) })]
			}, i);
			return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: bolded }, i);
		})
	});
}
//#endregion
export { IntelPage as component };
