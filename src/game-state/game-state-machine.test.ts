import { assert, test, vi, type Mock, type TestFunction } from "vitest";
import { interpret, type InterpreterFrom } from "xstate";
import { createGameStateMachine, type GameStateMachine } from "./game-state-machine.js";
import type { FeatureName, ToggleRouter } from "../toggle-router/toggle-router.js";
import type { GameWebStorage } from "../storage/game-web-storage.js";
import type { Team } from "../team/team-schema.js";

function createFakeGameWebStorage(): GameWebStorage {
	let localTeams: ReadonlyMap<number, Team> = new Map();

	return {
		get teams() {
			return localTeams;
		},
		set teams(teams: ReadonlyMap<number, Team>) {
			localTeams = teams;
		}
	} as unknown as GameWebStorage;
}

function withGameStateMachineService(
	testFunction: (
		gameStateMachineService: InterpreterFrom<GameStateMachine>,
		setFeature: Mock<FeatureName[], boolean>,
		gameWebStorage: GameWebStorage
	) => void
): TestFunction {
	return () => {
		const setFeature = vi.fn<FeatureName[], boolean>();
		const toggleRouter = {
			setFeature
		} as unknown as ToggleRouter;
		const gameWebStorage = createFakeGameWebStorage();
		const gameStateMachine = createGameStateMachine(toggleRouter, gameWebStorage);
		const gameStateMachineService = interpret(gameStateMachine);
		gameStateMachineService.start();

		testFunction(gameStateMachineService, setFeature, gameWebStorage);
	};
}

test(
	"gameStateMachine has an initial context set",
	withGameStateMachineService((gameStateMachineService) => {
		assert.deepStrictEqual(gameStateMachineService.getSnapshot().context, {
			teams: new Map(),
			canGameBeStarted: false,
			showConfetti: false
		});
	})
);

test(
	'gameStateMachine has initial state "emptyTeams"',
	withGameStateMachineService((gameStateMachineService) => {
		assert.strictEqual(gameStateMachineService.getSnapshot().value, "emptyTeams");
	})
);

test(
	'gameStateMachine transits from "emptyTeams" to "teamsUpdating" on "UPDATE_TEAM_NAME" event',
	withGameStateMachineService((gameStateMachineService) => {
		gameStateMachineService.send({ type: "UPDATE_TEAM_NAME", teamNumber: 0, teamName: "" });

		assert.strictEqual(gameStateMachineService.getSnapshot().value, "teamsUpdating");
	})
);

test(
	'gameStateMachine updates teams in context when transit from "emptyTeams" to "teamsUpdating"',
	withGameStateMachineService((gameStateMachineService) => {
		assert.deepStrictEqual(gameStateMachineService.getSnapshot().context.teams, new Map());

		gameStateMachineService.send({ type: "UPDATE_TEAM_NAME", teamNumber: 1, teamName: "Test team" });

		assert.deepStrictEqual(
			gameStateMachineService.getSnapshot().context.teams,
			new Map([[1, { teamName: "Test team", gamePoints: 0, isStretched: false }]])
		);
	})
);

test(
	'gameStateMachine updates teams in game web storage when transit from "emptyTeams" to "teamsUpdating"',
	withGameStateMachineService((gameStateMachineService, _setFeature, gameWebStorage) => {
		gameStateMachineService.send({ type: "UPDATE_TEAM_NAME", teamNumber: 1, teamName: "Test team" });

		assert.deepStrictEqual(
			gameWebStorage.teams,
			new Map([[1, { teamName: "Test team", gamePoints: 0, isStretched: false }]])
		);
	})
);

test(
	'gameStateMachine sets feature "game-point-buttons" to false when transit from "emptyTeams" to "teamsUpdating" and team name is not "ratze"',
	withGameStateMachineService((gameStateMachineService, setFeature) => {
		assert.deepStrictEqual(gameStateMachineService.getSnapshot().context.teams, new Map());

		gameStateMachineService.send({ type: "UPDATE_TEAM_NAME", teamNumber: 1, teamName: "Test team" });

		assert.strictEqual(setFeature.mock.calls.length, 1);
		assert.deepStrictEqual(setFeature.mock.lastCall, ["game-point-buttons", false]);
	})
);

test(
	'gameStateMachine sets feature "game-point-buttons" to true when transit from "emptyTeams" to "teamsUpdating" and team name is "ratze"',
	withGameStateMachineService((gameStateMachineService, setFeature) => {
		assert.deepStrictEqual(gameStateMachineService.getSnapshot().context.teams, new Map());

		gameStateMachineService.send({ type: "UPDATE_TEAM_NAME", teamNumber: 1, teamName: "ratze" });

		assert.strictEqual(setFeature.mock.calls.length, 1);
		assert.deepStrictEqual(setFeature.mock.lastCall, ["game-point-buttons", true]);
	})
);

