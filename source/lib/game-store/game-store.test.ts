import test from "ava";
import { get } from "svelte/store";
import { Stack } from "js-sdsl";
import type { GameStoreState } from "./game-store.js";
import { createGameStore } from "./game-store.js";
import { teamFactory } from "../../../test/team-factory.js";

test("gameStore has an initial state", (t) => {
	const gameStore = createGameStore();

	const actual = get(gameStore);
	const expected: GameStoreState = {
		gameRunning: false,
		teams: [teamFactory.build({ teamNumber: 1 }), teamFactory.build({ teamNumber: 2 })],
		gameRounds: new Stack(),
		audioPlaying: false,
		shouldShowConfetti: false,
		isGameOver: false,
	};

	t.deepEqual(actual, expected);
});

test("gameStore.updateTeamName() updates the team name for the first team", (t) => {
	const gameStore = createGameStore();
	const firstTeam = get(gameStore).teams[0];

	gameStore.updateTeamName(firstTeam, "foo");

	t.is(get(gameStore).teams[0].teamName, "foo");
	t.is(get(gameStore).teams[1].teamName, "");
});

test("gameStore.updateTeamName() updates the team name for the second team", (t) => {
	const gameStore = createGameStore();
	const secondTeam = get(gameStore).teams[1];

	gameStore.updateTeamName(secondTeam, "bar");

	t.is(get(gameStore).teams[0].teamName, "");
	t.is(get(gameStore).teams[1].teamName, "bar");
});

test("gameStore.startGame() sets gameRunning to true", (t) => {
	const gameStore = createGameStore();

	gameStore.startGame();

	t.true(get(gameStore).gameRunning);
});

test("gameStore.setCurrentGamePoints() sets current game points for the first team", (t) => {
	const gameStore = createGameStore();
	const firstTeam = get(gameStore).teams[0];

	gameStore.setCurrentGamePoints(firstTeam, 42);

	t.is(get(gameStore).teams[0].currentGamePoints, 42);
	t.is(get(gameStore).teams[1].currentGamePoints, 0);
});

test("gameStore.setCurrentGamePoints() sets current game points for the second team", (t) => {
	const gameStore = createGameStore();
	const secondTeam = get(gameStore).teams[1];

	gameStore.setCurrentGamePoints(secondTeam, 42);

	t.is(get(gameStore).teams[0].currentGamePoints, 0);
	t.is(get(gameStore).teams[1].currentGamePoints, 42);
});

test("gameStore.nextGameRound() adds current game points to total game points", (t) => {
	const gameStore = createGameStore();
	const firstTeam = get(gameStore).teams[0];

	gameStore.setCurrentGamePoints(firstTeam, 4);
	gameStore.nextGameRound();

	t.is(get(gameStore).teams[0].totalGamePoints, 4);
});

test("gameStore.nextGameRound() sets isStreched to false when total game points did not reached 12", (t) => {
	const gameStore = createGameStore();
	const firstTeam = get(gameStore).teams[0];

	gameStore.setCurrentGamePoints(firstTeam, 11);
	gameStore.nextGameRound();

	t.false(get(gameStore).teams[0].isStretched);
});

test("gameStore.nextGameRound() sets isStreched to true when total game points reached 12", (t) => {
	const gameStore = createGameStore();
	const firstTeam = get(gameStore).teams[0];

	gameStore.setCurrentGamePoints(firstTeam, 12);
	gameStore.nextGameRound();

	t.true(get(gameStore).teams[0].isStretched);
});

test("gameStore.nextGameRound() sets isStreched to true when total game points exceeded 12", (t) => {
	const gameStore = createGameStore();
	const firstTeam = get(gameStore).teams[0];

	gameStore.setCurrentGamePoints(firstTeam, 13);
	gameStore.nextGameRound();

	t.true(get(gameStore).teams[0].isStretched);
});

test("gameStore.nextGameRound() sets shouldShowConfetti to true when one of the teams reached 4 game points", (t) => {
	const gameStore = createGameStore();
	const firstTeam = get(gameStore).teams[0];

	gameStore.setCurrentGamePoints(firstTeam, 4);
	gameStore.nextGameRound();

	t.true(get(gameStore).shouldShowConfetti);
});

test("gameStore.nextGameRound() sets isGameOver to true when one of the teams reached 15 total game points", (t) => {
	const gameStore = createGameStore();
	const firstTeam = get(gameStore).teams[0];

	gameStore.setCurrentGamePoints(firstTeam, 15);
	gameStore.nextGameRound();

	t.true(get(gameStore).isGameOver);
});

