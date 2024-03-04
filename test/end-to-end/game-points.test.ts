import { test, expect } from "../playwright/test.js";

test("both radio button groups inputs are enabled by default", async ({ gamePage }) => {
	await gamePage.gotoGame();

	await gamePage.fillTeamsForm();
	await gamePage.submitTeamsForm();

	const isRangeInputForTeam1Disabled = await gamePage.isRadioButtonGroupDisabled(1);
	const isRangeInputForTeam2Disabled = await gamePage.isRadioButtonGroupDisabled(2);

	expect(isRangeInputForTeam1Disabled).toStrictEqual(false);
	expect(isRangeInputForTeam2Disabled).toStrictEqual(false);
});

test("disables radio button group for team 2 when radio button group for team 1 is checked", async ({ gamePage }) => {
	await gamePage.gotoGame();

	await gamePage.fillTeamsForm();
	await gamePage.submitTeamsForm();

	await gamePage.changeCheckedRadioButton(1, 2);
	const isRangeInputForTeam2Disabled = await gamePage.isRadioButtonGroupDisabled(2);

	expect(isRangeInputForTeam2Disabled).toStrictEqual(true);
});

test("re-enables radio button group for team 2 when radio button group for team 1 had a value but was reset to 0", async ({
	gamePage,
}) => {
	await gamePage.gotoGame();

	await gamePage.fillTeamsForm();
	await gamePage.submitTeamsForm();

	await gamePage.changeCheckedRadioButton(1, 2);
	await gamePage.changeCheckedRadioButton(1, 0);

	const isRadioButtonGroupForTeam1Disabled = await gamePage.isRadioButtonGroupDisabled(1);
	const isRadioButtonGroupForTeam2Disabled = await gamePage.isRadioButtonGroupDisabled(2);

	expect(isRadioButtonGroupForTeam1Disabled).toStrictEqual(false);
	expect(isRadioButtonGroupForTeam2Disabled).toStrictEqual(false);
});

test("disables radio button group for team 1 when radio button group for team 2 has a value", async ({ gamePage }) => {
	await gamePage.gotoGame();
	await gamePage.fillTeamsForm();
	await gamePage.submitTeamsForm();

	await gamePage.changeCheckedRadioButton(2, 2);
	const isRadioButtonGroupForTeam1Disabled = await gamePage.isRadioButtonGroupDisabled(1);

	expect(isRadioButtonGroupForTeam1Disabled).toStrictEqual(true);
});

test("re-enables radio button group for team 1 when radio button group for team 2 had a value but was reset to 0", async ({
	gamePage,
}) => {
	await gamePage.gotoGame();
	await gamePage.fillTeamsForm();
	await gamePage.submitTeamsForm();

	await gamePage.changeCheckedRadioButton(2, 2);
	await gamePage.changeCheckedRadioButton(2, 0);

	const isRadioButtonGroupForTeam1Disabled = await gamePage.isRadioButtonGroupDisabled(1);
	const isRadioButtonGroupForTeam2Disabled = await gamePage.isRadioButtonGroupDisabled(2);

	expect(isRadioButtonGroupForTeam1Disabled).toStrictEqual(false);
	expect(isRadioButtonGroupForTeam2Disabled).toStrictEqual(false);
});
