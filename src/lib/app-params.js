const isNode = typeof window === 'undefined';
const windowObj = isNode ? { localStorage: new Map() } : window;
const storage = windowObj.localStorage;

const toSnakeCase = (str) => {
	return str.replace(/([A-Z])/g, '_$1').toLowerCase();
}

const getAppParamValue = (paramName, { defaultValue = undefined, removeFromUrl = false } = {}) => {
	if (isNode) {
		return defaultValue;
	}
	const storageKey = `app_${toSnakeCase(paramName)}`;
	const urlParams = new URLSearchParams(window.location.search);
	const searchParam = urlParams.get(paramName);
	if (removeFromUrl) {
		urlParams.delete(paramName);
		const newUrl = `${window.location.pathname}${urlParams.toString() ? `?${urlParams.toString()}` : ""
			}${window.location.hash}`;
		window.history.replaceState({}, document.title, newUrl);
	}
	if (searchParam) {
		storage.setItem(storageKey, searchParam);
		return searchParam;
	}
	if (defaultValue) {
		storage.setItem(storageKey, defaultValue);
		return defaultValue;
	}
	const storedValue = storage.getItem(storageKey);
	if (storedValue) {
		return storedValue;
	}
	return null;
}

const getAppParams = () => {
	if (getAppParamValue("clear_access_token") === 'true') {
		storage.removeItem('app_access_token');
		storage.removeItem('token');
	}
	return {
		appId: getAppParamValue("app_id", { defaultValue: import.meta.env.VITE_APP_ID }),
		token: getAppParamValue("access_token", { removeFromUrl: true }),
		fromUrl: getAppParamValue("from_url", { defaultValue: window.location.href }),
		functionsVersion: getAppParamValue("functions_version", { defaultValue: import.meta.env.VITE_FUNCTIONS_VERSION }),
		appBaseUrl: getAppParamValue("app_base_url", { defaultValue: import.meta.env.VITE_APP_BASE_URL }),
	}
}


export const appParams = {
	...getAppParams()
}

const LOCAL_DB_KEY = "finanzas_data_v1";
const SESSION_KEY = "finanzas_session_v1";
const USER_EMAIL_KEY = "finanzas_user_email";
const USER_NAME_KEY = "finanzas_user_name";
/** Filas antiguas sin `created_by` se listan con este correo para que coincidan con el usuario local por defecto. */
const DEFAULT_LOCAL_EMAIL = "local@finanzas.app";
const ENTITY_NAMES = ["Transaction", "Budget", "Account", "Achievement", "SavingsGoal"];

const readLocalDB = () => {
	if (typeof window === "undefined") return {};
	try {
		return JSON.parse(window.localStorage.getItem(LOCAL_DB_KEY) || "{}");
	} catch {
		return {};
	}
};

const writeLocalDB = (db) => {
	if (typeof window === "undefined") return;
	window.localStorage.setItem(LOCAL_DB_KEY, JSON.stringify(db));
};

/** Asigna `created_by` a filas legacy para que los filtros por usuario las encuentren. */
const migrateLocalDB = () => {
	if (typeof window === "undefined") return;
	try {
		const db = readLocalDB();
		let changed = false;
		for (const name of ENTITY_NAMES) {
			const rows = db[name];
			if (!Array.isArray(rows)) continue;
			for (const row of rows) {
				if (row && (row.created_by === undefined || row.created_by === null || row.created_by === "")) {
					row.created_by = DEFAULT_LOCAL_EMAIL;
					changed = true;
				}
			}
		}
		if (changed) writeLocalDB(db);
	} catch {
		/* ignore */
	}
};

/** Si ya había datos guardados antes de la sesión explícita, mantener la sesión iniciada. */
const migrateSessionIfDataExists = () => {
	if (typeof window === "undefined") return;
	if (window.localStorage.getItem(SESSION_KEY) === "1") return;
	try {
		const raw = window.localStorage.getItem(LOCAL_DB_KEY);
		if (!raw || raw === "{}") return;
		const db = JSON.parse(raw);
		const hasData = ENTITY_NAMES.some((n) => Array.isArray(db[n]) && db[n].length > 0);
		if (hasData) window.localStorage.setItem(SESSION_KEY, "1");
	} catch {
		/* ignore */
	}
};

