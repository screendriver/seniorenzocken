import Maybe from "true-myth/maybe";
import { test, expect } from "../playwright/test.js";

test("saves entered team names into session storage", async ({ page, gamePage }) => {
	await page.goto("/");
	await gamePage.fillOutTeamsForm();

	const teamsFromSessionStorage = await page.evaluate(() => {
		return window.sessionStorage.getItem("teams");
	});

	expect(teamsFromSessionStorage).toStrictEqual('[[1,{"teamName":"Test team 1"}],[2,{"teamName":"Test team 2"}]]');
});

test("saves if is game started into session storage", async ({ page, gamePage }) => {
	await page.goto("/");
	await gamePage.fillOutTeamsForm();
	await gamePage.submitTeamsForm();

	const isGameStartedFromSessionStorage = await gamePage.getItemFromSessionStorage("is-game-started");

	expect(isGameStartedFromSessionStorage).toStrictEqual(Maybe.just("true"));
});

test('sets is game started to "false" when clicking on cancel game button', async ({ page, gamePage }) => {
	await page.goto("/");
	await gamePage.fillOutTeamsForm();
	await gamePage.submitTeamsForm();

	const cancelGameButton = page.getByText("Spiel abbrechen");
	await cancelGameButton.click();

	const isGameStartedFromSessionStorage = await gamePage.getItemFromSessionStorage("is-game-started");

	expect(isGameStartedFromSessionStorage).toStrictEqual(Maybe.just("false"));
});
