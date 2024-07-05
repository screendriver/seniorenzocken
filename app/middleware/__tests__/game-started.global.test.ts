import { test, expect, vi, afterEach } from "vitest";
import gameStartedMiddleware from "../game-started.global";
import type { RouteLocationNormalized } from "vue-router";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";

mockNuxtImport("useGameStore", () => {
	return vi.fn().mockReturnValue({
		isGameRunning: false,
	});
});

mockNuxtImport("navigateTo", () => {
	return vi.fn();
});

afterEach(() => {
	vi.clearAllMocks();
});

test('game-started global middleware calls "navigateTo()" when route matches /game and game is currently not running', () => {
	const gameStore = useGameStore();
	gameStore.isGameRunning = false;

	const to = { name: "game" } as unknown as RouteLocationNormalized;
	const from = {} as unknown as RouteLocationNormalized;

	gameStartedMiddleware(to, from);

	expect(navigateTo).toHaveBeenCalledWith({ name: "teams", replace: true });
});

test('game-started global middleware does not call "navigateTo()" when route matches /game but game is currently running', () => {
	const gameStore = useGameStore();
	gameStore.isGameRunning = true;

	const to = { name: "game" } as unknown as RouteLocationNormalized;
	const from = {} as unknown as RouteLocationNormalized;

	gameStartedMiddleware(to, from);

	expect(navigateTo).not.toHaveBeenCalled();
});

test('game-started global middleware does not call "navigateTo()" when route does not match /game', () => {
	const gameStore = useGameStore();
	gameStore.isGameRunning = false;

	const to = { name: "foo" } as unknown as RouteLocationNormalized;
	const from = {} as unknown as RouteLocationNormalized;

	gameStartedMiddleware(to, from);

	expect(navigateTo).not.toHaveBeenCalled();
});
