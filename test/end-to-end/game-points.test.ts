import { test, expect } from "../playwright/test.js";

test("both range inputs are enabled by default", async ({ gamePage }) => {
	await gamePage.gotoGame();

	await gamePage.fillTeamsForm();
	await gamePage.submitTeamsForm();

	const isRangeInputForTeam1Disabled = await gamePage.isRangeInputDisabled(1);
	const isRangeInputForTeam2Disabled = await gamePage.isRangeInputDisabled(2);

	expect(isRangeInputForTeam1Disabled).toStrictEqual(false);
	expect(isRangeInputForTeam2Disabled).toStrictEqual(false);
});

test("disables range input for team 2 when range input for team 1 has a value", async ({ gamePage }) => {
	await gamePage.gotoGame();

	await gamePage.fillTeamsForm();
	await gamePage.submitTeamsForm();

	await gamePage.changeRangeInputValue(1, 2);
	const isRangeInputForTeam2Disabled = await gamePage.isRangeInputDisabled(2);

	expect(isRangeInputForTeam2Disabled).toStrictEqual(true);
});

test("re-enables range input for team 2 when range input for team 1 had a value but was reset to 0", async ({
	gamePage,
}) => {
	await gamePage.gotoGame();

	await gamePage.fillTeamsForm();
	await gamePage.submitTeamsForm();

	await gamePage.changeRangeInputValue(1, 2);
	await gamePage.changeRangeInputValue(1, 0);

	const isRangeInputForTeam1Disabled = await gamePage.isRangeInputDisabled(1);
	const isRangeInputForTeam2Disabled = await gamePage.isRangeInputDisabled(2);

	expect(isRangeInputForTeam1Disabled).toStrictEqual(false);
	expect(isRangeInputForTeam2Disabled).toStrictEqual(false);
});

test("disables range input for team 1 when range input for team 2 has a value", async ({ gamePage }) => {
	await gamePage.gotoGame();
	await gamePage.fillTeamsForm();
	await gamePage.submitTeamsForm();

	await gamePage.changeRangeInputValue(2, 2);
	const isRangeInputForTeam1Disabled = await gamePage.isRangeInputDisabled(1);

	expect(isRangeInputForTeam1Disabled).toStrictEqual(true);
});

test("re-enables range input for team 1 when range input for team 2 had a value but was reset to 0", async ({
	gamePage,
}) => {
	await gamePage.gotoGame();
	await gamePage.fillTeamsForm();
	await gamePage.submitTeamsForm();

	await gamePage.changeRangeInputValue(2, 2);
	await gamePage.changeRangeInputValue(2, 0);

	const isRangeInputForTeam1Disabled = await gamePage.isRangeInputDisabled(1);
	const isRangeInputForTeam2Disabled = await gamePage.isRangeInputDisabled(2);

	expect(isRangeInputForTeam1Disabled).toStrictEqual(false);
	expect(isRangeInputForTeam2Disabled).toStrictEqual(false);
});

test('does not allow to set value "1" in range input for team 1 and jumps automatically to value "2"', async ({
	gamePage,
}) => {
	await gamePage.gotoGame();
	await gamePage.fillTeamsForm();
	await gamePage.submitTeamsForm();

	await gamePage.changeRangeInputValue(1, 1);
	const rangeInputValue = await gamePage.getRangeInputValue(1);

	expect(rangeInputValue).toStrictEqual("2");
});

test('does not allow to set value "1" in range input for team 2 and jumps automatically to value "2"', async ({
	gamePage,
}) => {
	await gamePage.gotoGame();
	await gamePage.fillTeamsForm();
	await gamePage.submitTeamsForm();

	await gamePage.changeRangeInputValue(2, 1);
	const rangeInputValue = await gamePage.getRangeInputValue(2);

	expect(rangeInputValue).toStrictEqual("2");
});
