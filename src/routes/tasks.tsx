import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { useTasks, useCrm, type Task } from "@/lib/crm";
import { useAccounts, invoiceOutstanding } from "@/lib/stores";
import { formatDate, inr } from "@/lib/format";
import { Plus, Trash2, Bell, CheckSquare } from "lucide-react";
import { Modal, Field, inputCls } from "@/components/ui";

export const Route = createFileRoute("/tasks")({
  head: () => ({
    meta: [
      { title: "Tasks — Atlas" },
      { name: "description", content: "Follow-ups, reminders and productivity." },
    ],
  }),
  component: TasksPage,
});

const PRI_STYLE = {
  low: "bg-muted text-muted-foreground",
  med: "bg-primary/10 text-primary",
  high: "bg-destructive/10 text-destructive",
} as const;

function TasksPage() {
  const { tasks, toggle, deleteTask, addTask } = useTasks();
  const invoices = useAccounts((s) => s.invoices);
  const customers = useCrm((s) => s.customers);
  const [openNew, setOpenNew] = useState(false);
  const [filter, setFilter] = useState<"open" | "done" | "all">("open");

  // Auto reminders — surface overdue invoices as suggested tasks
  const overdue = invoices.filter((i) => i.status === "Overdue");

  const list = useMemo(() => {
    const l = tasks
      .filter((t) => (filter === "all" ? true : filter === "open" ? !t.done : t.done))
      .sort((a, b) => (a.done === b.done ? (a.dueDate < b.dueDate ? -1 : 1) : a.done ? 1 : -1));
    return l;
  }, [tasks, filter]);

  const today = new Date().toISOString().slice(0, 10);
  const dueToday = tasks.filter((t) => !t.done && t.dueDate <= today).length;
  const openCount = tasks.filter((t) => !t.done).length;

  function customerName(id?: string) {
    return customers.find((c) => c.id === id)?.name;
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-[1200px] p-4 md:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">Tasks</h1>
            <p className="text-sm text-muted-foreground">Follow-ups, reminders &amp; productivity</p>
          </div>
          <button
            onClick={() => setOpenNew(true)}
            className="inline-flex items-center gap-1.5 rounded-xl gradient-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-card"
          >
            <Plus className="h-4 w-4" /> New task
          </button>
        </div>

        <div className="mb-4 grid grid-cols-3 gap-3">
          <Kpi label="Open" value={openCount} />
          <Kpi label="Due today or earlier" value={dueToday} tone={dueToday > 0 ? "danger" : undefined} />
          <Kpi label="Total" value={tasks.length} />
        </div>

        {overdue.length > 0 && (
          <div className="mb-4 rounded-2xl border border-border bg-card p-4 shadow-card">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium">
              <Bell className="h-4 w-4 text-primary" /> Suggested follow-ups
            </div>
            <ul className="space-y-2">
              {overdue.map((i) => (
                <li key={i.id} className="flex items-center justify-between rounded-xl bg-muted p-3 text-sm">
                  <div>
                    <div className="font-medium">Call {i.party} about {i.number}</div>
                    <div className="text-xs text-muted-foreground">
                      {inr(invoiceOutstanding(i))} overdue since {formatDate(i.dueDate)}
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      addTask({
                        title: `Follow up on ${i.number} — ${i.party}`,
                        dueDate: today,
                        priority: "high",
                        invoiceId: i.id,
                      })
                    }
                    className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs hover:bg-background"
                  >
                    + Task
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mb-3 inline-flex rounded-xl border border-border bg-card p-1">
          {(["open", "done", "all"] as const).map((k) => (
            <button
              key={k}
              onClick={() => setFilter(k)}
              className={
                "rounded-lg px-4 py-1.5 text-sm capitalize transition-colors " +
                (filter === k ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")
              }
            >
              {k}
            </button>
          ))}
        </div>

        <div className="rounded-2xl border border-border bg-card shadow-card">
          {list.length === 0 && (
            <div className="p-10 text-center text-sm text-muted-foreground">
              <CheckSquare className="mx-auto mb-2 h-6 w-6 opacity-50" />
              No tasks.
            </div>
          )}
          <ul className="divide-y divide-border">
            {list.map((t) => (
              <li key={t.id} className="flex items-center gap-3 px-4 py-3">
                <input
                  type="checkbox"
                  checked={t.done}
                  onChange={() => toggle(t.id)}
                  className="h-4 w-4 accent-primary"
                />
                <div className="min-w-0 flex-1">
                  <div className={"text-sm font-medium " + (t.done ? "line-through text-muted-foreground" : "")}>
                    {t.title}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Due {formatDate(t.dueDate)}
                    {customerName(t.customerId) ? ` · ${customerName(t.customerId)}` : ""}
                  </div>
                </div>
                <span className={"rounded-full px-2 py-0.5 text-[10px] font-medium " + PRI_STYLE[t.priority]}>
                  {t.priority}
                </span>
                <button
                  onClick={() => deleteTask(t.id)}
                  className="grid h-8 w-8 place-items-center rounded-lg border border-border text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
      {openNew && <NewTaskModal onClose={() => setOpenNew(false)} />}
    </AppShell>
  );
}

function Kpi({ label, value, tone }: { label: string; value: number | string; tone?: "danger" }) {
  const c = tone === "danger" ? "text-destructive" : "";
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
      <div className="text-[11px] text-muted-foreground">{label}</div>
      <div className={"mt-1 text-2xl font-semibold " + c}>{value}</div>
    </div>
  );
}

function NewTaskModal({ onClose }: { onClose: () => void }) {
  const addTask = useTasks((s) => s.addTask);
  const customers = useCrm((s) => s.customers);
  const [f, setF] = useState<Omit<Task, "id" | "done" | "createdAt">>({
    title: "",
    dueDate: new Date().toISOString().slice(0, 10),
    priority: "med",
    customerId: undefined,
    notes: "",
  });
  function submit(e: React.FormEvent) {
    e.preventDefault();
    addTask(f);
    onClose();
  }
  return (
    <Modal title="New task" onClose={onClose}>
      <form onSubmit={submit} className="space-y-3">
        <Field label="Title">
          <input required value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} className={inputCls} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Due date">
            <input type="date" value={f.dueDate} onChange={(e) => setF({ ...f, dueDate: e.target.value })} className={inputCls} />
          </Field>
          <Field label="Priority">
            <select value={f.priority} onChange={(e) => setF({ ...f, priority: e.target.value as any })} className={inputCls}>
              <option value="low">Low</option>
              <option value="med">Medium</option>
              <option value="high">High</option>
            </select>
          </Field>
        </div>
        <Field label="Link customer (optional)">
          <select
            value={f.customerId ?? ""}
            onChange={(e) => setF({ ...f, customerId: e.target.value || undefined })}
            className={inputCls}
          >
            <option value="">—</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="rounded-xl border border-border px-4 py-2 text-sm">
            Cancel
          </button>
          <button className="rounded-xl gradient-primary px-4 py-2 text-sm font-medium text-primary-foreground">
            Add task
          </button>
        </div>
      </form>
    </Modal>
  );
}
