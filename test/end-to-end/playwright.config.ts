import type { PlaywrightTestConfig } from "@playwright/test";

function isRunningInContinuousIntegration(): boolean {
	return typeof process.env.CI !== "undefined";
}

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
		},
		{
			name: "WebKit",
			use: {
				browserName: "webkit"
			}
		}
	],
	use: {
		baseURL: "http://localhost:3000"
	},
	outputDir: "../../target/test-results/"
};

export default config;
