//#region node_modules/.nitro/vite/services/ssr/assets/__23tanstack-start-server-fn-resolver-DtTNYHvd.js
var manifest = {
	"1895ce02c84c2784a1a461b8cd3b1e46886fb45299159902cf2012b61ec3df6e": {
		functionName: "cityFitRank_createServerFn_handler",
		importer: () => import("./_ssr/ai.functions-fLzdPL9e.mjs")
	},
	"1930d6f94e95b9d105f206515fa06e477a2112d57973226e900f44b99756f8cc": {
		functionName: "dailyBriefing_createServerFn_handler",
		importer: () => import("./_ssr/ai.functions-fLzdPL9e.mjs")
	},
	"1c85cd4715670f0c13aba09b72f4966f1e52a03fcd3da823c4d499d6124fa180": {
		functionName: "tallySync_createServerFn_handler",
		importer: () => import("./_ssr/ai.functions-fLzdPL9e.mjs")
	},
	"3788cfc68db122930526fe1f2449f1d1747865e57f7f3fc486e12c49744ac583": {
		functionName: "fetchNearbyPlaces_createServerFn_handler",
		importer: () => import("./_ssr/ai.functions-fLzdPL9e.mjs")
	},
	"3c4fbc25dadd607fae2c9e0805dba505aad4acc75c804c1b8257a29da1291ea4": {
		functionName: "recommendBrands_createServerFn_handler",
		importer: () => import("./_ssr/ai.functions-fLzdPL9e.mjs")
	},
	"485fceb2c964d891b5c9901c4edcd549f7f91ad98e7cf5c9f480c086bbb12d14": {
		functionName: "pitchPack_createServerFn_handler",
		importer: () => import("./_ssr/ai.functions-fLzdPL9e.mjs")
	},
	"48d39d8daed11434782d5c8c32d67e24353c688883ae033ea3a35a518c2bf1ca": {
		functionName: "generateProposalCopy_createServerFn_handler",
		importer: () => import("./_ssr/ai.functions-fLzdPL9e.mjs")
	},
	"4d23fc677d1852844225c736051de320f4ae25e28474a2bdfb062b845afafc1b": {
		functionName: "parseExcel_createServerFn_handler",
		importer: () => import("./_ssr/ai.functions-fLzdPL9e.mjs")
	},
	"52c6530446fcacbae40b7cd8c260a8d9841cd92a76c694b3e29238c1b3a56552": {
		functionName: "aiChat_createServerFn_handler",
		importer: () => import("./_ssr/ai.functions-fLzdPL9e.mjs")
	},
	"7d3cbf92f1bfc752cc090aad5382d190e5ab024ca2f5e3e8a57c265122a6b5eb": {
		functionName: "planCampaign_createServerFn_handler",
		importer: () => import("./_ssr/ai.functions-fLzdPL9e.mjs")
	},
	"8059a34720fdf7d6e3ab0cbc0fe7d6a85cd668e927532fc614c1e7d2c0c0b8a7": {
		functionName: "marketIntel_createServerFn_handler",
		importer: () => import("./_ssr/ai.functions-fLzdPL9e.mjs")
	},
	"894cdef45ba3baf16c25d56b374103f7a0fbda3fa6ffcfdb43659163dbd63a90": {
		functionName: "parsePartnerDoc_createServerFn_handler",
		importer: () => import("./_ssr/ai.functions-fLzdPL9e.mjs")
	},
	"9a8393e4f637533ed4896d1b067349e11a12cf7545942e20288106976039c8e0": {
		functionName: "parseWithHF_createServerFn_handler",
		importer: () => import("./_ssr/ai.functions-fLzdPL9e.mjs")
	},
	"9e4f3127dcbe1a764e2cc24053b99812e7aed206d067a0b8abb8ef2130c586b1": {
		functionName: "pullState_createServerFn_handler",
		importer: () => import("./_ssr/db.functions-eGyqiDv-.mjs")
	},
	"9f44a17e2a098ad98e4f3c7a5bea32688106ce78fb039f844ead009ed121096f": {
		functionName: "brandCityIntel_createServerFn_handler",
		importer: () => import("./_ssr/ai.functions-fLzdPL9e.mjs")
	},
	"a577131a34e5e4752dbbf8628baf403edf6eee114c3b212f1114e608b1cba60d": {
		functionName: "pushState_createServerFn_handler",
		importer: () => import("./_ssr/db.functions-eGyqiDv-.mjs")
	},
	"bd1093115cda05bd7a7a9d6bb9817fc0791febe8cfe4516db456bde0534d4cfe": {
		functionName: "analyzeAreaWithGroq_createServerFn_handler",
		importer: () => import("./_ssr/ai.functions-fLzdPL9e.mjs")
	},
	"bdd8b910ae9a783d932875ce99db7018b5cd95347358449d8f9c30e6b7107695": {
		functionName: "analyzeSitePhoto_createServerFn_handler",
		importer: () => import("./_ssr/ai.functions-fLzdPL9e.mjs")
	},
	"d3d035a05a25d2e6018b5b27937061cffb98bac2048373fa073cdee709e4b62c": {
		functionName: "verifyPassphrase_createServerFn_handler",
		importer: () => import("./_ssr/db.functions-eGyqiDv-.mjs")
	},
	"e2e961f6cf6fb7598764e216f70b73059c0f9d988b8253f5ab15e3d512d03f4c": {
		functionName: "checkServiceability_createServerFn_handler",
		importer: () => import("./_ssr/ai.functions-fLzdPL9e.mjs")
	},
	"e418414ba486cc031b9ba90f2707f51d6253950b14c3228913946f534068a214": {
		functionName: "mediaPlan_createServerFn_handler",
		importer: () => import("./_ssr/ai.functions-fLzdPL9e.mjs")
	}
};
async function getServerFnById(id, access) {
	const serverFnInfo = manifest[id];
	if (!serverFnInfo) throw new Error("Server function info not found for " + id);
	const fnModule = serverFnInfo.module ?? await serverFnInfo.importer();
	if (!fnModule) throw new Error("Server function module not resolved for " + id);
	const action = fnModule[serverFnInfo.functionName];
	if (!action) throw new Error("Server function module export not resolved for serverFn ID: " + id);
	return action;
}
//#endregion
export { getServerFnById as t };
