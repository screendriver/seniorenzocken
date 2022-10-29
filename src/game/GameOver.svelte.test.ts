import { cleanup, render, screen } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { Factory } from "fishery";
import { get } from "svelte/store";
import { afterEach, assert, test } from "vitest";
import { teams, type Team } from "../team/teams-store";
import { isGameOver } from "./game-store";
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

test('<GameOver /> dispatches "startnewgame" event when clicking on button', async () => {
	const user = userEvent.setup();
	const { component } = render(GameOver);

	let eventDispatched = false;
	component.$on("startnewgame", () => {
		eventDispatched = true;
	});

	const buttonElement = screen.getByDisplayValue<HTMLInputElement>("Neues Spiel");
	await user.click(buttonElement);

	assert.isTrue(eventDispatched);
});

test('<GameOver /> resets all stores when clicking on "Neues Spiel" button', async () => {
	const user = userEvent.setup();
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

	assert.isFalse(get(isGameOver));
	assert.deepStrictEqual(get(teams), new Map());
});