test(
	'gameStateMachine updates context property "teams" on "UPDATE_TEAM_NAME" event when current state is "teamsUpdating"',
	withGameStateMachineService((gameStateMachineService) => {
		gameStateMachineService.send({ type: "UPDATE_TEAM_NAME", teamNumber: 1, teamName: "f" });
		gameStateMachineService.send({ type: "UPDATE_TEAM_NAME", teamNumber: 1, teamName: "fo" });
		gameStateMachineService.send({ type: "UPDATE_TEAM_NAME", teamNumber: 1, teamName: "foo" });

		assert.deepStrictEqual(
			gameStateMachineService.getSnapshot().context.teams,
			new Map([[1, { teamName: "foo", gamePoints: 0, isStretched: false }]])
		);
	})
);

test(
	'gameStateMachine sets context property "canGameBeStarted" to true on "UPDATE_TEAM_NAME" event when current state is "teamsUpdating" and team name is filled',
	withGameStateMachineService((gameStateMachineService) => {
		assert.isFalse(gameStateMachineService.getSnapshot().context.canGameBeStarted);

		gameStateMachineService.send({ type: "UPDATE_TEAM_NAME", teamNumber: 1, teamName: "f" });
		gameStateMachineService.send({ type: "UPDATE_TEAM_NAME", teamNumber: 1, teamName: "fo" });
		gameStateMachineService.send({ type: "UPDATE_TEAM_NAME", teamNumber: 1, teamName: "foo" });

		assert.isTrue(gameStateMachineService.getSnapshot().context.canGameBeStarted);
	})
);

test(
	'gameStateMachine sets context property "canGameBeStarted" to false on "UPDATE_TEAM_NAME" event when current state is "teamsUpdating" and team name is empty',
	withGameStateMachineService((gameStateMachineService) => {
		assert.isFalse(gameStateMachineService.getSnapshot().context.canGameBeStarted);

		gameStateMachineService.send({ type: "UPDATE_TEAM_NAME", teamNumber: 1, teamName: "f" });
		gameStateMachineService.send({ type: "UPDATE_TEAM_NAME", teamNumber: 1, teamName: "fo" });
		gameStateMachineService.send({ type: "UPDATE_TEAM_NAME", teamNumber: 1, teamName: "" });

		assert.isFalse(gameStateMachineService.getSnapshot().context.canGameBeStarted);
	})
);

test(
	'gameStateMachine sets context property "canGameBeStarted" to false on "UPDATE_TEAM_NAME" event when current state is "teamsUpdating" and team one team name is empty but another one is filled',
	withGameStateMachineService((gameStateMachineService) => {
		assert.isFalse(gameStateMachineService.getSnapshot().context.canGameBeStarted);

		gameStateMachineService.send({ type: "UPDATE_TEAM_NAME", teamNumber: 1, teamName: "f" });
		gameStateMachineService.send({ type: "UPDATE_TEAM_NAME", teamNumber: 1, teamName: "fo" });
		gameStateMachineService.send({ type: "UPDATE_TEAM_NAME", teamNumber: 1, teamName: "foo" });

		gameStateMachineService.send({ type: "UPDATE_TEAM_NAME", teamNumber: 2, teamName: "" });

		assert.isFalse(gameStateMachineService.getSnapshot().context.canGameBeStarted);
	})
);

test(
	'gameStateMachine sets context property "canGameBeStarted" to false on "UPDATE_TEAM_NAME" event when current state is "teamsUpdating" and team one team name was filled but is empty again and another one is filled',
	withGameStateMachineService((gameStateMachineService) => {
		assert.isFalse(gameStateMachineService.getSnapshot().context.canGameBeStarted);

		gameStateMachineService.send({ type: "UPDATE_TEAM_NAME", teamNumber: 1, teamName: "f" });
		gameStateMachineService.send({ type: "UPDATE_TEAM_NAME", teamNumber: 1, teamName: "fo" });
		gameStateMachineService.send({ type: "UPDATE_TEAM_NAME", teamNumber: 1, teamName: "foo" });

		gameStateMachineService.send({ type: "UPDATE_TEAM_NAME", teamNumber: 2, teamName: "b" });
		gameStateMachineService.send({ type: "UPDATE_TEAM_NAME", teamNumber: 2, teamName: "ba" });
		gameStateMachineService.send({ type: "UPDATE_TEAM_NAME", teamNumber: 2, teamName: "" });

		assert.isFalse(gameStateMachineService.getSnapshot().context.canGameBeStarted);
	})
);

test(
	'gameStateMachine transits from "teamsUpdating" to "gameRunning" on "START_GAME" event when game can be started',
	withGameStateMachineService((gameStateMachineService) => {
		gameStateMachineService.send({ type: "UPDATE_TEAM_NAME", teamNumber: 1, teamName: "f" });
		gameStateMachineService.send({ type: "UPDATE_TEAM_NAME", teamNumber: 1, teamName: "fo" });
		gameStateMachineService.send({ type: "UPDATE_TEAM_NAME", teamNumber: 1, teamName: "foo" });
		gameStateMachineService.send({ type: "START_GAME" });

		assert.strictEqual(gameStateMachineService.getSnapshot().value, "gameRunning");
	})
);

