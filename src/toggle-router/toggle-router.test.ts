import { assert, test } from "vitest";
import { createToggleRouter, type FeatureName } from "./toggle-router";

test("featureIsEnabled() returns false when feature was never set", () => {
	const toggleRouter = createToggleRouter();
	const featureIsEnabled = toggleRouter.featureIsEnabled("game-point-buttons");

	assert.isFalse(featureIsEnabled);
});

test("featureIsEnabled() returns false when feature name is unknown", () => {
	const toggleRouter = createToggleRouter();
	const featureIsEnabled = toggleRouter.featureIsEnabled("foo" as FeatureName);

	assert.isFalse(featureIsEnabled);
});

test("setFeature() sets given feature name to true", () => {
	const toggleRouter = createToggleRouter();
	toggleRouter.setFeature("game-point-buttons", true);
	const featureIsEnabled = toggleRouter.featureIsEnabled("game-point-buttons");

	assert.isTrue(featureIsEnabled);
});

test("setFeature() sets given feature name to false", () => {
	const toggleRouter = createToggleRouter();
	toggleRouter.setFeature("game-point-buttons", false);
	const featureIsEnabled = toggleRouter.featureIsEnabled("game-point-buttons");

	assert.isFalse(featureIsEnabled);
});