migrateLocalDB();
migrateSessionIfDataExists();

const getRows = (db, name) => {
	if (!Array.isArray(db[name])) db[name] = [];
	return db[name];
};

const makeEntity = (name) => ({
	list: async () => {
		const db = readLocalDB();
		return getRows(db, name).slice();
	},
	filter: async (filters = {}, sortBy, limit) => {
		const db = readLocalDB();
		let rows = getRows(db, name).filter((row) =>
			Object.entries(filters).every(([k, v]) => row && row[k] === v)
		);
		if (sortBy) {
			const desc = sortBy.startsWith("-");
			const key = desc ? sortBy.slice(1) : sortBy;
			rows = rows.slice().sort((a, b) => {
				const av = String((a && a[key]) || "");
				const bv = String((b && b[key]) || "");
				return desc ? bv.localeCompare(av) : av.localeCompare(bv);
			});
		}
		if (typeof limit === "number") rows = rows.slice(0, limit);
		return rows;
	},
	create: async (data) => {
		const db = readLocalDB();
		const rows = getRows(db, name);
		const now = new Date().toISOString();
		const id = String(Date.now()) + "_" + String(Math.floor(Math.random() * 100000));
		const row = { ...data, id, created_date: now, updated_date: now };
		rows.unshift(row);
		writeLocalDB(db);
		return row;
	},
	update: async (id, patch) => {
		const db = readLocalDB();
		const rows = getRows(db, name);
		const i = rows.findIndex((row) => row.id === id);
		if (i < 0) return null;
		rows[i] = { ...rows[i], ...patch, updated_date: new Date().toISOString() };
		writeLocalDB(db);
		return rows[i];
	},
	delete: async (id) => {
		const db = readLocalDB();
		db[name] = getRows(db, name).filter((row) => row.id !== id);
		writeLocalDB(db);
		return { success: true };
	},
});

const entities = {};
for (const name of ENTITY_NAMES) entities[name] = makeEntity(name);

export const client = {
	auth: {
		me: async () => {
			if (typeof window === "undefined") return null;
			migrateLocalDB();
			migrateSessionIfDataExists();
			if (window.localStorage.getItem(SESSION_KEY) !== "1") return null;
			const email = window.localStorage.getItem(USER_EMAIL_KEY) || DEFAULT_LOCAL_EMAIL;
			const full_name = window.localStorage.getItem(USER_NAME_KEY) || "Usuario Local";
			return {
				id: "local-user",
				full_name,
				email,
				role: "user",
			};
		},
		login: async ({ email, fullName = "" } = {}) => {
			if (typeof window === "undefined") return;
			const e = String(email || "").trim();
			if (!e) throw new Error("email_required");
			window.localStorage.setItem(SESSION_KEY, "1");
			window.localStorage.setItem(USER_EMAIL_KEY, e);
			const n = String(fullName || "").trim();
			if (n) window.localStorage.setItem(USER_NAME_KEY, n);
			else window.localStorage.removeItem(USER_NAME_KEY);
		},
		logout: () => {
			if (typeof window === "undefined") return;
			window.localStorage.removeItem(SESSION_KEY);
			window.localStorage.removeItem(USER_EMAIL_KEY);
			window.localStorage.removeItem(USER_NAME_KEY);
			window.location.href = "/login";
		},
		redirectToLogin: () => {
			if (typeof window === "undefined") return;
			window.location.href = "/login";
		},
	},
	entities,
	integrations: {
		Core: {
			InvokeLLM: async ({ response_json_schema } = {}) => {
				if (response_json_schema && response_json_schema.type === "object") return { category: "other" };
				return "Asistente local activo.";
			},
		},
	},
};
