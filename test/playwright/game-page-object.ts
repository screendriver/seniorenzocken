import type { Page } from "@playwright/test";

const selectors = {
	placeholderTeam1: "Team 1",
	placeholderTeam2: "Team 2",
	startGame: "Spiel starten",
	nextRound: "Nächste Runde"
} as const;

type TeamNumber = 1 | 2;

export interface GamePageObject {
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
}

export function createGamePage(page: Page): GamePageObject {
	return {
		async fillTeamOneInTeamsForm() {
			const inputElementTeam1 = page.getByPlaceholder(selectors.placeholderTeam1);
			await inputElementTeam1.fill("Test team ");
			await inputElementTeam1.press("1");
		},
		async clearTeamOneInTeamsForm() {
			const inputElementTeam1 = page.getByPlaceholder(selectors.placeholderTeam1);
			await inputElementTeam1.fill("");
		},
		async fillTeamTwoInTeamsForm() {
			const inputElementTeam2 = page.getByPlaceholder(selectors.placeholderTeam2);
			await inputElementTeam2.fill("Test team ");
			await inputElementTeam2.press("2");
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

			await inputElement.evaluate<void, string, HTMLInputElement>((inputElementNode, value) => {
				inputElementNode.value = value;
				inputElementNode.dispatchEvent(new Event("input", { bubbles: true }));
				inputElementNode.dispatchEvent(new Event("change", { bubbles: true }));
			}, value.toString(10));
		},
		getRangeInputValue(teamNumber) {
			const inputElement = page.getByLabel(`Test team ${teamNumber.toString(10)}`);

			return inputElement.inputValue();
		},
		clickNextRoundButton() {
			const nextRoundButton = page.getByText(selectors.nextRound);

			return nextRoundButton.click();
		}
	};
}
