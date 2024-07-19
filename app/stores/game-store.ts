import * as v from "valibot";
import { isNonEmptyArray } from "@sindresorhus/is";
import { first } from "true-myth/maybe";

export const useGameStore = defineStore("game", () => {
	const team1: Ref<Team> = ref(createInitialTeam(1));
	const team2: Ref<Team> = ref(createInitialTeam(2));
	const isGameRunning = ref(false);
	const team1GamePoint = ref<GamePoint>(0);
	const team2GamePoint = ref<GamePoint>(0);
	const shouldPlayAudio = ref(true);
	const isAudioPlaying = ref(false);
	const gameRounds = ref<[team1: Team, team2: Team][]>([]);
	const showConfetti = ref(false);
	const isGameOver = ref(false);

	const allTeamsAtZeroGamePoints = computed(() => {
		return team1GamePoint.value === 0 && team2GamePoint.value === 0;
	});
	const isGamePointEnabled = computed(() => {
		return (gamePoint: GamePoint): boolean => {
			if (isAudioPlaying.value) {
				return false;
			}

			return allTeamsAtZeroGamePoints.value || gamePoint > 0;
		};
	});
	const isPreviousGameRoundEnabled = computed(() => {
		return isNonEmptyArray(gameRounds.value) && !isAudioPlaying.value;
	});
	const isNextGameRoundEnabled = computed(() => {
		return !allTeamsAtZeroGamePoints.value && !isAudioPlaying.value;
	});

	function toggleShouldPlayAudio(): void {
		shouldPlayAudio.value = !shouldPlayAudio.value;
	}
	function previousGameRound(): void {
		gameRounds.value.shift();

		const previousGameRound = first(gameRounds.value);

		previousGameRound.match({
			Just(teamsFromPreviousGameRound) {
				team1.value = teamsFromPreviousGameRound[0];
				team2.value = teamsFromPreviousGameRound[1];
			},
			Nothing() {
				team1.value.gamePoints = 0;
				team2.value.gamePoints = 0;
			},
		});
	}
	function nextGameRound(): void {
		const newTeam1GamePoints = v.parse(gamePointsSchema, team1.value.gamePoints + team1GamePoint.value);
		team1.value.gamePoints = newTeam1GamePoints;
		team1.value.isStretched = isStretched(newTeam1GamePoints);

		const newTeam2GamePoints = v.parse(gamePointsSchema, team2.value.gamePoints + team2GamePoint.value);
		team2.value.gamePoints = newTeam2GamePoints;
		team2.value.isStretched = isStretched(newTeam2GamePoints);

		showConfetti.value = hasReachedMaximumGamePoint(team1GamePoint, team2GamePoint);
		team1GamePoint.value = 0;
		team2GamePoint.value = 0;
		isAudioPlaying.value = shouldPlayAudio.value;

		const { cloned: clonedTeam1 } = useCloned(team1);
		const { cloned: clonedTeam2 } = useCloned(team2);
		gameRounds.value.unshift([clonedTeam1.value, clonedTeam2.value]);

		isGameOver.value = checkIfGameWouldBeOver([team1, team2]);
		isGameRunning.value = !isGameOver.value;
	}

	return {
		team1,
		team2,
		isGameRunning,
		team1GamePoint,
		team2GamePoint,
		shouldPlayAudio,
		isAudioPlaying,
		gameRounds,
		showConfetti,
		isGameOver,
		toggleShouldPlayAudio,
		allTeamsAtZeroGamePoints,
		isGamePointEnabled,
		isPreviousGameRoundEnabled,
		isNextGameRoundEnabled,
		previousGameRound,
		nextGameRound,
	};
});

export type GameStore = ReturnType<typeof useGameStore>;

if (import.meta.hot) {
	import.meta.hot.accept(acceptHMRUpdate(useGameStore, import.meta.hot));
}
