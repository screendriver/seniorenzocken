import { fileURLToPath } from "node:url";
import { mergeConfig, defineConfig } from "vitest/config";
import viteConfig from "./vite.config.ts";

export default mergeConfig(
	viteConfig,
	defineConfig({
		test: {
			environment: "happy-dom",
			root: fileURLToPath(new URL("./", import.meta.url)),
		},
	}),
);
