import type { PlaywrightTestConfig } from "@playwright/test";
import path from "node:path";

function isRunningInContinuousIntegration(): boolean {
	return typeof process.env.CI !== "undefined";
}

const testOutputDirectory = path.join("..", "..", "target", "test-output", "end-to-end");

const config: PlaywrightTestConfig = {
	forbidOnly: isRunningInContinuousIntegration(),
	webServer: {
		command: "npm run develop",
		port: 3000
	},
	projects: [
		{
			name: "Chromium",
			use: {
				browserName: "chromium"
			}
		},
		{
			name: "Firefox",
			use: {
				browserName: "firefox"
			}
		}
	],
	use: {
		baseURL: "http://localhost:3000"
	},
	reporter: [["list"], ["html", { outputFolder: path.join(testOutputDirectory, "html-report") }]],
	outputDir: path.join(testOutputDirectory, "test-results")
};

export default config;
