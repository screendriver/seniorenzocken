import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueDevTools from "vite-plugin-vue-devtools";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
	plugins: [
		vue(),
		vueDevTools(),
		tailwindcss(),
		{
			name: "Tracking scripts",
			apply: "build",
			transformIndexHtml() {
				return [
					{
						tag: "script",
						attrs: {
							defer: true,
							src: "https://statistics.82r.de/tasty.js",
							"data-website-id": "16d1825d-3f6c-46fb-9243-1d281224605e",
							"capture performance metrics": "true"
						},
						injectTo: "head"
					},
					{
						tag: "script",
						attrs: {
							defer: true,
							src: "https://pulse.82r.de/api/script.js",
							"data-site-id": "9f88a1ebc565"
						},
						injectTo: "head"
					}
				];
			}
		}
	],
	build: {
		outDir: "target/distribution/browser-application",
		minify: "esbuild",
		sourcemap: true
	},
	server: {
		host: true,
		port: 5173,
		strictPort: true,
		proxy: {
			"/api/": "http://localhost:4000"
		}
	}
});
