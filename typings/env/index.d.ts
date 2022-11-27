/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_IMAGEKIT_BASE_URL?: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
