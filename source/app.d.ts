// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	interface ImportMetaEnv {
		readonly VITE_IMAGEKIT_BASE_URL?: string;
		readonly VITE_API_ROUTE_BASE_URL?: string;
	}

	interface ImportMeta {
		readonly env: ImportMetaEnv;
	}

	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		interface Platform {
			env?: {
				MEDIA_BUCKET: R2Bucket;
			};
		}
	}
}

export {};
