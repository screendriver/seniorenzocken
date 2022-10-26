import { assert, test, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { get } from "svelte/store";
import Team from "../../../src/team/Team.svelte";
import { teams } from "../../../src/team/teams-store";

afterEach(() => {
	cleanup();
	teams.set(new Map());
});

test("<Team /> renders a label for the correct input id", () => {
	const { container } = render(Team, { teamNumber: 42 });
	const svgElement = container.querySelector("svg");

	assert.strictEqual(
		svgElement?.outerHTML,
		'<svg xmlns="http://www.w3.org/2000/svg" width="40px" height="40px" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-users rounded-l-lg bg-sky-700 p-2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>'
	);
});

test('<Team /> renders an input of type "text"', () => {
	render(Team, { teamNumber: 42 });
	const inputElement = screen.getByPlaceholderText<HTMLInputElement>("Team 42");

	assert.strictEqual(inputElement.nodeName, "INPUT");
	assert.strictEqual(inputElement.type, "text");
});

test("<Team /> renders an input with a correct name", () => {
	render(Team, { teamNumber: 42 });
	const inputElement = screen.getByPlaceholderText<HTMLInputElement>("Team 42");

	assert.strictEqual(inputElement.name, "team-42");
});

test("<Team /> saves entered text in teams store", async () => {
	const user = userEvent.setup();
	render(Team, { teamNumber: 42 });
	const inputElement = screen.getByPlaceholderText<HTMLInputElement>("Team 42");

	await user.click(inputElement);
	await user.keyboard("test");

	const teamsFromStore = get(teams);

	assert.deepStrictEqual(teamsFromStore, new Map([[42, { teamName: "test", gamePoints: 0 }]]));
});
