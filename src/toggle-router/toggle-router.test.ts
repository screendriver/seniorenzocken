import { assert, test, type TestFunction } from "vitest";
import { createToggleRouter, type FeatureName, type ToggleRouter } from "./toggle-router";

function withToggleRouter(testFunction: (toggleRouter: ToggleRouter) => void): TestFunction {
	return () => {
		const toggleRouter = createToggleRouter();

		testFunction(toggleRouter);
	};
}

test(
	"featureIsEnabled() returns false when feature was never set",
	withToggleRouter((toggleRouter) => {
		const featureIsEnabled = toggleRouter.featureIsEnabled("game-point-buttons");

		assert.isFalse(featureIsEnabled);
	})
);

test(
	"featureIsEnabled() returns false when feature name is unknown",
	withToggleRouter((toggleRouter) => {
		const featureIsEnabled = toggleRouter.featureIsEnabled("foo" as FeatureName);

		assert.isFalse(featureIsEnabled);
	})
);

test(
	"setFeature() sets given feature name to true",
	withToggleRouter((toggleRouter) => {
		toggleRouter.setFeature("game-point-buttons", true);
		const featureIsEnabled = toggleRouter.featureIsEnabled("game-point-buttons");

		assert.isTrue(featureIsEnabled);
	})
);

test(
	"setFeature() sets given feature name to false",
	withToggleRouter((toggleRouter) => {
		toggleRouter.setFeature("game-point-buttons", false);
		const featureIsEnabled = toggleRouter.featureIsEnabled("game-point-buttons");

		assert.isFalse(featureIsEnabled);
	})
);
