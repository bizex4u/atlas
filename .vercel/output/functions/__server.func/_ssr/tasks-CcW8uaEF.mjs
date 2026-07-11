import { o as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { T as Plus, d as Trash2, g as SquareCheckBig, pt as Bell } from "../_libs/lucide-react.mjs";
import { _ as useAccounts, l as inr, s as formatDate, u as invoiceOutstanding, w as useTasks, x as useCrm } from "./sync-BlerjOYi.mjs";
import { t as AppShell } from "./AppShell-Dr6oCPq7.mjs";
import { n as Modal, r as inputCls, t as Field } from "./ui-DZC8LrNE.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/tasks-CcW8uaEF.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var PRI_STYLE = {
	low: "bg-muted text-muted-foreground",
	med: "bg-primary/10 text-primary",
	high: "bg-destructive/10 text-destructive"
};
function TasksPage() {
	const { tasks, toggle, deleteTask, addTask } = useTasks();
	const invoices = useAccounts((s) => s.invoices);
	const customers = useCrm((s) => s.customers);
	const [openNew, setOpenNew] = (0, import_react.useState)(false);
	const [filter, setFilter] = (0, import_react.useState)("open");
	const overdue = invoices.filter((i) => i.status === "Overdue");
	const list = (0, import_react.useMemo)(() => {
		return tasks.filter((t) => filter === "all" ? true : filter === "open" ? !t.done : t.done).sort((a, b) => a.done === b.done ? a.dueDate < b.dueDate ? -1 : 1 : a.done ? 1 : -1);
	}, [tasks, filter]);
	const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
	const dueToday = tasks.filter((t) => !t.done && t.dueDate <= today).length;
	const openCount = tasks.filter((t) => !t.done).length;
	function customerName(id) {
		return customers.find((c) => c.id === id)?.name;
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-[1200px] p-4 md:p-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-4 flex flex-wrap items-center justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-2xl font-semibold",
					children: "Tasks"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "Follow-ups, reminders & productivity"
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					onClick: () => setOpenNew(true),
					className: "inline-flex items-center gap-1.5 rounded-xl gradient-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-card",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }), " New task"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-4 grid grid-cols-3 gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
						label: "Open",
						value: openCount
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
						label: "Due today or earlier",
						value: dueToday,
						tone: dueToday > 0 ? "danger" : void 0
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
						label: "Total",
						value: tasks.length
					})
				]
			}),
			overdue.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-4 rounded-2xl border border-border bg-card p-4 shadow-card",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-2 flex items-center gap-2 text-sm font-medium",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "h-4 w-4 text-primary" }), " Suggested follow-ups"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "space-y-2",
					children: overdue.map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex items-center justify-between rounded-xl bg-muted p-3 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "font-medium",
							children: [
								"Call ",
								i.party,
								" about ",
								i.number
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-xs text-muted-foreground",
							children: [
								inr(invoiceOutstanding(i)),
								" overdue since ",
								formatDate(i.dueDate)
							]
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => addTask({
								title: `Follow up on ${i.number} — ${i.party}`,
								dueDate: today,
								priority: "high",
								invoiceId: i.id
							}),
							className: "rounded-lg border border-border bg-card px-3 py-1.5 text-xs hover:bg-background",
							children: "+ Task"
						})]
					}, i.id))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mb-3 inline-flex rounded-xl border border-border bg-card p-1",
				children: [
					"open",
					"done",
					"all"
				].map((k) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: () => setFilter(k),
					className: "rounded-lg px-4 py-1.5 text-sm capitalize transition-colors " + (filter === k ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"),
					children: k
				}, k))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-2xl border border-border bg-card shadow-card",
				children: [list.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "p-10 text-center text-sm text-muted-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SquareCheckBig, { className: "mx-auto mb-2 h-6 w-6 opacity-50" }), "No tasks."]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "divide-y divide-border",
					children: list.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex items-center gap-3 px-4 py-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "checkbox",
								checked: t.done,
								onChange: () => toggle(t.id),
								className: "h-4 w-4 accent-primary"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0 flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-sm font-medium " + (t.done ? "line-through text-muted-foreground" : ""),
									children: t.title
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-xs text-muted-foreground",
									children: [
										"Due ",
										formatDate(t.dueDate),
										customerName(t.customerId) ? ` · ${customerName(t.customerId)}` : ""
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "rounded-full px-2 py-0.5 text-[10px] font-medium " + PRI_STYLE[t.priority],
								children: t.priority
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => deleteTask(t.id),
								className: "grid h-8 w-8 place-items-center rounded-lg border border-border text-destructive hover:bg-destructive/10",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3.5 w-3.5" })
							})
						]
					}, t.id))
				})]
			})
		]
	}), openNew && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NewTaskModal, { onClose: () => setOpenNew(false) })] });
}
function Kpi({ label, value, tone }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-2xl border border-border bg-card p-4 shadow-card",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-[11px] text-muted-foreground",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-1 text-2xl font-semibold " + (tone === "danger" ? "text-destructive" : ""),
			children: value
		})]
	});
}
function NewTaskModal({ onClose }) {
	const addTask = useTasks((s) => s.addTask);
	const customers = useCrm((s) => s.customers);
	const [f, setF] = (0, import_react.useState)({
		title: "",
		dueDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
		priority: "med",
		customerId: void 0,
		notes: ""
	});
	function submit(e) {
		e.preventDefault();
		addTask(f);
		onClose();
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Modal, {
		title: "New task",
		onClose,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			onSubmit: submit,
			className: "space-y-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Title",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						required: true,
						value: f.title,
						onChange: (e) => setF({
							...f,
							title: e.target.value
						}),
						className: inputCls
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-2 gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Due date",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "date",
							value: f.dueDate,
							onChange: (e) => setF({
								...f,
								dueDate: e.target.value
							}),
							className: inputCls
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Priority",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							value: f.priority,
							onChange: (e) => setF({
								...f,
								priority: e.target.value
							}),
							className: inputCls,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "low",
									children: "Low"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "med",
									children: "Medium"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "high",
									children: "High"
								})
							]
						})
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Link customer (optional)",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						value: f.customerId ?? "",
						onChange: (e) => setF({
							...f,
							customerId: e.target.value || void 0
						}),
						className: inputCls,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "",
							children: "—"
						}), customers.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: c.id,
							children: c.name
						}, c.id))]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex justify-end gap-2 pt-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: onClose,
						className: "rounded-xl border border-border px-4 py-2 text-sm",
						children: "Cancel"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: "rounded-xl gradient-primary px-4 py-2 text-sm font-medium text-primary-foreground",
						children: "Add task"
					})]
				})
			]
		})
	});
}
//#endregion
export { TasksPage as component };
