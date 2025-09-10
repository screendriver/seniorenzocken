import { describe, it, expect, type TestFunction } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useSessionGameStore } from "./session-game-store";

function withPinia(testFunction: () => void): TestFunction {
	return () => {
		setActivePinia(createPinia());

		testFunction();
	};
}

describe("session game store", () => {
	it(
		"has an initial isAudioPlaying set to false",
		withPinia(() => {
			const sessionGameStore = useSessionGameStore();

			expect(sessionGameStore.isAudioPlaying).toBe(false);
		})
	);
});
