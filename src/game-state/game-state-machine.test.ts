import { assert, test } from "vitest";
import { createGameStateMachine } from "./game-state-machine";

test('gameStateMachine has initial state "gameNotRunning"', () => {
	const gameStateMachine = createGameStateMachine();

	assert.strictEqual(gameStateMachine.initialState.value, "gameNotRunning");
});

test('gameStateMachine transits from "gameNotRunning" to "gameRunning" on "START_GAME" event', () => {
	const gameStateMachine = createGameStateMachine();
	const gameRunningState = gameStateMachine.transition(gameStateMachine.initialState, "START_GAME");

	assert.strictEqual(gameRunningState.value, "gameRunning");
});

test('gameStateMachine transits from "gameRunning" to "gameNotRunning" on "START_NEW_GAME" event', () => {
	const gameStateMachine = createGameStateMachine();
	const gameRunningState = gameStateMachine.transition(gameStateMachine.initialState, "START_GAME");
	const gameNotRunningState = gameStateMachine.transition(gameRunningState, "START_NEW_GAME");

	assert.strictEqual(gameNotRunningState.value, "gameNotRunning");
});
