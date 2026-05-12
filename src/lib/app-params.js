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
		me: async () => ({
			id: "local-user",
			full_name: "Usuario Local",
			email: "local@finanzas.app",
			role: "user",
		}),
		logout: () => {
			if (typeof window === "undefined") return;
			window.localStorage.removeItem(LOCAL_DB_KEY);
			window.location.href = "/";
		},
		redirectToLogin: () => {
			if (typeof window === "undefined") return;
			window.location.href = "/";
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
