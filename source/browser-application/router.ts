import {
	createRouter as createVueRouter,
	createWebHistory,
	type NavigationGuardReturn,
	type RouteLocationNormalized,
	type Router
} from "vue-router";
import * as Sentry from "@sentry/vue";
import { isError } from "@sindresorhus/is";
import TeamsView from "./views/TeamsView.vue";
import { useGameStore } from "./game-store/game-store.js";
import { useTRPCClientStore } from "./trpc-client-store/trpc-client-store";

export function createRouter(): Router {
	async function authenticationGuard(to: RouteLocationNormalized): Promise<NavigationGuardReturn | undefined> {
		if (!to.meta.requiresAuth) {
			return undefined;
		}

		const { trpcClient } = useTRPCClientStore();
		const session = await trpcClient.session.query();

		if (session === null) {
			return {
				name: "teams",
				replace: true
			};
		}

		return undefined;
	}

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
				path: "/sign-in",
				name: "sign-in",
				async component() {
					return import("./views/SignInView.vue");
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

	router.beforeEach(authenticationGuard);

	router.afterEach((_to, _from, failure) => {
		if (failure !== undefined) {
			Sentry.captureException(failure);
		}
	});

	router.onError((error: unknown, to) => {
		if (isError(error) && error.message.includes("Failed to fetch dynamically imported module")) {
			globalThis.location.href = to.fullPath;
		}
	});

	return router;
}
