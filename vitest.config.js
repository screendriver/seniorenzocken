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
						name: { label: "browser-application", color: "magenta" },
						environment: "jsdom"
					}
				},
				{
					extends: true,
					test: {
						include: ["server/**/*.test.ts"],
						name: { label: "server", color: "green" },
						environment: "node"
					}
				},
				{
					extends: true,
					test: {
						include: ["shared/**/*.test.ts"],
						name: { label: "shared", color: "cyan" },
						environment: "node"
					}
				}
			]
		}
	})
);
