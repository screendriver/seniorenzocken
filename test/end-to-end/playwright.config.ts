import { defineConfig } from "@playwright/test";
import path from "node:path";

function isRunningInContinuousIntegration(): boolean {
	return typeof process.env.CI !== "undefined";
}

const testOutputDirectory = path.join("..", "..", "target", "test-output", "end-to-end");

export default defineConfig({
	retries: 2,
	forbidOnly: isRunningInContinuousIntegration(),
	webServer: {
		command: "npm run preview:end-to-end",
		port: 4173,
	},
	projects: [
		{
			name: "Firefox",
			use: {
				browserName: "firefox",
				headless: true,
			},
		},
	],
	use: {
		baseURL: "http://localhost:4173",
		screenshot: "only-on-failure",
		trace: "on-first-retry",
	},
	reporter: [["list"], ["html", { outputFolder: path.join(testOutputDirectory, "html-report") }]],
	outputDir: path.join(testOutputDirectory, "test-results"),
});
