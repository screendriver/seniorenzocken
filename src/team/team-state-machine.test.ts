import is from "@sindresorhus/is";
import Maybe from "true-myth/maybe";
import { assert, test, type TestFunction } from "vitest";
import {
	assign,
	createMachine,
	interpret,
	spawn,
	type ActorRefFrom,
	type AnyEventObject,
	type StateMachine,
	type StateSchema,
	type Typestate
} from "xstate";
import type { GameWebStorage } from "../storage/game-web-storage.js";
import { createInMemoryGameWebStorage } from "../storage/test-lib/in-memory-game-web-storage.js";
import {
	createTeamStateMachine,
	type TeamStateMachine,
	type TeamStateMachineContext,
	type TeamStateMachineEvent,
	type TeamStateMachineState,
	possibleSentEventNames,
	type PossibleSentEventNames,
	type TeamStateMachineSentEvent
} from "./team-state-machine.js";

interface TestStateMachineContext {
	readonly teamStateMachineActor: Maybe<ActorRefFrom<TeamStateMachine>>;
}

type TestStateMachine = StateMachine<
	TestStateMachineContext,
	StateSchema,
	AnyEventObject,
	Typestate<TestStateMachineContext>
>;

function createParentStateMachine(teamStateMachine: TeamStateMachine): TestStateMachine {
	return createMachine({
		id: "parentMachine",
		initial: "test",
		predictableActionArguments: true,
		preserveActionOrder: true,
		context: {
			teamStateMachineActor: Maybe.nothing()
		},
		states: {
			test: {
				entry: assign({
					teamStateMachineActor() {
						const actorReference = spawn(teamStateMachine, { autoForward: true });

						return Maybe.just(actorReference);
					}
				})
			}
		}
	}) as TestStateMachine;
}

interface TestTeamStateMachineOptions {
	readonly expectedContext?: TeamStateMachineContext;
	readonly expectedStateValue?: TeamStateMachineState["value"];
	readonly eventsToSend?: readonly TeamStateMachineEvent[];
	readonly expectedSentEvents?: readonly TeamStateMachineSentEvent[];
	readonly expectedTeamsInStorage?: GameWebStorage["teams"];
}

function testTeamStateMachine(options: TestTeamStateMachineOptions): TestFunction {
	const {
		expectedContext,
		expectedStateValue,
		eventsToSend = [],
		expectedSentEvents,
		expectedTeamsInStorage
	} = options;

	return () => {
		const inMemoryGameWebStorage = createInMemoryGameWebStorage();
		const teamStateMachine = createTeamStateMachine(inMemoryGameWebStorage);
		const parentTestMachine = createParentStateMachine(teamStateMachine);
		const parentTestMachineService = interpret(parentTestMachine);

		let contextValue: unknown;
		let stateValue: unknown;
		const sentEventsFromChild: unknown[] = [];

		parentTestMachineService.onChange((context) => {
			contextValue = context.teamStateMachineActor
				.andThen((teamStateMachineActor) => {
					return Maybe.of(teamStateMachineActor.getSnapshot()?.context);
				})
				.unwrapOr(undefined);
		});

		parentTestMachineService.onEvent((event) => {
			if (possibleSentEventNames.includes(event.type as PossibleSentEventNames)) {
				sentEventsFromChild.push(event);
			}
		});

		parentTestMachineService.onTransition((state) => {
			stateValue = state.context.teamStateMachineActor
				.andThen((teamStateMachineActor) => {
					return Maybe.of(teamStateMachineActor.getSnapshot()?.value);
				})
				.unwrapOr(undefined);
		});

		parentTestMachineService.start();

		eventsToSend.forEach((eventToSend) => {
			parentTestMachineService.send(eventToSend);
		});

		if (is.object(expectedContext)) {
			assert.deepStrictEqual(expectedContext, contextValue);
		} else if (is.string(expectedStateValue)) {
			assert.strictEqual(expectedStateValue, stateValue);
		} else if (is.array(expectedSentEvents)) {
			assert.deepStrictEqual(sentEventsFromChild, expectedSentEvents);
		} else if (is.map(expectedTeamsInStorage)) {
			assert.deepStrictEqual(inMemoryGameWebStorage.teams, expectedTeamsInStorage);
		}
	};
}

test(
	"gameStateMachine has an initial context set",
	testTeamStateMachine({
		expectedContext: {
			teams: new Map()
		}
	})
);

test(
	'gameStateMachine has initial state "teamsEmpty"',
	testTeamStateMachine({
		expectedStateValue: "teamsEmpty"
	})
);

