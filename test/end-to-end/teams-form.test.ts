import { test, expect } from "../playwright/test.js";

test("disables the submit button when both teams are not filled initially", async ({ gamePage }) => {
	await gamePage.gotoGame();

	const isDisabled = await gamePage.isTeamsFormSubmitDisabled();

	expect(isDisabled).toStrictEqual(true);
});

test("disables the submit button when something gets entered in first team", async ({ gamePage }) => {
	await gamePage.gotoGame();
	await gamePage.fillTeamOneInTeamsForm();

	const isDisabled = await gamePage.isTeamsFormSubmitDisabled();

	expect(isDisabled).toStrictEqual(true);
});

test("disables the submit button when something gets entered in second team", async ({ gamePage }) => {
	await gamePage.gotoGame();
	await gamePage.fillTeamTwoInTeamsForm();

	const isDisabled = await gamePage.isTeamsFormSubmitDisabled();

	expect(isDisabled).toStrictEqual(true);
});

test("disables the submit button again when team one was already filled but cleared afterwards", async ({
	gamePage,
}) => {
	await gamePage.gotoGame();
	await gamePage.fillTeamOneInTeamsForm();
	await gamePage.clearTeamOneInTeamsForm();

	const isDisabled = await gamePage.isTeamsFormSubmitDisabled();

	expect(isDisabled).toStrictEqual(true);
});

test("disables the submit button again when team two was already filled but cleared afterwards", async ({
	gamePage,
}) => {
	await gamePage.gotoGame();
	await gamePage.fillTeamTwoInTeamsForm();
	await gamePage.clearTeamTwoInTeamsForm();

	const isDisabled = await gamePage.isTeamsFormSubmitDisabled();

	expect(isDisabled).toStrictEqual(true);
});

test("disables the submit button again when team one and two was filled but team one is cleared afterwards", async ({
	gamePage,
}) => {
	await gamePage.gotoGame();
	await gamePage.fillTeamOneInTeamsForm();
	await gamePage.fillTeamTwoInTeamsForm();
	await gamePage.clearTeamOneInTeamsForm();

	const isDisabled = await gamePage.isTeamsFormSubmitDisabled();

	expect(isDisabled).toStrictEqual(true);
});

test("disables the submit button again when team one and two was filled but team two is cleared afterwards", async ({
	gamePage,
}) => {
	await gamePage.gotoGame();
	await gamePage.fillTeamOneInTeamsForm();
	await gamePage.fillTeamTwoInTeamsForm();
	await gamePage.clearTeamTwoInTeamsForm();

	const isDisabled = await gamePage.isTeamsFormSubmitDisabled();

	expect(isDisabled).toStrictEqual(true);
});
