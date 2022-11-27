import { assert, test, type TestFunction } from "vitest";
import { createMachine, interpret } from "xstate";
import is from "@sindresorhus/is";
import {
	createGameStateMachine,
	type GameStateMachineContext,
	type GameStateMachineEvent
} from "./game-state-machine.js";
import type { TeamStateMachine, TeamStateMachineEvent } from "../team/team-state-machine.js";

function createFakeTeamStateMachine(): TeamStateMachine {
	return createMachine({
		id: "fakeTeamStateMachine",
		predictableActionArguments: true,
		preserveActionOrder: true,
		on: {
			UPDATE_TEAM_NAME: {},
			RESET: {}
		},
		states: {}
	}) as unknown as TeamStateMachine;
}

interface TestGameStateMachineOptions {
	readonly expectedContext?: Omit<GameStateMachineContext, "teamStateMachineActor">;
	readonly expectedStateValue?: unknown;
	readonly eventsToSend?: readonly GameStateMachineEvent[];
	readonly expectedForwardedEvents?: readonly TeamStateMachineEvent[];
}

function testGameStateMachine(options: TestGameStateMachineOptions): TestFunction {
	const { expectedContext, expectedStateValue, eventsToSend = [], expectedForwardedEvents } = options;

	return () => {
		const fakeTeamStateMachine = createFakeTeamStateMachine();
		const gameStateMachine = createGameStateMachine({ teamStateMachine: fakeTeamStateMachine });
		const gameStateMachineService = interpret(gameStateMachine);

		gameStateMachineService.start();

		const { teamStateMachineActor } = gameStateMachineService.getSnapshot().context;

		if (teamStateMachineActor.isNothing) {
			throw new Error("Team state machine actor was not spawned");
		}

		const teamStateMachineActorEvents: unknown[] = [];

		teamStateMachineActor.value.subscribe((state) => {
			const eventType = state.event.type;

			if (eventType === "UPDATE_TEAM_NAME" || eventType === "UPDATE_GAME_POINT" || eventType === "RESET") {
				teamStateMachineActorEvents.push(state.event);
			}
		});

		eventsToSend.forEach((eventToSend) => {
			gameStateMachineService.send(eventToSend);
		});

		const serviceSnapshot = gameStateMachineService.getSnapshot();

		if (is.object(expectedContext)) {
			const { teamStateMachineActor, ...contextWithoutTeamStateMachineActor } = serviceSnapshot.context;

			assert.deepStrictEqual(expectedContext, contextWithoutTeamStateMachineActor);
		} else if (!is.undefined(expectedStateValue)) {
			assert.deepStrictEqual(serviceSnapshot.value, expectedStateValue);
		} else if (is.array(expectedForwardedEvents)) {
			assert.deepStrictEqual(teamStateMachineActorEvents, expectedForwardedEvents);
		}
	};
}

test(
	"gameStateMachine has an initial context set",
	testGameStateMachine({
		expectedContext: {
			teams: new Map(),
			canGameBeStarted: false
		}
	})
);

test(
	'gameStateMachine has initial state "gameNotRunning"',
	testGameStateMachine({
		expectedStateValue: "gameNotRunning"
	})
);

test(
	'gameStateMachine forwards "UPDATE_TEAM_NAME" event to team state machine',
	testGameStateMachine({
		eventsToSend: [{ type: "UPDATE_TEAM_NAME", teamNumber: 1, teamName: "foo" }],
		expectedForwardedEvents: [{ type: "UPDATE_TEAM_NAME", teamNumber: 1, teamName: "foo" }]
	})
);

test(
	'gameStateMachine sets teams in context on "PARTIALLY_FILLED_TEAMS" event',
	testGameStateMachine({
		eventsToSend: [
			{
				type: "PARTIALLY_FILLED_TEAMS",
				teams: new Map([[1, { teamName: "foo", gamePoints: 0, isStretched: false }]])
			}
		],
		expectedContext: {
			canGameBeStarted: false,
			teams: new Map([[1, { teamName: "foo", gamePoints: 0, isStretched: false }]])
		}
	})
);

test(
	'gameStateMachine sets teams and "canGameBeStarted" to true in context on "FULLY_FILLED_TEAMS" event',
	testGameStateMachine({
		eventsToSend: [
			{
				type: "FULLY_FILLED_TEAMS",
				teams: new Map([[1, { teamName: "foo", gamePoints: 0, isStretched: false }]])
			}
		],
		expectedContext: {
			canGameBeStarted: true,
			teams: new Map([[1, { teamName: "foo", gamePoints: 0, isStretched: false }]])
		}
	})
);

