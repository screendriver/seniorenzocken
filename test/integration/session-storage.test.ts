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
