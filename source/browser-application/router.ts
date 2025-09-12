import { inject } from "vue";
import {
	createRouter as createVueRouter,
	createWebHistory,
	type NavigationGuardReturn,
	type RouteLocationNormalized,
	type Router
} from "vue-router";
import { assertDefined } from "ts-extras";
import * as Sentry from "@sentry/vue";
import { isError, isNull } from "@sindresorhus/is";
import TeamsView from "./views/TeamsView.vue";
import { useGameStore } from "./game-store/game-store.js";
import { trpcCilentInjectionKey } from "./trpc-client/trpc-client";

export function createRouter(): Router {
	async function authenticationGuard(to: RouteLocationNormalized): Promise<NavigationGuardReturn | undefined> {
		if (!to.meta.requiresAuth) {
			return true;
		}

		const trpcClient = inject(trpcCilentInjectionKey);

		assertDefined(trpcClient);

		const sessionToken = await trpcClient.session.token.query();

		if (isNull(sessionToken)) {
			return {
				name: "teams",
				replace: true
			};
		}

		return true;
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
					const trpcClient = inject(trpcCilentInjectionKey);

					assertDefined(trpcClient);

					const gameStore = useGameStore(trpcClient);

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
				},
				async beforeEnter() {
					const trpcClient = inject(trpcCilentInjectionKey);

					assertDefined(trpcClient);

					const sessionToken = await trpcClient.session.token.query();

					if (isNull(sessionToken)) {
						return true;
					}

					return { name: "teams-selection", replace: true };
				}
			},
			{
				path: "/teams-selection",
				name: "teams-selection",
				async component() {
					return import("./views/TeamsSelectionView.vue");
				},
				meta: { requiresAuth: true }
			},
			{
				path: "/session-game",
				name: "session-game",
				async component() {
					return import("./views/SessionGameView.vue");
				},
				meta: { requiresAuth: true }
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
