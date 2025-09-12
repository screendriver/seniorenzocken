import { describe, it, expect, vi, type TestFunction } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { Factory } from "fishery";
import type { NotPersistedTeam } from "../../shared/team.js";
import { createTRPCClient } from "../trpc/client.js";
import { useGameStore } from "./game-store.js";

const notPersistedTeamFactory = Factory.define<NotPersistedTeam>(() => {
	return {
		teamNumber: 1,
		name: "",
		currentRoundGamePoints: 0,
		matchTotalGamePoints: 0,
		isStretched: false
	};
});

function withPinia(testFunction: () => void): TestFunction {
	return () => {
		setActivePinia(createPinia());

		testFunction();

		vi.clearAllMocks();
	};
}

describe("game store", () => {
	it(
		"has an initial team1 set",
		withPinia(() => {
			const trpcClient = createTRPCClient();
			const gameStore = useGameStore(trpcClient);
			const expected = notPersistedTeamFactory.build({ teamNumber: 1 });

			expect(gameStore.team1).toStrictEqual(expected);
		})
	);

	it(
		"has an initial team2 set",
		withPinia(() => {
			const trpcClient = createTRPCClient();
			const gameStore = useGameStore(trpcClient);
			const expected = notPersistedTeamFactory.build({ teamNumber: 2 });

			expect(gameStore.team2).toStrictEqual(expected);
		})
	);
});
