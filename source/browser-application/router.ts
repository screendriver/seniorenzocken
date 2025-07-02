import { createRouter, createWebHistory } from "vue-router";
import TeamsView from "./views/TeamsView.vue";
import GameView from "./views/GameView.vue";
import NotFoundView from "./views/NotFoundView.vue";
import { useGameStore } from "./game-store/game-store";

export const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes: [
		{
			path: "/",
			name: "home",
			redirect: {
				name: "teams",
			},
		},
		{
			path: "/teams",
			name: "teams",
			component: TeamsView,
		},
		{
			path: "/game",
			name: "game",
			component: GameView,
			beforeEnter() {
				const gameStore = useGameStore();

				if (!gameStore.isGameRunning) {
					return { name: "teams", replace: true };
				}
			},
		},
		{
			path: "/:pathMatch(.*)*",
			name: "notFound",
			component: NotFoundView,
		},
	],
});
