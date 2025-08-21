import { createRouter as createVueRouter, createWebHistory, type Router } from "vue-router";
import TeamsView from "./views/TeamsView.vue";
import { useGameStore } from "./game-store/game-store.js";

export function createRouter(): Router {
	const router = createVueRouter({
		history: createWebHistory(import.meta.env.BASE_URL),
		routes: [
			{
				path: "/",
				name: "home",
				redirect: {
					name: "teams"
				}
			},
			{
				path: "/teams",
				name: "teams",
				component: TeamsView
			},
			{
				path: "/game",
				name: "game",
				async component() {
					return import("./views/GameView.vue");
				},
				beforeEnter() {
					const gameStore = useGameStore();

					if (!gameStore.isGameRunning) {
						return { name: "teams", replace: true };
					}

					return true;
				}
			},
			{
				path: "/:pathMatch(.*)*",
				name: "notFound",
				async component() {
					return import("./views/NotFoundView.vue");
				}
			}
		]
	});

	return router;
}
