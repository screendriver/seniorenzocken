import { suite, test, expect, beforeEach, vi, afterEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { Factory } from "fishery";
import { useGameStore } from "./game-store.ts";
import type { NotPersistedTeam } from "../../shared/team.ts";

const notPersistedTeamFactory = Factory.define<NotPersistedTeam>(() => {
	return {
		teamNumber: 1,
		name: "",
		currentRoundGamePoints: 0,
		matchTotalGamePoints: 0,
		isStretched: false,
	};
});

beforeEach(() => {
	setActivePinia(createPinia());
});

afterEach(() => {
	vi.clearAllMocks();
});

suite("game store", () => {
	test("game store has an initial team1 set", () => {
		const gameStore = useGameStore();
		const expected = notPersistedTeamFactory.build({ teamNumber: 1 });

		expect(gameStore.team1).toStrictEqual(expected);
	});

	test("game store has an initial team2 set", () => {
		const gameStore = useGameStore();
		const expected = notPersistedTeamFactory.build({ teamNumber: 2 });

		expect(gameStore.team2).toStrictEqual(expected);
	});
});
