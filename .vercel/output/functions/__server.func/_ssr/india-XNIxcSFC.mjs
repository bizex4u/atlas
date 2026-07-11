import { o as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { J as Earth, P as LoaderCircle, _ as Sparkles, j as MapPin, t as Zap } from "../_libs/lucide-react.mjs";
import { r as toast } from "./Toaster-UBdYQFLf.mjs";
import { a as cityFitRank, d as useServerFn, i as checkServiceability } from "./ai.functions-KpadgdAQ.mjs";
import { t as AppShell } from "./AppShell-Dr6oCPq7.mjs";
import { r as inputCls } from "./ui-DZC8LrNE.mjs";
import "./router-DF6JvSWr.mjs";
import { t as require_maplibre_gl } from "../_libs/maplibre-gl.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/india-XNIxcSFC.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var import_maplibre_gl = /* @__PURE__ */ __toESM(require_maplibre_gl());
var INDIA_CITIES = [
	{
		name: "Mumbai",
		state: "MH",
		lat: 19.076,
		lng: 72.8777,
		tier: 1
	},
	{
		name: "Delhi",
		state: "DL",
		lat: 28.7041,
		lng: 77.1025,
		tier: 1
	},
	{
		name: "Bengaluru",
		state: "KA",
		lat: 12.9716,
		lng: 77.5946,
		tier: 1
	},
	{
		name: "Hyderabad",
		state: "TG",
		lat: 17.385,
		lng: 78.4867,
		tier: 1
	},
	{
		name: "Chennai",
		state: "TN",
		lat: 13.0827,
		lng: 80.2707,
		tier: 1
	},
	{
		name: "Kolkata",
		state: "WB",
		lat: 22.5726,
		lng: 88.3639,
		tier: 1
	},
	{
		name: "Pune",
		state: "MH",
		lat: 18.5204,
		lng: 73.8567,
		tier: 1
	},
	{
		name: "Ahmedabad",
		state: "GJ",
		lat: 23.0225,
		lng: 72.5714,
		tier: 1
	},
	{
		name: "Jaipur",
		state: "RJ",
		lat: 26.9124,
		lng: 75.7873,
		tier: 2
	},
	{
		name: "Surat",
		state: "GJ",
		lat: 21.1702,
		lng: 72.8311,
		tier: 2
	},
	{
		name: "Lucknow",
		state: "UP",
		lat: 26.8467,
		lng: 80.9462,
		tier: 2
	},
	{
		name: "Kanpur",
		state: "UP",
		lat: 26.4499,
		lng: 80.3319,
		tier: 2
	},
	{
		name: "Nagpur",
		state: "MH",
		lat: 21.1458,
		lng: 79.0882,
		tier: 2
	},
	{
		name: "Indore",
		state: "MP",
		lat: 22.7196,
		lng: 75.8577,
		tier: 2
	},
	{
		name: "Thane",
		state: "MH",
		lat: 19.2183,
		lng: 72.9781,
		tier: 2
	},
	{
		name: "Bhopal",
		state: "MP",
		lat: 23.2599,
		lng: 77.4126,
		tier: 2
	},
	{
		name: "Visakhapatnam",
		state: "AP",
		lat: 17.6868,
		lng: 83.2185,
		tier: 2
	},
	{
		name: "Patna",
		state: "BR",
		lat: 25.5941,
		lng: 85.1376,
		tier: 2
	},
	{
		name: "Vadodara",
		state: "GJ",
		lat: 22.3072,
		lng: 73.1812,
		tier: 2
	},
	{
		name: "Ghaziabad",
		state: "UP",
		lat: 28.6692,
		lng: 77.4538,
		tier: 2
	},
	{
		name: "Ludhiana",
		state: "PB",
		lat: 30.901,
		lng: 75.8573,
		tier: 2
	},
	{
		name: "Agra",
		state: "UP",
		lat: 27.1767,
		lng: 78.0081,
		tier: 2
	},
	{
		name: "Nashik",
		state: "MH",
		lat: 19.9975,
		lng: 73.7898,
		tier: 2
	},
	{
		name: "Faridabad",
		state: "HR",
		lat: 28.4089,
		lng: 77.3178,
		tier: 2
	},
	{
		name: "Meerut",
		state: "UP",
		lat: 28.9845,
		lng: 77.7064,
		tier: 2
	},
	{
		name: "Rajkot",
		state: "GJ",
		lat: 22.3039,
		lng: 70.8022,
		tier: 2
	},
	{
		name: "Varanasi",
		state: "UP",
		lat: 25.3176,
		lng: 82.9739,
		tier: 2
	},
	{
		name: "Srinagar",
		state: "JK",
		lat: 34.0837,
		lng: 74.7973,
		tier: 2
	},
	{
		name: "Aurangabad",
		state: "MH",
		lat: 19.8762,
		lng: 75.3433,
		tier: 2
	},
	{
		name: "Dhanbad",
		state: "JH",
		lat: 23.7957,
		lng: 86.4304,
		tier: 3
	},
	{
		name: "Amritsar",
		state: "PB",
		lat: 31.634,
		lng: 74.8723,
		tier: 2
	},
	{
		name: "Navi Mumbai",
		state: "MH",
		lat: 19.033,
		lng: 73.0297,
		tier: 2
	},
	{
		name: "Prayagraj",
		state: "UP",
		lat: 25.4358,
		lng: 81.8463,
		tier: 2
	},
	{
		name: "Ranchi",
		state: "JH",
		lat: 23.3441,
		lng: 85.3096,
		tier: 2
	},
	{
		name: "Howrah",
		state: "WB",
		lat: 22.5958,
		lng: 88.2636,
		tier: 3
	},
	{
		name: "Coimbatore",
		state: "TN",
		lat: 11.0168,
		lng: 76.9558,
		tier: 2
	},
	{
		name: "Jabalpur",
		state: "MP",
		lat: 23.1815,
		lng: 79.9864,
		tier: 3
	},
	{
		name: "Gwalior",
		state: "MP",
		lat: 26.2183,
		lng: 78.1828,
		tier: 3
	},
	{
		name: "Vijayawada",
		state: "AP",
		lat: 16.5062,
		lng: 80.648,
		tier: 2
	},
	{
		name: "Jodhpur",
		state: "RJ",
		lat: 26.2389,
		lng: 73.0243,
		tier: 3
	},
	{
		name: "Madurai",
		state: "TN",
		lat: 9.9252,
		lng: 78.1198,
		tier: 2
	},
	{
		name: "Raipur",
		state: "CG",
		lat: 21.2514,
		lng: 81.6296,
		tier: 2
	},
	{
		name: "Kota",
		state: "RJ",
		lat: 25.2138,
		lng: 75.8648,
		tier: 3
	},
	{
		name: "Chandigarh",
		state: "CH",
		lat: 30.7333,
		lng: 76.7794,
		tier: 2
	},
	{
		name: "Guwahati",
		state: "AS",
		lat: 26.1445,
		lng: 91.7362,
		tier: 2
	},
	{
		name: "Solapur",
		state: "MH",
		lat: 17.6599,
		lng: 75.9064,
		tier: 3
	},
	{
		name: "Hubli-Dharwad",
		state: "KA",
		lat: 15.3647,
		lng: 75.124,
		tier: 3
	},
	{
		name: "Mysuru",
		state: "KA",
		lat: 12.2958,
		lng: 76.6394,
		tier: 2
	},
	{
		name: "Tiruchirappalli",
		state: "TN",
		lat: 10.7905,
		lng: 78.7047,
		tier: 3
	},
	{
		name: "Bareilly",
		state: "UP",
		lat: 28.367,
		lng: 79.4304,
		tier: 3
	},
	{
		name: "Aligarh",
		state: "UP",
		lat: 27.8974,
		lng: 78.088,
		tier: 3
	},
	{
		name: "Tiruppur",
		state: "TN",
		lat: 11.1085,
		lng: 77.3411,
		tier: 3
	},
	{
		name: "Moradabad",
		state: "UP",
		lat: 28.8386,
		lng: 78.7733,
		tier: 3
	},
	{
		name: "Jalandhar",
		state: "PB",
		lat: 31.326,
		lng: 75.5762,
		tier: 3
	},
	{
		name: "Bhubaneswar",
		state: "OD",
		lat: 20.2961,
		lng: 85.8245,
		tier: 2
	},
	{
		name: "Salem",
		state: "TN",
		lat: 11.6643,
		lng: 78.146,
		tier: 3
	},
	{
		name: "Warangal",
		state: "TG",
		lat: 17.9689,
		lng: 79.5941,
		tier: 3
	},
	{
		name: "Guntur",
		state: "AP",
		lat: 16.3067,
		lng: 80.4365,
		tier: 3
	},
	{
		name: "Bhiwandi",
		state: "MH",
		lat: 19.3009,
		lng: 73.0483,
		tier: 3
	},
	{
		name: "Saharanpur",
		state: "UP",
		lat: 29.968,
		lng: 77.5552,
		tier: 3
	},
	{
		name: "Gorakhpur",
		state: "UP",
		lat: 26.7606,
		lng: 83.3732,
		tier: 3
	},
	{
		name: "Bikaner",
		state: "RJ",
		lat: 28.0229,
		lng: 73.3119,
		tier: 3
	},
	{
		name: "Amravati",
		state: "MH",
		lat: 20.9374,
		lng: 77.7796,
		tier: 3
	},
	{
		name: "Noida",
		state: "UP",
		lat: 28.5355,
		lng: 77.391,
		tier: 2
	},
	{
		name: "Jamshedpur",
		state: "JH",
		lat: 22.8046,
		lng: 86.2029,
		tier: 3
	},
	{
		name: "Bhilai",
		state: "CG",
		lat: 21.1938,
		lng: 81.3509,
		tier: 3
	},
	{
		name: "Cuttack",
		state: "OD",
		lat: 20.4625,
		lng: 85.8828,
		tier: 3
	},
	{
		name: "Firozabad",
		state: "UP",
		lat: 27.1592,
		lng: 78.3957,
		tier: 3
	},
	{
		name: "Kochi",
		state: "KL",
		lat: 9.9312,
		lng: 76.2673,
		tier: 2
	},
	{
		name: "Nellore",
		state: "AP",
		lat: 14.4426,
		lng: 79.9865,
		tier: 3
	},
	{
		name: "Bhavnagar",
		state: "GJ",
		lat: 21.7645,
		lng: 72.1519,
		tier: 3
	},
	{
		name: "Dehradun",
		state: "UK",
		lat: 30.3165,
		lng: 78.0322,
		tier: 2
	},
	{
		name: "Durgapur",
		state: "WB",
		lat: 23.5204,
		lng: 87.3119,
		tier: 3
	},
	{
		name: "Asansol",
		state: "WB",
		lat: 23.6739,
		lng: 86.9524,
		tier: 3
	},
	{
		name: "Rourkela",
		state: "OD",
		lat: 22.2604,
		lng: 84.8536,
		tier: 3
	},
	{
		name: "Nanded",
		state: "MH",
		lat: 19.1383,
		lng: 77.321,
		tier: 3
	},
	{
		name: "Kolhapur",
		state: "MH",
		lat: 16.705,
		lng: 74.2433,
		tier: 3
	},
	{
		name: "Ajmer",
		state: "RJ",
		lat: 26.4499,
		lng: 74.6399,
		tier: 3
	},
	{
		name: "Akola",
		state: "MH",
		lat: 20.7002,
		lng: 77.0082,
		tier: 3
	},
	{
		name: "Gulbarga",
		state: "KA",
		lat: 17.3297,
		lng: 76.8343,
		tier: 3
	},
	{
		name: "Jamnagar",
		state: "GJ",
		lat: 22.4707,
		lng: 70.0577,
		tier: 3
	},
	{
		name: "Ujjain",
		state: "MP",
		lat: 23.1765,
		lng: 75.7885,
		tier: 3
	},
	{
		name: "Loni",
		state: "UP",
		lat: 28.7333,
		lng: 77.2833,
		tier: 3
	},
	{
		name: "Siliguri",
		state: "WB",
		lat: 26.7271,
		lng: 88.3953,
		tier: 3
	},
	{
		name: "Jhansi",
		state: "UP",
		lat: 25.4484,
		lng: 78.5685,
		tier: 3
	},
	{
		name: "Ulhasnagar",
		state: "MH",
		lat: 19.2215,
		lng: 73.1645,
		tier: 3
	},
	{
		name: "Jammu",
		state: "JK",
		lat: 32.7266,
		lng: 74.857,
		tier: 3
	},
	{
		name: "Sangli",
		state: "MH",
		lat: 16.8524,
		lng: 74.5815,
		tier: 3
	},
	{
		name: "Mangaluru",
		state: "KA",
		lat: 12.9141,
		lng: 74.856,
		tier: 3
	},
	{
		name: "Erode",
		state: "TN",
		lat: 11.341,
		lng: 77.7172,
		tier: 3
	},
	{
		name: "Belagavi",
		state: "KA",
		lat: 15.8497,
		lng: 74.4977,
		tier: 3
	},
	{
		name: "Ambattur",
		state: "TN",
		lat: 13.1143,
		lng: 80.1548,
		tier: 3
	},
	{
		name: "Tirunelveli",
		state: "TN",
		lat: 8.7139,
		lng: 77.7567,
		tier: 3
	},
	{
		name: "Malegaon",
		state: "MH",
		lat: 20.5579,
		lng: 74.5287,
		tier: 3
	},
	{
		name: "Gaya",
		state: "BR",
		lat: 24.7914,
		lng: 85.0002,
		tier: 3
	},
	{
		name: "Udaipur",
		state: "RJ",
		lat: 24.5854,
		lng: 73.7125,
		tier: 3
	},
	{
		name: "Thiruvananthapuram",
		state: "KL",
		lat: 8.5241,
		lng: 76.9366,
		tier: 2
	},
	{
		name: "Gurugram",
		state: "HR",
		lat: 28.4595,
		lng: 77.0266,
		tier: 1
	}
];
var CACHE_KEY = "atlas-india-coverage";
function loadCoverage() {
	try {
		const raw = localStorage.getItem(CACHE_KEY);
		if (!raw) return null;
		const parsed = JSON.parse(raw);
		if ((Date.now() - Date.parse(parsed.date)) / 864e5 > 7) return null;
		return parsed;
	} catch {
		return null;
	}
}
var DOT = {
	serviceable: "#16a34a",
	not_serviceable: "#dc2626",
	unknown: "#94a3b8"
};
function IndiaPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IndiaContent, {}) });
}
function IndiaContent() {
	const probe = useServerFn(checkServiceability);
	const rank = useServerFn(cityFitRank);
	const [statuses, setStatuses] = (0, import_react.useState)(() => loadCoverage()?.statuses ?? {});
	const [probing, setProbing] = (0, import_react.useState)(false);
	const [progress, setProgress] = (0, import_react.useState)(0);
	const [brand, setBrand] = (0, import_react.useState)("");
	const [ranking, setRanking] = (0, import_react.useState)(false);
	const [fits, setFits] = (0, import_react.useState)(null);
	const [selected, setSelected] = (0, import_react.useState)(null);
	const probed = Object.keys(statuses).length;
	const green = Object.values(statuses).filter((s) => s === "serviceable").length;
	async function probeAll() {
		setProbing(true);
		setProgress(0);
		const acc = {};
		try {
			for (let i = 0; i < INDIA_CITIES.length; i += 10) {
				const batch = INDIA_CITIES.slice(i, i + 10);
				const res = await probe({ data: { points: batch.map((c) => ({
					pincode: c.name,
					lat: c.lat,
					lng: c.lng
				})) } });
				for (const r of res.results) acc[r.pincode] = r.swiggy;
				setStatuses({ ...acc });
				setProgress(Math.min(100, Math.round((i + 10) / INDIA_CITIES.length * 100)));
			}
			localStorage.setItem(CACHE_KEY, JSON.stringify({
				date: (/* @__PURE__ */ new Date()).toISOString(),
				statuses: acc
			}));
			toast.success("India coverage updated", `${Object.values(acc).filter((s) => s === "serviceable").length} of ${INDIA_CITIES.length} cities serviceable`);
		} finally {
			setProbing(false);
		}
	}
	async function rankForBrand() {
		if (!brand.trim()) return;
		setRanking(true);
		setFits(null);
		try {
			const serviceable = INDIA_CITIES.filter((c) => statuses[c.name] === "serviceable" || probed === 0).map((c) => `${c.name} (${c.state}, tier ${c.tier})`);
			const res = await rank({ data: {
				brand: brand.trim(),
				cities: serviceable.slice(0, 100)
			} });
			if (res.error || !res.fits) toast.error("Ranking failed", res.error || void 0);
			else setFits(res.fits);
		} finally {
			setRanking(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative",
		style: { height: "calc(100vh - 3.5rem)" },
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IndiaMap, {
				statuses,
				fits,
				onSelect: setSelected
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "absolute left-4 top-4 z-10 w-[320px] space-y-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-2xl border border-border bg-card p-4 shadow-card",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "grid h-9 w-9 place-items-center rounded-xl gradient-primary text-primary-foreground",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Earth, { className: "h-4 w-4" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-sm font-semibold",
								children: "India Coverage"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-[11px] text-muted-foreground",
								children: probed > 0 ? `${green}/${probed} cities q-commerce serviceable` : `${INDIA_CITIES.length} cities ready to probe`
							})] })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: probeAll,
							disabled: probing,
							className: "mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl gradient-primary px-4 py-2 text-xs font-medium text-primary-foreground disabled:opacity-60",
							children: [probing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Zap, { className: "h-3.5 w-3.5" }), probing ? `Probing… ${progress}%` : probed ? "Re-probe all cities (live)" : "Probe all cities (live Swiggy check)"]
						}),
						probed > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-2 flex items-center gap-3 text-[11px] text-muted-foreground",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "flex items-center gap-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-2 w-2 rounded-full bg-green-600" }), " Serviceable"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "flex items-center gap-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-2 w-2 rounded-full bg-red-600" }), " Not yet"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "flex items-center gap-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-2 w-2 rounded-full bg-slate-400" }), " Unknown"]
								})
							]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-2xl border border-border bg-card p-4 shadow-card",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mb-2 text-xs font-semibold",
							children: "Rank cities for a brand"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								value: brand,
								onChange: (e) => setBrand(e.target.value),
								placeholder: "e.g. Zepto, boAt",
								className: inputCls,
								onKeyDown: (e) => e.key === "Enter" && rankForBrand()
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: rankForBrand,
								disabled: ranking || !brand.trim(),
								className: "grid h-9 w-9 shrink-0 place-items-center rounded-xl gradient-primary text-primary-foreground disabled:opacity-60",
								children: ranking ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-4 w-4" })
							})]
						}),
						fits && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
							className: "mt-3 max-h-[38vh] space-y-1.5 overflow-y-auto",
							children: fits.map((f, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "rounded-xl bg-muted/40 px-2.5 py-1.5 text-xs",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "font-semibold",
										children: [
											i + 1,
											". ",
											f.city
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "ml-1.5 rounded-full bg-primary/10 px-1.5 text-[10px] text-primary",
										children: f.score
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mt-0.5 text-muted-foreground",
										children: f.why
									})
								]
							}, f.city))
						})
					]
				})]
			}),
			selected && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "absolute bottom-6 left-4 z-10 w-[320px] rounded-2xl border border-border bg-card p-4 shadow-xl",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "h-4 w-4 text-primary" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-sm font-semibold",
								children: [
									selected.name,
									", ",
									selected.state
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "rounded-full bg-muted px-2 py-0.5 text-[10px]",
								children: ["Tier ", selected.tier]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-1.5 text-xs",
						children: [
							"Q-commerce: ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-medium",
								style: { color: DOT[statuses[selected.name] ?? "unknown"] },
								children: (statuses[selected.name] ?? "not probed").replace("_", " ")
							}),
							fits?.find((f) => f.city.startsWith(selected.name)) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-1 text-muted-foreground",
								children: fits.find((f) => f.city.startsWith(selected.name)).why
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: `/research?brand=&city=${encodeURIComponent(selected.name)}`,
						className: "mt-2 inline-block rounded-lg border border-border px-2.5 py-1 text-[11px] hover:bg-muted",
						children: "Deep-dive in Brand Intelligence →"
					})
				]
			})
		]
	});
}
function IndiaMap({ statuses, fits, onSelect }) {
	const container = (0, import_react.useRef)(null);
	const mapRef = (0, import_react.useRef)(null);
	const markersRef = (0, import_react.useRef)([]);
	(0, import_react.useEffect)(() => {
		if (!container.current || mapRef.current) return;
		const map = new import_maplibre_gl.default.Map({
			container: container.current,
			style: "https://tiles.openfreemap.org/styles/bright",
			center: [79.5, 22.5],
			zoom: 4.4
		});
		map.addControl(new import_maplibre_gl.default.NavigationControl({ showCompass: false }), "top-right");
		mapRef.current = map;
		return () => {
			map.remove();
			mapRef.current = null;
		};
	}, []);
	(0, import_react.useEffect)(() => {
		const map = mapRef.current;
		if (!map) return;
		markersRef.current.forEach((m) => m.remove());
		const topSet = new Set((fits ?? []).slice(0, 10).map((f) => f.city.split(" (")[0]));
		markersRef.current = INDIA_CITIES.map((c) => {
			const st = statuses[c.name] ?? "unknown";
			const isTop = topSet.has(c.name);
			const size = isTop ? 18 : c.tier === 1 ? 13 : c.tier === 2 ? 10 : 8;
			const el = document.createElement("div");
			el.style.cssText = `width:${size}px;height:${size}px;border-radius:50%;background:${DOT[st]};border:2px solid ${isTop ? "#7c3aed" : "#fff"};box-shadow:0 1px 4px rgba(0,0,0,.35);cursor:pointer;`;
			el.title = `${c.name} — ${st.replace("_", " ")}`;
			el.addEventListener("click", () => onSelect(c));
			return new import_maplibre_gl.default.Marker({ element: el }).setLngLat([c.lng, c.lat]).addTo(map);
		});
	}, [
		statuses,
		fits,
		onSelect
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		ref: container,
		style: {
			position: "absolute",
			inset: 0
		}
	});
}
//#endregion
export { IndiaPage as component };
