import { acceptHMRUpdate, defineStore } from "pinia";
import { computed, inject, ref } from "vue";
import { assertDefined } from "ts-extras";
import { isNonEmptyArray } from "@sindresorhus/is";
import { type Task, tryOrElse } from "true-myth/task";
import type { NotPersistedTeam, NotPersistedTeam1, NotPersistedTeam2 } from "../../shared/team.js";
import type { GameRounds } from "../../shared/game-rounds.js";
import { trpcCilentInjectionKey } from "../trpc-client/trpc-client.js";
import type { GamePointsPerRound } from "../../shared/game-points.js";

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

export const useGameStore = defineStore("game", () => {
	const trpcClient = inject(trpcCilentInjectionKey);

	const hasError = ref(false);
	const isAudioPlaying = ref(false);
	const team1 = ref(createEmptyNotPersistedTeam(1));
	const team2 = ref(createEmptyNotPersistedTeam(2));
	const isGameRunning = ref(false);
	const showConfetti = ref(false);
	const isGameOver = ref(false);
	const gameRounds = ref<GameRounds>([]);

	const bothTeamsHasZeroGamePoints = computed(() => {
		return team1.value.currentRoundGamePoints === 0 && team2.value.currentRoundGamePoints === 0;
	});

	const isGamePointEnabled = computed(() => {
		return (gamePoint: GamePointsPerRound): boolean => {
			if (isAudioPlaying.value) {
				return false;
			}

			return bothTeamsHasZeroGamePoints.value || gamePoint > 0;
		};
	});

	const isPreviousGameRoundEnabled = computed(() => {
		return isNonEmptyArray(gameRounds.value) && !isAudioPlaying.value;
	});

	const isNextGameRoundEnabled = computed(() => {
		return !bothTeamsHasZeroGamePoints.value && !isAudioPlaying.value;
	});

	function newGame(): Task<void, Error> {
		const newGameTask = tryOrElse(
			(error: unknown) => {
				hasError.value = true;

				return new Error("Could not create new game", { cause: error });
			},
			async () => {
				assertDefined(trpcClient);

				return trpcClient.game.new.query();
			}
		);

		return newGameTask.map((newGameOutput) => {
			team1.value = newGameOutput.team1;
			team2.value = newGameOutput.team2;
			isGameRunning.value = newGameOutput.isGameRunning;
			isGameOver.value = newGameOutput.isGameOver;
			showConfetti.value = newGameOutput.showConfetti;
			gameRounds.value = newGameOutput.gameRounds;
			hasError.value = false;

			return undefined;
		});
	}

	function startGame(): Task<void, Error> {
		const startGameTask = tryOrElse(
			(error: unknown) => {
				hasError.value = true;

				return new Error("Could not start game", { cause: error });
			},
			async () => {
				assertDefined(trpcClient);

				return trpcClient.game.start.mutate({ team1: team1.value, team2: team2.value });
			}
		);

		return startGameTask.map((mutationResult) => {
			isGameRunning.value = mutationResult.isGameRunning;
			hasError.value = false;

			return undefined;
		});
	}

	function nextGameRound(): Task<void, Error> {
		const nextRoundTask = tryOrElse(
			(error: unknown) => {
				hasError.value = true;

				return new Error("Could not start next game round", { cause: error });
			},
			async () => {
				assertDefined(trpcClient);

				return trpcClient.game.nextRound.mutate({
					team1: team1.value,
					team2: team2.value,
					gameRounds: gameRounds.value
				});
			}
		);

		return nextRoundTask.map((nextGameRoundMutationOutput) => {
			team1.value = nextGameRoundMutationOutput.team1;
			team2.value = nextGameRoundMutationOutput.team2;
			isGameRunning.value = nextGameRoundMutationOutput.isGameRunning;
			isGameOver.value = nextGameRoundMutationOutput.isGameOver;
			showConfetti.value = nextGameRoundMutationOutput.showConfetti;
			gameRounds.value = nextGameRoundMutationOutput.gameRounds;
			isAudioPlaying.value = true;
			hasError.value = false;

			return undefined;
		});
	}

	function previousGameRound(): Task<void, Error> {
		const previousRoundTask = tryOrElse(
			(error: unknown) => {
				hasError.value = true;

				return new Error("Could not go back to previous game round", { cause: error });
			},
			async () => {
				assertDefined(trpcClient);

				return trpcClient.game.previousRound.mutate({ gameRounds: gameRounds.value });
			}
		);

		return previousRoundTask.map((previousGameRoundMutationOutput) => {
			team1.value = previousGameRoundMutationOutput.team1;
			team2.value = previousGameRoundMutationOutput.team2;
			gameRounds.value = previousGameRoundMutationOutput.gameRounds;
			hasError.value = false;

			return undefined;
		});
	}

	function generateGamePointsAudioPlaylist(): Task<string[], Error> {
		const gamePointsPlaylistTask = tryOrElse(
			(error: unknown) => {
				hasError.value = true;

				return new Error("Could not query for game points playlist", { cause: error });
			},
			async () => {
				assertDefined(trpcClient);

				return trpcClient.audio.gamePointsPlaylist.query({
					team1: team1.value,
					team2: team2.value,
					gameRounds: gameRounds.value,
					hasWon: isGameOver.value
				});
			}
		);

		return gamePointsPlaylistTask;
	}

	return {
		hasError,
		isAudioPlaying,
		team1,
		team2,
		isGameRunning,
		showConfetti,
		isGameOver,
		gameRounds,
		isGamePointEnabled,
		bothTeamsHasZeroGamePoints,
		isPreviousGameRoundEnabled,
		isNextGameRoundEnabled,
		newGame,
		startGame,
		previousGameRound,
		nextGameRound,
		generateGamePointsAudioPlaylist
	};
});

export type GameStore = ReturnType<typeof useGameStore>;

if (import.meta.hot !== undefined) {
	import.meta.hot.accept(acceptHMRUpdate(useGameStore, import.meta.hot));
}
