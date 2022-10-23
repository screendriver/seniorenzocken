import type { Page } from "@playwright/test";
import Maybe from "true-myth/maybe";

export interface GamePageObject {
	fillOutTeamsForm(): Promise<void>;
	submitTeamsForm(): Promise<void>;
	getItemFromSessionStorage(key: string): Promise<Maybe<string>>;
}

export function createGamePage(page: Page): GamePageObject {
	return {
		async fillOutTeamsForm() {
			const inputElementTeam1 = page.getByPlaceholder("Team 1");
			await inputElementTeam1.focus();
			await inputElementTeam1.type("Test team 1");

			const inputElementTeam2 = page.getByPlaceholder("Team 2");
			await inputElementTeam2.focus();
			await inputElementTeam2.type("Test team 2");
		},
		async submitTeamsForm() {
			const submitButton = page.getByText("Spiel starten");
			await submitButton.click();
		},
		async getItemFromSessionStorage(key) {
			const itemValue = await page.evaluate((itemKey) => {
				return window.sessionStorage.getItem(itemKey);
			}, key);

			return Maybe.of(itemValue);
		}
	};
}
