import { describe, it, expect, assert, type TestFunction } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { Factory } from "fishery";
import { isJust, isNothing } from "true-myth/maybe";
import { useSessionGameStore } from "../game-store/session-game-store.js";
import type { CurrentGameRoundSession } from "../../shared/current-game-round.js";
import { useGamePoints } from "./game-points.js";

const currentGameRoundSessionFactory = Factory.define<CurrentGameRoundSession>(() => {
	return {
		teams: [],
		gamePointsPerRound: [0, 2, 3, 4],
		hasPreviousGameRounds: false
	};
});

function withPinia(testFunction: () => void): TestFunction {
	return () => {
		setActivePinia(createPinia());

		testFunction();
	};
}

describe("selectGamePoints", () => {
	it(
		"returns an empty object",
		withPinia(() => {
			const { selectedGamePoints } = useGamePoints();

			expect(selectedGamePoints.value).toStrictEqual({});
		})
	);
});

describe("isPreviousGameRoundEnabled", () => {
	it(
		"returns false when there are no previous game rounds",
		withPinia(() => {
			const { isPreviousGameRoundEnabled } = useGamePoints();

			expect(isPreviousGameRoundEnabled.value).toBe(false);
		})
	);

	it(
		"returns false when there are no previous game rounds and audio is playing",
		withPinia(() => {
			const sessionGameStore = useSessionGameStore();
			sessionGameStore.isAudioPlaying = true;

			const { isPreviousGameRoundEnabled } = useGamePoints();

			expect(isPreviousGameRoundEnabled.value).toBe(false);
		})
	);

	it(
		"returns false when there are previous game rounds but audio is playing",
		withPinia(() => {
			const currentGameRoundSession = currentGameRoundSessionFactory.build({ hasPreviousGameRounds: true });
			const sessionGameStore = useSessionGameStore();
			sessionGameStore.isAudioPlaying = true;

			const { isPreviousGameRoundEnabled, fillSelectedGamePoints } = useGamePoints();

			fillSelectedGamePoints(currentGameRoundSession);

			expect(isPreviousGameRoundEnabled.value).toBe(false);
		})
	);

	it(
		"returns true when there are previous game rounds and audio is not playing",
		withPinia(() => {
			const currentGameRoundSession = currentGameRoundSessionFactory.build({ hasPreviousGameRounds: true });
			const { isPreviousGameRoundEnabled, fillSelectedGamePoints } = useGamePoints();

			fillSelectedGamePoints(currentGameRoundSession);

			expect(isPreviousGameRoundEnabled.value).toBe(true);
		})
	);
});

describe("isNextGameRoundEnabled", () => {
	it(
		"returns false when there are no selected game points",
		withPinia(() => {
			const { isNextGameRoundEnabled } = useGamePoints();

			expect(isNextGameRoundEnabled.value).toBe(false);
		})
	);

	it(
		"returns false when there are selected game points but all of them equals -1",
		withPinia(() => {
			const currentGameRoundSession = currentGameRoundSessionFactory.build({
				teams: [{ teamId: 1 }, { teamId: 2 }]
			});

			const { isNextGameRoundEnabled, fillSelectedGamePoints } = useGamePoints();

			fillSelectedGamePoints(currentGameRoundSession);

			expect(isNextGameRoundEnabled.value).toBe(false);
		})
	);

	it(
		"returns false when there are selected game points but all of them equals 0",
		withPinia(() => {
			const currentGameRoundSession = currentGameRoundSessionFactory.build({
				teams: [{ teamId: 1 }, { teamId: 2 }]
			});

			const { isNextGameRoundEnabled, fillSelectedGamePoints, selectedGamePoints } = useGamePoints();

			fillSelectedGamePoints(currentGameRoundSession);
			selectedGamePoints.value = { 1: 0, 2: 0 };

			expect(isNextGameRoundEnabled.value).toBe(false);
		})
	);

	it(
		"returns false when there are selected game points, one of them equals 0 but audio is playing",
		withPinia(() => {
			const currentGameRoundSession = currentGameRoundSessionFactory.build({
				teams: [{ teamId: 1 }, { teamId: 2 }]
			});

			const sessionGameStore = useSessionGameStore();
			sessionGameStore.isAudioPlaying = true;

			const { isNextGameRoundEnabled, fillSelectedGamePoints, selectedGamePoints } = useGamePoints();

			fillSelectedGamePoints(currentGameRoundSession);
			selectedGamePoints.value = { 1: 0, 2: 2 };

			expect(isNextGameRoundEnabled.value).toBe(false);
		})
	);

	it(
		"returns true when there are selected game points, one of them equals 0 and audio is not playing",
		withPinia(() => {
			const currentGameRoundSession = currentGameRoundSessionFactory.build({
				teams: [{ teamId: 1 }, { teamId: 2 }]
			});

			const { isNextGameRoundEnabled, fillSelectedGamePoints, selectedGamePoints } = useGamePoints();

			fillSelectedGamePoints(currentGameRoundSession);
			selectedGamePoints.value = { 1: 0, 2: 2 };

			expect(isNextGameRoundEnabled.value).toBe(true);
		})
	);
});

