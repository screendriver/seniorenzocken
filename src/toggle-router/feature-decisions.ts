import type { ToggleRouter } from "./toggle-router";

interface FeatureDecisions {
	showGamePointButtonsInsteadOfRangeInput(): boolean;
}

export function createFeatureDecisions(toggleRouter: ToggleRouter): FeatureDecisions {
	return {
		showGamePointButtonsInsteadOfRangeInput() {
			return toggleRouter.featureIsEnabled("game-point-buttons");
		}
	};
}
