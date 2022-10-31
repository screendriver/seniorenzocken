/// <reference types="vitest" />
import { defineConfig } from "vitest/config";
import { VitePWA } from "vite-plugin-pwa";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import sveltePreprocess from "svelte-preprocess";

export default defineConfig({
	server: {
		port: 3000,
		strictPort: true
	},
	build: {
		outDir: "./target/dist"
	},
	plugins: [
		svelte({
			preprocess: [
				sveltePreprocess({
					postcss: true,
					typescript: true
				})
			],
			compilerOptions: {
				enableSourcemap: true,
				immutable: true
			}
		}),
		VitePWA({
			registerType: "autoUpdate",
			manifest: {
				name: "Senioren zocken",
				short_name: "Senioren zocken",
				description: "Punkte sammeln für das Kartenspiel Watten",
				theme_color: "#075985",
				background_color: "#0F172A",
				orientation: "portrait",
				lang: "de",
				display: "standalone",
				icons: [
					{
						src: "https://ik.imagekit.io/qi52orkcz/seniorenzocken/tr:w-192/joker.png",
						sizes: "192x192",
						type: "image/png"
					},
					{
						src: "https://ik.imagekit.io/qi52orkcz/seniorenzocken/tr:w-512/joker.png",
						sizes: "512x512",
						type: "image/png"
					}
				]
			}
		})
	],
	test: {
		include: ["src/**/*.test.ts"],
		environment: "happy-dom",
		coverage: {
			provider: "c8",
			all: true,
			extension: [".ts"],
			include: ["src/**/*"],
			exclude: ["src/start-develop.ts", "src/env.d.ts", "src/main.ts", "src/static-server/static-server.ts"],
			reporter: ["lcov", "text-summary", "clover"],
			reportsDirectory: "./target/coverage"
		},
		threads: false
	}
});
