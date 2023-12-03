import { test as base } from "@playwright/test";
import { createGamePage, type GamePageObject } from "./game-page-object.js";

type GamePageTestFixture = {
	readonly gamePage: GamePageObject;
};

export const test = base.extend<GamePageTestFixture>({
	async gamePage({ page }, use) {
		const gamePage = createGamePage(page);

		await use(gamePage);
	},
});

export const { expect } = test;
