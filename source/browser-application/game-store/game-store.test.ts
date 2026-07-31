import assert from "node:assert";
import { suite, test } from "mocha";
import { assert as sinonAssert, fake } from "sinon";
import type { TRPCClient } from "@trpc/client";
import type { NotPersistedTeam1, NotPersistedTeam2 } from "../../shared/team.js";
import type { GameRounds } from "../../shared/game-rounds.js";
import type { TRPCApplicationRouter } from "../../server-shared/trpc-application-router.js";
import { createGameStore } from "./game-store.js";

const emptyTeam1: NotPersistedTeam1 = {
	teamNumber: 1,
	name: "",
	currentRoundGamePoints: 0,
	matchTotalGamePoints: 0,
	isStretched: false
};

const emptyTeam2: NotPersistedTeam2 = {
	teamNumber: 2,
	name: "",
	currentRoundGamePoints: 0,
	matchTotalGamePoints: 0,
	isStretched: false
};

const firstGameRound: GameRounds = [
	[
		{ team: { ...emptyTeam1, currentRoundGamePoints: 2, matchTotalGamePoints: 2 }, hasWonGameRound: true },
		{ team: { ...emptyTeam2, currentRoundGamePoints: 0, matchTotalGamePoints: 0 }, hasWonGameRound: false }
	]
];

type FakeTrpcClientOptions = {
	readonly newGameQuery?: () => Promise<unknown>;
	readonly startGameMutation?: () => Promise<unknown>;
	readonly nextRoundMutation?: () => Promise<unknown>;
	readonly previousRoundMutation?: () => Promise<unknown>;
	readonly gamePointsPlaylistQuery?: () => Promise<unknown>;
};

function createFakeTrpcClient(options: FakeTrpcClientOptions = {}): TRPCClient<TRPCApplicationRouter> {
	const { newGameQuery, startGameMutation, nextRoundMutation, previousRoundMutation, gamePointsPlaylistQuery } =
		options;

	return {
		game: {
			new: {
				query:
					newGameQuery ??
					fake.resolves({
						team1: { ...emptyTeam1, name: "Team A" },
						team2: { ...emptyTeam2, name: "Team B" },
						isGameRunning: false,
						isGameOver: false,
						showConfetti: false,
						gameRounds: []
					})
			},
			start: {
				mutate:
					startGameMutation ??
					fake.resolves({
						isGameRunning: true
					})
			},
			nextRound: {
				mutate:
					nextRoundMutation ??
					fake.resolves({
						team1: { ...emptyTeam1, matchTotalGamePoints: 2 },
						team2: { ...emptyTeam2, matchTotalGamePoints: 0 },
						isGameRunning: true,
						isGameOver: false,
						showConfetti: true,
						gameRounds: firstGameRound
					})
			},
			previousRound: {
				mutate:
					previousRoundMutation ??
					fake.resolves({
						team1: { ...emptyTeam1 },
						team2: { ...emptyTeam2 },
						gameRounds: []
					})
			}
		},
		audio: {
			gamePointsPlaylist: {
				query: gamePointsPlaylistQuery ?? fake.resolves(["/api/audio/1"])
			}
		}
	} as unknown as TRPCClient<TRPCApplicationRouter>;
}