test(
	'gameStateMachine sets teams to an empty Map and canGameBeStarted to false on "TEAMS_EMPTY" event',
	testGameStateMachine({
		eventsToSend: [
			{
				type: "FULLY_FILLED_TEAMS",
				teams: new Map([[1, { teamName: "foo", gamePoints: 0, isStretched: false }]])
			},
			{ type: "TEAMS_EMPTY" }
		],
		expectedContext: {
			canGameBeStarted: false,
			teams: new Map()
		}
	})
);

test(
	'gameStateMachine transit to "gameRunning.audio.notPlaying" and "gameRunning.confetti.hidden" in parallel on "START_GAME" event when game can be started',
	testGameStateMachine({
		eventsToSend: [
			{
				type: "FULLY_FILLED_TEAMS",
				teams: new Map([[1, { teamName: "foo", gamePoints: 0, isStretched: false }]])
			},
			{ type: "START_GAME" }
		],
		expectedStateValue: {
			gameRunning: {
				audio: "notPlaying",
				confetti: "hidden"
			}
		}
	})
);

test(
	'gameStateMachine does not transit to "gameRunning" on "START_GAME" event when game cannot be started',
	testGameStateMachine({
		eventsToSend: [
			{
				type: "PARTIALLY_FILLED_TEAMS",
				teams: new Map([[1, { teamName: "o", gamePoints: 0, isStretched: false }]])
			},
			{ type: "START_GAME" }
		],
		expectedStateValue: "gameNotRunning"
	})
);

test(
	'gameStateMachine forwards "UPDATE_GAME_POINT" event to team state machine',
	testGameStateMachine({
		eventsToSend: [
			{
				type: "FULLY_FILLED_TEAMS",
				teams: new Map([[1, { teamName: "foo", gamePoints: 0, isStretched: false }]])
			},
			{ type: "START_GAME" },
			{ type: "UPDATE_GAME_POINT", teamNumber: 1, gamePoints: 2 }
		],
		expectedForwardedEvents: [{ type: "UPDATE_GAME_POINT", teamNumber: 1, gamePoints: 2 }]
	})
);

test(
	'gameStateMachine updates team game point on "GAME_POINT_UPDATED" event',
	testGameStateMachine({
		eventsToSend: [
			{
				type: "FULLY_FILLED_TEAMS",
				teams: new Map([[1, { teamName: "foo", gamePoints: 0, isStretched: false }]])
			},
			{ type: "START_GAME" },
			{
				type: "GAME_POINT_UPDATED",
				gamePoints: 3,
				teams: new Map([[1, { teamName: "foo", gamePoints: 3, isStretched: false }]]),
				teamNumber: 1
			}
		],
		expectedContext: {
			canGameBeStarted: true,
			teams: new Map([[1, { teamName: "foo", gamePoints: 3, isStretched: false }]])
		}
	})
);

test(
	'gameStateMachine transit to "gameRunning.audio.playing" on "GAME_POINT_UPDATED" event',
	testGameStateMachine({
		eventsToSend: [
			{
				type: "FULLY_FILLED_TEAMS",
				teams: new Map([[1, { teamName: "foo", gamePoints: 0, isStretched: false }]])
			},
			{ type: "START_GAME" },
			{
				type: "GAME_POINT_UPDATED",
				gamePoints: 3,
				teams: new Map([[1, { teamName: "foo", gamePoints: 3, isStretched: false }]]),
				teamNumber: 1
			}
		],
		expectedStateValue: {
			gameRunning: {
				audio: "playing",
				confetti: "hidden"
			}
		}
	})
);

test(
	'gameStateMachine transit from "gameRunning.audio.playing" to "gameRunning.audio.notPlaying" on "AUDIO_ENDED" event',
	testGameStateMachine({
		eventsToSend: [
			{
				type: "FULLY_FILLED_TEAMS",
				teams: new Map([[1, { teamName: "foo", gamePoints: 0, isStretched: false }]])
			},
			{ type: "START_GAME" },
			{
				type: "GAME_POINT_UPDATED",
				gamePoints: 3,
				teams: new Map([[1, { teamName: "foo", gamePoints: 3, isStretched: false }]]),
				teamNumber: 1
			},
			{ type: "AUDIO_ENDED" }
		],
		expectedStateValue: {
			gameRunning: {
				audio: "notPlaying",
				confetti: "hidden"
			}
		}
	})
);

