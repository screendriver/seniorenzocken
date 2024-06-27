import { createInitialTeam, type Team } from "./team";
import type { GamePoint } from "./game-points";

export const useGameStore = defineStore("game", () => {
	const team1: Ref<Team> = ref(createInitialTeam(1));
	const team2: Ref<Team> = ref(createInitialTeam(2));
	const team1GamePoint = ref<GamePoint>(0);
	const team2GamePoint = ref<GamePoint>(0);
	const shouldPlayAudio = ref(true);
	const isAudioPlaying = ref(false);

	return { team1, team2, team1GamePoint, team2GamePoint, shouldPlayAudio, isAudioPlaying };
});

if (import.meta.hot) {
	import.meta.hot.accept(acceptHMRUpdate(useGameStore, import.meta.hot));
}
