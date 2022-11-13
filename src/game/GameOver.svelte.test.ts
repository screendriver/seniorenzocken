import { cleanup, render, screen } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { Factory } from "fishery";
import { afterEach, assert, test } from "vitest";
import type { Team } from "../team/team-schema.js";
import GameOver from "./GameOver.svelte";

const teamFactory = Factory.define<Team>(() => {
	return {
		teamName: "",
		gamePoints: 0,
		isStretched: false
	};
});

afterEach(cleanup);

test("<GameOver /> renders the winner team when there is one set", () => {
	const teams = new Map([
		[
			1,
			teamFactory.build({
				teamName: "Winner team"
			})
		]
	]);

	render(GameOver, { teams });

	const headingElement = screen.queryByText<HTMLHeadingElement>('Gewonnen hat: Team "Winner team"');
	assert.isNotNull(headingElement);
});

test('<GameOver /> dispatches "startnewgame" event when clicking on button', async () => {
	const user = userEvent.setup();
	const teams = new Map([
		[
			1,
			teamFactory.build({
				teamName: "Winner team"
			})
		]
	]);
	const { component } = render(GameOver, { teams });

	let eventDispatched = false;
	component.$on("startnewgame", () => {
		eventDispatched = true;
	});

	const buttonElement = screen.getByDisplayValue<HTMLInputElement>("Neues Spiel");
	await user.click(buttonElement);

	assert.isTrue(eventDispatched);
});
