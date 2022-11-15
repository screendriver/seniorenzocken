import { assert, test, vi, type TestFunction } from "vitest";
import { createMachine, interpret } from "xstate";
import is from "@sindresorhus/is";
import {
	createGameStateMachine,
	type GameStateMachineContext,
	type GameStateMachineEvent,
	type GameStateMachineState
} from "./game-state-machine.js";
import type { FeatureName, ToggleRouter } from "../toggle-router/toggle-router.js";
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
	readonly expectedStateValue?: GameStateMachineState["value"];
	readonly eventsToSend?: readonly GameStateMachineEvent[];
	readonly expectedForwardedEvents?: readonly TeamStateMachineEvent[];
}

function testGameStateMachine(options: TestGameStateMachineOptions): TestFunction {
	const { expectedContext, expectedStateValue, eventsToSend = [], expectedForwardedEvents } = options;

	return () => {
		const setFeature = vi.fn<FeatureName[], boolean>();
		const toggleRouter = {
			setFeature
		} as unknown as ToggleRouter;
		const fakeTeamStateMachine = createFakeTeamStateMachine();
		const gameStateMachine = createGameStateMachine({ toggleRouter, teamStateMachine: fakeTeamStateMachine });
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
		} else if (is.string(expectedStateValue)) {
			assert.strictEqual(expectedStateValue, serviceSnapshot.value);
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
			canGameBeStarted: false,
			showConfetti: false
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
			showConfetti: false,
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
			showConfetti: false,
			teams: new Map([[1, { teamName: "foo", gamePoints: 0, isStretched: false }]])
		}
	})
);

test(
	'gameStateMachine sets teams to an empty Map on "TEAMS_EMPTY" event',
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
			showConfetti: false,
			teams: new Map()
		}
	})
);

test(
	'gameStateMachine transit to "gameRunning" on "START_GAME" event when game can be started',
	testGameStateMachine({
		eventsToSend: [
			{
				type: "FULLY_FILLED_TEAMS",
				teams: new Map([[1, { teamName: "foo", gamePoints: 0, isStretched: false }]])
			},
			{ type: "START_GAME" }
		],
		expectedStateValue: "gameRunning"
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
	'gameStateMachine updates team game point on "GAME_POINT_UPDATED" event when current state is "gameRunning"',
	testGameStateMachine({
		eventsToSend: [
			{
				type: "FULLY_FILLED_TEAMS",
				teams: new Map([[1, { teamName: "foo", gamePoints: 0, isStretched: false }]])
			},
			{ type: "START_GAME" },
			{
				type: "GAME_POINT_UPDATED",
				teams: new Map([[1, { teamName: "foo", gamePoints: 3, isStretched: false }]])
			}
		],
		expectedContext: {
			canGameBeStarted: true,
			showConfetti: false,
			teams: new Map([[1, { teamName: "foo", gamePoints: 3, isStretched: false }]])
		}
	})
);

test(
	'gameStateMachine transit to "gameOver" on "GAME_POINT_UPDATED" event when current state is "gameRunning" and one team reached 15 game points',
	testGameStateMachine({
		eventsToSend: [
			{
				type: "FULLY_FILLED_TEAMS",
				teams: new Map([[1, { teamName: "foo", gamePoints: 0, isStretched: false }]])
			},
			{ type: "START_GAME" },
			{
				type: "GAME_POINT_UPDATED",
				teams: new Map([[1, { teamName: "foo", gamePoints: 15, isStretched: true }]])
			}
		],
		expectedContext: {
			canGameBeStarted: true,
			showConfetti: false,
			teams: new Map([[1, { teamName: "foo", gamePoints: 15, isStretched: true }]])
		}
	})
);

test(
	'gameStateMachine sets context property "showConfetti" to true on "GAME_POINT_UPDATED" event when game points equals 4',
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
				teams: new Map([[1, { teamName: "foo", gamePoints: 4, isStretched: false }]])
			}
		],
		expectedContext: {
			canGameBeStarted: true,
			showConfetti: true,
			teams: new Map([[1, { teamName: "foo", gamePoints: 4, isStretched: false }]])
		}
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
			{ type: "UPDATE_GAME_POINT", teamNumber: 1, gamePoints: 16 },
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
			{ type: "UPDATE_GAME_POINT", teamNumber: 1, gamePoints: 4 },
			{ type: "UPDATE_GAME_POINT", teamNumber: 1, gamePoints: 11 },
			{ type: "START_NEW_GAME" }
		],
		expectedContext: {
			teams: new Map(),
			canGameBeStarted: false,
			showConfetti: false
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
			{ type: "UPDATE_GAME_POINT", teamNumber: 1, gamePoints: 4 },
			{ type: "UPDATE_GAME_POINT", teamNumber: 1, gamePoints: 11 },
			{ type: "START_NEW_GAME" }
		],
		expectedForwardedEvents: [{ type: "RESET" }]
	})
);
