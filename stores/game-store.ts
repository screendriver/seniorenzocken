import { createInitialTeam, type Team } from "./team";

export const useGameStore = defineStore("game", () => {
	const team1: Ref<Team> = ref(createInitialTeam(1));
	const team2: Ref<Team> = ref(createInitialTeam(2));

	return { team1, team2 };
});

if (import.meta.hot) {
	import.meta.hot.accept(acceptHMRUpdate(useGameStore, import.meta.hot));
}
