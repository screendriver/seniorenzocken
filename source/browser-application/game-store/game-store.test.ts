import { describe, it, expect, vi } from "vitest";
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
					vi.fn().mockResolvedValue({
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
					vi.fn().mockResolvedValue({
						isGameRunning: true
					})
			},
			nextRound: {
				mutate:
					nextRoundMutation ??
					vi.fn().mockResolvedValue({
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
					vi.fn().mockResolvedValue({
						team1: { ...emptyTeam1 },
						team2: { ...emptyTeam2 },
						gameRounds: []
					})
			}
		},
		audio: {
			gamePointsPlaylist: {
				query: gamePointsPlaylistQuery ?? vi.fn().mockResolvedValue(["/api/audio/1"])
			}
		}
	} as unknown as TRPCClient<TRPCApplicationRouter>;
}

describe("game store", () => {
	it("has an initial team1 set", () => {
		const gameStore = createGameStore(createFakeTrpcClient());

		expect(gameStore.getState().team1).toStrictEqual(emptyTeam1);
	});

	it("has an initial team2 set", () => {
		const gameStore = createGameStore(createFakeTrpcClient());

		expect(gameStore.getState().team2).toStrictEqual(emptyTeam2);
	});

	it("updates team names explicitly", () => {
		const gameStore = createGameStore(createFakeTrpcClient());

		gameStore.getState().setTeam1Name("Alice");
		gameStore.getState().setTeam2Name("Bob");

		expect(gameStore.getState().team1.name).toBe("Alice");
		expect(gameStore.getState().team2.name).toBe("Bob");
	});

	it("loads a new game and clears the error state", async () => {
		const gameStore = createGameStore(createFakeTrpcClient());
		gameStore.setState({ hasError: true });

		const result = await gameStore.getState().newGame();

		expect(result.isOk).toBe(true);
		expect(gameStore.getState().team1.name).toBe("Team A");
		expect(gameStore.getState().team2.name).toBe("Team B");
		expect(gameStore.getState().hasError).toBe(false);
	});

	it("stores an error when loading a new game fails", async () => {
		const gameStore = createGameStore(
			createFakeTrpcClient({
				newGameQuery: vi.fn().mockRejectedValue(new Error("boom"))
			})
		);

		const result = await gameStore.getState().newGame();

		expect(result.isErr).toBe(true);
		expect(gameStore.getState().hasError).toBe(true);
	});

	it("starts a game and marks it as running", async () => {
		const startGameMutation = vi.fn().mockResolvedValue({ isGameRunning: true });
		const gameStore = createGameStore(
			createFakeTrpcClient({
				startGameMutation
			})
		);
		gameStore.getState().setTeam1Name("Alice");
		gameStore.getState().setTeam2Name("Bob");

		const result = await gameStore.getState().startGame();

		expect(result.isOk).toBe(true);
		expect(startGameMutation).toHaveBeenCalledWith({
			team1: { ...emptyTeam1, name: "Alice" },
			team2: { ...emptyTeam2, name: "Bob" }
		});
		expect(gameStore.getState().isGameRunning).toBe(true);
	});

	it("advances to the next game round and enables audio playback", async () => {
		const nextRoundMutation = vi.fn().mockResolvedValue({
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

		expect(result.isOk).toBe(true);
		expect(nextRoundMutation).toHaveBeenCalledWith({
			team1: emptyTeam1,
			team2: emptyTeam2,
			gameRounds: []
		});
		expect(gameStore.getState().showConfetti).toBe(true);
		expect(gameStore.getState().isAudioPlaying).toBe(true);
		expect(gameStore.getState().team1.matchTotalGamePoints).toBe(2);
	});

	it("restores the previous game round", async () => {
		const previousRoundMutation = vi.fn().mockResolvedValue({
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

		expect(result.isOk).toBe(true);
		expect(previousRoundMutation).toHaveBeenCalledWith({
			gameRounds: []
		});
		expect(gameStore.getState().team1.name).toBe("Reset");
		expect(gameStore.getState().gameRounds).toStrictEqual([]);
	});

	it("queries the game points audio playlist with the current game state", async () => {
		const gamePointsPlaylistQuery = vi.fn().mockResolvedValue(["/api/audio/1"]);
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

		expect(result.isOk).toBe(true);
		expect(gamePointsPlaylistQuery).toHaveBeenCalledWith({
			team1: { ...emptyTeam1, matchTotalGamePoints: 4 },
			team2: { ...emptyTeam2, matchTotalGamePoints: 2 },
			gameRounds: [],
			hasWon: true
		});
	});
});
