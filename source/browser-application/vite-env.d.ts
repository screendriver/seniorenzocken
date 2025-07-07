/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_POCKETBASE_BASE_URL: string;
	readonly VITE_TRPC_SERVER_URL: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
