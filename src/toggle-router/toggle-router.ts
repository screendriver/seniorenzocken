const featureNames: readonly string[] = [];

type FeatureName = typeof featureNames[number];

export interface ToggleRouter {
	featureIsEnabled(featureName: FeatureName): boolean;
}

export function createToggleRouter(): ToggleRouter {
	return {
		featureIsEnabled() {
			return false;
		}
	};
}
