import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
	plugins: [
		react(),
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
		rolldownOptions: {
			output: {
				codeSplitting: {
					groups: [
						{
							name: "react",
							test: /node_modules\/(?:react|react-dom|react-router)\//
						},
						{
							name: "react-query",
							test: /node_modules\/(?:@tanstack|@trpc)\//
						}
					]
				}
			}
		}
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
