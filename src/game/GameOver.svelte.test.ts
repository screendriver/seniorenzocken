import { cleanup, render, screen } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { Factory } from "fishery";
import { get } from "svelte/store";
import { afterEach, assert, test } from "vitest";
import { teams, type Team } from "../team/teams-store";
import { isGameOver, isGameStarted } from "./game-store";
import GameOver from "./GameOver.svelte";

const teamFactory = Factory.define<Team>(() => {
	return {
		teamName: "",
		gamePoints: 0
	};
});

afterEach(cleanup);

test("<GameOver /> renders the winner team when there is one set", () => {
	teams.set(
		new Map([
			[
				1,
				teamFactory.build({
					teamName: "Winner team"
				})
			]
		])
	);

	render(GameOver);

	const headingElement = screen.queryByText<HTMLHeadingElement>('Gewonnen hat: Team "Winner team"');
	assert.isNotNull(headingElement);
});

test('<GameOver /> resets all stores when clicking on "Neues Spiel" button', async () => {
	const user = userEvent.setup();
	isGameStarted.set(true);
	isGameOver.set(true);
	teams.set(
		new Map([
			[
				1,
				teamFactory.build({
					teamName: "Winner team"
				})
			]
		])
	);

	render(GameOver);

	const buttonElement = screen.getByDisplayValue<HTMLInputElement>("Neues Spiel");
	await user.click(buttonElement);

	assert.isFalse(get(isGameStarted));
	assert.isFalse(get(isGameOver));
	assert.deepStrictEqual(get(teams), new Map());
});
