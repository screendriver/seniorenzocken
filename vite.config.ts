/// <reference types="vitest" />
import { defineConfig } from "vitest/config";
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
		})
	],
	test: {
		environment: "happy-dom",
		coverage: {
			provider: "c8",
			all: true,
			extension: [".ts"],
			include: ["src/**/*"],
			reporter: ["lcov", "text-summary", "clover"],
			reportsDirectory: "./target/coverage"
		},
		threads: false
	}
});
