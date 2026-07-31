const sharedMochaConfiguration = require("./mocha.shared.config.cjs");

module.exports = {
	...sharedMochaConfiguration,
	spec: ["source/server/**/*.test.ts", "source/server-shared/**/*.test.ts", "source/shared/**/*.test.ts"]
};