suite("game store", function () {
	test("has an initial team1 set", function () {
		const gameStore = createGameStore(createFakeTrpcClient());

		assert.deepStrictEqual(gameStore.getState().team1, emptyTeam1);
	});

	test("has an initial team2 set", function () {
		const gameStore = createGameStore(createFakeTrpcClient());

		assert.deepStrictEqual(gameStore.getState().team2, emptyTeam2);
	});

	test("updates team names explicitly", function () {
		const gameStore = createGameStore(createFakeTrpcClient());

		gameStore.getState().setTeam1Name("Alice");
		gameStore.getState().setTeam2Name("Bob");

		assert.strictEqual(gameStore.getState().team1.name, "Alice");
		assert.strictEqual(gameStore.getState().team2.name, "Bob");
	});

	test("loads a new game and clears the error state", async function () {
		const gameStore = createGameStore(createFakeTrpcClient());
		gameStore.setState({ hasError: true });

		const result = await gameStore.getState().newGame();

		assert.strictEqual(result.isOk, true);
		assert.strictEqual(gameStore.getState().team1.name, "Team A");
		assert.strictEqual(gameStore.getState().team2.name, "Team B");
		assert.strictEqual(gameStore.getState().hasError, false);
	});

	test("stores an error when loading a new game fails", async function () {
		const gameStore = createGameStore(
			createFakeTrpcClient({
				newGameQuery: fake.rejects(new Error("boom"))
			})
		);

		const result = await gameStore.getState().newGame();

		assert.strictEqual(result.isErr, true);
		assert.strictEqual(gameStore.getState().hasError, true);
	});

	test("starts a game and marks it as running", async function () {
		const startGameMutation = fake.resolves({ isGameRunning: true });
		const gameStore = createGameStore(
			createFakeTrpcClient({
				startGameMutation
			})
		);
		gameStore.getState().setTeam1Name("Alice");
		gameStore.getState().setTeam2Name("Bob");

		const result = await gameStore.getState().startGame();

		assert.strictEqual(result.isOk, true);
		sinonAssert.calledWith(startGameMutation, {
			team1: { ...emptyTeam1, name: "Alice" },
			team2: { ...emptyTeam2, name: "Bob" }
		});
		assert.strictEqual(gameStore.getState().isGameRunning, true);
	});

	test("advances to the next game round and enables audio playback", async function () {
		const nextRoundMutation = fake.resolves({
			team1: { ...emptyTeam1, matchTotalGamePoints: 2 },
			team2: { ...emptyTeam2, matchTotalGamePoints: 0 },
			isGameRunning: true,
			isGameOver: false,
			showConfetti: true,
			gameRounds: firstGameRound
		});
		const gameStore = createGameStore(
			createFakeTrpcClient({
				nextRoundMutation
			})
		);

		const result = await gameStore.getState().nextGameRound();

		assert.strictEqual(result.isOk, true);
		sinonAssert.calledWith(nextRoundMutation, {
			team1: emptyTeam1,
			team2: emptyTeam2,
			gameRounds: []
		});
		assert.strictEqual(gameStore.getState().showConfetti, true);
		assert.strictEqual(gameStore.getState().isAudioPlaying, true);
		assert.strictEqual(gameStore.getState().team1.matchTotalGamePoints, 2);
	});

	test("restores the previous game round", async function () {
		const previousRoundMutation = fake.resolves({
			team1: { ...emptyTeam1, name: "Reset" },
			team2: { ...emptyTeam2, name: "Reset" },
			gameRounds: []
		});
		const gameStore = createGameStore(
			createFakeTrpcClient({
				previousRoundMutation
			})
		);

		const result = await gameStore.getState().previousGameRound();

		assert.strictEqual(result.isOk, true);
		sinonAssert.calledWith(previousRoundMutation, {
			gameRounds: []
		});
		assert.strictEqual(gameStore.getState().team1.name, "Reset");
		assert.deepStrictEqual(gameStore.getState().gameRounds, []);
	});

	test("queries the game points audio playlist with the current game state", async function () {
		const gamePointsPlaylistQuery = fake.resolves(["/api/audio/1"]);
		const gameStore = createGameStore(
			createFakeTrpcClient({
				gamePointsPlaylistQuery
			})
		);
		gameStore.setState({
			team1: { ...emptyTeam1, matchTotalGamePoints: 4 },
			team2: { ...emptyTeam2, matchTotalGamePoints: 2 },
			isGameOver: true
		});

		const result = await gameStore.getState().generateGamePointsAudioPlaylist();

		assert.strictEqual(result.isOk, true);
		sinonAssert.calledWith(gamePointsPlaylistQuery, {
			team1: { ...emptyTeam1, matchTotalGamePoints: 4 },
			team2: { ...emptyTeam2, matchTotalGamePoints: 2 },
			gameRounds: [],
			hasWon: true
		});
	});
});
