import type { ToggleRouter } from "./toggle-router";

export interface FeatureDecisions {
	showGamePointButtonsInsteadOfRangeInput(): boolean;
}

export function createFeatureDecisions(toggleRouter: ToggleRouter): FeatureDecisions {
	return {
		showGamePointButtonsInsteadOfRangeInput() {
			return toggleRouter.featureIsEnabled("game-point-buttons");
		}
	};
}
