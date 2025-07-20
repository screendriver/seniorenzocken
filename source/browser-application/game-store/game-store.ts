import { acceptHMRUpdate, defineStore } from "pinia";
import { computed, ref } from "vue";
import { isNonEmptyArray } from "@sindresorhus/is";
import Task, { fromPromise } from "true-myth/task";
import type { NotPersistedTeam } from "../../shared/team.ts";
import type { GameRounds } from "../../shared/game-rounds.ts";
import { useTRPCClientStore } from "../trpc-client-store/trpc-client-store.ts";
import type { GamePointsPerRound } from "../../shared/game-points.ts";

function createEmptyNotPersistedTeam(teamNumber: NotPersistedTeam["teamNumber"]): NotPersistedTeam {
	return {
		teamNumber,
		name: "",
		currentRoundGamePoints: 0,
		matchTotalGamePoints: 0,
		isStretched: false,
	};
}

export const useGameStore = defineStore("game", () => {
	const { trpcClient } = useTRPCClientStore();
	const hasError = ref(false);
	const isAudioPlaying = ref(false);
	const team1 = ref<NotPersistedTeam>(createEmptyNotPersistedTeam(1));
	const team2 = ref<NotPersistedTeam>(createEmptyNotPersistedTeam(2));
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

	function newGame(): Task<void, unknown> {
		return fromPromise(trpcClient.newGame.query())
			.map((newGame) => {
				team1.value = newGame.team1;
				team2.value = newGame.team2;
				isGameRunning.value = newGame.isGameRunning;
				isGameOver.value = newGame.isGameOver;
				showConfetti.value = newGame.showConfetti;
				gameRounds.value = newGame.gameRounds;
				hasError.value = false;
			})
			.mapRejected(() => {
				hasError.value = true;
			});
	}

	function startGame(): Task<void, unknown> {
		return fromPromise(trpcClient.startGame.mutate({ team1: team1.value, team2: team2.value }))
			.map((mutationResult) => {
				isGameRunning.value = mutationResult.isGameRunning;
				hasError.value = false;
			})
			.mapRejected(() => {
				hasError.value = true;
			});
	}

	function nextGameRound(): Task<void, unknown> {
		return fromPromise(
			trpcClient.nextGameRound.mutate({ team1: team1.value, team2: team2.value, gameRounds: gameRounds.value }),
		)
			.map((nextGameRoundMutationOutput) => {
				team1.value = nextGameRoundMutationOutput.team1;
				team2.value = nextGameRoundMutationOutput.team2;
				isGameRunning.value = nextGameRoundMutationOutput.isGameRunning;
				isGameOver.value = nextGameRoundMutationOutput.isGameOver;
				showConfetti.value = nextGameRoundMutationOutput.showConfetti;
				gameRounds.value = nextGameRoundMutationOutput.gameRounds;
				isAudioPlaying.value = true;
				hasError.value = false;
			})
			.mapRejected(() => {
				hasError.value = true;
			});
	}

	function previousGameRound(): Task<void, unknown> {
		return fromPromise(trpcClient.previousGameRound.mutate({ gameRounds: gameRounds.value }))
			.map((previousGameRoundMutationOutput) => {
				team1.value = previousGameRoundMutationOutput.team1;
				team2.value = previousGameRoundMutationOutput.team2;
				gameRounds.value = previousGameRoundMutationOutput.gameRounds;
				hasError.value = false;
			})
			.mapRejected(() => {
				hasError.value = true;
			});
	}

	function generateAudioPlaylist(): Task<string[], unknown> {
		return fromPromise(
			trpcClient.generateAudioPlaylist.query({
				team1MatchTotalGamePoints: team1.value.matchTotalGamePoints,
				team2MatchTotalGamePoints: team2.value.matchTotalGamePoints,
				isStretched: !isGameOver.value && (team1.value.isStretched || team2.value.isStretched),
				hasWon: isGameOver.value,
			}),
		).mapRejected(() => {
			hasError.value = true;
		});
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
		generateAudioPlaylist,
	};
});

export type GameStore = ReturnType<typeof useGameStore>;

if (import.meta.hot) {
	import.meta.hot.accept(acceptHMRUpdate(useGameStore, import.meta.hot));
}