describe("selectedGamePoint", () => {
	it(
		"returns a Nothing when there are no selected game points",
		withPinia(() => {
			const { selectedGamePoint } = useGamePoints();

			assert(isNothing(selectedGamePoint.value));
		})
	);

	it(
		"returns a Nothing when all teams have 0 game points",
		withPinia(() => {
			const currentGameRoundSession = currentGameRoundSessionFactory.build({
				teams: [{ teamId: 1 }, { teamId: 2 }]
			});

			const { selectedGamePoint, selectedGamePoints, fillSelectedGamePoints } = useGamePoints();

			fillSelectedGamePoints(currentGameRoundSession);
			selectedGamePoints.value = { 1: 0, 2: 0 };

			assert(isNothing(selectedGamePoint.value));
		})
	);

	it(
		"returns a Just when one teams has more than 0 game points",
		withPinia(() => {
			const currentGameRoundSession = currentGameRoundSessionFactory.build({
				teams: [{ teamId: 1 }, { teamId: 2 }]
			});

			const { selectedGamePoint, selectedGamePoints, fillSelectedGamePoints } = useGamePoints();

			fillSelectedGamePoints(currentGameRoundSession);
			selectedGamePoints.value = { 1: 0, 2: 2 };

			assert(isJust(selectedGamePoint.value));

			expect(selectedGamePoint.value.value).toStrictEqual({ teamId: 2, selectedGamePoint: 2 });
		})
	);

	it(
		"returns a Just with the first team found that has more than 0 game points",
		withPinia(() => {
			const currentGameRoundSession = currentGameRoundSessionFactory.build({
				teams: [{ teamId: 1 }, { teamId: 2 }, { teamId: 3 }]
			});

			const { selectedGamePoint, selectedGamePoints, fillSelectedGamePoints } = useGamePoints();

			fillSelectedGamePoints(currentGameRoundSession);
			selectedGamePoints.value = { 1: 4, 2: 0, 3: 2 };

			assert(isJust(selectedGamePoint.value));

			expect(selectedGamePoint.value.value).toStrictEqual({ teamId: 1, selectedGamePoint: 4 });
		})
	);
});

describe("isGamePointEnabled()", () => {
	it(
		"returns false when audio is playing",
		withPinia(() => {
			const sessionGameStore = useSessionGameStore();
			sessionGameStore.isAudioPlaying = true;

			const { isGamePointEnabled } = useGamePoints();

			expect(isGamePointEnabled(0)).toBe(false);
		})
	);

	it(
		"returns true when all selected game points are empty",
		withPinia(() => {
			const currentGameRoundSession = currentGameRoundSessionFactory.build({
				teams: [{ teamId: 1 }, { teamId: 2 }]
			});

			const { isGamePointEnabled, fillSelectedGamePoints } = useGamePoints();

			fillSelectedGamePoints(currentGameRoundSession);

			expect(isGamePointEnabled(0)).toBe(true);
		})
	);

	it(
		"returns true when team id could not be found",
		withPinia(() => {
			const currentGameRoundSession = currentGameRoundSessionFactory.build({
				teams: [{ teamId: 1 }, { teamId: 2 }]
			});

			const { isGamePointEnabled, fillSelectedGamePoints, selectedGamePoints } = useGamePoints();

			fillSelectedGamePoints(currentGameRoundSession);
			selectedGamePoints.value = { 1: 0, 2: 2 };

			expect(isGamePointEnabled(42)).toBe(true);
		})
	);

	it(
		"returns true when found game point is greater than minimum game points",
		withPinia(() => {
			const currentGameRoundSession = currentGameRoundSessionFactory.build({
				teams: [{ teamId: 1 }, { teamId: 2 }]
			});

			const { isGamePointEnabled, fillSelectedGamePoints, selectedGamePoints } = useGamePoints();

			fillSelectedGamePoints(currentGameRoundSession);
			selectedGamePoints.value = { 1: 2, 2: 0 };

			expect(isGamePointEnabled(1)).toBe(true);
		})
	);

	it(
		"returns false when found game point is not greater than minimum game points",
		withPinia(() => {
			const currentGameRoundSession = currentGameRoundSessionFactory.build({
				teams: [{ teamId: 1 }, { teamId: 2 }]
			});

			const { isGamePointEnabled, fillSelectedGamePoints, selectedGamePoints } = useGamePoints();

			fillSelectedGamePoints(currentGameRoundSession);
			selectedGamePoints.value = { 1: 2, 2: 0 };

			expect(isGamePointEnabled(2)).toBe(false);
		})
	);
});

describe("clearSelectedGamePoints()", () => {
	it(
		"clears previously filled selected game points",
		withPinia(() => {
			const currentGameRoundSession = currentGameRoundSessionFactory.build({
				teams: [{ teamId: 1 }, { teamId: 2 }]
			});

			const { selectedGamePoints, fillSelectedGamePoints, clearSelectedGamePoints } = useGamePoints();

			fillSelectedGamePoints(currentGameRoundSession);

			expect(selectedGamePoints.value).toStrictEqual({ 1: -1, 2: -1 });

			clearSelectedGamePoints();

			expect(selectedGamePoints.value).toStrictEqual({});
		})
	);
});
