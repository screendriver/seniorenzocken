import { vitePreprocess } from "@sveltejs/kit/vite";

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
	},
};
