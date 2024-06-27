import { test, expect, type TestFunction } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { Factory } from "fishery";
import { useGameStore } from "../game-store";

const teamFactory = Factory.define<Team>(() => {
	return {
		teamNumber: 1,
		teamName: "",
		gamePoints: 0,
		isStretched: false,
	};
});

function withActivePinia(test: () => void): TestFunction {
	setActivePinia(createPinia());

	return () => {
		test();
	};
}

test(
	"game store has an initial team1 set",
	withActivePinia(() => {
		const gameStore = useGameStore();
		const expected = teamFactory.build({ teamNumber: 1 });

		expect(gameStore.team1).toEqual(expected);
	}),
);

test(
	"game store has an initial team2 set",
	withActivePinia(() => {
		const gameStore = useGameStore();
		const expected = teamFactory.build({ teamNumber: 2 });

		expect(gameStore.team2).toEqual(expected);
	}),
);

test(
	"game store has an initial team 1 game point set",
	withActivePinia(() => {
		const gameStore = useGameStore();

		expect(gameStore.team1GamePoint).toBe(0);
	}),
);

test(
	"game store has an initial team 2 game point set",
	withActivePinia(() => {
		const gameStore = useGameStore();

		expect(gameStore.team2GamePoint).toBe(0);
	}),
);
