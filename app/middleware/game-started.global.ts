export default defineNuxtRouteMiddleware((to) => {
	const gameStore = useGameStore();

	if (to.name === "game" && !gameStore.isGameRunning) {
		return navigateTo({ name: "teams", replace: true });
	}
});
