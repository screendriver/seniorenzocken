import { cleanup, render, screen } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { Factory } from "fishery";
import { afterEach, assert, test } from "vitest";
import type { Team, Teams } from "../team/team-schema.js";
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
	const teams: Teams = [
		teamFactory.build({
			teamName: "Winner team",
			gamePoints: 15
		}),
		teamFactory.build({
			teamName: "Looser team"
		})
	];

	render(GameOver, { playAudio: false, teams });

	const headingElement = screen.queryByText<HTMLHeadingElement>('Gewonnen hat: Team "Winner team"');
	assert.isNotNull(headingElement);
});

test('<GameOver /> dispatches "startnewgame" event when clicking on button', async () => {
	const user = userEvent.setup();
	const teams: Teams = [
		teamFactory.build({
			teamName: "Winner team",
			gamePoints: 15
		}),
		teamFactory.build({
			teamName: "Looser team"
		})
	];
	const { component } = render(GameOver, { playAudio: false, teams });

	let eventDispatched = false;
	component.$on("startnewgame", () => {
		eventDispatched = true;
	});

	const buttonElement = screen.getByText<HTMLButtonElement>("Neues Spiel");
	await user.click(buttonElement);

	assert.isTrue(eventDispatched);
});

test('<GameOver /> dispatches "replayaudio" event when clicking on button', async () => {
	const user = userEvent.setup();
	const teams: Teams = [
		teamFactory.build({
			teamName: "Winner team",
			gamePoints: 15
		}),
		teamFactory.build({
			teamName: "Looser team"
		})
	];
	const { component } = render(GameOver, { playAudio: false, teams });

	let eventDispatched = false;
	component.$on("replayaudio", () => {
		eventDispatched = true;
	});

	const buttonElement = screen.getByText<HTMLButtonElement>("Punktestand vorlesen");
	await user.click(buttonElement);

	assert.isTrue(eventDispatched);
});
