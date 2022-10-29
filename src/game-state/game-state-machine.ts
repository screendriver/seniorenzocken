import { createMachine } from "@xstate/fsm";

export interface Team {
	readonly teamName: string;
	readonly gamePoints: number;
}

export type Teams = ReadonlyMap<number, Team>;

interface GameStateMachineContext {
	readonly teams: Teams;
}

export function createGameStateMachine() {
	return createMachine<GameStateMachineContext>({
		id: "gameState",
		initial: "gameNotStarted",
		context: {
			teams: new Map()
		},
		states: {
			gameNotStarted: {},
			gameStarted: {}
		}
	});
}
