import "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { n as X } from "../_libs/lucide-react.mjs";
require_react();
var import_jsx_runtime = require_jsx_runtime();
var inputCls = "h-9 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary/40";
function Field({ label, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "block",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "mb-1 block text-xs font-medium text-muted-foreground",
			children: label
		}), children]
	});
}
function Modal({ title, onClose, children, wide }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-full overflow-y-auto rounded-t-3xl bg-card p-5 shadow-xl sm:rounded-3xl " + (wide ? "sm:max-w-2xl" : "sm:max-w-md") + " max-h-[90vh]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-4 flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "text-base font-semibold",
					children: title
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: onClose,
					className: "grid h-8 w-8 place-items-center rounded-lg hover:bg-muted",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" })
				})]
			}), children]
		})
	});
}
//#endregion
export { Modal as n, inputCls as r, Field as t };
