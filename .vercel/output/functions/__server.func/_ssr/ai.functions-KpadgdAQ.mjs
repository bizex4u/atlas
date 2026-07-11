import { o as __toESM } from "../_runtime.mjs";
import { r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { k as isRedirect, y as useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { l as createServerFn } from "./esm-Dova13aH.mjs";
import { a as objectType, i as numberType, n as booleanType, o as stringType, r as enumType, t as arrayType } from "../_libs/zod.mjs";
import { i as createSsrRpc } from "./sync-BlerjOYi.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ai.functions-KpadgdAQ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
function useServerFn(serverFn) {
	const router = useRouter();
	return import_react.useCallback(async (...args) => {
		try {
			const res = await serverFn(...args);
			if (isRedirect(res)) throw res;
			return res;
		} catch (err) {
			if (isRedirect(err)) {
				err.options._fromLocation = router.stores.location.get();
				return router.navigate(router.resolveRedirect(err).options);
			}
			throw err;
		}
	}, [router, serverFn]);
}
var PlacesInput = objectType({
	lat: numberType(),
	lng: numberType(),
	radius: numberType().default(500)
});
var fetchNearbyPlaces = createServerFn({ method: "POST" }).validator((d) => PlacesInput.parse(d)).handler(createSsrRpc("3788cfc68db122930526fe1f2449f1d1747865e57f7f3fc486e12c49744ac583"));
var HFInput = objectType({
	content: stringType(),
	mimeType: stringType(),
	fileName: stringType().default("file")
});
createServerFn({ method: "POST" }).validator((d) => HFInput.parse(d)).handler(createSsrRpc("9a8393e4f637533ed4896d1b067349e11a12cf7545942e20288106976039c8e0"));
var SitePhotoInput = objectType({
	image: stringType(),
	siteName: stringType().default(""),
	city: stringType().default("")
});
createServerFn({ method: "POST" }).validator((d) => SitePhotoInput.parse(d)).handler(createSsrRpc("bdd8b910ae9a783d932875ce99db7018b5cd95347358449d8f9c30e6b7107695"));
var ExcelInput = objectType({ content: stringType() });
createServerFn({ method: "POST" }).validator((d) => ExcelInput.parse(d)).handler(createSsrRpc("4d23fc677d1852844225c736051de320f4ae25e28474a2bdfb062b845afafc1b"));
var ParseDocInput = objectType({
	content: stringType(),
	mimeType: stringType(),
	openrouterKey: stringType()
});
createServerFn({ method: "POST" }).validator((d) => ParseDocInput.parse(d)).handler(createSsrRpc("894cdef45ba3baf16c25d56b374103f7a0fbda3fa6ffcfdb43659163dbd63a90"));
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
var tallySync = createServerFn({ method: "POST" }).validator((d) => TallyInput.parse(d)).handler(createSsrRpc("1c85cd4715670f0c13aba09b72f4966f1e52a03fcd3da823c4d499d6124fa180"));
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
var analyzeAreaWithGroq = createServerFn({ method: "POST" }).validator((d) => AreaAnalysisInput.parse(d)).handler(createSsrRpc("bd1093115cda05bd7a7a9d6bb9817fc0791febe8cfe4516db456bde0534d4cfe"));
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
createServerFn({ method: "POST" }).validator((d) => BrandInput.parse(d)).handler(createSsrRpc("3c4fbc25dadd607fae2c9e0805dba505aad4acc75c804c1b8257a29da1291ea4"));
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
createServerFn({ method: "POST" }).validator((d) => CampaignInput.parse(d)).handler(createSsrRpc("7d3cbf92f1bfc752cc090aad5382d190e5ab024ca2f5e3e8a57c265122a6b5eb"));
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
createServerFn({ method: "POST" }).validator((d) => ProposalInput.parse(d)).handler(createSsrRpc("48d39d8daed11434782d5c8c32d67e24353c688883ae033ea3a35a518c2bf1ca"));
var IntelInput = objectType({
	city: stringType(),
	dealHistory: arrayType(objectType({
		brand: stringType(),
		category: stringType(),
		stage: stringType(),
		value: numberType()
	})).default([])
});
var marketIntel = createServerFn({ method: "POST" }).validator((d) => IntelInput.parse(d)).handler(createSsrRpc("8059a34720fdf7d6e3ab0cbc0fe7d6a85cd668e927532fc614c1e7d2c0c0b8a7"));
var MediaPlanInput = objectType({
	brand: stringType(),
	category: stringType().default(""),
	cities: arrayType(stringType()),
	budget: numberType().default(0),
	durationMonths: numberType().default(1),
	objective: stringType().default(""),
	audience: stringType().default("")
});
createServerFn({ method: "POST" }).validator((d) => MediaPlanInput.parse(d)).handler(createSsrRpc("e418414ba486cc031b9ba90f2707f51d6253950b14c3228913946f534068a214"));
var IntelReportInput = objectType({
	brand: stringType(),
	city: stringType(),
	objective: stringType().default(""),
	audience: stringType().default(""),
	budget: numberType().default(0),
	category: stringType().default("")
});
var brandCityIntel = createServerFn({ method: "POST" }).validator((d) => IntelReportInput.parse(d)).handler(createSsrRpc("9f44a17e2a098ad98e4f3c7a5bea32688106ce78fb039f844ead009ed121096f"));
var ServiceabilityInput = objectType({ points: arrayType(objectType({
	pincode: stringType(),
	lat: numberType(),
	lng: numberType()
})).max(10) });
var checkServiceability = createServerFn({ method: "POST" }).validator((d) => ServiceabilityInput.parse(d)).handler(createSsrRpc("e2e961f6cf6fb7598764e216f70b73059c0f9d988b8253f5ab15e3d512d03f4c"));
var CityFitInput = objectType({
	brand: stringType(),
	cities: arrayType(stringType()).max(120)
});
var cityFitRank = createServerFn({ method: "POST" }).validator((d) => CityFitInput.parse(d)).handler(createSsrRpc("1895ce02c84c2784a1a461b8cd3b1e46886fb45299159902cf2012b61ec3df6e"));
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
var dailyBriefing = createServerFn({ method: "POST" }).validator((d) => BriefingInput.parse(d)).handler(createSsrRpc("1930d6f94e95b9d105f206515fa06e477a2112d57973226e900f44b99756f8cc"));
var PitchPackInput = objectType({
	brand: stringType(),
	category: stringType().default(""),
	whyNow: stringType().default(""),
	barterAngle: stringType().default(""),
	inventory: stringType().default(""),
	cities: arrayType(stringType()).default([])
});
var pitchPack = createServerFn({ method: "POST" }).validator((d) => PitchPackInput.parse(d)).handler(createSsrRpc("485fceb2c964d891b5c9901c4edcd549f7f91ad98e7cf5c9f480c086bbb12d14"));
var aiChat = createServerFn({ method: "POST" }).validator((d) => ChatInput.parse(d)).handler(createSsrRpc("52c6530446fcacbae40b7cd8c260a8d9841cd92a76c694b3e29238c1b3a56552"));
//#endregion
export { cityFitRank as a, marketIntel as c, useServerFn as d, checkServiceability as i, pitchPack as l, analyzeAreaWithGroq as n, dailyBriefing as o, brandCityIntel as r, fetchNearbyPlaces as s, aiChat as t, tallySync as u };
