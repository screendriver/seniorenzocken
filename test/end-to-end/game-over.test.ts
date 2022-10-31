import { test, expect } from "../playwright/test.js";

test("shows the winner game when game is over", async ({ page, gamePage }) => {
	await page.goto("/");
	await gamePage.fillTeamsForm();
	await gamePage.submitTeamsForm();
	await gamePage.changeRangeInputValue(1, 4);
	await gamePage.clickNextRoundButton();
	await gamePage.changeRangeInputValue(1, 8);
	await gamePage.clickNextRoundButton();
	await gamePage.changeRangeInputValue(1, 12);
	await gamePage.clickNextRoundButton();
	await gamePage.changeRangeInputValue(1, 15);
	await gamePage.clickNextRoundButton();

	const headingElement = page.getByText('Gewonnen hat: Team "Test team 1"');

	await expect(headingElement).toBeVisible();
});

test("starts a new game when clicking on new game button", async ({ page, gamePage }) => {
	await page.goto("/");
	await gamePage.fillTeamsForm();
	await gamePage.submitTeamsForm();
	await gamePage.changeRangeInputValue(1, 4);
	await gamePage.clickNextRoundButton();
	await gamePage.changeRangeInputValue(1, 8);
	await gamePage.clickNextRoundButton();
	await gamePage.changeRangeInputValue(1, 12);
	await gamePage.clickNextRoundButton();
	await gamePage.changeRangeInputValue(1, 15);
	await gamePage.clickNextRoundButton();

	const newGameButtonElement = page.getByText("Neues Spiel");
	await newGameButtonElement.click();
	const isTeamsFormSubmitDisabled = await gamePage.isTeamsFormSubmitDisabled();

	expect(isTeamsFormSubmitDisabled).toStrictEqual(true);
});