test(
	'gameStateMachine transit from "gameRunning.confetti.hidden" to "gameRunning.confetti.visible" on "GAME_POINT_UPDATED" event when confetti can be shown',
	testGameStateMachine({
		eventsToSend: [
			{
				type: "FULLY_FILLED_TEAMS",
				teams: new Map([[1, { teamName: "foo", gamePoints: 0, isStretched: false }]])
			},
			{ type: "START_GAME" },
			{
				type: "GAME_POINT_UPDATED",
				gamePoints: 4,
				teams: new Map([[1, { teamName: "foo", gamePoints: 3, isStretched: false }]]),
				teamNumber: 1
			}
		],
		expectedStateValue: {
			gameRunning: {
				audio: "playing",
				confetti: "visible"
			}
		}
	})
);

test(
	'gameStateMachine transit from "gameRunning.confetti.visible" to "gameRunning.confetti.hidden" on "CONFETTI_HIDDEN" event',
	testGameStateMachine({
		eventsToSend: [
			{
				type: "FULLY_FILLED_TEAMS",
				teams: new Map([[1, { teamName: "foo", gamePoints: 0, isStretched: false }]])
			},
			{ type: "START_GAME" },
			{
				type: "GAME_POINT_UPDATED",
				gamePoints: 4,
				teams: new Map([[1, { teamName: "foo", gamePoints: 3, isStretched: false }]]),
				teamNumber: 1
			},
			{ type: "CONFETTI_HIDDEN" }
		],
		expectedStateValue: {
			gameRunning: {
				audio: "playing",
				confetti: "hidden"
			}
		}
	})
);

test(
	'gameStateMachine transit to "gameOver" on "GAME_POINT_UPDATED" event when current state is "gameRunning.audio.notPlaying" and one team reached 15 game points',
	testGameStateMachine({
		eventsToSend: [
			{
				type: "FULLY_FILLED_TEAMS",
				teams: new Map([[1, { teamName: "foo", gamePoints: 0, isStretched: false }]])
			},
			{ type: "START_GAME" },
			{
				type: "GAME_POINT_UPDATED",
				gamePoints: 15,
				teams: new Map([[1, { teamName: "foo", gamePoints: 15, isStretched: true }]]),
				teamNumber: 1
			}
		],
		expectedStateValue: "gameOver"
	})
);

test(
	'gameStateMachine transits from "gameOver" to "gameNotRunning" on "START_NEW_GAME" event',
	testGameStateMachine({
		eventsToSend: [
			{
				type: "FULLY_FILLED_TEAMS",
				teams: new Map([[1, { teamName: "foo", gamePoints: 0, isStretched: false }]])
			},
			{ type: "START_GAME" },
			{
				type: "GAME_POINT_UPDATED",
				gamePoints: 16,
				teams: new Map([[1, { teamName: "foo", gamePoints: 16, isStretched: false }]]),
				teamNumber: 1
			},
			{ type: "START_NEW_GAME" }
		],
		expectedStateValue: "gameNotRunning"
	})
);

test(
	'gameStateMachine resets context when transit from "gameOver" to "gameNotRunning" on "START_NEW_GAME" event',
	testGameStateMachine({
		eventsToSend: [
			{
				type: "FULLY_FILLED_TEAMS",
				teams: new Map([[1, { teamName: "foo", gamePoints: 0, isStretched: false }]])
			},
			{ type: "START_GAME" },
			{
				type: "GAME_POINT_UPDATED",
				gamePoints: 15,
				teams: new Map([[1, { teamName: "foo", gamePoints: 15, isStretched: false }]]),
				teamNumber: 1
			},
			{ type: "START_NEW_GAME" }
		],
		expectedContext: {
			teams: new Map(),
			canGameBeStarted: false
		}
	})
);

test(
	'gameStateMachine sends "RESET" event to team state machine when transit from "gameOver" to "gameNotRunning" on "START_NEW_GAME" event',
	testGameStateMachine({
		eventsToSend: [
			{
				type: "FULLY_FILLED_TEAMS",
				teams: new Map([[1, { teamName: "foo", gamePoints: 0, isStretched: false }]])
			},
			{ type: "START_GAME" },
			{
				type: "GAME_POINT_UPDATED",
				gamePoints: 15,
				teams: new Map([[1, { teamName: "foo", gamePoints: 15, isStretched: false }]]),
				teamNumber: 1
			},
			{ type: "START_NEW_GAME" }
		],
		expectedForwardedEvents: [{ type: "RESET" }]
	})
);
