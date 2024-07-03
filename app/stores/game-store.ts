export const useGameStore = defineStore("game", () => {
	const team1: Ref<Team> = ref(createInitialTeam(1));
	const team2: Ref<Team> = ref(createInitialTeam(2));
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

	return {
		team1,
		team2,
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
	};
});

export type GameStore = ReturnType<typeof useGameStore>;

if (import.meta.hot) {
	import.meta.hot.accept(acceptHMRUpdate(useGameStore, import.meta.hot));
}
