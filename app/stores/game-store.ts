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
	const isNextGameRoundEnabled = computed(() => {
		return !allTeamsAtZeroGamePoints.value && !isAudioPlaying.value;
	});

	function toggleShouldPlayAudio(): void {
		shouldPlayAudio.value = !shouldPlayAudio.value;
	}
	function nextGameRound(): void {
		const newTeam1GamePoints = team1.value.gamePoints + team1GamePoint.value;
		team1.value.gamePoints = newTeam1GamePoints;
		team1.value.isStretched = isStretched(newTeam1GamePoints);
		const newTeam2GamePoints = team2.value.gamePoints + team2GamePoint.value;
		team2.value.gamePoints = newTeam2GamePoints;
		team2.value.isStretched = isStretched(newTeam2GamePoints);
		showConfetti.value = hasReachedMaximumGamePoints(team1GamePoint, team2GamePoint);
		team1GamePoint.value = 0;
		team2GamePoint.value = 0;
		isAudioPlaying.value = shouldPlayAudio.value;

		const { cloned: clonedTeam1 } = useCloned(team1);
		const { cloned: clonedTeam2 } = useCloned(team2);
		gameRounds.value.push([clonedTeam1.value, clonedTeam2.value]);
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
		toggleShouldPlayAudio,
		allTeamsAtZeroGamePoints,
		isGamePointEnabled,
		isNextGameRoundEnabled,
		nextGameRound,
	};
});

export type GameStore = ReturnType<typeof useGameStore>;

if (import.meta.hot) {
	import.meta.hot.accept(acceptHMRUpdate(useGameStore, import.meta.hot));
}
