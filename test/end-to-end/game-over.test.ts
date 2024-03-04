import { test, expect } from "../playwright/test.js";

test("shows the winner game when game is over", async ({ page, gamePage }) => {
	await gamePage.gotoGame();
	await gamePage.turnAudioOff();

	await gamePage.fillTeamsForm();
	await gamePage.submitTeamsForm();
	await gamePage.changeCheckedRadioButton(1, 4);
	await gamePage.clickNextRoundButton();
	await gamePage.changeCheckedRadioButton(1, 4);
	await gamePage.clickNextRoundButton();
	await gamePage.changeCheckedRadioButton(1, 4);
	await gamePage.clickNextRoundButton();
	await gamePage.changeCheckedRadioButton(1, 3);
	await gamePage.clickNextRoundButton();

	const headingElement = page.getByText('Gewonnen hat: Team "Test team 1"');

	await expect(headingElement).toBeVisible();
});

test("starts a new game when clicking on new game button", async ({ page, gamePage }) => {
	await gamePage.gotoGame();
	await gamePage.turnAudioOff();

	await gamePage.fillTeamsForm();
	await gamePage.submitTeamsForm();
	await gamePage.changeCheckedRadioButton(1, 4);
	await gamePage.clickNextRoundButton();
	await gamePage.changeCheckedRadioButton(1, 4);
	await gamePage.clickNextRoundButton();
	await gamePage.changeCheckedRadioButton(1, 4);
	await gamePage.clickNextRoundButton();
	await gamePage.changeCheckedRadioButton(1, 3);
	await gamePage.clickNextRoundButton();

	const newGameButtonElement = page.getByText("Neues Spiel");
	await newGameButtonElement.click();
	const isTeamsFormSubmitDisabled = await gamePage.isTeamsFormSubmitDisabled();

	expect(isTeamsFormSubmitDisabled).toStrictEqual(true);
});
