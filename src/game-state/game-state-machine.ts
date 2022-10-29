import { createMachine, type StateMachine, type Typestate } from "@xstate/fsm";

export interface Team {
	readonly teamName: string;
	readonly gamePoints: number;
}

export type Teams = ReadonlyMap<number, Team>;

interface GameStateMachineContext {
	readonly teams: Teams;
}

interface StartGameEvent {
	readonly type: "START_GAME";
}

interface StartNewGameEvent {
	readonly type: "START_NEW_GAME";
}

type GameStateMachineEvent = StartGameEvent | StartNewGameEvent;

export type GameStateMachine = StateMachine.Machine<
	GameStateMachineContext,
	GameStateMachineEvent,
	Typestate<GameStateMachineContext>
>;

export function createGameStateMachine(): GameStateMachine {
	return createMachine<GameStateMachineContext, GameStateMachineEvent>({
		id: "gameState",
		initial: "gameNotRunning",
		context: {
			teams: new Map()
		},
		states: {
			gameNotRunning: {
				on: {
					START_GAME: "gameRunning"
				}
			},
			gameRunning: {
				on: {
					START_NEW_GAME: "gameNotRunning"
				}
			}
		}
	});
}
