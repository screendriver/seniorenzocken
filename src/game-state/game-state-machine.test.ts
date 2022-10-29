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

test('gameStateMachine transits from "gameRunning" to "gameOver" on "GAME_OVER" event', () => {
	const gameStateMachine = createGameStateMachine();
	const gameRunningState = gameStateMachine.transition(gameStateMachine.initialState, "START_GAME");
	const gameOverState = gameStateMachine.transition(gameRunningState, "GAME_OVER");

	assert.strictEqual(gameOverState.value, "gameOver");
});

test('gameStateMachine transits from "gameOver" to "gameNotRunning" on "START_NEW_GAME" event', () => {
	const gameStateMachine = createGameStateMachine();
	const gameRunningState = gameStateMachine.transition(gameStateMachine.initialState, "START_GAME");
	const gameOverState = gameStateMachine.transition(gameRunningState, "GAME_OVER");
	const gameNotRunningState = gameStateMachine.transition(gameOverState, "START_NEW_GAME");

	assert.strictEqual(gameNotRunningState.value, "gameNotRunning");
});
