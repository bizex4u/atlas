import { o as __toESM, r as __exportAll$1 } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { Q as Cloud, n as X, nt as CircleAlert, tt as CircleCheck, z as Info } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/Toaster-UBdYQFLf.js
var Toaster_UBdYQFLf_exports = /* @__PURE__ */ __exportAll$1({
	n: () => Toaster_exports,
	r: () => toast,
	t: () => Toaster
});
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
var Toaster_exports = /* @__PURE__ */ __exportAll({
	Toaster: () => Toaster,
	toast: () => toast
});
var listeners = /* @__PURE__ */ new Set();
function toast(kind, title, desc) {
	const t = {
		id: crypto.randomUUID(),
		kind,
		title,
		desc
	};
	listeners.forEach((l) => l(t));
}
toast.success = (title, desc) => toast("success", title, desc);
toast.error = (title, desc) => toast("error", title, desc);
toast.info = (title, desc) => toast("info", title, desc);
var ICONS = {
	success: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-4 w-4 text-success" }),
	error: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "h-4 w-4 text-destructive" }),
	info: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, { className: "h-4 w-4 text-primary" }),
	sync: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cloud, { className: "h-4 w-4 text-primary" })
};
function Toaster() {
	const [toasts, setToasts] = (0, import_react.useState)([]);
	(0, import_react.useEffect)(() => {
		const onToast = (t) => {
			setToasts((prev) => [...prev.slice(-3), t]);
			setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== t.id)), 3800);
		};
		listeners.add(onToast);
		return () => {
			listeners.delete(onToast);
		};
	}, []);
	if (!toasts.length) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "pointer-events-none fixed bottom-4 right-4 z-[100] flex flex-col gap-2",
		children: toasts.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "pointer-events-auto flex items-start gap-2.5 rounded-xl border border-border bg-card px-4 py-3 shadow-lg animate-in slide-in-from-bottom-2 fade-in duration-200 min-w-[260px] max-w-[360px]",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "mt-0.5 shrink-0",
					children: ICONS[t.kind]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0 flex-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-sm font-medium leading-tight",
						children: t.title
					}), t.desc && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-0.5 text-xs text-muted-foreground",
						children: t.desc
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: () => setToasts((prev) => prev.filter((x) => x.id !== t.id)),
					className: "shrink-0 rounded-md p-0.5 text-muted-foreground hover:bg-muted",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-3.5 w-3.5" })
				})
			]
		}, t.id))
	});
}
//#endregion
export { Toaster_UBdYQFLf_exports as n, toast as r, Toaster as t };
