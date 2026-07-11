import { Link, useRouterState } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import {
  LayoutDashboard,
  Map as MapIcon,
  Settings as SettingsIcon,
  Bot,
  Search,
  Bell,
  Home,
  Users,
  CheckSquare,
  Tag,
  Radar,
  Warehouse,
  Microscope,
  Globe2,
  Contact,
} from "lucide-react";
import { useTasks } from "@/lib/crm";
import { GlobalSearch, useGlobalSearchHotkey } from "./GlobalSearch";
import { SyncBadge } from "./SyncBadge";
import { Toaster } from "./Toaster";

interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  badgeVariant?: "muted" | "danger";
}

export function AppShell({ children }: { children: ReactNode }) {
  const tasks = useTasks((s) => s.tasks);
  const openTasks = tasks.filter((t) => !t.done).length;
  const [searchOpen, setSearchOpen] = useState(false);
  useGlobalSearchHotkey(setSearchOpen);

  // Six pillars a Bizex4u user thinks in — everything else is contextual (Sprint 1: Identity).
  // Retired from the sidebar (still reachable by URL / ⌘K search until folded in):
  // Market Intelligence → merges into Research; AI Assistant, Tasks, Agencies, Area Map,
  // Warehouse → become contextual panels inside Dashboard/CRM/Coverage.
  const primary: NavItem[] = [
    { to: "/", label: "Dashboard", icon: LayoutDashboard },
    { to: "/research", label: "Research", icon: Microscope },
    { to: "/india", label: "Coverage", icon: Globe2 },
    { to: "/brands", label: "Campaigns", icon: Tag },
    { to: "/crm", label: "CRM", icon: Contact },
  ];
  const workspace: NavItem[] = [
    { to: "/map", label: "Area Map", icon: MapIcon },
  ];
  const settings: NavItem[] = [{ to: "/settings", label: "Settings", icon: SettingsIcon }];

  const mobileTabs = [
    { to: "/", label: "Home", icon: Home },
    { to: "/research", label: "Research", icon: Microscope },
    { to: "/india", label: "Coverage", icon: Globe2 },
    { to: "/brands", label: "Campaigns", icon: Tag },
    { to: "/crm", label: "CRM", icon: Contact },
  ];

  return (
    <div className="min-h-screen w-full bg-background text-foreground">
      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
      {/* Sidebar (desktop) */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[220px] flex-col border-r border-border bg-card px-3 py-5 md:flex">

        <Link to="/" className="mb-6 flex items-center gap-2 px-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl gradient-primary text-primary-foreground font-bold">
            A
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold">Atlas</div>
            <div className="text-[11px] text-muted-foreground">BIZEX4U</div>
          </div>
        </Link>

        <NavGroup label="" items={primary} />
        <NavGroup label="Workspace" items={workspace} />
        <NavGroup label="Settings" items={settings} />
      </aside>

      {/* Header (desktop) */}
      <header className="fixed inset-x-0 top-0 z-30 hidden h-14 items-center gap-3 border-b border-border bg-card px-4 md:flex md:pl-[236px]">
        <button
          onClick={() => setSearchOpen(true)}
          className="group relative flex h-9 w-full max-w-md items-center gap-2 rounded-xl border border-border bg-background pl-9 pr-2 text-left text-sm text-muted-foreground hover:border-primary/40"
        >
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
          <span className="flex-1 truncate">Search deals, agencies, tasks…</span>
          <kbd className="rounded-md border border-border bg-muted px-1.5 py-0.5 text-[10px]">⌘K</kbd>
        </button>

        <div className="ml-auto flex items-center gap-3">
          <SyncBadge />
          <button className="relative grid h-9 w-9 place-items-center rounded-xl border border-border bg-background hover:bg-muted">
            <Bell className="h-4 w-4" />
            {openTasks > 0 && (
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive" />
            )}
          </button>
          <div className="flex items-center gap-2 pl-2">
            <div className="grid h-8 w-8 place-items-center rounded-full gradient-primary text-primary-foreground text-sm font-semibold">
              Y
            </div>
            <div className="hidden text-right lg:block">
              <div className="text-sm font-medium leading-tight">Yash</div>
              <div className="text-[11px] text-muted-foreground leading-tight">BIZEX4U</div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile header */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-card px-4 md:hidden">
        <Link to="/" className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-lg gradient-primary text-primary-foreground font-bold text-sm">
            A
          </div>
          <div className="text-sm font-semibold">Atlas</div>
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSearchOpen(true)}
            className="grid h-9 w-9 place-items-center rounded-xl border border-border bg-background"
            aria-label="Search"
          >
            <Search className="h-4 w-4" />
          </button>
          <button className="relative grid h-9 w-9 place-items-center rounded-xl border border-border bg-background">
            <Bell className="h-4 w-4" />
            {openTasks > 0 && (
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive" />
            )}
          </button>
          <div className="grid h-8 w-8 place-items-center rounded-full gradient-primary text-primary-foreground text-sm font-semibold">
            Y
          </div>
        </div>
      </header>

      <main className="md:pl-[220px] md:pt-14">
        <div className="min-h-[calc(100vh-3.5rem)] pb-20 md:pb-6">{children}</div>
      </main>

      <Toaster />

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex h-16 items-center justify-around border-t border-border bg-card md:hidden">
        {mobileTabs.map((t) => (
          <MobileTab key={t.to} to={t.to} label={t.label} Icon={t.icon} />
        ))}
      </nav>
    </div>
  );
}

function NavGroup({ label, items }: { label: string; items: NavItem[] }) {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  if (!items.length) return null;
  return (
    <div className="mb-4">
      {label && (
        <div className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </div>
      )}
      <div className="flex flex-col gap-0.5">
        {items.map((item) => {
          const active =
            item.to === "/" ? pathname === "/" : pathname === item.to || pathname.startsWith(item.to + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={
                "flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition-colors " +
                (active
                  ? "bg-accent text-accent-foreground font-medium"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground")
              }
            >
              <Icon className="h-4 w-4" />
              <span className="flex-1">{item.label}</span>
              {item.badge != null && (
                <span
                  className={
                    "min-w-5 rounded-full px-1.5 text-center text-[10px] font-medium leading-5 " +
                    (item.badgeVariant === "danger"
                      ? "bg-destructive text-destructive-foreground"
                      : "bg-muted text-muted-foreground")
                  }
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function MobileTab({
  to,
  label,
  Icon,
}: {
  to: string;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
}) {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const active = to === "/" ? pathname === "/" : pathname === to || pathname.startsWith(to + "/");
  return (
    <Link
      to={to}
      className={
        "flex flex-1 flex-col items-center justify-center gap-1 text-[10px] " +
        (active ? "text-primary font-medium" : "text-muted-foreground")
      }
    >
      <Icon className="h-5 w-5" />
      {label}
    </Link>
  );
}
