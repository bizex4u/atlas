import { l as createServerFn } from "./esm-Dova13aH.mjs";
import { a as objectType, i as numberType, n as booleanType, o as stringType, r as enumType, t as arrayType } from "../_libs/zod.mjs";
import { t as createServerRpc } from "./createServerRpc-WJgk8O8C.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ai.functions-fLzdPL9e.js
var PlacesInput = objectType({
	lat: numberType(),
	lng: numberType(),
	radius: numberType().default(500)
});
var fetchNearbyPlaces_createServerFn_handler = createServerRpc({
	id: "3788cfc68db122930526fe1f2449f1d1747865e57f7f3fc486e12c49744ac583",
	name: "fetchNearbyPlaces",
	filename: "src/lib/ai.functions.ts"
}, (opts) => fetchNearbyPlaces.__executeServer(opts));
var fetchNearbyPlaces = createServerFn({ method: "POST" }).validator((d) => PlacesInput.parse(d)).handler(fetchNearbyPlaces_createServerFn_handler, async ({ data }) => {
	const key = process.env.GOOGLE_PLACES_API_KEY;
	if (!key) return {
		places: [],
		error: "GOOGLE_PLACES_API_KEY not set"
	};
	const body = {
		includedTypes: [
			"shopping_mall",
			"supermarket",
			"department_store",
			"school",
			"university",
			"hospital",
			"bus_station",
			"transit_station",
			"restaurant",
			"cafe",
			"fast_food_restaurant",
			"movie_theater",
			"amusement_park",
			"bank",
			"atm",
			"gas_station"
		],
		maxResultCount: 20,
		locationRestriction: { circle: {
			center: {
				latitude: data.lat,
				longitude: data.lng
			},
			radius: data.radius
		} },
		rankPreference: "POPULARITY"
	};
	const res = await fetch("https://places.googleapis.com/v1/places:searchNearby", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"X-Goog-Api-Key": key,
			"X-Goog-FieldMask": "places.displayName,places.types,places.rating,places.userRatingCount,places.priceLevel,places.location,places.currentOpeningHours"
		},
		body: JSON.stringify(body)
	});
	if (!res.ok) {
		const txt = await res.text().catch(() => "");
		return {
			places: [],
			error: `Places API error ${res.status}: ${txt.slice(0, 200)}`
		};
	}
	const json = await res.json();
	const priceLevelMap = {
		PRICE_LEVEL_FREE: 0,
		PRICE_LEVEL_INEXPENSIVE: 1,
		PRICE_LEVEL_MODERATE: 2,
		PRICE_LEVEL_EXPENSIVE: 3,
		PRICE_LEVEL_VERY_EXPENSIVE: 4
	};
	function haversine(lat1, lon1, lat2, lon2) {
		const R = 6371e3;
		const dLat = (lat2 - lat1) * Math.PI / 180;
		const dLon = (lon2 - lon1) * Math.PI / 180;
		const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
		return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
	}
	const places = (json.places || []).map((p) => ({
		name: p.displayName?.text || "Unknown",
		category: p.types?.[0]?.replace(/_/g, " ") || "place",
		rating: p.rating || 0,
		reviewCount: p.userRatingCount || 0,
		priceLevel: priceLevelMap[p.priceLevel || ""] ?? -1,
		lat: p.location?.latitude || 0,
		lng: p.location?.longitude || 0,
		distance: haversine(data.lat, data.lng, p.location?.latitude || 0, p.location?.longitude || 0),
		openNow: p.currentOpeningHours?.openNow ?? null
	}));
	const maxScore = Math.max(...places.map((p) => p.rating * Math.log10(p.reviewCount + 1)), 1);
	return {
		places: places.map((p) => ({
			...p,
			footfallScore: Math.round(p.rating * Math.log10(p.reviewCount + 1) / maxScore * 100)
		})),
		error: null
	};
});
var HFInput = objectType({
	content: stringType(),
	mimeType: stringType(),
	fileName: stringType().default("file")
});
var parseWithHF_createServerFn_handler = createServerRpc({
	id: "9a8393e4f637533ed4896d1b067349e11a12cf7545942e20288106976039c8e0",
	name: "parseWithHF",
	filename: "src/lib/ai.functions.ts"
}, (opts) => parseWithHF.__executeServer(opts));
var parseWithHF = createServerFn({ method: "POST" }).validator((d) => HFInput.parse(d)).handler(parseWithHF_createServerFn_handler, async ({ data }) => {
	const key = process.env.GROQ_API_KEY;
	if (!key) return {
		sites: [],
		error: "GROQ_API_KEY not set in .env",
		tokensUsed: 0
	};
	const isImage = data.mimeType.startsWith("image/");
	const prompt = `You are an OOH (Out-of-Home) advertising expert in India. Extract ALL advertising media sites from this ${isImage ? "image" : "document"}.

IMPORTANT EXTRACTION RULES:
1. GPS OVERLAY: If image has a GPS Map Camera watermark with lat/long coordinates, extract EXACT lat/lng values shown. Also extract full address shown.
2. FORMAT DETECTION: Be specific — use: Hoarding, Unipole, DOOH, Bus Shelter, Metro Panel, Mall Display, Society Lift, Airport Terminal, Transit Panel, Wall Wrap, Tree Guard, Highway Media, Radio, Newspaper, Magazine, Event Sponsorship, Cinema. Use "DOOH" for outdoor LED/digital screens (not indoor). Use "Digital" only for indoor screens.
3. SIZE: Extract width × height in feet. If "65 inch" visible, note in notes field.
4. ADDRESS: If GPS overlay shows full address, put it in notes field.
5. SITE NAME: Use any visible text label or signage name. If not visible, describe location precisely (e.g. "DOOH Screen at Golf Practice Ground, Gulistan Colony").

Return ONLY a JSON array, no markdown, no explanation:
[{"name":"site name","city":"city name","format":"DOOH|Hoarding|Unipole|Bus Shelter|Metro Panel|Mall Display|Transit Panel|Society Lift|Airport Terminal|Wall Wrap|Tree Guard|Highway Media|Digital|Radio|Newspaper|Magazine|Event Sponsorship|Cinema","monthlyRent":number,"width":number,"height":number,"lat":number,"lng":number,"address":"full address if visible","notes":"illumination, size details, address, any other info"}]
If lat/lng not visible, estimate from city/area. If rent not visible set 0. Extract ALL sites visible.`;
	const messages = isImage ? [{
		role: "user",
		content: [{
			type: "image_url",
			image_url: { url: `data:${data.mimeType};base64,${data.content}` }
		}, {
			type: "text",
			text: prompt
		}]
	}] : [{
		role: "user",
		content: `${prompt}\n\nDOCUMENT:\n${data.content.slice(0, 8e3)}`
	}];
	const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${key}`
		},
		body: JSON.stringify({
			model: "meta-llama/llama-4-scout-17b-16e-instruct",
			messages,
			max_tokens: 1500,
			temperature: .1
		})
	});
	if (!res.ok) {
		const txt = await res.text().catch(() => "");
		return {
			sites: [],
			error: `Groq vision error ${res.status}: ${txt.slice(0, 200)}`,
			tokensUsed: 0
		};
	}
	const json = await res.json();
	const raw = json.choices?.[0]?.message?.content?.trim() || "[]";
	const tokensUsed = json.usage?.total_tokens || 0;
	try {
		const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
		const start = cleaned.indexOf("[");
		const end = cleaned.lastIndexOf("]");
		const sites = JSON.parse(start >= 0 ? cleaned.slice(start, end + 1) : cleaned);
		return {
			sites: Array.isArray(sites) ? sites : [],
			error: null,
			tokensUsed
		};
	} catch {
		return {
			sites: [],
			error: "Could not parse vision response. Retry or check file quality.",
			tokensUsed
		};
	}
});
var SitePhotoInput = objectType({
	image: stringType(),
	siteName: stringType().default(""),
	city: stringType().default("")
});
var analyzeSitePhoto_createServerFn_handler = createServerRpc({
	id: "bdd8b910ae9a783d932875ce99db7018b5cd95347358449d8f9c30e6b7107695",
	name: "analyzeSitePhoto",
	filename: "src/lib/ai.functions.ts"
}, (opts) => analyzeSitePhoto.__executeServer(opts));
var analyzeSitePhoto = createServerFn({ method: "POST" }).validator((d) => SitePhotoInput.parse(d)).handler(analyzeSitePhoto_createServerFn_handler, async ({ data }) => {
	const key = process.env.GROQ_API_KEY;
	if (!key) return {
		tags: [],
		description: null,
		error: "GROQ_API_KEY not set",
		tokensUsed: 0
	};
	const prompt = `You are an OOH media auditor in India inspecting a site photo${data.siteName ? ` of "${data.siteName}"` : ""}${data.city ? ` in ${data.city}` : ""}.
Return ONLY JSON, no markdown:
{"tags":["5-10 short searchable tags: media type, lit/non-lit, road type, nearby landmarks, traffic density, condition"],"description":"2 sentences: what the site is, visibility quality, surroundings — written to help sell it"}`;
	const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${key}`
		},
		body: JSON.stringify({
			model: "meta-llama/llama-4-scout-17b-16e-instruct",
			messages: [{
				role: "user",
				content: [{
					type: "image_url",
					image_url: { url: `data:image/jpeg;base64,${data.image}` }
				}, {
					type: "text",
					text: prompt
				}]
			}],
			max_tokens: 400,
			temperature: .2
		})
	});
	if (!res.ok) return {
		tags: [],
		description: null,
		error: `Groq vision error ${res.status}`,
		tokensUsed: 0
	};
	const json = await res.json();
	const raw = json.choices?.[0]?.message?.content?.trim() || "{}";
	try {
		const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
		const s = cleaned.indexOf("{"), e = cleaned.lastIndexOf("}");
		const parsed = JSON.parse(cleaned.slice(s, e + 1));
		return {
			tags: (parsed.tags || []).slice(0, 10),
			description: parsed.description || null,
			error: null,
			tokensUsed: json.usage?.total_tokens || 0
		};
	} catch {
		return {
			tags: [],
			description: null,
			error: "Could not parse vision response",
			tokensUsed: json.usage?.total_tokens || 0
		};
	}
});
var ExcelInput = objectType({ content: stringType() });
var parseExcel_createServerFn_handler = createServerRpc({
	id: "4d23fc677d1852844225c736051de320f4ae25e28474a2bdfb062b845afafc1b",
	name: "parseExcel",
	filename: "src/lib/ai.functions.ts"
}, (opts) => parseExcel.__executeServer(opts));
var parseExcel = createServerFn({ method: "POST" }).validator((d) => ExcelInput.parse(d)).handler(parseExcel_createServerFn_handler, async ({ data }) => {
	try {
		const XLSX = await import("../_libs/xlsx.mjs").then((n) => n.t);
		const buf = Buffer.from(data.content, "base64");
		const wb = XLSX.read(buf, { type: "buffer" });
		const allSites = [];
		for (const sheetName of wb.SheetNames) {
			const ws = wb.Sheets[sheetName];
			const rows = XLSX.utils.sheet_to_json(ws, { defval: "" });
			if (!rows.length) continue;
			Object.keys(rows[0]).map((h) => String(h).toLowerCase().trim());
			function col(row, patterns) {
				const key = Object.keys(row).find((k) => patterns.some((p) => k.toLowerCase().includes(p)));
				return key ? String(row[key] || "").trim() : "";
			}
			function numCol(row, patterns) {
				const v = col(row, patterns);
				return parseFloat(v.replace(/[₹,\s]/g, "")) || 0;
			}
			for (const row of rows) {
				const name = col(row, [
					"site name",
					"name",
					"location",
					"site",
					"hoarding",
					"media"
				]);
				if (!name || name.length < 2) continue;
				const city = col(row, [
					"city",
					"town",
					"district",
					"area",
					"region"
				]);
				const format = col(row, [
					"format",
					"type",
					"media type",
					"medium"
				]);
				const rent = numCol(row, [
					"rate",
					"rent",
					"cost",
					"price",
					"monthly",
					"amount"
				]);
				const width = numCol(row, [
					"width",
					"w ",
					"breadth"
				]);
				const height = numCol(row, [
					"height",
					"h ",
					"length"
				]);
				const notes = [
					col(row, [
						"illumination",
						"light",
						"lit"
					]),
					col(row, [
						"traffic",
						"footfall",
						"visibility"
					]),
					col(row, [
						"remark",
						"note",
						"comment",
						"description"
					])
				].filter(Boolean).join(" | ");
				allSites.push({
					name,
					city,
					format,
					monthlyRent: rent,
					width,
					height,
					lat: 0,
					lng: 0,
					notes
				});
			}
		}
		return {
			sites: allSites,
			error: null,
			sheets: wb.SheetNames.length
		};
	} catch (e) {
		return {
			sites: [],
			error: `Excel parse error: ${e instanceof Error ? e.message : "unknown"}`,
			sheets: 0
		};
	}
});
var ParseDocInput = objectType({
	content: stringType(),
	mimeType: stringType(),
	openrouterKey: stringType()
});
var parsePartnerDoc_createServerFn_handler = createServerRpc({
	id: "894cdef45ba3baf16c25d56b374103f7a0fbda3fa6ffcfdb43659163dbd63a90",
	name: "parsePartnerDoc",
	filename: "src/lib/ai.functions.ts"
}, (opts) => parsePartnerDoc.__executeServer(opts));
var parsePartnerDoc = createServerFn({ method: "POST" }).validator((d) => ParseDocInput.parse(d)).handler(parsePartnerDoc_createServerFn_handler, async ({ data }) => {
	if (!data.openrouterKey) return {
		sites: [],
		error: "OpenRouter API key not set in Settings."
	};
	const isImage = data.mimeType.startsWith("image/");
	const userContent = isImage ? [{
		type: "image_url",
		image_url: { url: `data:${data.mimeType};base64,${data.content}` }
	}, {
		type: "text",
		text: `You are an OOH (Out-of-Home) media expert. Extract all advertising sites from this image/document.
Return ONLY a JSON array (no markdown, no explanation):
[{"name":"site name","city":"city","format":"Hoarding|Unipole|Bus Shelter|Metro Panel|Mall Display|Transit|Digital","monthlyRent":number,"lat":number,"lng":number,"notes":"any extra info"}]
If lat/lng not visible, estimate from city name. If rent not visible, set 0. Extract ALL sites you see.`
	}] : `You are an OOH (Out-of-Home) media expert. Extract all advertising sites from this text document.
Return ONLY a JSON array (no markdown, no explanation):
[{"name":"site name","city":"city","format":"Hoarding|Unipole|Bus Shelter|Metro Panel|Mall Display|Transit|Digital","monthlyRent":number,"lat":number,"lng":number,"notes":"any extra info"}]
If lat/lng not visible, estimate from city name. If rent not visible, set 0. Extract ALL sites.

DOCUMENT TEXT:
${data.content}`;
	const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${data.openrouterKey}`,
			"HTTP-Referer": "https://atlas.bizex4u.com",
			"X-Title": "Atlas OOH"
		},
		body: JSON.stringify({
			model: isImage ? "qwen/qwen2.5-vl-72b-instruct:free" : "qwen/qwen2.5-72b-instruct:free",
			messages: [{
				role: "user",
				content: userContent
			}],
			max_tokens: 2e3,
			temperature: .1
		})
	});
	if (!res.ok) {
		const txt = await res.text().catch(() => "");
		return {
			sites: [],
			error: `OpenRouter error ${res.status}: ${txt.slice(0, 200)}`
		};
	}
	const raw = (await res.json()).choices?.[0]?.message?.content?.trim() || "[]";
	try {
		const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
		const sites = JSON.parse(cleaned);
		return {
			sites: Array.isArray(sites) ? sites : [],
			error: null
		};
	} catch {
		return {
			sites: [],
			error: "Could not parse AI response. Try again."
		};
	}
});
var TallyInput = objectType({
	host: stringType().default("http://localhost:9000"),
	type: enumType([
		"ping",
		"vouchers",
		"ledgers"
	]),
	fromDate: stringType().optional(),
	toDate: stringType().optional()
});
function tallyXml(body) {
	return `<ENVELOPE><HEADER><TALLYREQUEST>Export Data</TALLYREQUEST></HEADER><BODY>${body}</BODY></ENVELOPE>`;
}
var tallySync_createServerFn_handler = createServerRpc({
	id: "1c85cd4715670f0c13aba09b72f4966f1e52a03fcd3da823c4d499d6124fa180",
	name: "tallySync",
	filename: "src/lib/ai.functions.ts"
}, (opts) => tallySync.__executeServer(opts));
var tallySync = createServerFn({ method: "POST" }).validator((d) => TallyInput.parse(d)).handler(tallySync_createServerFn_handler, async ({ data }) => {
	const host = data.host || "http://localhost:9000";
	if (data.type === "ping") try {
		const r = await fetch(host, {
			method: "POST",
			headers: { "Content-Type": "text/xml" },
			body: tallyXml(`<EXPORTDATA><REQUESTDESC><REPORTNAME>List of Companies</REPORTNAME></REQUESTDESC></EXPORTDATA>`),
			signal: AbortSignal.timeout(4e3)
		});
		if (r.ok) return {
			ok: true,
			company: (await r.text()).match(/<BASICCOMPANYNAME[^>]*>([^<]+)<\/BASICCOMPANYNAME>/)?.[1] || "Connected"
		};
		return {
			ok: false,
			error: `Tally returned ${r.status}`
		};
	} catch (e) {
		return {
			ok: false,
			error: `Cannot reach Tally at ${host}. Is TallyPrime open?`
		};
	}
	if (data.type === "vouchers") {
		const xml = tallyXml(`<EXPORTDATA><REQUESTDESC><REPORTNAME>Voucher Register</REPORTNAME><STATICVARIABLES><SVEXPORTFORMAT>$$SysName:XML</SVEXPORTFORMAT><SVFROMDATE>${data.fromDate || (/* @__PURE__ */ new Date(Date.now() - 90 * 864e5)).toISOString().slice(0, 10).replace(/-/g, "")}</SVFROMDATE><SVTODATE>${data.toDate || (/* @__PURE__ */ new Date()).toISOString().slice(0, 10).replace(/-/g, "")}</SVTODATE></STATICVARIABLES></REQUESTDESC></EXPORTDATA>`);
		try {
			const r = await fetch(host, {
				method: "POST",
				headers: { "Content-Type": "text/xml" },
				body: xml,
				signal: AbortSignal.timeout(1e4)
			});
			if (!r.ok) return {
				ok: false,
				error: `Tally error ${r.status}`,
				vouchers: []
			};
			const text = await r.text();
			const vouchers = [];
			const re = /<VOUCHER[^>]*>([\s\S]*?)<\/VOUCHER>/g;
			let m;
			while ((m = re.exec(text)) !== null) {
				const v = m[1];
				const get = (tag) => v.match(new RegExp(`<${tag}[^>]*>([^<]*)<\/${tag}>`))?.[1]?.trim() || "";
				vouchers.push({
					number: get("VOUCHERNUMBER"),
					party: get("PARTYLEDGERNAME"),
					amount: parseFloat(get("AMOUNT") || "0"),
					date: get("DATE"),
					type: get("VOUCHERTYPENAME")
				});
			}
			return {
				ok: true,
				vouchers,
				error: null
			};
		} catch {
			return {
				ok: false,
				error: "Tally request timed out.",
				vouchers: []
			};
		}
	}
	return {
		ok: false,
		error: "Unknown type",
		vouchers: []
	};
});
var ChatInput = objectType({
	message: stringType().min(1),
	context: stringType().default(""),
	history: arrayType(objectType({
		role: enumType(["user", "assistant"]),
		content: stringType()
	})).default([])
});
var AreaAnalysisInput = objectType({
	lat: numberType(),
	lng: numberType(),
	places: arrayType(objectType({
		name: stringType(),
		category: stringType(),
		rating: numberType(),
		reviewCount: numberType(),
		priceLevel: numberType(),
		distance: numberType(),
		footfallScore: numberType()
	})),
	avgRating: stringType(),
	totalReviews: numberType(),
	oohScore: numberType(),
	secLabel: stringType()
});
var analyzeAreaWithGroq_createServerFn_handler = createServerRpc({
	id: "bd1093115cda05bd7a7a9d6bb9817fc0791febe8cfe4516db456bde0534d4cfe",
	name: "analyzeAreaWithGroq",
	filename: "src/lib/ai.functions.ts"
}, (opts) => analyzeAreaWithGroq.__executeServer(opts));
var analyzeAreaWithGroq = createServerFn({ method: "POST" }).validator((d) => AreaAnalysisInput.parse(d)).handler(analyzeAreaWithGroq_createServerFn_handler, async ({ data }) => {
	const key = process.env.GROQ_API_KEY;
	if (!key) return {
		analysis: null,
		error: "GROQ_API_KEY not set"
	};
	const topBusinesses = data.places.slice(0, 10).map((p) => `${p.name} (${p.category.replace(/_/g, " ")}, ${p.rating}★, ${p.reviewCount} reviews, ${p.distance}m away)`).join("\n");
	const prompt = `You are an OOH (Out-of-Home) advertising expert in India analyzing a location for billboard/hoarding placement.

LOCATION DATA:
- Coordinates: ${data.lat.toFixed(4)}, ${data.lng.toFixed(4)}
- OOH Score: ${data.oohScore}/100
- Avg business rating: ${data.avgRating}★
- Total reviews in area: ${data.totalReviews.toLocaleString("en-IN")}
- Estimated SEC: ${data.secLabel}

TOP BUSINESSES NEARBY:
${topBusinesses}

Provide a concise OOH intelligence report with these sections:
1. **Area Profile** (1-2 lines: what kind of area, vibe, time of day activity)
2. **Primary Audience** (SEC, age group, intent — commuter/shopper/resident)
3. **Best OOH Formats** for this location (e.g. Unipole, Bus Shelter, Hoarding)
4. **Top Brand Categories** that would benefit (list 4-5: FMCG, auto, fintech, etc.)
5. **Peak Visibility Hours** based on business types
6. **One-line pitch** for selling this location to an agency

Keep it punchy, India-specific, actionable. No fluff.`;
	const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${key}`
		},
		body: JSON.stringify({
			model: "llama-3.3-70b-versatile",
			messages: [{
				role: "user",
				content: prompt
			}],
			max_tokens: 600,
			temperature: .6
		})
	});
	if (!res.ok) return {
		analysis: null,
		error: `Groq error ${res.status}`
	};
	return {
		analysis: (await res.json()).choices?.[0]?.message?.content?.trim() || null,
		error: null
	};
});
var BrandInput = objectType({
	lat: numberType(),
	lng: numberType(),
	format: stringType(),
	city: stringType(),
	oohScore: numberType(),
	secLabel: stringType(),
	avgRating: numberType(),
	totalReviews: numberType(),
	nearbyCategories: arrayType(stringType()),
	generatePitch: booleanType().default(false)
});
var BRANDS = [
	{
		name: "Amul",
		category: "FMCG",
		logo: "🧈",
		sec: [
			"B",
			"C",
			"D"
		],
		formats: [
			"Hoarding",
			"Bus Shelter",
			"Transit"
		],
		audienceTriggers: [
			"supermarket",
			"school",
			"hospital"
		],
		cityTier: 3
	},
	{
		name: "Dabur",
		category: "FMCG",
		logo: "🌿",
		sec: ["B", "C"],
		formats: [
			"Hoarding",
			"Unipole",
			"Transit"
		],
		audienceTriggers: ["hospital", "supermarket"],
		cityTier: 3
	},
	{
		name: "HUL",
		category: "FMCG",
		logo: "🧴",
		sec: ["B", "C"],
		formats: [
			"Hoarding",
			"Bus Shelter",
			"Mall Display"
		],
		audienceTriggers: [
			"supermarket",
			"shopping_mall",
			"department_store"
		],
		cityTier: 3
	},
	{
		name: "Nestle",
		category: "FMCG",
		logo: "🍫",
		sec: ["A", "B"],
		formats: [
			"Mall Display",
			"Hoarding",
			"Digital"
		],
		audienceTriggers: [
			"shopping_mall",
			"supermarket",
			"school"
		],
		cityTier: 2
	},
	{
		name: "ITC",
		category: "FMCG",
		logo: "🏭",
		sec: ["B", "C"],
		formats: ["Hoarding", "Unipole"],
		audienceTriggers: [
			"supermarket",
			"restaurant",
			"bus_station"
		],
		cityTier: 3
	},
	{
		name: "Maruti Suzuki",
		category: "Auto",
		logo: "🚗",
		sec: ["B", "C"],
		formats: ["Hoarding", "Unipole"],
		audienceTriggers: [
			"bank",
			"gas_station",
			"shopping_mall"
		],
		cityTier: 3
	},
	{
		name: "Honda",
		category: "Auto",
		logo: "🏎️",
		sec: ["A", "B"],
		formats: [
			"Hoarding",
			"Unipole",
			"Digital"
		],
		audienceTriggers: [
			"bank",
			"gas_station",
			"university"
		],
		cityTier: 2
	},
	{
		name: "Hyundai",
		category: "Auto",
		logo: "🚙",
		sec: ["A", "B"],
		formats: ["Hoarding", "Unipole"],
		audienceTriggers: ["bank", "shopping_mall"],
		cityTier: 2
	},
	{
		name: "TVS / Hero",
		category: "Auto (2W)",
		logo: "🏍️",
		sec: ["C", "D"],
		formats: [
			"Hoarding",
			"Bus Shelter",
			"Transit"
		],
		audienceTriggers: [
			"school",
			"university",
			"bus_station"
		],
		cityTier: 3
	},
	{
		name: "Bajaj Auto",
		category: "Auto (2W)",
		logo: "🛵",
		sec: ["C", "D"],
		formats: [
			"Hoarding",
			"Transit",
			"Bus Shelter"
		],
		audienceTriggers: [
			"bus_station",
			"school",
			"gas_station"
		],
		cityTier: 3
	},
	{
		name: "Jio",
		category: "Telecom",
		logo: "📶",
		sec: [
			"B",
			"C",
			"D"
		],
		formats: [
			"Hoarding",
			"Bus Shelter",
			"Unipole",
			"Digital"
		],
		audienceTriggers: [
			"shopping_mall",
			"transit_station",
			"bus_station",
			"university"
		],
		cityTier: 3
	},
	{
		name: "Airtel",
		category: "Telecom",
		logo: "📡",
		sec: ["A", "B"],
		formats: [
			"Hoarding",
			"Unipole",
			"Digital"
		],
		audienceTriggers: [
			"shopping_mall",
			"transit_station",
			"university"
		],
		cityTier: 2
	},
	{
		name: "Vi",
		category: "Telecom",
		logo: "📱",
		sec: ["B", "C"],
		formats: ["Hoarding", "Bus Shelter"],
		audienceTriggers: [
			"transit_station",
			"bus_station",
			"shopping_mall"
		],
		cityTier: 3
	},
	{
		name: "PhonePe",
		category: "Fintech",
		logo: "💜",
		sec: [
			"B",
			"C",
			"D"
		],
		formats: [
			"Hoarding",
			"Bus Shelter",
			"Transit",
			"Digital"
		],
		audienceTriggers: [
			"bank",
			"atm",
			"supermarket",
			"restaurant",
			"bus_station"
		],
		cityTier: 3
	},
	{
		name: "Paytm",
		category: "Fintech",
		logo: "💙",
		sec: ["C", "D"],
		formats: [
			"Hoarding",
			"Bus Shelter",
			"Transit"
		],
		audienceTriggers: [
			"bank",
			"atm",
			"restaurant",
			"supermarket"
		],
		cityTier: 3
	},
	{
		name: "CRED",
		category: "Fintech",
		logo: "💳",
		sec: ["A"],
		formats: [
			"Hoarding",
			"Unipole",
			"Digital",
			"Mall Display"
		],
		audienceTriggers: [
			"bank",
			"shopping_mall",
			"restaurant",
			"amusement_park"
		],
		cityTier: 1
	},
	{
		name: "Groww / Zerodha",
		category: "Fintech",
		logo: "📈",
		sec: ["A", "B"],
		formats: [
			"Hoarding",
			"Digital",
			"Metro Panel"
		],
		audienceTriggers: [
			"bank",
			"university",
			"transit_station"
		],
		cityTier: 1
	},
	{
		name: "Godrej Properties",
		category: "Real Estate",
		logo: "🏗️",
		sec: ["A", "B"],
		formats: [
			"Hoarding",
			"Unipole",
			"Digital"
		],
		audienceTriggers: [
			"bank",
			"university",
			"transit_station",
			"shopping_mall"
		],
		cityTier: 1
	},
	{
		name: "Prestige / DLF",
		category: "Real Estate",
		logo: "🏢",
		sec: ["A"],
		formats: ["Hoarding", "Unipole"],
		audienceTriggers: [
			"bank",
			"hospital",
			"transit_station"
		],
		cityTier: 1
	},
	{
		name: "BYJU's / Allen",
		category: "Ed-Tech",
		logo: "📚",
		sec: ["B", "C"],
		formats: [
			"Hoarding",
			"Bus Shelter",
			"Unipole"
		],
		audienceTriggers: [
			"school",
			"university",
			"transit_station",
			"bus_station"
		],
		cityTier: 2
	},
	{
		name: "Aakash Institute",
		category: "Ed-Tech",
		logo: "🎓",
		sec: ["B", "C"],
		formats: ["Hoarding", "Bus Shelter"],
		audienceTriggers: ["school", "university"],
		cityTier: 2
	},
	{
		name: "Swiggy",
		category: "Food Delivery",
		logo: "🧡",
		sec: [
			"A",
			"B",
			"C"
		],
		formats: [
			"Hoarding",
			"Digital",
			"Metro Panel",
			"Bus Shelter"
		],
		audienceTriggers: [
			"restaurant",
			"cafe",
			"transit_station",
			"university",
			"shopping_mall"
		],
		cityTier: 2
	},
	{
		name: "Zomato",
		category: "Food Delivery",
		logo: "❤️",
		sec: [
			"A",
			"B",
			"C"
		],
		formats: [
			"Hoarding",
			"Digital",
			"Metro Panel"
		],
		audienceTriggers: [
			"restaurant",
			"cafe",
			"transit_station",
			"shopping_mall"
		],
		cityTier: 2
	},
	{
		name: "Domino's",
		category: "QSR",
		logo: "🍕",
		sec: ["B", "C"],
		formats: [
			"Hoarding",
			"Mall Display",
			"Bus Shelter"
		],
		audienceTriggers: [
			"shopping_mall",
			"school",
			"movie_theater"
		],
		cityTier: 2
	},
	{
		name: "McDonald's",
		category: "QSR",
		logo: "🍟",
		sec: ["B", "C"],
		formats: [
			"Mall Display",
			"Hoarding",
			"Digital"
		],
		audienceTriggers: [
			"shopping_mall",
			"movie_theater",
			"transit_station"
		],
		cityTier: 1
	},
	{
		name: "Apollo Hospitals",
		category: "Healthcare",
		logo: "🏥",
		sec: ["A", "B"],
		formats: [
			"Hoarding",
			"Unipole",
			"Digital"
		],
		audienceTriggers: ["hospital", "transit_station"],
		cityTier: 2
	},
	{
		name: "Cipla / Dr. Reddy's",
		category: "Pharma",
		logo: "💊",
		sec: ["B", "C"],
		formats: ["Hoarding", "Bus Shelter"],
		audienceTriggers: ["hospital", "supermarket"],
		cityTier: 3
	},
	{
		name: "LIC",
		category: "Insurance",
		logo: "🛡️",
		sec: [
			"B",
			"C",
			"D"
		],
		formats: [
			"Hoarding",
			"Unipole",
			"Bus Shelter"
		],
		audienceTriggers: [
			"bank",
			"transit_station",
			"bus_station"
		],
		cityTier: 3
	},
	{
		name: "HDFC Bank",
		category: "Banking",
		logo: "🏦",
		sec: ["A", "B"],
		formats: [
			"Hoarding",
			"Unipole",
			"Digital",
			"Metro Panel"
		],
		audienceTriggers: [
			"bank",
			"atm",
			"shopping_mall",
			"transit_station"
		],
		cityTier: 2
	},
	{
		name: "SBI",
		category: "Banking",
		logo: "🔵",
		sec: [
			"B",
			"C",
			"D"
		],
		formats: [
			"Hoarding",
			"Bus Shelter",
			"Unipole"
		],
		audienceTriggers: [
			"bank",
			"bus_station",
			"transit_station"
		],
		cityTier: 3
	},
	{
		name: "Reliance / JioMart",
		category: "Retail",
		logo: "🛒",
		sec: ["B", "C"],
		formats: [
			"Hoarding",
			"Mall Display",
			"Bus Shelter"
		],
		audienceTriggers: [
			"shopping_mall",
			"supermarket",
			"transit_station"
		],
		cityTier: 3
	},
	{
		name: "DMart",
		category: "Retail",
		logo: "🏪",
		sec: ["C", "D"],
		formats: [
			"Hoarding",
			"Unipole",
			"Bus Shelter"
		],
		audienceTriggers: [
			"supermarket",
			"bus_station",
			"school"
		],
		cityTier: 3
	},
	{
		name: "Amazon India",
		category: "E-Commerce",
		logo: "📦",
		sec: [
			"A",
			"B",
			"C"
		],
		formats: [
			"Hoarding",
			"Unipole",
			"Digital",
			"Metro Panel"
		],
		audienceTriggers: [
			"transit_station",
			"shopping_mall",
			"university",
			"bus_station"
		],
		cityTier: 2
	},
	{
		name: "Flipkart",
		category: "E-Commerce",
		logo: "🛍️",
		sec: ["B", "C"],
		formats: [
			"Hoarding",
			"Unipole",
			"Bus Shelter"
		],
		audienceTriggers: [
			"transit_station",
			"bus_station",
			"shopping_mall"
		],
		cityTier: 2
	},
	{
		name: "Netflix / Hotstar",
		category: "OTT",
		logo: "🎬",
		sec: ["A", "B"],
		formats: [
			"Digital",
			"Metro Panel",
			"Mall Display",
			"Hoarding"
		],
		audienceTriggers: [
			"movie_theater",
			"shopping_mall",
			"amusement_park",
			"transit_station"
		],
		cityTier: 1
	},
	{
		name: "Nykaa",
		category: "Beauty",
		logo: "💄",
		sec: ["A", "B"],
		formats: [
			"Mall Display",
			"Digital",
			"Hoarding"
		],
		audienceTriggers: [
			"shopping_mall",
			"university",
			"movie_theater"
		],
		cityTier: 1
	},
	{
		name: "Mamaearth",
		category: "Beauty",
		logo: "🌱",
		sec: ["B", "C"],
		formats: [
			"Hoarding",
			"Mall Display",
			"Bus Shelter"
		],
		audienceTriggers: [
			"shopping_mall",
			"supermarket",
			"hospital"
		],
		cityTier: 2
	}
];
var SEC_ORDER = [
	"A",
	"B",
	"C",
	"D"
];
function scoreBrand(brand, input) {
	const secIdx = SEC_ORDER.indexOf(input.secLabel);
	const secFit = brand.sec.includes(input.secLabel) ? 30 : brand.sec.some((s) => Math.abs(SEC_ORDER.indexOf(s) - secIdx) === 1) ? 15 : 0;
	const formatFit = brand.formats.includes(input.format) ? 25 : 0;
	const footfallFit = Math.round(input.oohScore / 100 * 20);
	const matched = brand.audienceTriggers.filter((trigger) => input.nearbyCategories.some((cat) => cat.includes(trigger) || trigger.includes(cat.split(" ")[0]))).length;
	const audienceFit = Math.min(25, Math.round(matched / Math.max(brand.audienceTriggers.length, 1) * 25));
	return {
		brand: brand.name,
		category: brand.category,
		logo: brand.logo,
		score: secFit + formatFit + footfallFit + audienceFit,
		secFit,
		formatFit,
		footfallFit,
		audienceFit
	};
}
var recommendBrands_createServerFn_handler = createServerRpc({
	id: "3c4fbc25dadd607fae2c9e0805dba505aad4acc75c804c1b8257a29da1291ea4",
	name: "recommendBrands",
	filename: "src/lib/ai.functions.ts"
}, (opts) => recommendBrands.__executeServer(opts));
var recommendBrands = createServerFn({ method: "POST" }).validator((d) => BrandInput.parse(d)).handler(recommendBrands_createServerFn_handler, async ({ data }) => {
	const scored = BRANDS.map((b) => ({
		...scoreBrand(b, data),
		pitch: null
	})).sort((a, b) => b.score - a.score).slice(0, 12);
	if (!data.generatePitch) return {
		brands: scored,
		error: null
	};
	const key = process.env.GROQ_API_KEY;
	if (!key) return {
		brands: scored,
		error: "GROQ_API_KEY not set"
	};
	const top5 = scored.slice(0, 5).map((b) => `${b.logo} ${b.brand} (${b.category}, score ${b.score}/100)`).join("\n");
	const prompt = `You are an OOH advertising sales expert in India.

SITE: ${data.city} | Format: ${data.format} | OOH Score: ${data.oohScore}/100 | SEC: ${data.secLabel}
Avg nearby rating: ${data.avgRating.toFixed(1)}★ | Total reviews: ${data.totalReviews.toLocaleString("en-IN")}

TOP BRAND MATCHES:
${top5}

Write ONE punchy agency-ready pitch paragraph (4-5 sentences). Open with why this location is powerful, name 2-3 specific brand opportunities with brief rationale, end with a compelling close for the media buyer. India-specific, data-driven, no fluff, no markdown.`;
	const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${key}`
		},
		body: JSON.stringify({
			model: "llama-3.3-70b-versatile",
			messages: [{
				role: "user",
				content: prompt
			}],
			max_tokens: 300,
			temperature: .65
		})
	});
	const pitchText = res.ok ? (await res.json()).choices?.[0]?.message?.content?.trim() || null : null;
	return {
		brands: scored.map((b, i) => ({
			...b,
			pitch: i === 0 ? pitchText : null
		})),
		error: null
	};
});
var CampaignInput = objectType({
	brand: stringType(),
	category: stringType(),
	budget: numberType(),
	durationMonths: numberType().default(1),
	cities: arrayType(stringType()),
	objective: stringType().default(""),
	audience: stringType().default(""),
	preferredFormats: arrayType(stringType()).default([]),
	sites: arrayType(objectType({
		id: stringType(),
		name: stringType(),
		city: stringType(),
		format: stringType(),
		monthlyRent: numberType(),
		status: stringType(),
		notes: stringType().default("")
	}))
});
var planCampaign_createServerFn_handler = createServerRpc({
	id: "7d3cbf92f1bfc752cc090aad5382d190e5ab024ca2f5e3e8a57c265122a6b5eb",
	name: "planCampaign",
	filename: "src/lib/ai.functions.ts"
}, (opts) => planCampaign.__executeServer(opts));
var planCampaign = createServerFn({ method: "POST" }).validator((d) => CampaignInput.parse(d)).handler(planCampaign_createServerFn_handler, async ({ data }) => {
	const cityset = data.cities.map((c) => c.toLowerCase().trim());
	const fmtset = data.preferredFormats.map((f) => f.toLowerCase());
	const scored = data.sites.map((s) => {
		const cityFit = cityset.some((c) => s.city.toLowerCase().includes(c) || c.includes(s.city.toLowerCase())) ? 40 : 0;
		const formatFit = fmtset.length === 0 ? 15 : fmtset.includes(s.format.toLowerCase()) ? 25 : 0;
		const availFit = s.status === "free" ? 20 : s.status === "expired" ? 12 : 0;
		const cost = s.monthlyRent * data.durationMonths;
		const budgetFit = cost > 0 && cost <= data.budget ? 15 : cost === 0 ? 5 : 0;
		return {
			...s,
			score: cityFit + formatFit + availFit + budgetFit,
			cost,
			cityFit,
			formatFit,
			availFit,
			budgetFit
		};
	}).filter((s) => s.score > 0).sort((a, b) => b.score - a.score);
	let remaining = data.budget;
	const plan = scored.map((s) => {
		const fits = s.cost > 0 && s.cost <= remaining;
		if (fits) remaining -= s.cost;
		return {
			...s,
			inPlan: fits
		};
	});
	const planSites = plan.filter((p) => p.inPlan);
	const totalCost = planSites.reduce((a, p) => a + p.cost, 0);
	let rationale = null;
	const key = process.env.GROQ_API_KEY;
	if (key && planSites.length > 0) {
		const summary = planSites.slice(0, 12).map((p) => `${p.name} (${p.city}, ${p.format}, ₹${p.cost.toLocaleString("en-IN")}/${data.durationMonths}mo, score ${p.score})`).join("\n");
		const prompt = `You are a senior OOH media planner in India. Campaign brief:
Brand: ${data.brand} (${data.category}) | Budget: ₹${data.budget.toLocaleString("en-IN")} | Duration: ${data.durationMonths} months
Cities: ${data.cities.join(", ")} | Objective: ${data.objective || "brand awareness"} | Audience: ${data.audience || "general"}

RECOMMENDED PLAN (${planSites.length} sites, total ₹${totalCost.toLocaleString("en-IN")}):
${summary}

Write a concise media plan rationale (4-6 sentences): why this mix works for the brand, coverage logic, one risk/gap to flag, and expected impact. India-specific, no fluff, no markdown headers.`;
		const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${key}`
			},
			body: JSON.stringify({
				model: "llama-3.3-70b-versatile",
				messages: [{
					role: "user",
					content: prompt
				}],
				max_tokens: 400,
				temperature: .5
			})
		});
		if (res.ok) rationale = (await res.json()).choices?.[0]?.message?.content?.trim() || null;
	}
	return {
		plan,
		totalCost,
		remaining,
		rationale,
		error: null
	};
});
var ProposalInput = objectType({
	brand: stringType(),
	category: stringType(),
	objective: stringType().default(""),
	durationMonths: numberType().default(1),
	sites: arrayType(objectType({
		name: stringType(),
		city: stringType(),
		format: stringType(),
		monthlyRent: numberType(),
		notes: stringType().default("")
	}))
});
var generateProposalCopy_createServerFn_handler = createServerRpc({
	id: "48d39d8daed11434782d5c8c32d67e24353c688883ae033ea3a35a518c2bf1ca",
	name: "generateProposalCopy",
	filename: "src/lib/ai.functions.ts"
}, (opts) => generateProposalCopy.__executeServer(opts));
var generateProposalCopy = createServerFn({ method: "POST" }).validator((d) => ProposalInput.parse(d)).handler(generateProposalCopy_createServerFn_handler, async ({ data }) => {
	const key = process.env.GROQ_API_KEY;
	if (!key) return {
		intro: null,
		siteBlurbs: [],
		closing: null,
		error: "GROQ_API_KEY not set"
	};
	const siteList = data.sites.map((s, i) => `${i + 1}. ${s.name} — ${s.city}, ${s.format}, ₹${s.monthlyRent.toLocaleString("en-IN")}/mo${s.notes ? ` (${s.notes.slice(0, 80)})` : ""}`).join("\n");
	const prompt = `You are writing an OOH media proposal for BIZEX4U (media agency, Lucknow, India) to pitch ${data.brand} (${data.category}).
Objective: ${data.objective || "brand visibility"}. Duration: ${data.durationMonths} months.

SITES IN PROPOSAL:
${siteList}

Return ONLY JSON, no markdown:
{"intro":"2-3 sentence opening paragraph addressed to the brand — why this plan fits them","siteBlurbs":["one punchy sentence per site, same order as list, selling that specific location"],"closing":"1-2 sentence close with call to action"}`;
	const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${key}`
		},
		body: JSON.stringify({
			model: "llama-3.3-70b-versatile",
			messages: [{
				role: "user",
				content: prompt
			}],
			max_tokens: 900,
			temperature: .6
		})
	});
	if (!res.ok) return {
		intro: null,
		siteBlurbs: [],
		closing: null,
		error: `Groq error ${res.status}`
	};
	const raw = (await res.json()).choices?.[0]?.message?.content?.trim() || "{}";
	try {
		const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
		const start = cleaned.indexOf("{");
		const end = cleaned.lastIndexOf("}");
		const parsed = JSON.parse(cleaned.slice(start, end + 1));
		return {
			intro: parsed.intro || null,
			siteBlurbs: parsed.siteBlurbs || [],
			closing: parsed.closing || null,
			error: null
		};
	} catch {
		return {
			intro: null,
			siteBlurbs: [],
			closing: null,
			error: "Could not parse AI response"
		};
	}
});
var IntelInput = objectType({
	city: stringType(),
	dealHistory: arrayType(objectType({
		brand: stringType(),
		category: stringType(),
		stage: stringType(),
		value: numberType()
	})).default([])
});
var marketIntel_createServerFn_handler = createServerRpc({
	id: "8059a34720fdf7d6e3ab0cbc0fe7d6a85cd668e927532fc614c1e7d2c0c0b8a7",
	name: "marketIntel",
	filename: "src/lib/ai.functions.ts"
}, (opts) => marketIntel.__executeServer(opts));
var marketIntel = createServerFn({ method: "POST" }).validator((d) => IntelInput.parse(d)).handler(marketIntel_createServerFn_handler, async ({ data }) => {
	const key = process.env.GROQ_API_KEY;
	if (!key) return {
		report: null,
		error: "GROQ_API_KEY not set"
	};
	const history = data.dealHistory.length ? `MY PIPELINE HISTORY:\n${data.dealHistory.map((d2) => `${d2.brand} (${d2.category}) — ${d2.stage}, ₹${d2.value.toLocaleString("en-IN")}`).join("\n")}` : "No pipeline history yet.";
	const month = (/* @__PURE__ */ new Date()).toLocaleString("en-IN", {
		month: "long",
		year: "numeric",
		timeZone: "Asia/Kolkata"
	});
	const prompt = `You are an OOH market intelligence analyst for a traditional media agency in ${data.city}, India. Current month: ${month}.

${history}

Produce a prospecting intelligence report with these sections (use these exact headings, markdown ## format):
## Active Spender Categories
Which brand categories typically spend heavily on OOH/print/radio in ${data.city} this season (festivals, weather, academic calendar, elections if relevant). 4-5 categories with one-line why.
## Hot Prospects This Month
8-10 specific brand names (mix of national + regional brands active in Uttar Pradesh / ${data.city} market) worth cold-calling now, each with one-line hook.
## Seasonal Angle
What's coming in next 60 days (festivals, events, seasons) that brands will want media for. Be specific to ${data.city}/UP.
## Gap in My Pipeline
Compare my history above against active categories — which high-spending category am I missing.
IMPORTANT: These are analytical estimates based on market patterns, not verified spend data. Keep it punchy and actionable.`;
	const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${key}`
		},
		body: JSON.stringify({
			model: "llama-3.3-70b-versatile",
			messages: [{
				role: "user",
				content: prompt
			}],
			max_tokens: 1200,
			temperature: .6
		})
	});
	if (!res.ok) return {
		report: null,
		error: `Groq error ${res.status}`
	};
	return {
		report: (await res.json()).choices?.[0]?.message?.content?.trim() || null,
		error: null
	};
});
var MediaPlanInput = objectType({
	brand: stringType(),
	category: stringType().default(""),
	cities: arrayType(stringType()),
	budget: numberType().default(0),
	durationMonths: numberType().default(1),
	objective: stringType().default(""),
	audience: stringType().default("")
});
var mediaPlan_createServerFn_handler = createServerRpc({
	id: "e418414ba486cc031b9ba90f2707f51d6253950b14c3228913946f534068a214",
	name: "mediaPlan",
	filename: "src/lib/ai.functions.ts"
}, (opts) => mediaPlan.__executeServer(opts));
var mediaPlan = createServerFn({ method: "POST" }).validator((d) => MediaPlanInput.parse(d)).handler(mediaPlan_createServerFn_handler, async ({ data }) => {
	const key = process.env.GROQ_API_KEY;
	if (!key) return {
		plan: null,
		error: "GROQ_API_KEY not set"
	};
	const cityList = data.cities.join(", ");
	const budgetLine = data.budget > 0 ? `Budget: ₹${data.budget.toLocaleString("en-IN")} for ${data.durationMonths} month(s).` : "Budget: not specified — suggest a sensible range.";
	const prompt = `You are a senior traditional-media planner at BIZEX4U, a media agency in India. A brand has approached us to advertise. Build a practical, city-specific media plan across ALL traditional channels we can sell.

BRAND: ${data.brand}${data.category ? ` (${data.category})` : ""}
TARGET CITIES: ${cityList}
${budgetLine}
Objective: ${data.objective || "brand awareness + reach"}
Audience: ${data.audience || "infer from the brand"}

Return ONLY valid JSON, no markdown, in EXACTLY this shape:
{
  "brandSnapshot": "2-3 sentences: what ${data.brand} sells, positioning, who buys it",
  "audience": "1-2 sentences: the real target audience in ${cityList} (SEC, age, intent)",
  "channels": [
    {
      "channel": "e.g. OOH — Hoardings & Unipoles | Newspaper — Regional | Radio | Cinema | Transit (Bus/Auto) | DOOH & Digital Screens | Society/Mall Branding | Events & Activation",
      "fit": "High | Medium | Low",
      "why": "1-2 sentences why this channel fits ${data.brand} in ${cityList}",
      "specifics": "REAL India specifics for ${cityList}: name actual newspapers (e.g. Dainik Jagran, Amar Ujala, Hindustan, Times of India), radio stations (Radio Mirchi 98.3, Red FM 93.5, BIG FM 92.7), key OOH localities/landmarks, cinema chains (PVR/INOX), transit routes",
      "estCostBand": "rough India monthly cost band in ₹ (label as estimate)",
      "budgetPct": number 0-100
    }
  ],
  "cityHotspots": ["5-8 specific high-visibility localities/landmarks in ${cityList} for OOH placement"],
  "pitch": "One punchy 4-5 sentence pitch paragraph addressed to ${data.brand} to win this deal — India-specific, confident, no fluff",
  "nextSteps": ["3-4 concrete next actions to close the deal, e.g. share site photos for X, confirm availability, send costing"]
}

Rank channels best-fit first. budgetPct across channels should sum to ~100. Be specific to the named cities — no generic filler. All costs are agency estimates.`;
	const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${key}`
		},
		body: JSON.stringify({
			model: "llama-3.3-70b-versatile",
			messages: [{
				role: "user",
				content: prompt
			}],
			max_tokens: 2200,
			temperature: .55,
			response_format: { type: "json_object" }
		})
	});
	if (!res.ok) {
		const txt = await res.text().catch(() => "");
		return {
			plan: null,
			error: `Groq error ${res.status}: ${txt.slice(0, 160)}`
		};
	}
	const raw = (await res.json()).choices?.[0]?.message?.content?.trim() || "{}";
	try {
		const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
		const start = cleaned.indexOf("{");
		const end = cleaned.lastIndexOf("}");
		const parsed = JSON.parse(cleaned.slice(start, end + 1));
		parsed.channels = (parsed.channels || []).map((c) => ({
			channel: String(c.channel || "Channel"),
			fit: [
				"High",
				"Medium",
				"Low"
			].includes(c.fit) ? c.fit : "Medium",
			why: String(c.why || ""),
			specifics: String(c.specifics || ""),
			estCostBand: String(c.estCostBand || "—"),
			budgetPct: Number(c.budgetPct) || 0
		}));
		parsed.cityHotspots = parsed.cityHotspots || [];
		parsed.nextSteps = parsed.nextSteps || [];
		return {
			plan: parsed,
			error: null
		};
	} catch {
		return {
			plan: null,
			error: "Could not parse AI plan. Retry."
		};
	}
});
var RSS_FEEDS = [
	{
		url: "https://inc42.com/feed/",
		source: "Inc42"
	},
	{
		url: "https://yourstory.com/feed",
		source: "YourStory"
	},
	{
		url: "https://brandequity.economictimes.indiatimes.com/rss/topstories",
		source: "ET BrandEquity"
	},
	{
		url: "https://retail.economictimes.indiatimes.com/rss/topstories",
		source: "ET Retail"
	},
	{
		url: "https://news.google.com/rss/search?q=India+D2C+brand+(launch+OR+funding+OR+expansion)&hl=en-IN&gl=IN&ceid=IN:en",
		source: "Google News"
	},
	{
		url: "https://news.google.com/rss/search?q=India+consumer+brand+(marketing+campaign+OR+CMO+OR+retail+stores)&hl=en-IN&gl=IN&ceid=IN:en",
		source: "Google News"
	}
];
var TAM_KEYWORDS = [
	"launch",
	"launches",
	"unveil",
	"raises",
	"funding",
	"series ",
	"d2c",
	"fmcg",
	"brand",
	"retail",
	"store",
	"stores",
	"expansion",
	"expands",
	"marketing",
	"campaign",
	"cmo",
	"advertising",
	"festive",
	"consumer",
	"electronics",
	"appliance",
	"wearable",
	"beverage",
	"food",
	"apparel",
	"beauty",
	"skincare",
	"smartwatch",
	"quick commerce",
	"ecommerce",
	"e-commerce",
	"offline"
];
var TAM_EXCLUDE = [
	"crypto",
	"layoff",
	"lawsuit",
	"ipo listing gain",
	"stock market today",
	"sensex",
	"nifty"
];
function stripCdata(s) {
	return s.replace(/<!\[CDATA\[/g, "").replace(/\]\]>/g, "").replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&#39;|&apos;/g, "'").replace(/&quot;/g, "\"").trim();
}
async function fetchFeed(feed) {
	try {
		const res = await fetch(feed.url, {
			headers: { "User-Agent": "Mozilla/5.0 (AtlasBriefing/1.0)" },
			signal: AbortSignal.timeout(6e3)
		});
		if (!res.ok) return [];
		const xml = await res.text();
		const items = [];
		const re = /<item>([\s\S]*?)<\/item>/g;
		let m;
		while ((m = re.exec(xml)) !== null && items.length < 25) {
			const block = m[1];
			const title = stripCdata(block.match(/<title>([\s\S]*?)<\/title>/)?.[1] || "");
			const link = stripCdata(block.match(/<link>([\s\S]*?)<\/link>/)?.[1] || "");
			const pub = stripCdata(block.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1] || "");
			const srcTag = stripCdata(block.match(/<source[^>]*>([\s\S]*?)<\/source>/)?.[1] || "");
			if (!title || !link) continue;
			items.push({
				title,
				url: link,
				source: srcTag || feed.source,
				publishedAt: pub
			});
		}
		return items;
	} catch {
		return [];
	}
}
async function fetchTamNews(maxItems = 35) {
	const all = (await Promise.all(RSS_FEEDS.map(fetchFeed))).flat();
	const cutoff = Date.now() - 168 * 3600 * 1e3;
	const seen = /* @__PURE__ */ new Set();
	const filtered = all.filter((n) => {
		const t = n.title.toLowerCase();
		if (seen.has(t.slice(0, 60))) return false;
		seen.add(t.slice(0, 60));
		if (TAM_EXCLUDE.some((k) => t.includes(k))) return false;
		if (!TAM_KEYWORDS.some((k) => t.includes(k))) return false;
		const ts = Date.parse(n.publishedAt);
		if (!Number.isNaN(ts) && ts < cutoff) return false;
		return true;
	});
	filtered.sort((a, b) => (Date.parse(b.publishedAt) || 0) - (Date.parse(a.publishedAt) || 0));
	return filtered.slice(0, maxItems);
}
async function fetchBrandNews(brand, maxItems = 12) {
	const items = await fetchFeed({
		url: `https://news.google.com/rss/search?q=${encodeURIComponent(`"${brand}" India`)}&hl=en-IN&gl=IN&ceid=IN:en`,
		source: "Google News"
	});
	const cutoff = Date.now() - 720 * 3600 * 1e3;
	return items.filter((n) => Number.isNaN(Date.parse(n.publishedAt)) || Date.parse(n.publishedAt) >= cutoff).slice(0, maxItems);
}
var IntelReportInput = objectType({
	brand: stringType(),
	city: stringType(),
	objective: stringType().default(""),
	audience: stringType().default(""),
	budget: numberType().default(0),
	category: stringType().default("")
});
async function groqJSON(key, prompt, maxTokens) {
	const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${key}`
		},
		body: JSON.stringify({
			model: "llama-3.3-70b-versatile",
			messages: [{
				role: "user",
				content: prompt
			}],
			max_tokens: maxTokens,
			temperature: .5,
			response_format: { type: "json_object" }
		})
	});
	if (!res.ok) return null;
	const raw = (await res.json()).choices?.[0]?.message?.content?.trim() || "{}";
	try {
		const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
		return JSON.parse(cleaned.slice(cleaned.indexOf("{"), cleaned.lastIndexOf("}") + 1));
	} catch {
		return null;
	}
}
var brandCityIntel_createServerFn_handler = createServerRpc({
	id: "9f44a17e2a098ad98e4f3c7a5bea32688106ce78fb039f844ead009ed121096f",
	name: "brandCityIntel",
	filename: "src/lib/ai.functions.ts"
}, (opts) => brandCityIntel.__executeServer(opts));
var brandCityIntel = createServerFn({ method: "POST" }).validator((d) => IntelReportInput.parse(d)).handler(brandCityIntel_createServerFn_handler, async ({ data }) => {
	const key = process.env.GROQ_API_KEY;
	if (!key) return {
		report: null,
		error: "GROQ_API_KEY not set"
	};
	const news = await fetchBrandNews(data.brand, 12);
	const newsBlock = news.length ? news.map((n, i) => `[${i}] ${n.title} (${n.source}, ${n.publishedAt.slice(0, 16)})`).join("\n") : "none found";
	const ctx = `BRAND: ${data.brand}${data.category ? ` (${data.category})` : ""} | CITY: ${data.city}, India
${data.objective ? `Objective: ${data.objective}. ` : ""}${data.audience ? `Audience: ${data.audience}. ` : ""}${data.budget > 0 ? `Budget: ₹${data.budget.toLocaleString("en-IN")}. ` : ""}
You are a senior media planner + brand strategist + location intelligence analyst at BIZEX4U, an Indian OOH/media-barter agency. Never output raw data — always reason like a consultant. Every claim should carry WHY.`;
	const promptA = `${ctx}

REAL RECENT HEADLINES about ${data.brand} (last 30 days):
${newsBlock}

Return ONLY valid JSON:
{
  "profile": {
    "businessModel": "1-2 sentences",
    "targetAudience": "who buys, SEC, age, intent",
    "purchaseBehaviour": "how/when customers buy (impulse vs planned, time-of-day peaks)",
    "marketingStyle": "how this brand markets today",
    "expansion": "current expansion strategy incl. dark stores/warehouses/retail footprint if relevant",
    "competitors": ["3-5 direct competitors in India"],
    "seasonality": "seasonal demand pattern",
    "oohUseCases": ["3-5 ideal OOH use cases for this brand"]
  },
  "signals": [4-6 items: {"signal": "the event/pattern", "meaning": "what it MEANS commercially for approaching them now", "sourceIdx": headline index or null}],
  "campaign": {
    "mediaMix": [{"format": "e.g. Digital OOH screens", "zones": "where in ${data.city}", "share": "e.g. 30%"}] (4-6 rows),
    "estReach": "estimated monthly reach band",
    "frequency": "expected exposure frequency",
    "duration": "ideal campaign duration + why",
    "barterValue": "suggested barter deal band in ₹",
    "inventoryFit": "what inventory they'd trade and how liquid it is for us",
    "likelihood": 0-100,
    "pitchAngle": "the ONE angle to lead with",
    "whyBizex4u": "2-3 sentences: why BIZEX4U specifically, cash-preservation barter framing",
    "outreach": "4-5 sentence personalised outreach summary to send the brand — references their real moment, the city opportunity, ends with CTA"
  }
}`;
	const promptB = `${ctx}

Return ONLY valid JSON with REAL ${data.city} geography (real localities, real pincodes, approximate but plausible lat/lng coordinates):
{
  "cityOverview": "3-4 sentences: ${data.city} for this brand — population character, income, commercial zones, growth corridors, why it matters for ${data.brand}",
  "pincodes": [6-8 highest-opportunity REAL ${data.city} pincodes: {
    "pincode": "e.g. 226010",
    "area": "locality name",
    "lat": number, "lng": number,
    "score": 0-100 demand score,
    "reasons": ["3-5 short reasons: apartment density, IT employees, students, affluence, ordering behaviour"],
    "profile": "one line: who lives/works here"
  }] sorted by score desc,
  "zones": [6-9 specific advertising zones (real landmarks: stations, IT parks, universities, markets, malls, junctions): {
    "name": "real place name",
    "kind": "Railway Station|Metro|IT Park|University|Market|Mall|Junction|Residential Cluster|Highway",
    "lat": number, "lng": number,
    "whyPeople": "human behaviour: who is here, what state of mind, why they'd act on ${data.brand}'s message",
    "media": ["2-4 recommended OOH formats for this exact spot"],
    "reasoning": "3-4 sentence senior-media-planner paragraph: why ${data.brand} should advertise HERE — connect the location's flows to purchase moments. Never say just 'high traffic'.",
    "confidence": 0-100
  }]
}`;
	const [a, b] = await Promise.all([groqJSON(key, promptA, 2600), groqJSON(key, promptB, 3600)]);
	if (!a || !b) return {
		report: null,
		error: "AI analysis failed — retry"
	};
	try {
		const signals = (a.signals || []).map((s) => {
			const n = s.sourceIdx != null ? news[Number(s.sourceIdx)] : void 0;
			return {
				signal: s.signal,
				meaning: s.meaning,
				source: n ? {
					title: n.title,
					url: n.url,
					source: n.source
				} : void 0
			};
		});
		const campaign = a.campaign;
		campaign.likelihood = Math.min(100, Math.max(0, Number(campaign.likelihood) || 50));
		return {
			report: {
				profile: a.profile,
				signals,
				cityOverview: String(b.cityOverview || ""),
				pincodes: (b.pincodes || []).map((p) => ({
					...p,
					lat: Number(p.lat) || 0,
					lng: Number(p.lng) || 0,
					score: Math.min(100, Math.max(0, Number(p.score) || 0)),
					reasons: p.reasons || []
				})).sort((x, y) => y.score - x.score),
				zones: (b.zones || []).map((z) => ({
					...z,
					lat: Number(z.lat) || 0,
					lng: Number(z.lng) || 0,
					media: z.media || [],
					confidence: Math.min(100, Math.max(0, Number(z.confidence) || 60))
				})),
				campaign,
				newsCount: news.length
			},
			error: null
		};
	} catch {
		return {
			report: null,
			error: "Could not assemble report. Retry."
		};
	}
});
var ServiceabilityInput = objectType({ points: arrayType(objectType({
	pincode: stringType(),
	lat: numberType(),
	lng: numberType()
})).max(10) });
var checkServiceability_createServerFn_handler = createServerRpc({
	id: "e2e961f6cf6fb7598764e216f70b73059c0f9d988b8253f5ab15e3d512d03f4c",
	name: "checkServiceability",
	filename: "src/lib/ai.functions.ts"
}, (opts) => checkServiceability.__executeServer(opts));
var checkServiceability = createServerFn({ method: "POST" }).validator((d) => ServiceabilityInput.parse(d)).handler(checkServiceability_createServerFn_handler, async ({ data }) => {
	return {
		results: await Promise.all(data.points.map(async (p) => {
			try {
				const res = await fetch(`https://www.swiggy.com/dapi/restaurants/list/v5?lat=${p.lat}&lng=${p.lng}&page_type=DESKTOP_WEB_LISTING`, {
					headers: { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)" },
					signal: AbortSignal.timeout(7e3)
				});
				if (!res.ok) return {
					pincode: p.pincode,
					swiggy: "unknown"
				};
				const txt = await res.text();
				if (txt.includes("swiggy_not_present")) return {
					pincode: p.pincode,
					swiggy: "not_serviceable"
				};
				if (txt.includes("\"serviceability\":\"SERVICEABLE\"") || txt.includes("\"statusMessage\":\"done successfully\"")) return {
					pincode: p.pincode,
					swiggy: "serviceable"
				};
				return {
					pincode: p.pincode,
					swiggy: "unknown"
				};
			} catch {
				return {
					pincode: p.pincode,
					swiggy: "unknown"
				};
			}
		})),
		error: null
	};
});
var CityFitInput = objectType({
	brand: stringType(),
	cities: arrayType(stringType()).max(120)
});
var cityFitRank_createServerFn_handler = createServerRpc({
	id: "1895ce02c84c2784a1a461b8cd3b1e46886fb45299159902cf2012b61ec3df6e",
	name: "cityFitRank",
	filename: "src/lib/ai.functions.ts"
}, (opts) => cityFitRank.__executeServer(opts));
var cityFitRank = createServerFn({ method: "POST" }).validator((d) => CityFitInput.parse(d)).handler(cityFitRank_createServerFn_handler, async ({ data }) => {
	const key = process.env.GROQ_API_KEY;
	if (!key) return {
		fits: null,
		error: "GROQ_API_KEY not set"
	};
	const out = await groqJSON(key, `You are a national media planner at BIZEX4U (Indian media-barter agency). For the brand "${data.brand}", rank the 10 BEST target cities from this list for an advertising/barter campaign, considering the brand's category, audience concentration, category adoption, competition intensity, and expansion logic:

${data.cities.join(", ")}

Return ONLY valid JSON:
{"fits": [{"city": "city name exactly as given", "score": 0-100, "why": "one sharp line: why this city for ${data.brand}"}]}
Ranked best first, exactly 10 items.`, 1200);
	if (!out) return {
		fits: null,
		error: "Ranking failed"
	};
	return {
		fits: (out.fits || []).map((f) => ({
			city: String(f.city),
			score: Math.min(100, Math.max(0, Number(f.score) || 0)),
			why: String(f.why)
		})),
		error: null
	};
});
var BriefingInput = objectType({
	date: stringType(),
	focusCities: arrayType(stringType()).default([
		"Lucknow",
		"Kanpur",
		"Delhi NCR"
	]),
	existingBrands: arrayType(stringType()).default([]),
	wonCategories: arrayType(stringType()).default([]),
	count: numberType().min(4).max(12).default(8)
});
var dailyBriefing_createServerFn_handler = createServerRpc({
	id: "1930d6f94e95b9d105f206515fa06e477a2112d57973226e900f44b99756f8cc",
	name: "dailyBriefing",
	filename: "src/lib/ai.functions.ts"
}, (opts) => dailyBriefing.__executeServer(opts));
var dailyBriefing = createServerFn({ method: "POST" }).validator((d) => BriefingInput.parse(d)).handler(dailyBriefing_createServerFn_handler, async ({ data }) => {
	const key = process.env.GROQ_API_KEY;
	if (!key) return {
		briefing: null,
		error: "GROQ_API_KEY not set"
	};
	const dateLabel = (/* @__PURE__ */ new Date(data.date + "T09:00:00+05:30")).toLocaleDateString("en-IN", {
		weekday: "long",
		day: "numeric",
		month: "long",
		year: "numeric"
	});
	const exclude = data.existingBrands.slice(0, 120).join(", ") || "none";
	const news = await fetchTamNews(35);
	const newsBlock = news.length ? news.map((n, i) => `[${i}] ${n.title} (${n.source})`).join("\n") : "none available";
	const prompt = `You are the AI Chief Growth Officer of BIZEX4U — an Indian media-barter agency (HQ Lucknow). We trade advertising (OOH hoardings, metro/transit, cinema, FM radio, print, DOOH, mall & society media, events) in exchange for brands' product inventory, helping brands preserve cash while scaling awareness.

Today: ${dateLabel}. Focus markets: ${data.focusCities.join(", ")} + national brands.
Already in our pipeline (EXCLUDE these): ${exclude}
Categories we closed before (prefer similar): ${data.wonCategories.join(", ") || "consumer electronics, FMCG, D2C"}

REAL NEWS HEADLINES from the last 7 days (Inc42, YourStory, ET BrandEquity, ET Retail, Google News), each with an index:
${newsBlock}

Produce today's opportunity briefing: the ${data.count} Indian consumer brands most worth approaching TODAY for a barter deal.
PRIORITIZE opportunities grounded in the real headlines above — when an opportunity is based on one or more headlines, cite their indices in "sourceIdx". You may also add pattern-based opportunities (seasonality, category cycles) with empty sourceIdx.

Think like a barter strategist: translate events into commercial opportunities (funding → bigger marketing budget → pitch awareness campaign; new stores → retail visibility need; launch → launch campaign + inventory to trade).

Return ONLY valid JSON:
{
  "headline": "one punchy line summarizing today's biggest theme",
  "totalSignals": number,
  "opportunities": [
    {
      "brand": "real brand name",
      "category": "e.g. Consumer Electronics",
      "score": 0-100,
      "confidence": 0-100,
      "signals": [{"signal": "e.g. New product launch (news)", "impact": 5-25}, ... 4-6 signals, impacts roughly sum to score],
      "whyNow": "1-2 sentences: the event and what it MEANS commercially",
      "barterAngle": "1-2 sentences: specific barter pitch — media mix in exchange for which inventory",
      "estValue": "realistic barter band in ₹",
      "likelihood": "High|Medium|Low",
      "whyBizex4u": "2-3 sentences: why BIZEX4U should approach NOW — their pressure, our fit, cash preservation",
      "inventory": "product inventory they would trade",
      "sourceIdx": [indices of headlines above backing this, or []]
    }
  ],
  "feed": [ 8-10 items derived from the REAL headlines where possible: {"time": "HH:MM", "event": "short observation naming the brand", "opportunity": "the barter opportunity it implies", "sourceIdx": index or null} — times between 05:30 and 09:30, most recent first ]
}

Rank by score descending. News-grounded opportunities get higher confidence than pattern-based ones. Be India-real, zero filler.`;
	const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${key}`
		},
		body: JSON.stringify({
			model: "llama-3.3-70b-versatile",
			messages: [{
				role: "user",
				content: prompt
			}],
			max_tokens: 4e3,
			temperature: .65,
			response_format: { type: "json_object" }
		})
	});
	if (!res.ok) {
		const txt = await res.text().catch(() => "");
		return {
			briefing: null,
			error: `Groq error ${res.status}: ${txt.slice(0, 160)}`
		};
	}
	const raw = (await res.json()).choices?.[0]?.message?.content?.trim() || "{}";
	try {
		const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
		const parsed = JSON.parse(cleaned.slice(cleaned.indexOf("{"), cleaned.lastIndexOf("}") + 1));
		const toSource = (i) => {
			const n = news[Number(i)];
			return n ? {
				title: n.title,
				url: n.url,
				source: n.source
			} : null;
		};
		const opportunities = (parsed.opportunities || []).map((o) => ({
			brand: o.brand,
			category: o.category,
			score: Math.min(100, Math.max(0, Number(o.score) || 0)),
			confidence: Math.min(100, Math.max(0, Number(o.confidence) || 0)),
			signals: (o.signals || []).map((s) => ({
				signal: String(s.signal),
				impact: Number(s.impact) || 0
			})),
			whyNow: o.whyNow,
			barterAngle: o.barterAngle,
			estValue: o.estValue,
			likelihood: [
				"High",
				"Medium",
				"Low"
			].includes(o.likelihood) ? o.likelihood : "Medium",
			whyBizex4u: o.whyBizex4u,
			inventory: o.inventory,
			sources: (o.sourceIdx || []).map(toSource).filter((s) => !!s)
		})).sort((a, b) => b.score - a.score);
		const feed = (parsed.feed || []).map((f) => {
			const src = f.sourceIdx != null ? toSource(f.sourceIdx) : null;
			return {
				time: f.time,
				event: f.event,
				opportunity: f.opportunity,
				source: src?.source,
				url: src?.url
			};
		});
		return {
			briefing: {
				headline: parsed.headline,
				opportunities,
				feed,
				totalSignals: Number(parsed.totalSignals) || opportunities.reduce((a, o) => a + o.signals.length, 0),
				newsCount: news.length
			},
			error: null
		};
	} catch {
		return {
			briefing: null,
			error: "Could not parse briefing. Retry."
		};
	}
});
var PitchPackInput = objectType({
	brand: stringType(),
	category: stringType().default(""),
	whyNow: stringType().default(""),
	barterAngle: stringType().default(""),
	inventory: stringType().default(""),
	cities: arrayType(stringType()).default([])
});
var pitchPack_createServerFn_handler = createServerRpc({
	id: "485fceb2c964d891b5c9901c4edcd549f7f91ad98e7cf5c9f480c086bbb12d14",
	name: "pitchPack",
	filename: "src/lib/ai.functions.ts"
}, (opts) => pitchPack.__executeServer(opts));
var pitchPack = createServerFn({ method: "POST" }).validator((d) => PitchPackInput.parse(d)).handler(pitchPack_createServerFn_handler, async ({ data }) => {
	const key = process.env.GROQ_API_KEY;
	if (!key) return {
		pack: null,
		error: "GROQ_API_KEY not set"
	};
	const prompt = `You are BIZEX4U's AI Chief Growth Officer (Indian media-barter agency, Lucknow). Prepare a complete, send-ready pitch pack to approach ${data.brand}${data.category ? ` (${data.category})` : ""} for a barter deal: our advertising media (OOH, metro, cinema, FM, print, DOOH, mall/society, events) in exchange for their product inventory${data.inventory ? ` (${data.inventory})` : ""}.

Context: ${data.whyNow || "brand is in an active marketing cycle"}. Angle: ${data.barterAngle || "inventory-for-media barter"}. Priority cities: ${data.cities.join(", ") || "Lucknow, Kanpur, Delhi NCR + brand's key markets"}.

Return ONLY valid JSON:
{
  "execSummary": "3-4 sentence executive summary of the opportunity",
  "whyFit": "2-3 sentences: why ${data.brand} fits BIZEX4U's barter model right now (cash preservation, inventory, visibility)",
  "objectives": ["3-4 likely marketing objectives ${data.brand} has right now"],
  "decisionMakers": [{"role": "e.g. CMO / VP Marketing / Brand Head / Founder / Head of Procurement", "approach": "one line on how to approach this person"}] (4-5 roles),
  "linkedinMsg": "personalized LinkedIn connection message, under 300 chars, no fluff, specific to ${data.brand}'s moment",
  "email": {"subject": "sharp subject line", "body": "5-8 sentence personalized email from Yash Mehrotra, BIZEX4U — opens with their specific moment, proposes the barter, quantifies media value, single clear CTA. Sign off: Yash Mehrotra, BIZEX4U, yash@bizex4u.com"},
  "followUps": ["3 follow-up messages: day 3 (value-add), day 7 (case/social proof), day 14 (breakup email)"],
  "callPoints": ["5 talking points for the first call, each one line"],
  "mediaMix": [{"channel": "e.g. OOH Hoardings", "cities": "where", "share": "e.g. 30%"}] (4-6 rows),
  "estBarterValue": "₹ band",
  "successProbability": 0-100
}
India-specific, confident, zero generic filler.`;
	const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${key}`
		},
		body: JSON.stringify({
			model: "llama-3.3-70b-versatile",
			messages: [{
				role: "user",
				content: prompt
			}],
			max_tokens: 2500,
			temperature: .6,
			response_format: { type: "json_object" }
		})
	});
	if (!res.ok) return {
		pack: null,
		error: `Groq error ${res.status}`
	};
	const raw = (await res.json()).choices?.[0]?.message?.content?.trim() || "{}";
	try {
		const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
		const pack = JSON.parse(cleaned.slice(cleaned.indexOf("{"), cleaned.lastIndexOf("}") + 1));
		pack.successProbability = Math.min(100, Math.max(0, Number(pack.successProbability) || 50));
		return {
			pack,
			error: null
		};
	} catch {
		return {
			pack: null,
			error: "Could not parse pitch pack. Retry."
		};
	}
});
var aiChat_createServerFn_handler = createServerRpc({
	id: "52c6530446fcacbae40b7cd8c260a8d9841cd92a76c694b3e29238c1b3a56552",
	name: "aiChat",
	filename: "src/lib/ai.functions.ts"
}, (opts) => aiChat.__executeServer(opts));
var aiChat = createServerFn({ method: "POST" }).validator((d) => ChatInput.parse(d)).handler(aiChat_createServerFn_handler, async ({ data }) => {
	const key = process.env.GROQ_API_KEY;
	if (!key) return { reply: "AI unavailable — GROQ_API_KEY not set." };
	const system = `You are Atlas AI — a friendly, smart assistant for Yash at BIZEX4U, an Out-of-Home (OOH) advertising company in Lucknow, India.
Today's date: ${(/* @__PURE__ */ new Date()).toLocaleString("en-IN", {
		weekday: "long",
		day: "numeric",
		month: "long",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
		timeZone: "Asia/Kolkata"
	}) + " IST"}.

Rules:
- For greetings (hi, hello, hey): respond warmly and briefly. Do NOT mention business data unprompted.
- For general questions (time, weather, jokes, etc.): answer naturally. Business context is irrelevant here.
- Only reference [CONTEXT] data when the user asks about sites, inventory, invoices, barters, revenue, deals, or customers.
- Use ₹ for currency. Keep replies concise (under 6 lines) unless detail is requested.
- Never say "as per context" or quote raw data fields. Speak naturally like a knowledgeable colleague.`;
	const userContent = data.context ? `[CONTEXT]\n${data.context}\n\n${data.message}` : data.message;
	const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${key}`
		},
		body: JSON.stringify({
			model: "llama-3.3-70b-versatile",
			messages: [
				{
					role: "system",
					content: system
				},
				...data.history,
				{
					role: "user",
					content: userContent
				}
			],
			max_tokens: 400,
			temperature: .7
		})
	});
	if (res.status === 429) return { reply: "AI is rate-limited. Try again shortly." };
	if (!res.ok) {
		const text = await res.text().catch(() => "");
		console.error("Groq error", res.status, text);
		return { reply: "AI temporarily unavailable. Please try again." };
	}
	return { reply: (await res.json()).choices?.[0]?.message?.content?.trim() || "…" };
});
//#endregion
export { aiChat_createServerFn_handler, analyzeAreaWithGroq_createServerFn_handler, analyzeSitePhoto_createServerFn_handler, brandCityIntel_createServerFn_handler, checkServiceability_createServerFn_handler, cityFitRank_createServerFn_handler, dailyBriefing_createServerFn_handler, fetchNearbyPlaces_createServerFn_handler, generateProposalCopy_createServerFn_handler, marketIntel_createServerFn_handler, mediaPlan_createServerFn_handler, parseExcel_createServerFn_handler, parsePartnerDoc_createServerFn_handler, parseWithHF_createServerFn_handler, pitchPack_createServerFn_handler, planCampaign_createServerFn_handler, recommendBrands_createServerFn_handler, tallySync_createServerFn_handler };
