import Maybe from "true-myth/maybe";

const featureNames = ["game-point-buttons"] as const;

export type FeatureName = typeof featureNames[number];

export interface ToggleRouter {
	setFeature(featureName: FeatureName, isEnabled: boolean): void;
	featureIsEnabled(featureName: FeatureName): boolean;
}

export function createToggleRouter(): ToggleRouter {
	const features = new Map<FeatureName, boolean>();

	return {
		setFeature(featureName, isEnabled) {
			features.set(featureName, isEnabled);
		},
		featureIsEnabled(featureName) {
			return Maybe.of(features.get(featureName)).unwrapOr(false);
		}
	};
}
