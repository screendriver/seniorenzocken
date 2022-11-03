import { assert, test } from "vitest";
import { createToggleRouter } from "./toggle-router";

test("featureIsEnabled() returns false", () => {
	const toggleRouter = createToggleRouter();
	const featureIsEnabled = toggleRouter.featureIsEnabled("");

	assert.isFalse(featureIsEnabled);
});
