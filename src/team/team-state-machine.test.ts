import is from "@sindresorhus/is";
import { Factory } from "fishery";
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
import type { Team } from "./team-schema.js";
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

const teamFactory = Factory.define<Team>(() => {
	return {
		teamName: "",
		gamePoints: 0,
		isStretched: false
	};
});

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
}

function testTeamStateMachine(options: TestTeamStateMachineOptions): TestFunction {
	const { expectedContext, expectedStateValue, eventsToSend = [], expectedSentEvents } = options;

	return () => {
		const teamStateMachine = createTeamStateMachine();
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
		} else {
			assert.fail("No assertions used");
		}
	};
}

test(
	"gameStateMachine has an initial context set",
	testTeamStateMachine({
		expectedContext: {
			teams: [teamFactory.build(), teamFactory.build()]
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
		eventsToSend: [{ type: "UPDATE_TEAM_NAME", teamNumber: 0, teamName: "" }],
		expectedStateValue: "partiallyFilledTeams"
	})
);

test(
	'gameStateMachine transit from "teamsEmpty" to "partiallyFilledTeams" on "UPDATE_TEAM_NAME" event when just one of two teams have a name filled',
	testTeamStateMachine({
		eventsToSend: [
			{ type: "UPDATE_TEAM_NAME", teamNumber: 0, teamName: "foo" },
			{ type: "UPDATE_TEAM_NAME", teamNumber: 1, teamName: "" }
		],
		expectedStateValue: "partiallyFilledTeams"
	})
);

test(
	'gameStateMachine transit from "teamsEmpty" to "fullyFilledTeams" on "UPDATE_TEAM_NAME" event when both teams have a name',
	testTeamStateMachine({
		eventsToSend: [
			{ type: "UPDATE_TEAM_NAME", teamNumber: 0, teamName: "foo" },
			{ type: "UPDATE_TEAM_NAME", teamNumber: 1, teamName: "bar" }
		],
		expectedStateValue: "fullyFilledTeams"
	})
);

test(
	'gameStateMachine sets given teams in context when transit from "teamsEmpty" to "partiallyFilledTeams" on "UPDATE_TEAM_NAME" event when one of two teams does not have a name set',
	testTeamStateMachine({
		eventsToSend: [
			{ type: "UPDATE_TEAM_NAME", teamNumber: 0, teamName: "foo" },
			{ type: "UPDATE_TEAM_NAME", teamNumber: 1, teamName: "" }
		],
		expectedContext: {
			teams: [teamFactory.build({ teamName: "foo" }), teamFactory.build()]
		}
	})
);

test(
	'gameStateMachine sets given team in context when transit from "teamsEmpty" to "fullyFilledTeams" on "UPDATE_TEAM_NAME"',
	testTeamStateMachine({
		eventsToSend: [
			{ type: "UPDATE_TEAM_NAME", teamNumber: 0, teamName: "foo" },
			{ type: "UPDATE_TEAM_NAME", teamNumber: 1, teamName: "bar" }
		],
		expectedContext: {
			teams: [teamFactory.build({ teamName: "foo" }), teamFactory.build({ teamName: "bar" })]
		}
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
		eventsToSend: [{ type: "UPDATE_TEAM_NAME", teamNumber: 1, teamName: "foo" }],
		expectedSentEvents: [
			{ type: "TEAMS_EMPTY" },
			{
				type: "PARTIALLY_FILLED_TEAMS",
				teams: [teamFactory.build(), teamFactory.build({ teamName: "foo" })]
			}
		]
	})
);

test(
	'gameStateMachine sends to parent "FULLY_FILLED_TEAMS" event when transit from "teamsEmpty" to "fullyFilledTeams"',
	testTeamStateMachine({
		eventsToSend: [
			{ type: "UPDATE_TEAM_NAME", teamNumber: 0, teamName: "foo" },
			{ type: "UPDATE_TEAM_NAME", teamNumber: 1, teamName: "bar" }
		],
		expectedSentEvents: [
			{ type: "TEAMS_EMPTY" },
			{
				type: "PARTIALLY_FILLED_TEAMS",
				teams: [teamFactory.build({ teamName: "foo" }), teamFactory.build()]
			},
			{
				type: "FULLY_FILLED_TEAMS",
				teams: [teamFactory.build({ teamName: "foo" }), teamFactory.build({ teamName: "bar" })]
			}
		]
	})
);

test(
	'gameStateMachine sends to parent first "FULLY_FILLED_TEAMS" and after that "PARTIALLY_FILLED_TEAMS" when team name gets empty again',
	testTeamStateMachine({
		eventsToSend: [
			{ type: "UPDATE_TEAM_NAME", teamNumber: 0, teamName: "foo" },
			{ type: "UPDATE_TEAM_NAME", teamNumber: 1, teamName: "bar" },
			{ type: "UPDATE_TEAM_NAME", teamNumber: 1, teamName: "" }
		],
		expectedSentEvents: [
			{ type: "TEAMS_EMPTY" },
			{
				type: "PARTIALLY_FILLED_TEAMS",
				teams: [teamFactory.build({ teamName: "foo" }), teamFactory.build()]
			},
			{
				type: "FULLY_FILLED_TEAMS",
				teams: [teamFactory.build({ teamName: "foo" }), teamFactory.build({ teamName: "bar" })]
			},
			{
				type: "PARTIALLY_FILLED_TEAMS",
				teams: [teamFactory.build({ teamName: "foo" }), teamFactory.build()]
			}
		]
	})
);

test(
	'gameStateMachine transit from "fullyFilledTeams" to "teamsEmpty" on "RESET" event',
	testTeamStateMachine({
		eventsToSend: [
			{ type: "UPDATE_TEAM_NAME", teamNumber: 0, teamName: "foo" },
			{ type: "UPDATE_TEAM_NAME", teamNumber: 1, teamName: "bar" },
			{ type: "RESET" }
		],
		expectedStateValue: "teamsEmpty"
	})
);

test(
	'gameStateMachine updates team game point when in state "fullyFilledTeams" and "UPDATE_GAME_POINT" event is sent',
	testTeamStateMachine({
		eventsToSend: [
			{ type: "UPDATE_TEAM_NAME", teamNumber: 0, teamName: "foo" },
			{ type: "UPDATE_TEAM_NAME", teamNumber: 1, teamName: "bar" },
			{ type: "UPDATE_GAME_POINT", teamNumber: 1, gamePoints: 4 }
		],
		expectedContext: {
			teams: [teamFactory.build({ teamName: "foo" }), teamFactory.build({ teamName: "bar", gamePoints: 4 })]
		}
	})
);

test(
	'gameStateMachine updates team game point when in state "fullyFilledTeams" and multiple "UPDATE_GAME_POINT" events are sent',
	testTeamStateMachine({
		eventsToSend: [
			{ type: "UPDATE_TEAM_NAME", teamNumber: 0, teamName: "foo" },
			{ type: "UPDATE_TEAM_NAME", teamNumber: 1, teamName: "bar" },
			{ type: "UPDATE_GAME_POINT", teamNumber: 0, gamePoints: 2 },
			{ type: "UPDATE_GAME_POINT", teamNumber: 0, gamePoints: 3 }
		],
		expectedContext: {
			teams: [teamFactory.build({ teamName: "foo", gamePoints: 5 }), teamFactory.build({ teamName: "bar" })]
		}
	})
);

test(
	'gameStateMachine sets if a team is stretched when in state "fullyFilledTeams" and multiple "UPDATE_GAME_POINT" events are sent that lead to total game points of 12',
	testTeamStateMachine({
		eventsToSend: [
			{ type: "UPDATE_TEAM_NAME", teamNumber: 0, teamName: "foo" },
			{ type: "UPDATE_TEAM_NAME", teamNumber: 1, teamName: "bar" },
			{ type: "UPDATE_GAME_POINT", teamNumber: 0, gamePoints: 4 },
			{ type: "UPDATE_GAME_POINT", teamNumber: 0, gamePoints: 4 },
			{ type: "UPDATE_GAME_POINT", teamNumber: 0, gamePoints: 4 }
		],
		expectedContext: {
			teams: [
				teamFactory.build({ teamName: "foo", gamePoints: 12, isStretched: true }),
				teamFactory.build({ teamName: "bar" })
			]
		}
	})
);

test(
	'gameStateMachine sets if a team is stretched when in state "fullyFilledTeams" and multiple "UPDATE_GAME_POINT" events are sent that lead to total game points more than 12',
	testTeamStateMachine({
		eventsToSend: [
			{ type: "UPDATE_TEAM_NAME", teamNumber: 0, teamName: "foo" },
			{ type: "UPDATE_TEAM_NAME", teamNumber: 1, teamName: "bar" },
			{ type: "UPDATE_GAME_POINT", teamNumber: 0, gamePoints: 4 },
			{ type: "UPDATE_GAME_POINT", teamNumber: 0, gamePoints: 4 },
			{ type: "UPDATE_GAME_POINT", teamNumber: 0, gamePoints: 4 },
			{ type: "UPDATE_GAME_POINT", teamNumber: 0, gamePoints: 1 }
		],
		expectedContext: {
			teams: [
				teamFactory.build({ teamName: "foo", gamePoints: 13, isStretched: true }),
				teamFactory.build({ teamName: "bar" })
			]
		}
	})
);

test(
	'gameStateMachine sends to parent "GAME_POINT_UPDATED" event when game point gets updated',
	testTeamStateMachine({
		eventsToSend: [
			{ type: "UPDATE_TEAM_NAME", teamNumber: 0, teamName: "foo" },
			{ type: "UPDATE_TEAM_NAME", teamNumber: 1, teamName: "bar" },
			{ type: "UPDATE_GAME_POINT", teamNumber: 0, gamePoints: 2 }
		],
		expectedSentEvents: [
			{ type: "TEAMS_EMPTY" },
			{
				type: "PARTIALLY_FILLED_TEAMS",
				teams: [teamFactory.build({ teamName: "foo" }), teamFactory.build()]
			},
			{
				type: "FULLY_FILLED_TEAMS",
				teams: [teamFactory.build({ teamName: "foo" }), teamFactory.build({ teamName: "bar" })]
			},
			{
				type: "GAME_POINT_UPDATED",
				teamNumber: 0,
				teams: [teamFactory.build({ teamName: "foo", gamePoints: 2 }), teamFactory.build({ teamName: "bar" })],
				gamePoints: 2
			}
		]
	})
);

test(
	'gameStateMachine resets context on "RESET" event',
	testTeamStateMachine({
		eventsToSend: [
			{ type: "UPDATE_TEAM_NAME", teamNumber: 0, teamName: "foo" },
			{ type: "UPDATE_TEAM_NAME", teamNumber: 1, teamName: "bar" },
			{ type: "RESET" }
		],
		expectedContext: {
			teams: [teamFactory.build(), teamFactory.build()]
		}
	})
);
