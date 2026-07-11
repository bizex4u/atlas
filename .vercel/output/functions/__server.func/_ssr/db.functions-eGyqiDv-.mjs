import { l as createServerFn } from "./esm-Dova13aH.mjs";
import { a as objectType, o as stringType } from "../_libs/zod.mjs";
import { t as createServerRpc } from "./createServerRpc-WJgk8O8C.mjs";
import { t as createClient } from "../_libs/@libsql/client.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/db.functions-eGyqiDv-.js
var _client = null;
var _schemaReady = null;
function db() {
	const url = process.env.TURSO_DATABASE_URL;
	const authToken = process.env.TURSO_AUTH_TOKEN;
	if (!url) return null;
	if (!_client) _client = createClient({
		url,
		authToken
	});
	return _client;
}
async function ensureSchema(client) {
	if (!_schemaReady) _schemaReady = client.execute(`CREATE TABLE IF NOT EXISTS store (
          workspace TEXT NOT NULL,
          key TEXT NOT NULL,
          value TEXT NOT NULL,
          updated_at INTEGER NOT NULL,
          PRIMARY KEY (workspace, key)
        )`).then(() => void 0);
	return _schemaReady;
}
function safeEqual(a, b) {
	if (a.length !== b.length) return false;
	let diff = 0;
	for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
	return diff === 0;
}
function checkPass(passphrase) {
	const secret = process.env.ATLAS_PASSPHRASE;
	if (!secret) return {
		ok: false,
		error: "Sync not configured — ATLAS_PASSPHRASE not set on server"
	};
	if (!safeEqual(passphrase, secret)) return {
		ok: false,
		error: "Wrong passphrase"
	};
	return { ok: true };
}
var WORKSPACE = "default";
var VerifyInput = objectType({ passphrase: stringType() });
var verifyPassphrase_createServerFn_handler = createServerRpc({
	id: "d3d035a05a25d2e6018b5b27937061cffb98bac2048373fa073cdee709e4b62c",
	name: "verifyPassphrase",
	filename: "src/lib/db.functions.ts"
}, (opts) => verifyPassphrase.__executeServer(opts));
var verifyPassphrase = createServerFn({ method: "POST" }).validator((d) => VerifyInput.parse(d)).handler(verifyPassphrase_createServerFn_handler, async ({ data }) => {
	if (!db()) return {
		ok: false,
		error: "Sync not configured — TURSO_DATABASE_URL not set"
	};
	const chk = checkPass(data.passphrase);
	return {
		ok: chk.ok,
		error: chk.error
	};
});
var pullState_createServerFn_handler = createServerRpc({
	id: "9e4f3127dcbe1a764e2cc24053b99812e7aed206d067a0b8abb8ef2130c586b1",
	name: "pullState",
	filename: "src/lib/db.functions.ts"
}, (opts) => pullState.__executeServer(opts));
var pullState = createServerFn({ method: "POST" }).validator((d) => VerifyInput.parse(d)).handler(pullState_createServerFn_handler, async ({ data }) => {
	const client = db();
	if (!client) return {
		ok: false,
		error: "Sync not configured",
		entries: {}
	};
	const chk = checkPass(data.passphrase);
	if (!chk.ok) return {
		ok: false,
		error: chk.error,
		entries: {}
	};
	await ensureSchema(client);
	const res = await client.execute({
		sql: "SELECT key, value FROM store WHERE workspace = ?",
		args: [WORKSPACE]
	});
	const entries = {};
	for (const row of res.rows) entries[String(row.key)] = String(row.value);
	return {
		ok: true,
		error: null,
		entries
	};
});
var PushInput = objectType({
	passphrase: stringType(),
	key: stringType(),
	value: stringType()
});
var pushState_createServerFn_handler = createServerRpc({
	id: "a577131a34e5e4752dbbf8628baf403edf6eee114c3b212f1114e608b1cba60d",
	name: "pushState",
	filename: "src/lib/db.functions.ts"
}, (opts) => pushState.__executeServer(opts));
var pushState = createServerFn({ method: "POST" }).validator((d) => PushInput.parse(d)).handler(pushState_createServerFn_handler, async ({ data }) => {
	const client = db();
	if (!client) return {
		ok: false,
		error: "Sync not configured"
	};
	const chk = checkPass(data.passphrase);
	if (!chk.ok) return {
		ok: false,
		error: chk.error
	};
	await ensureSchema(client);
	await client.execute({
		sql: `INSERT INTO store (workspace, key, value, updated_at)
            VALUES (?, ?, ?, ?)
            ON CONFLICT(workspace, key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
		args: [
			WORKSPACE,
			data.key,
			data.value,
			Date.now()
		]
	});
	return {
		ok: true,
		error: null
	};
});
//#endregion
export { pullState_createServerFn_handler, pushState_createServerFn_handler, verifyPassphrase_createServerFn_handler };
