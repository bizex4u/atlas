import { create } from "zustand";
import { persist } from "zustand/middleware";

export type LeadStage = "new" | "contacted" | "qualified" | "won" | "lost";

export interface Customer {
  id: string;
  name: string;
  contact: string;
  phone?: string;
  email?: string;
  gstin?: string;
  address?: string;
  city?: string;
  state?: string;
  stage: LeadStage;
  source?: string;
  notes?: string;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  dueDate: string;
  done: boolean;
  priority: "low" | "med" | "high";
  customerId?: string;
  invoiceId?: string;
  siteId?: string;
  notes?: string;
  createdAt: string;
}

const seedCustomers: Customer[] = [
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
    createdAt: "2026-04-01",
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
    createdAt: "2026-05-20",
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
    createdAt: "2026-06-10",
  },
];

const seedTasks: Task[] = [
  {
    id: "t1",
    title: "Follow up on INV-2025-001 overdue",
    dueDate: new Date().toISOString().slice(0, 10),
    done: false,
    priority: "high",
    customerId: "c1",
    invoiceId: "i1",
    createdAt: "2026-06-25",
  },
  {
    id: "t2",
    title: "Send Awadh Motors proposal for Gomti Nagar Unipole",
    dueDate: new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10),
    done: false,
    priority: "med",
    customerId: "c2",
    createdAt: "2026-06-28",
  },
];

interface CrmState {
  customers: Customer[];
  addCustomer: (c: Omit<Customer, "id" | "createdAt">) => string;
  updateCustomer: (id: string, patch: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
}
export const useCrm = create<CrmState>()(
  persist(
    (set) => ({
      customers: seedCustomers,
      addCustomer: (c) => {
        const id = crypto.randomUUID();
        set((st) => ({
          customers: [...st.customers, { ...c, id, createdAt: new Date().toISOString().slice(0, 10) }],
        }));
        return id;
      },
      updateCustomer: (id, patch) =>
        set((st) => ({ customers: st.customers.map((c) => (c.id === id ? { ...c, ...patch } : c)) })),
      deleteCustomer: (id) => set((st) => ({ customers: st.customers.filter((c) => c.id !== id) })),
    }),
    { name: "atlas-crm" },
  ),
);

interface TasksState {
  tasks: Task[];
  addTask: (t: Omit<Task, "id" | "createdAt" | "done">) => void;
  toggle: (id: string) => void;
  updateTask: (id: string, patch: Partial<Task>) => void;
  deleteTask: (id: string) => void;
}
export const useTasks = create<TasksState>()(
  persist(
    (set) => ({
      tasks: seedTasks,
      addTask: (t) =>
        set((st) => ({
          tasks: [
            ...st.tasks,
            { ...t, id: crypto.randomUUID(), done: false, createdAt: new Date().toISOString().slice(0, 10) },
          ],
        })),
      toggle: (id) =>
        set((st) => ({ tasks: st.tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)) })),
      updateTask: (id, patch) =>
        set((st) => ({ tasks: st.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)) })),
      deleteTask: (id) => set((st) => ({ tasks: st.tasks.filter((t) => t.id !== id) })),
    }),
    { name: "atlas-tasks" },
  ),
);