test(
	'gameStateMachine transit from "teamsEmpty" to "partiallyFilledTeams" on "UPDATE_TEAM_NAME" event when just one team without a name is given',
	testTeamStateMachine({
		eventsToSend: [{ type: "UPDATE_TEAM_NAME", teamNumber: 1, teamName: "" }],
		expectedStateValue: "partiallyFilledTeams"
	})
);

test(
	'gameStateMachine transit from "teamsEmpty" to "partiallyFilledTeams" on "UPDATE_TEAM_NAME" event when just one of two teams have a name filled',
	testTeamStateMachine({
		eventsToSend: [
			{ type: "UPDATE_TEAM_NAME", teamNumber: 1, teamName: "foo" },
			{ type: "UPDATE_TEAM_NAME", teamNumber: 2, teamName: "" }
		],
		expectedStateValue: "partiallyFilledTeams"
	})
);

test(
	'gameStateMachine transit from "teamsEmpty" to "fullyFilledTeams" on "UPDATE_TEAM_NAME" event when just one team with a name is given',
	testTeamStateMachine({
		eventsToSend: [{ type: "UPDATE_TEAM_NAME", teamNumber: 1, teamName: "foo" }],
		expectedStateValue: "fullyFilledTeams"
	})
);

test(
	'gameStateMachine transit from "teamsEmpty" to "fullyFilledTeams" on "UPDATE_TEAM_NAME" event when just two teams with a name are given',
	testTeamStateMachine({
		eventsToSend: [
			{ type: "UPDATE_TEAM_NAME", teamNumber: 1, teamName: "foo" },
			{ type: "UPDATE_TEAM_NAME", teamNumber: 2, teamName: "bar" }
		],
		expectedStateValue: "fullyFilledTeams"
	})
);

test(
	'gameStateMachine sets given teams in context when transit from "teamsEmpty" to "partiallyFilledTeams" on "UPDATE_TEAM_NAME" event when one of two teams does not have a name set',
	testTeamStateMachine({
		eventsToSend: [
			{ type: "UPDATE_TEAM_NAME", teamNumber: 1, teamName: "foo" },
			{ type: "UPDATE_TEAM_NAME", teamNumber: 2, teamName: "" }
		],
		expectedContext: {
			teams: new Map([
				[1, { gamePoints: 0, isStretched: false, teamName: "foo" }],
				[2, { gamePoints: 0, isStretched: false, teamName: "" }]
			])
		}
	})
);

test(
	'gameStateMachine sets given team in context when transit from "teamsEmpty" to "fullyFilledTeams" on "UPDATE_TEAM_NAME" event when given team has a name',
	testTeamStateMachine({
		eventsToSend: [{ type: "UPDATE_TEAM_NAME", teamNumber: 1, teamName: "foo" }],
		expectedContext: {
			teams: new Map([[1, { gamePoints: 0, isStretched: false, teamName: "foo" }]])
		}
	})
);

test(
	'gameStateMachine saves teams in storage on "UPDATE_TEAM_NAME" event',
	testTeamStateMachine({
		eventsToSend: [{ type: "UPDATE_TEAM_NAME", teamNumber: 1, teamName: "foo" }],
		expectedTeamsInStorage: new Map([[1, { gamePoints: 0, isStretched: false, teamName: "foo" }]])
	})
);

test(
	'gameStateMachine sends to parent "TEAMS_EMPTY" event when entering "teamsEmpty" state',
	testTeamStateMachine({
		expectedSentEvents: [{ type: "TEAMS_EMPTY" }]
	})
);

test(
	'gameStateMachine sends to parent "PARTIALLY_FILLED_TEAMS" event when transit from "teamsEmpty" to "partiallyFilledTeams"',
	testTeamStateMachine({
		eventsToSend: [{ type: "UPDATE_TEAM_NAME", teamNumber: 1, teamName: "" }],
		expectedSentEvents: [
			{ type: "TEAMS_EMPTY" },
			{
				type: "PARTIALLY_FILLED_TEAMS",
				teams: new Map([[1, { teamName: "", gamePoints: 0, isStretched: false }]])
			}
		]
	})
);

test(
	'gameStateMachine sends to parent "FULLY_FILLED_TEAMS" event when transit from "teamsEmpty" to "fullyFilledTeams"',
	testTeamStateMachine({
		eventsToSend: [{ type: "UPDATE_TEAM_NAME", teamNumber: 1, teamName: "foo" }],
		expectedSentEvents: [
			{ type: "TEAMS_EMPTY" },
			{
				type: "FULLY_FILLED_TEAMS",
				teams: new Map([[1, { teamName: "foo", gamePoints: 0, isStretched: false }]])
			}
		]
	})
);

