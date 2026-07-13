import { createStore, type StoreApi } from "zustand";
import { isNonEmptyArray } from "@sindresorhus/is";
import { type Task, tryOrElse } from "true-myth/task";
import type { TRPCClient } from "@trpc/client";
import type { NotPersistedTeam, NotPersistedTeam1, NotPersistedTeam2 } from "../../shared/team.js";
import type { GameRounds } from "../../shared/game-rounds.js";
import type { GamePointsPerRound } from "../../shared/game-points.js";
import type { TRPCApplicationRouter } from "../../server-shared/trpc-application-router.js";

function createEmptyNotPersistedTeam(teamNumber: 1): NotPersistedTeam1;
function createEmptyNotPersistedTeam(teamNumber: 2): NotPersistedTeam2;
function createEmptyNotPersistedTeam(teamNumber: 1 | 2): NotPersistedTeam {
	return {
		teamNumber,
		name: "",
		currentRoundGamePoints: 0,
		matchTotalGamePoints: 0,
		isStretched: false
	};
}

export type GameStoreState = {
	readonly hasError: boolean;
	readonly isAudioPlaying: boolean;
	readonly team1: NotPersistedTeam1;
	readonly team2: NotPersistedTeam2;
	readonly isGameRunning: boolean;
	readonly showConfetti: boolean;
	readonly isGameOver: boolean;
	readonly gameRounds: GameRounds;
	readonly bothTeamsHasZeroGamePoints: () => boolean;
	readonly isGamePointEnabled: (gamePoint: GamePointsPerRound) => boolean;
	readonly isPreviousGameRoundEnabled: () => boolean;
	readonly isNextGameRoundEnabled: () => boolean;
	readonly setIsAudioPlaying: (isAudioPlaying: boolean) => void;
	readonly setTeam1Name: (teamName: string) => void;
	readonly setTeam2Name: (teamName: string) => void;
	readonly newGame: () => Task<void, Error>;
	readonly startGame: () => Task<void, Error>;
	readonly nextGameRound: () => Task<void, Error>;
	readonly previousGameRound: () => Task<void, Error>;
	readonly generateGamePointsAudioPlaylist: () => Task<readonly string[], Error>;
};

export function createGameStore(trpcClient: TRPCClient<TRPCApplicationRouter>): StoreApi<GameStoreState> {
	return createStore<GameStoreState>((set, get) => {
		return {
			hasError: false,
			isAudioPlaying: false,
			team1: createEmptyNotPersistedTeam(1),
			team2: createEmptyNotPersistedTeam(2),
			isGameRunning: false,
			showConfetti: false,
			isGameOver: false,
			gameRounds: [],
			bothTeamsHasZeroGamePoints() {
				const { team1, team2 } = get();
				return team1.currentRoundGamePoints === 0 && team2.currentRoundGamePoints === 0;
			},
			isGamePointEnabled(gamePoint) {
				if (get().isAudioPlaying) {
					return false;
				}
				return get().bothTeamsHasZeroGamePoints() || gamePoint > 0;
			},
			isPreviousGameRoundEnabled() {
				return isNonEmptyArray(get().gameRounds) && !get().isAudioPlaying;
			},
			isNextGameRoundEnabled() {
				return !get().bothTeamsHasZeroGamePoints() && !get().isAudioPlaying;
			},
			setIsAudioPlaying(isAudioPlaying) {
				set({ isAudioPlaying });
			},
			setTeam1Name(teamName) {
				set((state) => {
					const { team1 } = state;
					return { team1: { ...team1, name: teamName } };
				});
			},
			setTeam2Name(teamName) {
				set((state) => {
					const { team2 } = state;
					return { team2: { ...team2, name: teamName } };
				});
			},
			newGame() {
				const newGameTask = tryOrElse(
					(error: unknown) => {
						set({ hasError: true });
						return new Error("Could not create new game", { cause: error });
					},
					async () => {
						return trpcClient.game.new.query();
					}
				);

				return newGameTask.map((newGameOutput) => {
					set({
						team1: newGameOutput.team1,
						team2: newGameOutput.team2,
						isGameRunning: newGameOutput.isGameRunning,
						isGameOver: newGameOutput.isGameOver,
						showConfetti: newGameOutput.showConfetti,
						gameRounds: newGameOutput.gameRounds,
						hasError: false
					});
					return undefined;
				});
			},
			startGame() {
				const startGameTask = tryOrElse(
					(error: unknown) => {
						set({ hasError: true });
						return new Error("Could not start game", { cause: error });
					},
					async () => {
						return trpcClient.game.start.mutate({ team1: get().team1, team2: get().team2 });
					}
				);

				return startGameTask.map((mutationResult) => {
					set({ isGameRunning: mutationResult.isGameRunning, hasError: false });
					return undefined;
				});
			},
			nextGameRound() {
				const nextRoundTask = tryOrElse(
					(error: unknown) => {
						set({ hasError: true });
						return new Error("Could not start next game round", { cause: error });
					},
					async () => {
						return trpcClient.game.nextRound.mutate({
							team1: get().team1,
							team2: get().team2,
							gameRounds: get().gameRounds
						});
					}
				);

				return nextRoundTask.map((nextGameRoundMutationOutput) => {
					set({
						team1: nextGameRoundMutationOutput.team1,
						team2: nextGameRoundMutationOutput.team2,
						isGameRunning: nextGameRoundMutationOutput.isGameRunning,
						isGameOver: nextGameRoundMutationOutput.isGameOver,
						showConfetti: nextGameRoundMutationOutput.showConfetti,
						gameRounds: nextGameRoundMutationOutput.gameRounds,
						isAudioPlaying: true,
						hasError: false
					});
					return undefined;
				});
			},
			previousGameRound() {
				const previousRoundTask = tryOrElse(
					(error: unknown) => {
						set({ hasError: true });
						return new Error("Could not go back to previous game round", { cause: error });
					},
					async () => {
						return trpcClient.game.previousRound.mutate({ gameRounds: get().gameRounds });
					}
				);

				return previousRoundTask.map((previousGameRoundMutationOutput) => {
					set({
						team1: previousGameRoundMutationOutput.team1,
						team2: previousGameRoundMutationOutput.team2,
						gameRounds: previousGameRoundMutationOutput.gameRounds,
						hasError: false
					});
					return undefined;
				});
			},
			generateGamePointsAudioPlaylist() {
				return tryOrElse(
					(error: unknown) => {
						set({ hasError: true });
						return new Error("Could not query for game points playlist", { cause: error });
					},
					async () => {
						return trpcClient.audio.gamePointsPlaylist.query({
							team1: get().team1,
							team2: get().team2,
							gameRounds: get().gameRounds,
							hasWon: get().isGameOver
						});
					}
				);
			}
		};
	});
}