test(
	'gameStateMachine updates team game point on "UPDATE_GAME_POINT" event when current state is "gameRunning" and no team reached 15 game points',
	withGameStateMachineService((gameStateMachineService) => {
		gameStateMachineService.send({ type: "UPDATE_TEAM_NAME", teamNumber: 1, teamName: "f" });
		gameStateMachineService.send({ type: "UPDATE_TEAM_NAME", teamNumber: 1, teamName: "fo" });
		gameStateMachineService.send({ type: "UPDATE_TEAM_NAME", teamNumber: 1, teamName: "foo" });
		gameStateMachineService.send({ type: "START_GAME" });
		gameStateMachineService.send({ type: "UPDATE_GAME_POINT", teamNumber: 1, gamePoints: 3 });

		assert.deepStrictEqual(
			gameStateMachineService.getSnapshot().context.teams,
			new Map([[1, { teamName: "foo", gamePoints: 3, isStretched: false }]])
		);
	})
);

test(
	'gameStateMachine updates team game point on "UPDATE_GAME_POINT" event and transit to "gameOver" when current state is "gameRunning" and one team reached 15 game points',
	withGameStateMachineService((gameStateMachineService) => {
		gameStateMachineService.send({ type: "UPDATE_TEAM_NAME", teamNumber: 1, teamName: "f" });
		gameStateMachineService.send({ type: "UPDATE_TEAM_NAME", teamNumber: 1, teamName: "fo" });
		gameStateMachineService.send({ type: "UPDATE_TEAM_NAME", teamNumber: 1, teamName: "foo" });
		gameStateMachineService.send({ type: "START_GAME" });
		gameStateMachineService.send({ type: "UPDATE_GAME_POINT", teamNumber: 1, gamePoints: 3 });
		gameStateMachineService.send({ type: "UPDATE_GAME_POINT", teamNumber: 1, gamePoints: 12 });

		assert.deepStrictEqual(
			gameStateMachineService.getSnapshot().context.teams,
			new Map([[1, { teamName: "foo", gamePoints: 15, isStretched: true }]])
		);
		assert.strictEqual(gameStateMachineService.getSnapshot().value, "gameOver");
	})
);

test(
	'gameStateMachine sets context property "showConfetti" to true on "UPDATE_GAME_POINT" event when game points equals 4',
	withGameStateMachineService((gameStateMachineService) => {
		gameStateMachineService.send({ type: "UPDATE_TEAM_NAME", teamNumber: 1, teamName: "f" });
		gameStateMachineService.send({ type: "UPDATE_TEAM_NAME", teamNumber: 1, teamName: "fo" });
		gameStateMachineService.send({ type: "UPDATE_TEAM_NAME", teamNumber: 1, teamName: "foo" });
		gameStateMachineService.send({ type: "START_GAME" });
		gameStateMachineService.send({ type: "UPDATE_GAME_POINT", teamNumber: 1, gamePoints: 4 });

		assert.isTrue(gameStateMachineService.getSnapshot().context.showConfetti);
	})
);

test(
	'gameStateMachine transits from "gameOver" to "emptyTeams" on "START_NEW_GAME" event',
	withGameStateMachineService((gameStateMachineService) => {
		gameStateMachineService.send({ type: "UPDATE_TEAM_NAME", teamNumber: 1, teamName: "f" });
		gameStateMachineService.send({ type: "UPDATE_TEAM_NAME", teamNumber: 1, teamName: "fo" });
		gameStateMachineService.send({ type: "UPDATE_TEAM_NAME", teamNumber: 1, teamName: "foo" });
		gameStateMachineService.send({ type: "START_GAME" });
		gameStateMachineService.send({ type: "UPDATE_GAME_POINT", teamNumber: 1, gamePoints: 16 });
		gameStateMachineService.send({ type: "START_NEW_GAME" });

		assert.strictEqual(gameStateMachineService.getSnapshot().value, "emptyTeams");
	})
);

test(
	'gameStateMachine resets context when transit from "gameOver" to "emptyTeams" on "START_NEW_GAME" event',
	withGameStateMachineService((gameStateMachineService) => {
		gameStateMachineService.send({ type: "UPDATE_TEAM_NAME", teamNumber: 1, teamName: "f" });
		gameStateMachineService.send({ type: "UPDATE_TEAM_NAME", teamNumber: 1, teamName: "fo" });
		gameStateMachineService.send({ type: "UPDATE_TEAM_NAME", teamNumber: 1, teamName: "foo" });
		gameStateMachineService.send({ type: "START_GAME" });
		gameStateMachineService.send({ type: "UPDATE_GAME_POINT", teamNumber: 1, gamePoints: 4 });
		gameStateMachineService.send({ type: "UPDATE_GAME_POINT", teamNumber: 1, gamePoints: 11 });
		gameStateMachineService.send({ type: "START_NEW_GAME" });

		assert.deepStrictEqual(gameStateMachineService.getSnapshot().context, {
			teams: new Map(),
			canGameBeStarted: false,
			showConfetti: false
		});
	})
);
