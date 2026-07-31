const sharedMochaConfiguration = require("./mocha.shared.config.cjs");

module.exports = {
	...sharedMochaConfiguration,
	require: ["./source/browser-application/test-support/mocha-jsdom.ts"],
	spec: ["source/browser-application/**/*.test.ts", "source/browser-application/**/*.test.tsx"]
};