test("gameStore.nextGameRound() sets isGameOver to true when one of the teams exceeded 15 total game points", (t) => {
	const gameStore = createGameStore();
	const firstTeam = get(gameStore).teams[0];

	gameStore.setCurrentGamePoints(firstTeam, 16);
	gameStore.nextGameRound();

	t.true(get(gameStore).isGameOver);
});

test("gameStore.nextGameRound() resets current game points of all teams", (t) => {
	const gameStore = createGameStore();
	const firstTeam = get(gameStore).teams[0];
	const secondTeam = get(gameStore).teams[0];

	gameStore.setCurrentGamePoints(firstTeam, 3);
	gameStore.setCurrentGamePoints(secondTeam, 2);
	gameStore.nextGameRound();

	t.is(get(gameStore).teams[0].currentGamePoints, 0);
	t.is(get(gameStore).teams[1].currentGamePoints, 0);
});

test("gameStore.nextGameRound() pushes a new game round in game rounds stack", (t) => {
	const gameStore = createGameStore();
	const firstTeam = get(gameStore).teams[0];

	gameStore.setCurrentGamePoints(firstTeam, 3);
	gameStore.nextGameRound();

	t.is(get(gameStore).gameRounds.size(), 1);
	t.deepEqual(get(gameStore).gameRounds.top(), [
		teamFactory.build({ teamNumber: 1, totalGamePoints: 3 }),
		teamFactory.build({ teamNumber: 2 }),
	]);
});

test("gameStore.previousGameRound() does nothing when there is no previous game round", (t) => {
	const gameStore = createGameStore();

	gameStore.previousGameRound();

	t.is(get(gameStore).gameRounds.size(), 0);
	t.deepEqual(get(gameStore).teams, [teamFactory.build({ teamNumber: 1 }), teamFactory.build({ teamNumber: 2 })]);
});

test("gameStore.previousGameRound() drops the latest game round and resets teams to the previous state when there does only one game round exist", (t) => {
	const gameStore = createGameStore();
	const firstTeam = get(gameStore).teams[0];

	gameStore.setCurrentGamePoints(firstTeam, 2);
	gameStore.nextGameRound();
	gameStore.previousGameRound();

	t.is(get(gameStore).gameRounds.size(), 0);
	t.deepEqual(get(gameStore).teams, [teamFactory.build({ teamNumber: 1 }), teamFactory.build({ teamNumber: 2 })]);
});

test("gameStore.previousGameRound() drops the latest game round and resets teams to the previous state when multiple game rounds exist", (t) => {
	const gameStore = createGameStore();

	gameStore.setCurrentGamePoints(get(gameStore).teams[0], 2);
	gameStore.nextGameRound();
	gameStore.setCurrentGamePoints(get(gameStore).teams[0], 3);
	gameStore.nextGameRound();
	gameStore.previousGameRound();

	t.is(get(gameStore).gameRounds.size(), 1);
	t.deepEqual(get(gameStore).teams, [
		teamFactory.build({ teamNumber: 1, totalGamePoints: 2 }),
		teamFactory.build({ teamNumber: 2 }),
	]);
});

test("gameStore.gamePointsAudioEnded() sets audioPlaying to false", (t) => {
	const gameStore = createGameStore();
	const firstTeam = get(gameStore).teams[0];

	gameStore.setCurrentGamePoints(firstTeam, 2);
	gameStore.nextGameRound();
	gameStore.gamePointsAudioEnded();

	t.false(get(gameStore).audioPlaying);
});

test("gameStore.showConfetti() sets shouldShowConfetti to true", (t) => {
	const gameStore = createGameStore();

	gameStore.showConfetti();

	t.true(get(gameStore).shouldShowConfetti);
});

test("gameStore.hideConfetti() sets shouldShowConfetti to false", (t) => {
	const gameStore = createGameStore();

	gameStore.showConfetti();
	gameStore.hideConfetti();

	t.false(get(gameStore).shouldShowConfetti);
});

test("gameStore.startNewGame() resets the overall state", (t) => {
	const gameStore = createGameStore();
	const firstTeam = get(gameStore).teams[0];

	gameStore.setCurrentGamePoints(firstTeam, 2);
	gameStore.nextGameRound();
	gameStore.showConfetti();
	gameStore.startNewGame();

	const actual = get(gameStore);
	const expected: GameStoreState = {
		gameRunning: false,
		teams: [teamFactory.build({ teamNumber: 1 }), teamFactory.build({ teamNumber: 2 })],
		gameRounds: new Stack(),
		audioPlaying: false,
		shouldShowConfetti: false,
		isGameOver: false,
	};

	t.deepEqual(actual, expected);
});
