import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueDevTools from "vite-plugin-vue-devtools";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
	plugins: [vue(), vueDevTools(), tailwindcss()],
	build: {
		outDir: "target/distribution/browser-application",
	},
	esbuild: {
		legalComments: "none",
	},
});
