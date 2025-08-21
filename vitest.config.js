import { URL, fileURLToPath } from "node:url";
import { mergeConfig, defineConfig } from "vitest/config";
import viteConfig from "./vite.config.js";

export default mergeConfig(
	viteConfig,
	defineConfig({
		test: {
			environment: "happy-dom",
			root: fileURLToPath(new URL("./source", import.meta.url)),
			isolate: false
		}
	})
);
