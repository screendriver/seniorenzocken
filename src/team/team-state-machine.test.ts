import { assert, test, type TestFunction } from "vitest";
import { interpret, type InterpreterFrom } from "xstate";
import type { GameWebStorage } from "../storage/game-web-storage.js";
import { createInMemoryGameWebStorage } from "../storage/test-lib/in-memory-game-web-storage.js";
import { createTeamStateMachine, type TeamStateMachine } from "./team-state-machine.js";

function withTeamStateMachineService(
	testFunction: (teamStateMachineService: InterpreterFrom<TeamStateMachine>, gameWebStorage: GameWebStorage) => void
): TestFunction {
	return () => {
		const inMemoryGameWebStorage = createInMemoryGameWebStorage();
		const teamStateMachine = createTeamStateMachine(inMemoryGameWebStorage);
		const teamStateMachineService = interpret(teamStateMachine);
		teamStateMachineService.start();

		testFunction(teamStateMachineService, inMemoryGameWebStorage);
	};
}

test(
	"gameStateMachine has an initial context set",
	withTeamStateMachineService((teamStateMachineService) => {
		assert.deepStrictEqual(teamStateMachineService.getSnapshot().context, {
			teams: new Map()
		});
	})
);

test(
	'gameStateMachine has initial state "teamsEmpty"',
	withTeamStateMachineService((teamStateMachineService) => {
		assert.strictEqual(teamStateMachineService.getSnapshot().value, "teamsEmpty");
	})
);

test(
	'gameStateMachine transit from "teamsEmpty" to "partiallyFilledTeams" on "UPDATE_TEAM_NAME" event when just one team without a name is given',
	withTeamStateMachineService((teamStateMachineService) => {
		teamStateMachineService.send([{ type: "UPDATE_TEAM_NAME", teamNumber: 1, teamName: "" }]);

		assert.strictEqual(teamStateMachineService.getSnapshot().value, "partiallyFilledTeams");
	})
);

test(
	'gameStateMachine transit from "teamsEmpty" to "partiallyFilledTeams" on "UPDATE_TEAM_NAME" event when just one of two teams have a name filled',
	withTeamStateMachineService((teamStateMachineService) => {
		teamStateMachineService.send([
			{ type: "UPDATE_TEAM_NAME", teamNumber: 1, teamName: "foo" },
			{ type: "UPDATE_TEAM_NAME", teamNumber: 2, teamName: "" }
		]);

		assert.strictEqual(teamStateMachineService.getSnapshot().value, "partiallyFilledTeams");
	})
);

test(
	'gameStateMachine transit from "teamsEmpty" to "fullyFilledTeams" on "UPDATE_TEAM_NAME" event when just one team with a name is given',
	withTeamStateMachineService((teamStateMachineService) => {
		teamStateMachineService.send([{ type: "UPDATE_TEAM_NAME", teamNumber: 1, teamName: "foo" }]);

		assert.strictEqual(teamStateMachineService.getSnapshot().value, "fullyFilledTeams");
	})
);

test(
	'gameStateMachine transit from "teamsEmpty" to "fullyFilledTeams" on "UPDATE_TEAM_NAME" event when just two teams with a name are given',
	withTeamStateMachineService((teamStateMachineService) => {
		teamStateMachineService.send([
			{ type: "UPDATE_TEAM_NAME", teamNumber: 1, teamName: "foo" },
			{ type: "UPDATE_TEAM_NAME", teamNumber: 2, teamName: "bar" }
		]);

		assert.strictEqual(teamStateMachineService.getSnapshot().value, "fullyFilledTeams");
	})
);

test(
	'gameStateMachine sets given teams in context when transit from "teamsEmpty" to "partiallyFilledTeams" on "UPDATE_TEAM_NAME" event when one of two teams does not have a name set',
	withTeamStateMachineService((teamStateMachineService) => {
		teamStateMachineService.send([
			{ type: "UPDATE_TEAM_NAME", teamNumber: 1, teamName: "foo" },
			{ type: "UPDATE_TEAM_NAME", teamNumber: 2, teamName: "" }
		]);

		assert.deepStrictEqual(
			teamStateMachineService.getSnapshot().context.teams,
			new Map([
				[1, { gamePoints: 0, isStretched: false, teamName: "foo" }],
				[2, { gamePoints: 0, isStretched: false, teamName: "" }]
			])
		);
	})
);

test(
	'gameStateMachine sets given team in context when transit from "teamsEmpty" to "fullyFilledTeams" on "UPDATE_TEAM_NAME" event when given team has a name',
	withTeamStateMachineService((teamStateMachineService) => {
		teamStateMachineService.send([{ type: "UPDATE_TEAM_NAME", teamNumber: 1, teamName: "foo" }]);

		assert.deepStrictEqual(
			teamStateMachineService.getSnapshot().context.teams,
			new Map([[1, { gamePoints: 0, isStretched: false, teamName: "foo" }]])
		);
	})
);
