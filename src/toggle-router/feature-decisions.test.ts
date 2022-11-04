import { assert, test, vi, type Mock } from "vitest";
import { createFeatureDecisions } from "./feature-decisions";
import type { FeatureName, ToggleRouter } from "./toggle-router";

function createToggleRouter(featureIsEnabled: Mock<FeatureName[], boolean>): ToggleRouter {
	return {
		featureIsEnabled
	} as unknown as ToggleRouter;
}

test('showGamePointButtonsInsteadOfRangeInput() returns false when toggle router returns false for feature flag "game-point-buttons"', () => {
	const featureIsEnabled = vi.fn<FeatureName[], boolean>().mockReturnValue(false);
	const toggleRouter = createToggleRouter(featureIsEnabled);
	const featureDecisions = createFeatureDecisions(toggleRouter);

	assert.isFalse(featureDecisions.showGamePointButtonsInsteadOfRangeInput());
	assert.deepStrictEqual(featureIsEnabled.mock.lastCall, ["game-point-buttons"]);
});

test('showGamePointButtonsInsteadOfRangeInput() returns true when toggle router returns true for feature flag "game-point-buttons"', () => {
	const featureIsEnabled = vi.fn<FeatureName[], boolean>().mockReturnValue(true);
	const toggleRouter = createToggleRouter(featureIsEnabled);
	const featureDecisions = createFeatureDecisions(toggleRouter);

	assert.isTrue(featureDecisions.showGamePointButtonsInsteadOfRangeInput());
	assert.deepStrictEqual(featureIsEnabled.mock.lastCall, ["game-point-buttons"]);
});
