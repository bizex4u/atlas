import { o as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { E as Phone, M as Mail, d as Trash2, gt as ArrowLeft, j as MapPin } from "../_libs/lucide-react.mjs";
import { g as Link, v as useParams } from "../_libs/@tanstack/react-router+[...].mjs";
import { _ as useAccounts, d as invoiceTotal, l as inr, s as formatDate, u as invoiceOutstanding, x as useCrm } from "./sync-BlerjOYi.mjs";
import { t as AppShell } from "./AppShell-Dr6oCPq7.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/customers._id-DKEMxQo5.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var STAGES = [
	"new",
	"contacted",
	"qualified",
	"won",
	"lost"
];
function CustomerDetail() {
	const { id } = useParams({ from: "/customers/$id" });
	const customer = useCrm((s) => s.customers.find((c) => c.id === id));
	const { updateCustomer, deleteCustomer } = useCrm();
	const invoices = useAccounts((s) => s.invoices);
	if (!customer) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-2xl p-10 text-center",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-muted-foreground",
			children: "Agency not found."
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
			to: "/customers",
			className: "mt-3 inline-block text-sm text-primary hover:underline",
			children: "← Back to customers"
		})]
	}) });
	const custInvoices = invoices.filter((i) => i.party.toLowerCase() === customer.name.toLowerCase() && i.type === "sales");
	const totalBilled = custInvoices.reduce((a, i) => a + invoiceTotal(i), 0);
	const totalOutstanding = custInvoices.reduce((a, i) => a + invoiceOutstanding(i), 0);
	const totalReceived = totalBilled - totalOutstanding;
	const buckets = {
		"0-30": 0,
		"30-60": 0,
		"60-90": 0,
		"90+": 0
	};
	for (const i of custInvoices) {
		const os = invoiceOutstanding(i);
		if (os <= 0) continue;
		const days = Math.floor((Date.now() - new Date(i.dueDate).getTime()) / 864e5);
		if (days < 30) buckets["0-30"] += os;
		else if (days < 60) buckets["30-60"] += os;
		else if (days < 90) buckets["60-90"] += os;
		else buckets["90+"] += os;
	}
	const payments = custInvoices.flatMap((i) => i.payments.map((p) => ({
		...p,
		invoice: i
	}))).sort((a, b) => a.date < b.date ? 1 : -1);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-[1200px] p-4 md:p-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/customers",
				className: "inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "h-3.5 w-3.5" }), " Customers"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex flex-wrap items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-2xl font-semibold",
					children: customer.name
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: customer.contact }),
						customer.phone && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "inline-flex items-center gap-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Phone, { className: "h-3 w-3" }), customer.phone]
						}),
						customer.email && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "inline-flex items-center gap-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, { className: "h-3 w-3" }), customer.email]
						}),
						customer.city && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "inline-flex items-center gap-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "h-3 w-3" }), customer.city]
						}),
						customer.gstin && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["GSTIN ", customer.gstin] })
					]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
						value: customer.stage,
						onChange: (e) => updateCustomer(customer.id, { stage: e.target.value }),
						className: "h-9 rounded-xl border border-border bg-card px-3 text-sm",
						children: STAGES.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: s,
							children: s
						}, s))
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => {
							if (confirm(`Delete ${customer.name}?`)) {
								deleteCustomer(customer.id);
								window.history.back();
							}
						},
						className: "grid h-9 w-9 place-items-center rounded-xl border border-border text-destructive hover:bg-destructive/10",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-4 w-4" })
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5 grid grid-cols-2 gap-3 md:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Total billed",
						value: inr(totalBilled)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Received",
						value: inr(totalReceived),
						tone: "success"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Outstanding",
						value: inr(totalOutstanding),
						tone: totalOutstanding > 0 ? "danger" : void 0
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Invoices",
						value: String(custInvoices.length)
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5 grid gap-4 md:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
					title: "Ageing",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid grid-cols-4 gap-2 text-center",
						children: Object.keys(buckets).map((k) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-xl border border-border p-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-[10px] uppercase text-muted-foreground",
								children: [k, " d"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-1 text-sm font-semibold " + (buckets[k] > 0 ? "text-destructive" : ""),
								children: inr(buckets[k])
							})]
						}, k))
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
					title: "Notes",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NotesEditor, {
						customerId: customer.id,
						initial: customer.notes ?? ""
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5 grid gap-4 lg:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
					title: `Invoices (${custInvoices.length})`,
					children: custInvoices.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, { children: "No invoices for this customer yet." }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "divide-y divide-border text-sm",
						children: custInvoices.map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InvoiceRow, { inv: i }, i.id))
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
					title: `Payment history (${payments.length})`,
					children: payments.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, { children: "No payments recorded." }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "divide-y divide-border text-sm",
						children: payments.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex items-center justify-between py-2.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "font-medium",
								children: inr(p.amount)
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-xs text-muted-foreground",
								children: [
									formatDate(p.date),
									" · ",
									p.invoice.number
								]
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "rounded-full bg-success/15 px-2 py-0.5 text-[11px] font-medium text-success",
								children: "Received"
							})]
						}, p.id))
					})
				})]
			})
		]
	}) });
}
function Stat({ label, value, tone }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-2xl border border-border bg-card p-4 shadow-card",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-[11px] text-muted-foreground",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-1 text-xl font-semibold " + (tone === "success" ? "text-success" : tone === "danger" ? "text-destructive" : ""),
			children: value
		})]
	});
}
function Section({ title, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-2xl border border-border bg-card p-4 shadow-card",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mb-3 text-sm font-medium",
			children: title
		}), children]
	});
}
function Empty({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "rounded-xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground",
		children
	});
}
function InvoiceRow({ inv }) {
	const os = invoiceOutstanding(inv);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
		className: "flex items-center justify-between py-2.5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "font-medium",
			children: inv.number
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "text-xs text-muted-foreground",
			children: [
				formatDate(inv.date),
				" · Due ",
				formatDate(inv.dueDate),
				" · ",
				inv.status
			]
		})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "text-right",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-sm font-medium",
				children: inr(invoiceTotal(inv))
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-xs " + (os > 0 ? "text-destructive" : "text-success"),
				children: os > 0 ? `${inr(os)} due` : "Paid"
			})]
		})]
	});
}
function NotesEditor({ customerId, initial }) {
	const update = useCrm((s) => s.updateCustomer);
	const [val, setVal] = (0, import_react.useState)(initial);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
		value: val,
		onChange: (e) => setVal(e.target.value),
		rows: 4,
		placeholder: "Add call notes, requirements, next steps…",
		className: "w-full resize-none rounded-xl border border-border bg-background p-3 text-sm outline-none focus:border-primary/40"
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mt-2 text-right",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			onClick: () => update(customerId, { notes: val }),
			className: "rounded-lg border border-border px-3 py-1.5 text-xs hover:bg-muted",
			children: "Save notes"
		})
	})] });
}
//#endregion
export { CustomerDetail as component };
