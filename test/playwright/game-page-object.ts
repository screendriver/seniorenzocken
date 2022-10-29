import type { Page } from "@playwright/test";

export interface GamePageObject {
	fillTeamOneInTeamsForm(text?: string): Promise<void>;
	fillTeamTwoInTeamsForm(text?: string): Promise<void>;
	isTeamsFormSubmitDisabled(): Promise<boolean>;
	submitTeamsForm(): Promise<void>;
}

export function createGamePage(page: Page): GamePageObject {
	return {
		async fillTeamOneInTeamsForm(text = "Test team 1") {
			const inputElementTeam1 = page.getByPlaceholder("Team 1");
			await inputElementTeam1.fill(text);
		},
		async fillTeamTwoInTeamsForm(text = "Test team 2") {
			const inputElementTeam2 = page.getByPlaceholder("Team 2");
			await inputElementTeam2.fill(text);
		},
		isTeamsFormSubmitDisabled() {
			const submitButton = page.getByText("Spiel starten");
			return submitButton.isDisabled();
		},
		async submitTeamsForm() {
			const submitButton = page.getByText("Spiel starten");
			await submitButton.click();
		}
	};
}