test(
	'gameStateMachine sends to parent first "FULLY_FILLED_TEAMS" and after that "PARTIALLY_FILLED_TEAMS" when team name gets empty again',
	testTeamStateMachine({
		eventsToSend: [
			{ type: "UPDATE_TEAM_NAME", teamNumber: 1, teamName: "foo" },
			{ type: "UPDATE_TEAM_NAME", teamNumber: 1, teamName: "" }
		],
		expectedSentEvents: [
			{ type: "TEAMS_EMPTY" },
			{
				type: "FULLY_FILLED_TEAMS",
				teams: new Map([[1, { teamName: "foo", gamePoints: 0, isStretched: false }]])
			},
			{
				type: "PARTIALLY_FILLED_TEAMS",
				teams: new Map([[1, { teamName: "", gamePoints: 0, isStretched: false }]])
			}
		]
	})
);

test(
	'gameStateMachine transit from "fullyFilledTeams" to "teamsEmpty" on "RESET" event',
	testTeamStateMachine({
		eventsToSend: [{ type: "UPDATE_TEAM_NAME", teamNumber: 1, teamName: "foo" }, { type: "RESET" }],
		expectedStateValue: "teamsEmpty"
	})
);

test(
	'gameStateMachine updates team game point when in state "fullyFilledTeams" and "UPDATE_GAME_POINT" event is sent',
	testTeamStateMachine({
		eventsToSend: [
			{ type: "UPDATE_TEAM_NAME", teamNumber: 1, teamName: "foo" },
			{ type: "UPDATE_GAME_POINT", teamNumber: 1, gamePoints: 4 }
		],
		expectedContext: {
			teams: new Map([[1, { teamName: "foo", gamePoints: 4, isStretched: false }]])
		}
	})
);

test(
	'gameStateMachine updates team game point when in state "fullyFilledTeams" and multiple "UPDATE_GAME_POINT" events are sent',
	testTeamStateMachine({
		eventsToSend: [
			{ type: "UPDATE_TEAM_NAME", teamNumber: 1, teamName: "foo" },
			{ type: "UPDATE_GAME_POINT", teamNumber: 1, gamePoints: 2 },
			{ type: "UPDATE_GAME_POINT", teamNumber: 1, gamePoints: 3 }
		],
		expectedContext: {
			teams: new Map([[1, { teamName: "foo", gamePoints: 5, isStretched: false }]])
		}
	})
);

test(
	'gameStateMachine sets if a team is stretched when in state "fullyFilledTeams" and multiple "UPDATE_GAME_POINT" events are sent that lead to total game points of 12',
	testTeamStateMachine({
		eventsToSend: [
			{ type: "UPDATE_TEAM_NAME", teamNumber: 1, teamName: "foo" },
			{ type: "UPDATE_GAME_POINT", teamNumber: 1, gamePoints: 4 },
			{ type: "UPDATE_GAME_POINT", teamNumber: 1, gamePoints: 4 },
			{ type: "UPDATE_GAME_POINT", teamNumber: 1, gamePoints: 4 }
		],
		expectedContext: {
			teams: new Map([[1, { teamName: "foo", gamePoints: 12, isStretched: true }]])
		}
	})
);

test(
	'gameStateMachine sets if a team is stretched when in state "fullyFilledTeams" and multiple "UPDATE_GAME_POINT" events are sent that lead to total game points more than 12',
	testTeamStateMachine({
		eventsToSend: [
			{ type: "UPDATE_TEAM_NAME", teamNumber: 1, teamName: "foo" },
			{ type: "UPDATE_GAME_POINT", teamNumber: 1, gamePoints: 4 },
			{ type: "UPDATE_GAME_POINT", teamNumber: 1, gamePoints: 4 },
			{ type: "UPDATE_GAME_POINT", teamNumber: 1, gamePoints: 4 },
			{ type: "UPDATE_GAME_POINT", teamNumber: 1, gamePoints: 1 }
		],
		expectedContext: {
			teams: new Map([[1, { teamName: "foo", gamePoints: 13, isStretched: true }]])
		}
	})
);

test(
	'gameStateMachine saves teams in storage on "UPDATE_GAME_POINT" event',
	testTeamStateMachine({
		eventsToSend: [
			{ type: "UPDATE_TEAM_NAME", teamNumber: 1, teamName: "foo" },
			{ type: "UPDATE_GAME_POINT", teamNumber: 1, gamePoints: 2 }
		],
		expectedTeamsInStorage: new Map([[1, { gamePoints: 2, isStretched: false, teamName: "foo" }]])
	})
);

test(
	'gameStateMachine resets context on "RESET" event',
	testTeamStateMachine({
		eventsToSend: [{ type: "UPDATE_TEAM_NAME", teamNumber: 1, teamName: "foo" }, { type: "RESET" }],
		expectedContext: {
			teams: new Map()
		}
	})
);
