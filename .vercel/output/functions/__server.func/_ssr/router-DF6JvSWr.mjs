import { o as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react, t as QueryClientProvider } from "../_libs/react+tanstack__react-query.mjs";
import { $ as CloudOff, N as Lock, P as LoaderCircle, Q as Cloud } from "../_libs/lucide-react.mjs";
import { c as HeadContent, d as createRouter, f as Outlet, g as Link, h as createRootRouteWithContext, m as createFileRoute, p as lazyRouteComponent, s as Scripts, y as useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { c as getPassphrase, g as startSync, h as setPassphrase, m as pullAndHydrate, r as clearPassphrase } from "./sync-BlerjOYi.mjs";
import { t as QueryClient } from "../_libs/tanstack__query-core.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/router-DF6JvSWr.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var styles_default = "/assets/styles-UMxPFwHh.css";
function reportLovableError(error, context = {}) {
	if (typeof window === "undefined") return;
	window.__lovableEvents?.captureException?.(error, {
		source: "react_error_boundary",
		route: window.location.pathname,
		...context
	}, {
		mechanism: "react_error_boundary",
		handled: false,
		severity: "error"
	});
}
function AuthGate({ children }) {
	const [phase, setPhase] = (0, import_react.useState)("loading");
	const [pass, setPass] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		const stored = getPassphrase();
		if (!stored) {
			setPhase("locked");
			return;
		}
		(async () => {
			const res = await pullAndHydrate(stored);
			if (res.ok) {
				startSync();
				setPhase("unlocked");
			} else {
				clearPassphrase();
				setError(res.error || null);
				setPhase("locked");
			}
		})();
	}, []);
	async function unlock(e) {
		e.preventDefault();
		if (!pass.trim()) return;
		setBusy(true);
		setError(null);
		const res = await pullAndHydrate(pass.trim());
		setBusy(false);
		if (res.ok) {
			setPassphrase(pass.trim());
			startSync();
			setPhase("unlocked");
		} else setError(res.error || "Could not unlock");
	}
	function useOffline() {
		setPhase("unlocked");
	}
	if (phase === "loading") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-6 w-6 animate-spin text-muted-foreground" })
	});
	if (phase === "locked") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-full max-w-sm",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-6 text-center",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl gradient-primary text-primary-foreground",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "h-6 w-6" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "text-xl font-semibold",
							children: "Atlas"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-muted-foreground",
							children: "Enter passphrase to sync your workspace"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					onSubmit: unlock,
					className: "rounded-2xl border border-border bg-card p-5 shadow-card",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "password",
							autoFocus: true,
							value: pass,
							onChange: (e) => setPass(e.target.value),
							placeholder: "Workspace passphrase",
							className: "w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
						}),
						error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-xs text-destructive",
							children: error
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "submit",
							disabled: busy || !pass.trim(),
							className: "mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl gradient-primary px-4 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-60",
							children: [busy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cloud, { className: "h-4 w-4" }), busy ? "Unlocking…" : "Unlock & sync"]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					onClick: useOffline,
					className: "mt-3 flex w-full items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CloudOff, { className: "h-3.5 w-3.5" }), " Use offline on this device only"]
				})
			]
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children });
}
function NotFoundComponent() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-7xl font-bold text-foreground",
					children: "404"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-4 text-xl font-semibold text-foreground",
					children: "Page not found"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "The page you're looking for doesn't exist or has been moved."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Go home"
					})
				})
			]
		})
	});
}
function ErrorComponent({ error, reset }) {
	console.error(error);
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		reportLovableError(error, { boundary: "tanstack_root_error_component" });
	}, [error]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-xl font-semibold tracking-tight text-foreground",
					children: "This page didn't load"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "Something went wrong on our end. You can try refreshing or head back home."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 flex flex-wrap justify-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => {
							router.invalidate();
							reset();
						},
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Try again"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: "/",
						className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
						children: "Go home"
					})]
				})
			]
		})
	});
}
var Route$12 = createRootRouteWithContext()({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: "Atlas — OOH Business OS for BIZEX4U" },
			{
				name: "description",
				content: "Atlas by BIZEX4U — plan, sell, barter and bill Out-of-Home advertising sites across India from one clean dashboard."
			},
			{
				name: "author",
				content: "BIZEX4U"
			},
			{
				property: "og:title",
				content: "Atlas — OOH Business OS"
			},
			{
				property: "og:description",
				content: "OOH media inventory, barter and GST-ready billing for BIZEX4U."
			},
			{
				property: "og:type",
				content: "website"
			},
			{
				name: "twitter:card",
				content: "summary_large_image"
			},
			{
				name: "theme-color",
				content: "#7c3aed"
			},
			{
				name: "apple-mobile-web-app-capable",
				content: "yes"
			},
			{
				name: "apple-mobile-web-app-status-bar-style",
				content: "default"
			},
			{
				name: "apple-mobile-web-app-title",
				content: "Atlas"
			}
		],
		links: [
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "icon",
				href: "/icon.svg",
				type: "image/svg+xml"
			},
			{
				rel: "manifest",
				href: "/manifest.webmanifest"
			},
			{
				rel: "apple-touch-icon",
				href: "/apple-touch-icon.png"
			}
		]
	}),
	shellComponent: RootShell,
	component: RootComponent,
	notFoundComponent: NotFoundComponent,
	errorComponent: ErrorComponent
});
function RootShell({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "en",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})] })]
	});
}
function RootComponent() {
	const { queryClient } = Route$12.useRouteContext();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QueryClientProvider, {
		client: queryClient,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthGate, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}) })
	});
}
var $$splitComponentImporter$11 = () => import("./warehouse-DWV848Nf.mjs");
var Route$11 = createFileRoute("/warehouse")({
	head: () => ({ meta: [{ title: "Warehouse — Atlas" }] }),
	component: lazyRouteComponent($$splitComponentImporter$11, "component")
});
/** Average monthly outflow over the item's movement history (absolute units/month). */
var $$splitComponentImporter$10 = () => import("./tasks-CcW8uaEF.mjs");
var Route$10 = createFileRoute("/tasks")({
	head: () => ({ meta: [{ title: "Tasks — Atlas" }, {
		name: "description",
		content: "Follow-ups, reminders and productivity."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$10, "component")
});
var $$splitComponentImporter$9 = () => import("./settings-C22tTxTo.mjs");
var Route$9 = createFileRoute("/settings")({
	head: () => ({ meta: [{ title: "Settings — Atlas" }, {
		name: "description",
		content: "Company, integrations and sync settings for BIZEX4U."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$9, "component")
});
var $$splitComponentImporter$8 = () => import("./research-nhramHaR.mjs");
var Route$8 = createFileRoute("/research")({
	head: () => ({ meta: [{ title: "Brand Intelligence — Atlas" }] }),
	component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
var $$splitComponentImporter$7 = () => import("./map-CACGLUJ9.mjs");
var Route$7 = createFileRoute("/map")({
	head: () => ({ meta: [{ title: "Site Map — Atlas" }, {
		name: "description",
		content: "Live map + Google Places intelligence for Atlas OOH."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
var $$splitComponentImporter$6 = () => import("./intel-CEMJBa7E.mjs");
var Route$6 = createFileRoute("/intel")({
	head: () => ({ meta: [{ title: "Market Intel — Atlas" }] }),
	component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
var $$splitComponentImporter$5 = () => import("./india-XNIxcSFC.mjs");
var Route$5 = createFileRoute("/india")({
	head: () => ({ meta: [{ title: "India Coverage — Atlas" }] }),
	component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
var $$splitComponentImporter$4 = () => import("./customers-btr9VRIM.mjs");
var Route$4 = createFileRoute("/customers")({
	head: () => ({ meta: [{ title: "Agencies — Atlas" }, {
		name: "description",
		content: "Advertising agency pipeline — Dentsu, WPP, GroupM, Publicis and more."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
var $$splitComponentImporter$3 = () => import("./brands-BmRuYcZ2.mjs");
var Route$3 = createFileRoute("/brands")({
	head: () => ({ meta: [{ title: "Brand Pipeline — Atlas" }] }),
	component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
var $$splitComponentImporter$2 = () => import("./ai-CR0AjSGO.mjs");
var Route$2 = createFileRoute("/ai")({
	head: () => ({ meta: [{ title: "AI Assistant — Atlas" }, {
		name: "description",
		content: "Ask Atlas AI anything about your OOH business."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
var $$splitComponentImporter$1 = () => import("./routes-jzMRQP1y.mjs");
var Route$1 = createFileRoute("/")({
	head: () => ({ meta: [{ title: "Atlas — AI Growth Engine for BIZEX4U" }, {
		name: "description",
		content: "Atlas surfaces the barter opportunities BIZEX4U should chase today — scored, explained, pitch-ready."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
var $$splitComponentImporter = () => import("./customers._id-DKEMxQo5.mjs");
var Route = createFileRoute("/customers/$id")({
	head: () => ({ meta: [{ title: "Agency — Atlas" }] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
var WarehouseRoute = Route$11.update({
	id: "/warehouse",
	path: "/warehouse",
	getParentRoute: () => Route$12
});
var TasksRoute = Route$10.update({
	id: "/tasks",
	path: "/tasks",
	getParentRoute: () => Route$12
});
var SettingsRoute = Route$9.update({
	id: "/settings",
	path: "/settings",
	getParentRoute: () => Route$12
});
var ResearchRoute = Route$8.update({
	id: "/research",
	path: "/research",
	getParentRoute: () => Route$12
});
var MapRoute = Route$7.update({
	id: "/map",
	path: "/map",
	getParentRoute: () => Route$12
});
var IntelRoute = Route$6.update({
	id: "/intel",
	path: "/intel",
	getParentRoute: () => Route$12
});
var IndiaRoute = Route$5.update({
	id: "/india",
	path: "/india",
	getParentRoute: () => Route$12
});
var CustomersRoute = Route$4.update({
	id: "/customers",
	path: "/customers",
	getParentRoute: () => Route$12
});
var BrandsRoute = Route$3.update({
	id: "/brands",
	path: "/brands",
	getParentRoute: () => Route$12
});
var AiRoute = Route$2.update({
	id: "/ai",
	path: "/ai",
	getParentRoute: () => Route$12
});
var IndexRoute = Route$1.update({
	id: "/",
	path: "/",
	getParentRoute: () => Route$12
});
var CustomersRouteChildren = { CustomersIdRoute: Route.update({
	id: "/$id",
	path: "/$id",
	getParentRoute: () => CustomersRoute
}) };
var rootRouteChildren = {
	IndexRoute,
	AiRoute,
	BrandsRoute,
	CustomersRoute: CustomersRoute._addFileChildren(CustomersRouteChildren),
	IndiaRoute,
	IntelRoute,
	MapRoute,
	ResearchRoute,
	SettingsRoute,
	TasksRoute,
	WarehouseRoute
};
var routeTree = Route$12._addFileChildren(rootRouteChildren)._addFileTypes();
var getRouter = () => {
	return createRouter({
		routeTree,
		context: { queryClient: new QueryClient() },
		scrollRestoration: true,
		defaultPreloadStaleTime: 0
	});
};
//#endregion
export { getRouter };
