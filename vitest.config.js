import { URL, fileURLToPath } from "node:url";
import { mergeConfig, defineConfig } from "vitest/config";
import viteConfig from "./vite.config.js";

export default mergeConfig(
	viteConfig,
	defineConfig({
		test: {
			root: fileURLToPath(new URL("./source", import.meta.url)),
			isolate: false,
			environment: "node",
			projects: [
				"source/*",
				{
					extends: true,
					test: {
						include: ["browser-application/**/*.test.ts"],
						name: "browser-application",
						environment: "happy-dom"
					}
				},
				{
					extends: true,
					test: {
						include: ["server/**/*.test.ts"],
						name: "server",
						environment: "node"
					}
				},
				{
					extends: true,
					test: {
						include: ["shared/**/*.test.ts"],
						name: "shared",
						environment: "node"
					}
				}
			]
		}
	})
);
