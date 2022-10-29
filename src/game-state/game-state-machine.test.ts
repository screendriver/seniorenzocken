import { assert, test } from "vitest";
import { createGameStateMachine } from "./game-state-machine";

test('gameStateMachine has initial state "gameNotStarted"', () => {
	const gameStateMachine = createGameStateMachine();

	assert.strictEqual(gameStateMachine.initialState.value, "gameNotStarted");
});
