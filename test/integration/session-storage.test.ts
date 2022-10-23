import { test, expect } from "@playwright/test";

test("saves entered team names into session storage", async ({ page }) => {
	await page.goto("/");
	const inputElement = page.getByPlaceholder("Team 1");
	await inputElement.focus();
	await inputElement.type("Test team");

	const teamsFromSessionStorage = await page.evaluate(() => {
		return window.sessionStorage.getItem("teams");
	});

	expect(teamsFromSessionStorage).toStrictEqual(
		'[[1,{"teamName":"Test team","teamNumber":1}],[2,{"teamName":"","teamNumber":2}]]'
	);
});

test("saves if is game started into session storage", async ({ page }) => {
	await page.goto("/");
	const inputElementTeam1 = page.getByPlaceholder("Team 1");
	await inputElementTeam1.focus();
	await inputElementTeam1.type("Test team 1");

	const inputElementTeam2 = page.getByPlaceholder("Team 2");
	await inputElementTeam2.focus();
	await inputElementTeam2.type("Test team 2");

	const submitButton = page.getByText("Spiel starten");
	await submitButton.click();

	const isGameStartedFromSessionStorage = await page.evaluate(() => {
		return window.sessionStorage.getItem("is-game-started");
	});

	expect(isGameStartedFromSessionStorage).toStrictEqual("true");
});
