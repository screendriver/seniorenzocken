import adapter from "@sveltejs/adapter-cloudflare";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

/** @type {import('@sveltejs/kit').Config} */
export default {
	preprocess: vitePreprocess(),
	kit: {
		outDir: "./target/svelte-kit",
		files: {
			appTemplate: "source/app.html",
			routes: "source/routes",
			lib: "source/lib",
		},
		adapter: adapter(),
	},
};
