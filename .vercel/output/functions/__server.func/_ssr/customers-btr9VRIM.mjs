import { o as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { T as Plus, s as Users, x as Search } from "../_libs/lucide-react.mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { _ as useAccounts, d as invoiceTotal, l as inr, u as invoiceOutstanding, x as useCrm } from "./sync-BlerjOYi.mjs";
import { t as AppShell } from "./AppShell-Dr6oCPq7.mjs";
import { n as Modal, r as inputCls, t as Field } from "./ui-DZC8LrNE.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/customers-btr9VRIM.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var STAGES = [
	"new",
	"contacted",
	"qualified",
	"won",
	"lost"
];
var STAGE_STYLE = {
	new: "bg-muted text-muted-foreground",
	contacted: "bg-primary/10 text-primary",
	qualified: "bg-warning/15 text-warning-foreground",
	won: "bg-success/15 text-success",
	lost: "bg-destructive/10 text-destructive"
};
function CustomersPage() {
	const { customers } = useCrm();
	const invoices = useAccounts((s) => s.invoices);
	const [q, setQ] = (0, import_react.useState)("");
	const [stage, setStage] = (0, import_react.useState)("all");
	const [openNew, setOpenNew] = (0, import_react.useState)(false);
	const rows = (0, import_react.useMemo)(() => {
		const term = q.toLowerCase();
		return customers.filter((c) => stage === "all" || c.stage === stage).filter((c) => !term || c.name.toLowerCase().includes(term) || c.contact.toLowerCase().includes(term) || (c.email ?? "").toLowerCase().includes(term));
	}, [
		customers,
		q,
		stage
	]);
	function outstandingFor(name) {
		return invoices.filter((i) => i.party.toLowerCase() === name.toLowerCase() && i.type === "sales").reduce((a, i) => a + invoiceOutstanding(i), 0);
	}
	function billedFor(name) {
		return invoices.filter((i) => i.party.toLowerCase() === name.toLowerCase() && i.type === "sales").reduce((a, i) => a + invoiceTotal(i), 0);
	}
	const totalPipeline = customers.filter((c) => c.stage === "qualified" || c.stage === "contacted").length;
	const totalWon = customers.filter((c) => c.stage === "won").length;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-[1400px] p-4 md:p-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-4 flex flex-wrap items-center justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-2xl font-semibold",
					children: "Agencies"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "Advertising agency pipeline"
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					onClick: () => setOpenNew(true),
					className: "inline-flex items-center gap-1.5 rounded-xl gradient-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-card",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }), " New Agency"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
						label: "Total",
						value: customers.length
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
						label: "Won",
						value: totalWon,
						tone: "success"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
						label: "In pipeline",
						value: totalPipeline
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
						label: "Total outstanding",
						value: inr(customers.reduce((a, c) => a + outstandingFor(c.name), 0)),
						tone: "danger",
						isText: true
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-3 flex flex-wrap items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative flex-1 min-w-[200px]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: q,
						onChange: (e) => setQ(e.target.value),
						placeholder: "Filter agencies…",
						className: "h-9 w-full rounded-xl border border-border bg-card pl-9 pr-3 text-sm outline-none focus:border-primary/40"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
					value: stage,
					onChange: (e) => setStage(e.target.value),
					className: "h-9 rounded-xl border border-border bg-card px-3 text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: "all",
						children: "All stages"
					}), STAGES.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: s,
						children: s
					}, s))]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "overflow-hidden rounded-2xl border border-border bg-card shadow-card",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "w-full text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
						className: "bg-muted text-left text-[11px] uppercase tracking-wide text-muted-foreground",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-4 py-2.5",
								children: "Agency"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-4 py-2.5",
								children: "Stage"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-4 py-2.5",
								children: "Contact"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-4 py-2.5 text-right",
								children: "Billed"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-4 py-2.5 text-right",
								children: "Outstanding"
							})
						] })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tbody", { children: [rows.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
						colSpan: 5,
						className: "p-10 text-center text-muted-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "mx-auto mb-2 h-6 w-6 opacity-50" }), "No agencies."]
					}) }), rows.map((c) => {
						const os = outstandingFor(c.name);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "border-t border-border hover:bg-muted/40",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
									className: "px-4 py-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
										to: "/customers/$id",
										params: { id: c.id },
										className: "font-medium text-foreground hover:text-primary",
										children: c.name
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "text-xs text-muted-foreground",
										children: [c.city ?? "—", c.gstin ? ` · ${c.gstin}` : ""]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-4 py-3",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "rounded-full px-2 py-0.5 text-[11px] font-medium " + STAGE_STYLE[c.stage],
										children: c.stage
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
									className: "px-4 py-3 text-xs",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: c.contact }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "text-muted-foreground",
										children: [
											c.phone ?? "",
											" ",
											c.email ? ` · ${c.email}` : ""
										]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-4 py-3 text-right tabular-nums",
									children: inr(billedFor(c.name))
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-4 py-3 text-right tabular-nums font-medium " + (os > 0 ? "text-destructive" : "text-success"),
									children: inr(os)
								})
							]
						}, c.id);
					})] })]
				})
			})
		]
	}), openNew && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NewCustomerModal, { onClose: () => setOpenNew(false) })] });
}
function Kpi({ label, value, tone, isText }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-2xl border border-border bg-card p-4 shadow-card",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-[11px] text-muted-foreground",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-1 font-semibold " + (isText ? "text-xl " : "text-2xl ") + (tone === "success" ? "text-success" : tone === "danger" ? "text-destructive" : ""),
			children: value
		})]
	});
}
function NewCustomerModal({ onClose }) {
	const addCustomer = useCrm((s) => s.addCustomer);
	const [f, setF] = (0, import_react.useState)({
		name: "",
		contact: "",
		phone: "",
		email: "",
		gstin: "",
		city: "",
		state: "Uttar Pradesh",
		stage: "new",
		source: "",
		notes: ""
	});
	function submit(e) {
		e.preventDefault();
		addCustomer(f);
		onClose();
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Modal, {
		title: "New customer",
		onClose,
		wide: true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			onSubmit: submit,
			className: "grid grid-cols-2 gap-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Company / Customer name",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						required: true,
						value: f.name,
						onChange: (e) => setF({
							...f,
							name: e.target.value
						}),
						className: inputCls
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Contact person",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						required: true,
						value: f.contact,
						onChange: (e) => setF({
							...f,
							contact: e.target.value
						}),
						className: inputCls
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Phone",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: f.phone,
						onChange: (e) => setF({
							...f,
							phone: e.target.value
						}),
						className: inputCls
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Email",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "email",
						value: f.email,
						onChange: (e) => setF({
							...f,
							email: e.target.value
						}),
						className: inputCls
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "GSTIN",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: f.gstin,
						onChange: (e) => setF({
							...f,
							gstin: e.target.value
						}),
						className: inputCls
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "City",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: f.city,
						onChange: (e) => setF({
							...f,
							city: e.target.value
						}),
						className: inputCls
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Stage",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
						value: f.stage,
						onChange: (e) => setF({
							...f,
							stage: e.target.value
						}),
						className: inputCls,
						children: STAGES.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: s,
							children: s
						}, s))
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Source",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: f.source,
						onChange: (e) => setF({
							...f,
							source: e.target.value
						}),
						className: inputCls,
						placeholder: "Referral / Website / Cold call"
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "col-span-2 flex justify-end gap-2 pt-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: onClose,
						className: "rounded-xl border border-border px-4 py-2 text-sm",
						children: "Cancel"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: "rounded-xl gradient-primary px-4 py-2 text-sm font-medium text-primary-foreground",
						children: "Add customer"
					})]
				})
			]
		})
	});
}
//#endregion
export { CustomersPage as component };
