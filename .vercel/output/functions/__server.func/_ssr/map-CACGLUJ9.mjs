import { o as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { G as Film, P as LoaderCircle, W as GraduationCap, X as Cross, _ as Sparkles, at as ChevronDown, h as Star, j as MapPin, l as TrendingUp, lt as Bus, m as Store, mt as Banknote, n as X, o as Utensils, rt as ChevronUp, s as Users, ut as Building2, v as ShoppingBag, x as Search } from "../_libs/lucide-react.mjs";
import { d as useServerFn, n as analyzeAreaWithGroq, s as fetchNearbyPlaces } from "./ai.functions-KpadgdAQ.mjs";
import { t as AppShell } from "./AppShell-Dr6oCPq7.mjs";
import "./router-DF6JvSWr.mjs";
import { t as require_maplibre_gl } from "../_libs/maplibre-gl.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/map-CACGLUJ9.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var import_maplibre_gl = /* @__PURE__ */ __toESM(require_maplibre_gl());
var POI_CATEGORIES = [
	{
		id: "mall",
		label: "Shopping Malls",
		icon: ShoppingBag,
		color: "#8b5cf6",
		overpass: ["node[\"shop\"=\"mall\"]", "way[\"shop\"=\"mall\"]"]
	},
	{
		id: "school",
		label: "Schools & Colleges",
		icon: GraduationCap,
		color: "#3b82f6",
		overpass: ["node[\"amenity\"=\"school\"]", "node[\"amenity\"=\"college\"]"]
	},
	{
		id: "hospital",
		label: "Hospitals",
		icon: Cross,
		color: "#ef4444",
		overpass: ["node[\"amenity\"=\"hospital\"]"]
	},
	{
		id: "bus",
		label: "Bus Stops",
		icon: Bus,
		color: "#f59e0b",
		overpass: ["node[\"amenity\"=\"bus_station\"]", "node[\"highway\"=\"bus_stop\"]"]
	},
	{
		id: "office",
		label: "Offices",
		icon: Building2,
		color: "#64748b",
		overpass: ["node[\"building\"=\"office\"]"]
	},
	{
		id: "restaurant",
		label: "Restaurants",
		icon: Utensils,
		color: "#f97316",
		overpass: ["node[\"amenity\"=\"restaurant\"]", "node[\"amenity\"=\"fast_food\"]"]
	},
	{
		id: "cinema",
		label: "Cinemas",
		icon: Film,
		color: "#ec4899",
		overpass: ["node[\"amenity\"=\"cinema\"]"]
	},
	{
		id: "supermarket",
		label: "Supermarkets",
		icon: Store,
		color: "#10b981",
		overpass: ["node[\"shop\"=\"supermarket\"]"]
	}
];
function haversineKm(lat1, lon1, lat2, lon2) {
	const R = 6371;
	const dLat = (lat2 - lat1) * Math.PI / 180;
	const dLon = (lon2 - lon1) * Math.PI / 180;
	const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
	return parseFloat((R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(2));
}
function categoryIcon(cat) {
	if (cat.includes("mall") || cat.includes("shopping")) return ShoppingBag;
	if (cat.includes("school") || cat.includes("university")) return GraduationCap;
	if (cat.includes("hospital") || cat.includes("clinic")) return Cross;
	if (cat.includes("bus") || cat.includes("transit")) return Bus;
	if (cat.includes("restaurant") || cat.includes("cafe") || cat.includes("food")) return Utensils;
	if (cat.includes("movie") || cat.includes("theater")) return Film;
	if (cat.includes("supermarket") || cat.includes("department")) return Store;
	if (cat.includes("office") || cat.includes("bank")) return Building2;
	return MapPin;
}
function scoreColor(score) {
	if (score >= 70) return "text-success";
	if (score >= 40) return "text-warning-foreground";
	return "text-destructive";
}
function MapPage() {
	const container = (0, import_react.useRef)(null);
	const mapRef = (0, import_react.useRef)(null);
	const poiMarkersRef = (0, import_react.useRef)([]);
	const [placesPanel, setPlacesPanel] = (0, import_react.useState)(false);
	const [placesLoading, setPlacesLoading] = (0, import_react.useState)(false);
	const [places, setPlaces] = (0, import_react.useState)([]);
	const [placesError, setPlacesError] = (0, import_react.useState)("");
	const [placesCoords, setPlacesCoords] = (0, import_react.useState)(null);
	const [placesRadius, setPlacesRadius] = (0, import_react.useState)(500);
	const getNearby = useServerFn(fetchNearbyPlaces);
	const analyzeArea = useServerFn(analyzeAreaWithGroq);
	const [aiAnalysis, setAiAnalysis] = (0, import_react.useState)(null);
	const [aiLoading, setAiLoading] = (0, import_react.useState)(false);
	const [scraperOpen, setScraperOpen] = (0, import_react.useState)(false);
	const [selectedCats, setSelectedCats] = (0, import_react.useState)(/* @__PURE__ */ new Set([
		"mall",
		"bus",
		"school"
	]));
	const [radius, setRadius] = (0, import_react.useState)(2e3);
	const [scraping, setScraping] = (0, import_react.useState)(false);
	const [pois, setPois] = (0, import_react.useState)([]);
	const [scrapeError, setScrapeError] = (0, import_react.useState)("");
	const [is3D, setIs3D] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (!container.current || mapRef.current) return;
		const map = new import_maplibre_gl.default.Map({
			container: container.current,
			style: "https://tiles.openfreemap.org/styles/bright",
			center: [80.9462, 26.8493],
			zoom: 12,
			maxPitch: 70
		});
		map.addControl(new import_maplibre_gl.default.NavigationControl({ visualizePitch: true }), "top-right");
		map.on("click", (e) => {
			const { lat, lng } = e.lngLat;
			setPlacesCoords({
				lat,
				lng
			});
			setPlaces([]);
			setPlacesError("");
			setAiAnalysis(null);
			setPlacesPanel(true);
			setScraperOpen(false);
		});
		map.on("error", (e) => console.error("[atlas-map]", e.error?.message || e));
		mapRef.current = map;
		return () => {
			map.remove();
			mapRef.current = null;
		};
	}, []);
	function toggle3D() {
		const map = mapRef.current;
		if (!map) return;
		const next = !is3D;
		setIs3D(next);
		map.easeTo({
			pitch: next ? 55 : 0,
			bearing: next ? -15 : 0,
			duration: 900
		});
	}
	async function loadPlaces(lat, lng) {
		setPlacesLoading(true);
		setPlacesError("");
		try {
			const result = await getNearby({ data: {
				lat,
				lng,
				radius: placesRadius
			} });
			if (result.error && !result.places.length) setPlacesError(result.error);
			else setPlaces(result.places);
		} catch (e) {
			setPlacesError(e instanceof Error ? e.message : "Failed");
		} finally {
			setPlacesLoading(false);
		}
	}
	const scrapePois = (0, import_react.useCallback)(async () => {
		const map = mapRef.current;
		if (!map || selectedCats.size === 0) return;
		const center = map.getCenter();
		const lat = center.lat, lng = center.lng;
		setScraping(true);
		setScrapeError("");
		setPois([]);
		poiMarkersRef.current.forEach((m) => m.remove());
		poiMarkersRef.current = [];
		try {
			const query = `[out:json][timeout:30];(${POI_CATEGORIES.filter((c) => selectedCats.has(c.id)).flatMap((c) => c.overpass.map((q) => `${q}(around:${radius},${lat},${lng});`)).join("")});out center;`;
			const mirrors = [
				"https://overpass-api.de/api/interpreter",
				"https://overpass.kumi.systems/api/interpreter",
				"https://maps.mail.ru/osm/tools/overpass/api/interpreter"
			];
			let res = null;
			for (const url of mirrors) try {
				res = await fetch(url, {
					method: "POST",
					body: query
				});
				if (res.ok) break;
			} catch {
				continue;
			}
			if (!res || !res.ok) throw new Error(`Overpass unavailable — try again in a moment`);
			if (!res.ok) throw new Error(`Overpass error ${res.status}`);
			const results = (await res.json()).elements.map((el) => {
				const elLat = el.lat ?? el.center?.lat ?? 0;
				const elLon = el.lon ?? el.center?.lon ?? 0;
				const name = el.tags?.name || el.tags?.amenity || el.tags?.shop || "Unnamed";
				const cat = POI_CATEGORIES.find((c) => c.overpass.some((q) => {
					const kv = q.match(/\["([^"]+)"="([^"]+)"\]/);
					return kv ? el.tags?.[kv[1]] === kv[2] : false;
				}));
				return {
					id: el.id,
					name,
					category: cat?.id || "other",
					lat: elLat,
					lon: elLon,
					distance: haversineKm(lat, lng, elLat, elLon)
				};
			}).filter((p) => p.lat && p.lon).sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0)).slice(0, 200);
			setPois(results);
			if (map) poiMarkersRef.current = results.map((p) => {
				const cat = POI_CATEGORIES.find((c) => c.id === p.category);
				const el = document.createElement("div");
				el.style.cssText = `width:10px;height:10px;border-radius:50%;background:${cat?.color || "#94a3b8"};border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.2);`;
				const popup = new import_maplibre_gl.default.Popup({
					offset: 8,
					closeButton: false
				}).setHTML(`<div style="font-family:system-ui;font-size:11px;max-width:160px"><div style="font-weight:600">${p.name}</div><div style="color:#64748b">${cat?.label} · ${p.distance}km</div></div>`);
				return new import_maplibre_gl.default.Marker({ element: el }).setLngLat([p.lon, p.lat]).setPopup(popup).addTo(map);
			});
		} catch (e) {
			setScrapeError(e instanceof Error ? e.message : "Failed");
		} finally {
			setScraping(false);
		}
	}, [selectedCats, radius]);
	const avgRating = places.length ? (places.reduce((a, p) => a + p.rating, 0) / places.length).toFixed(1) : "—";
	const totalReviews = places.reduce((a, p) => a + p.reviewCount, 0);
	const avgFootfall = places.length ? Math.round(places.reduce((a, p) => a + p.footfallScore, 0) / places.length) : 0;
	const secEstimate = places.length ? places.reduce((a, p) => a + (p.priceLevel >= 0 ? p.priceLevel : 2), 0) / places.length : -1;
	const secLabel = secEstimate < 0 ? "—" : secEstimate >= 3 ? "SEC A" : secEstimate >= 1.5 ? "SEC B" : "SEC C";
	const topBusinesses = [...places].sort((a, b) => b.footfallScore - a.footfallScore).slice(0, 8);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative",
		style: { height: "calc(100vh - 3.5rem)" },
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				ref: container,
				style: {
					position: "absolute",
					inset: 0,
					width: "100%",
					height: "100%"
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute left-4 top-4 z-10 flex gap-2",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: toggle3D,
					className: `inline-flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-medium shadow-card transition ${is3D ? "gradient-primary border-transparent text-primary-foreground" : "border-border bg-card hover:bg-muted"}`,
					title: "Toggle 3D buildings view",
					children: is3D ? "3D" : "2D"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				onClick: () => {
					setScraperOpen((v) => !v);
					setPlacesPanel(false);
				},
				className: "absolute left-4 bottom-6 z-10 inline-flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-2.5 text-sm font-medium shadow-card hover:bg-muted",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "h-4 w-4 text-primary" }),
					"OSM POIs",
					pois.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground",
						children: pois.length
					}),
					scraperOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronUp, { className: "h-3.5 w-3.5" })
				]
			}),
			scraperOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "absolute bottom-20 left-4 z-20 w-72 max-h-[65vh] overflow-y-auto rounded-2xl border border-border bg-card shadow-xl",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "sticky top-0 flex items-center justify-between border-b border-border bg-card px-4 py-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-sm font-semibold",
						children: "OSM POI Scraper"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-[11px] text-muted-foreground",
						children: "OpenStreetMap · Free"
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => setScraperOpen(false),
						className: "grid h-7 w-7 place-items-center rounded-lg hover:bg-muted",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-3.5 w-3.5" })
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "p-4 space-y-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mb-2 flex justify-between text-xs",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-medium",
								children: "Radius"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-primary font-semibold",
								children: [(radius / 1e3).toFixed(1), "km"]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "range",
							min: 300,
							max: 5e3,
							step: 100,
							value: radius,
							onChange: (e) => setRadius(Number(e.target.value)),
							className: "w-full accent-primary"
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid grid-cols-2 gap-1.5",
							children: POI_CATEGORIES.map((cat) => {
								const Icon = cat.icon;
								const active = selectedCats.has(cat.id);
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									onClick: () => setSelectedCats((p) => {
										const n = new Set(p);
										if (n.has(cat.id)) n.delete(cat.id);
										else n.add(cat.id);
										return n;
									}),
									className: "flex items-center gap-1.5 rounded-xl border px-2.5 py-2 text-[11px] transition-all " + (active ? "border-primary/40 bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/30"),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
										className: "h-3.5 w-3.5 shrink-0",
										style: { color: active ? cat.color : void 0 }
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "leading-tight",
										children: cat.label
									})]
								}, cat.id);
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: scrapePois,
							disabled: scraping || selectedCats.size === 0,
							className: "w-full inline-flex items-center justify-center gap-2 rounded-xl gradient-primary py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-60",
							children: scraping ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin" }), " Scraping…"] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "h-4 w-4" }), " Scrape at map center"] })
						}),
						scrapeError && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "rounded-xl bg-destructive/10 px-3 py-2 text-xs text-destructive",
							children: scrapeError
						}),
						pois.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mb-2 flex justify-between text-xs font-medium",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [pois.length, " POIs found"] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => {
									poiMarkersRef.current.forEach((m) => m.remove());
									poiMarkersRef.current = [];
									setPois([]);
								},
								className: "text-destructive hover:underline",
								children: "Clear"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "max-h-40 overflow-y-auto divide-y divide-border rounded-xl border border-border",
							children: pois.slice(0, 60).map((p) => {
								const cat = POI_CATEGORIES.find((c) => c.id === p.category);
								const Icon = cat?.icon || MapPin;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									onClick: () => mapRef.current?.flyTo({
										center: [p.lon, p.lat],
										zoom: 17,
										duration: 700
									}),
									className: "flex cursor-pointer items-center gap-2.5 px-3 py-2 hover:bg-muted",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "grid h-6 w-6 shrink-0 place-items-center rounded-lg",
											style: { background: (cat?.color || "#94a3b8") + "20" },
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
												className: "h-3 w-3",
												style: { color: cat?.color || "#94a3b8" }
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "min-w-0 flex-1",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "truncate text-[11px] font-medium",
												children: p.name
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "shrink-0 text-[10px] text-muted-foreground",
											children: [p.distance, "km"]
										})
									]
								}, p.id);
							})
						})] })
					]
				})]
			}),
			placesPanel && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "absolute right-4 top-4 bottom-4 z-20 w-[340px] rounded-2xl border border-border bg-card shadow-xl overflow-hidden flex flex-col",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between border-b border-border px-4 py-3 shrink-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-sm font-semibold",
						children: "Area Intelligence"
					}), placesCoords && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-[11px] text-muted-foreground",
						children: [
							placesCoords.lat.toFixed(4),
							", ",
							placesCoords.lng.toFixed(4)
						]
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => setPlacesPanel(false),
						className: "grid h-7 w-7 place-items-center rounded-lg hover:bg-muted",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" })
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex-1 overflow-y-auto",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "border-b border-border p-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mb-2 flex items-center justify-between text-xs",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-medium",
										children: "Search radius"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-primary font-semibold",
										children: [placesRadius, "m"]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "range",
									min: 200,
									max: 2e3,
									step: 100,
									value: placesRadius,
									onChange: (e) => setPlacesRadius(Number(e.target.value)),
									className: "mb-3 w-full accent-primary"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: () => placesCoords && loadPlaces(placesCoords.lat, placesCoords.lng),
									disabled: placesLoading || !placesCoords,
									className: "w-full inline-flex items-center justify-center gap-2 rounded-xl gradient-primary py-2 text-sm font-medium text-primary-foreground disabled:opacity-60",
									children: placesLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin" }), " Fetching from Google…"] }) : places.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "h-4 w-4" }), " Re-analyse"] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "h-4 w-4" }), " Analyse with Google Places"] })
								}),
								placesError && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-2 rounded-xl bg-destructive/10 px-3 py-2 text-xs text-destructive",
									children: placesError
								})
							]
						}),
						places.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "grid grid-cols-4 divide-x divide-border border-b border-border",
								children: [
									{
										icon: Star,
										label: "Avg Rating",
										value: avgRating
									},
									{
										icon: Users,
										label: "Reviews",
										value: totalReviews > 999 ? `${(totalReviews / 1e3).toFixed(1)}K` : String(totalReviews)
									},
									{
										icon: TrendingUp,
										label: "Footfall",
										value: `${avgFootfall}`
									},
									{
										icon: Banknote,
										label: "SEC",
										value: secLabel
									}
								].map(({ icon: Icon, label, value }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-col items-center justify-center gap-0.5 py-3 px-1",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-3.5 w-3.5 text-primary" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: `text-sm font-bold ${label === "Footfall" ? scoreColor(avgFootfall) : ""}`,
											children: value
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "text-[9px] text-muted-foreground text-center leading-tight",
											children: label
										})
									]
								}, label))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "border-b border-border px-4 py-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center justify-between mb-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-xs font-semibold",
											children: "OOH Site Score"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: `text-lg font-bold ${scoreColor(avgFootfall)}`,
											children: [avgFootfall, "/100"]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "h-2 rounded-full bg-muted overflow-hidden",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "h-2 rounded-full bg-primary transition-all",
											style: { width: `${avgFootfall}%` }
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-1.5 text-[11px] text-muted-foreground",
										children: [
											"Based on ",
											places.length,
											" businesses · avg rating ",
											avgRating,
											"★ · ",
											totalReviews.toLocaleString("en-IN"),
											" total reviews"
										]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "px-4 py-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mb-2 text-xs font-semibold",
									children: "Top businesses nearby"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
									className: "space-y-1.5",
									children: topBusinesses.map((p, i) => {
										return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
											className: "flex items-center gap-2.5 rounded-xl border border-border p-2.5",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/10",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(categoryIcon(p.category), { className: "h-3.5 w-3.5 text-primary" })
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "min-w-0 flex-1",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
														className: "truncate text-[11px] font-medium",
														children: p.name
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "text-[10px] text-muted-foreground capitalize",
														children: [
															p.category.replace(/_/g, " "),
															" · ",
															p.distance,
															"m away"
														]
													})]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "shrink-0 text-right",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "text-[11px] font-semibold flex items-center gap-0.5",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: "h-2.5 w-2.5 text-warning fill-warning" }), p.rating || "—"]
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "text-[10px] text-muted-foreground",
														children: [p.reviewCount > 999 ? `${(p.reviewCount / 1e3).toFixed(1)}K` : p.reviewCount, " rev"]
													})]
												})
											]
										}, i);
									})
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "border-t border-border px-4 py-3",
								children: !aiAnalysis ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: async () => {
										setAiLoading(true);
										const r = await analyzeArea({ data: {
											lat: placesCoords.lat,
											lng: placesCoords.lng,
											places: places.map((p) => ({
												name: p.name,
												category: p.category,
												rating: p.rating,
												reviewCount: p.reviewCount,
												priceLevel: p.priceLevel,
												distance: p.distance,
												footfallScore: p.footfallScore
											})),
											avgRating,
											totalReviews,
											oohScore: avgFootfall,
											secLabel
										} });
										setAiAnalysis(r.analysis || r.error || "No response");
										setAiLoading(false);
									},
									disabled: aiLoading,
									className: "w-full inline-flex items-center justify-center gap-2 rounded-xl border border-primary/30 bg-primary/10 py-2.5 text-sm font-medium text-primary hover:bg-primary/20 disabled:opacity-60",
									children: aiLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin" }), " Analysing with Groq…"] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-4 w-4" }), " Get OOH AI Analysis"] })
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mb-2 flex items-center justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-1.5 text-xs font-semibold",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-3.5 w-3.5 text-primary" }), " AI Analysis"]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: () => setAiAnalysis(null),
										className: "text-[10px] text-muted-foreground hover:text-foreground",
										children: "Clear"
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "rounded-xl bg-primary/5 border border-primary/20 p-3 text-xs text-foreground leading-relaxed whitespace-pre-wrap",
									children: aiAnalysis
								})] })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "border-t border-border px-4 py-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mb-2 text-xs font-semibold",
									children: "Category mix"
								}), (() => {
									const counts = {};
									for (const p of places) {
										const key = p.category.split("_")[0];
										counts[key] = (counts[key] || 0) + 1;
									}
									return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([cat, count]) => {
										return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "mb-1.5 flex items-center gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(categoryIcon(cat), { className: "h-3 w-3 shrink-0 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex-1",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex justify-between text-[10px] mb-0.5",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "capitalize text-muted-foreground",
														children: cat.replace(/_/g, " ")
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "font-medium",
														children: count
													})]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "h-1 rounded-full bg-muted",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
														className: "h-1 rounded-full bg-primary/60",
														style: { width: `${count / places.length * 100}%` }
													})
												})]
											})]
										}, cat);
									});
								})()]
							})
						] }),
						!placesLoading && places.length === 0 && !placesError && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-col items-center justify-center gap-3 p-8 text-center",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "grid h-12 w-12 place-items-center rounded-2xl bg-primary/10",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "h-5 w-5 text-primary" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-sm font-medium",
								children: "Click analyse"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-1 text-xs text-muted-foreground",
								children: "Fetches real business data from Google Places to score this OOH location"
							})] })]
						})
					]
				})]
			})
		]
	}) });
}
//#endregion
export { MapPage as component };
