import type { Page } from "@playwright/test";

const selectors = {
	placeholderTeam1: "Team 1",
	placeholderTeam2: "Team 2",
	startGame: "Spiel starten",
	nextRound: "Nächste Runde",
} as const;

type TeamNumber = 1 | 2;

export type GamePageObject = {
	gotoGame(): Promise<void>;
	turnAudioOff(): Promise<void>;
	fillTeamOneInTeamsForm(): Promise<void>;
	clearTeamOneInTeamsForm(): Promise<void>;
	fillTeamTwoInTeamsForm(): Promise<void>;
	clearTeamTwoInTeamsForm(): Promise<void>;
	fillTeamsForm(): Promise<void>;
	isTeamsFormSubmitDisabled(): Promise<boolean>;
	submitTeamsForm(): Promise<void>;
	isRangeInputDisabled(teamNumber: TeamNumber): Promise<boolean>;
	changeRangeInputValue(teamNumber: TeamNumber, value: number): Promise<void>;
	getRangeInputValue(teamNumber: TeamNumber): Promise<string>;
	clickNextRoundButton(): Promise<void>;
};

export function createGamePage(page: Page): GamePageObject {
	return {
		async gotoGame() {
			await page.goto("/");
		},
		async turnAudioOff() {
			const menuElement = page.getByTitle("Menü");
			await menuElement.click();

			const audioMenuItem = page.getByText("Punktestand vorlesen");
			await audioMenuItem.click();
			await page.waitForTimeout(300);

			await menuElement.click();
		},
		async fillTeamOneInTeamsForm() {
			await page.waitForTimeout(500);

			const inputElementTeam1 = page.getByPlaceholder(selectors.placeholderTeam1);
			await inputElementTeam1.pressSequentially("Test team 1", { delay: 20 });
		},
		async clearTeamOneInTeamsForm() {
			const inputElementTeam1 = page.getByPlaceholder(selectors.placeholderTeam1);
			await inputElementTeam1.fill("");
		},
		async fillTeamTwoInTeamsForm() {
			await page.waitForTimeout(500);

			const inputElementTeam2 = page.getByPlaceholder(selectors.placeholderTeam2);
			await inputElementTeam2.pressSequentially("Test team 2", { delay: 20 });
		},
		async clearTeamTwoInTeamsForm() {
			const inputElementTeam2 = page.getByPlaceholder(selectors.placeholderTeam2);
			await inputElementTeam2.fill("");
		},
		async fillTeamsForm() {
			await this.fillTeamOneInTeamsForm();
			await this.fillTeamTwoInTeamsForm();
		},
		isTeamsFormSubmitDisabled() {
			const submitButton = page.getByText(selectors.startGame);
			return submitButton.isDisabled();
		},
		async submitTeamsForm() {
			const submitButton = page.getByText(selectors.startGame);
			await submitButton.click();
		},
		isRangeInputDisabled(teamNumber) {
			const inputElement = page.getByLabel(`Test team ${teamNumber.toString(10)}`);

			return inputElement.isDisabled();
		},
		async changeRangeInputValue(teamNumber, value) {
			const inputElement = page.getByLabel(`Test team ${teamNumber.toString(10)}`);
			await inputElement.fill(value.toString(10));
		},
		getRangeInputValue(teamNumber) {
			const inputElement = page.getByLabel(`Test team ${teamNumber.toString(10)}`);

			return inputElement.inputValue();
		},
		clickNextRoundButton() {
			const nextRoundButton = page.getByText(selectors.nextRound);

			return nextRoundButton.click();
		},
	};
}
