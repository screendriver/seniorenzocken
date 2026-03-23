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
			name: "Umami",
			apply: "build",
			transformIndexHtml() {
				return [
					{
						tag: "script",
						attrs: {
							defer: true,
							src: "https://statistics.82r.de/tasty.js",
							"data-website-id": "16d1825d-3f6c-46fb-9243-1d281224605e"
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
