import { assert, test, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import Team from "./Team.svelte";

afterEach(() => {
	cleanup();
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
	const inputElement = screen.getByPlaceholderText<HTMLInputElement>("Team 43");

	assert.strictEqual(inputElement.nodeName, "INPUT");
	assert.strictEqual(inputElement.type, "text");
});

test("<Team /> renders an input with a correct name", () => {
	render(Team, { teamNumber: 42 });
	const inputElement = screen.getByPlaceholderText<HTMLInputElement>("Team 43");

	assert.strictEqual(inputElement.name, "team-42");
});

test('<Team /> dispatches "teamnamechange" when team name changes', async () => {
	const user = userEvent.setup();
	const { component } = render(Team, { teamNumber: 42 });

	let teamNameChangeEvent: unknown;
	component.$on("teamnamechange", (event) => {
		teamNameChangeEvent = event.detail;
	});

	const inputElement = screen.getByPlaceholderText<HTMLInputElement>("Team 43");

	await user.click(inputElement);
	await user.keyboard("Abc");

	assert.deepStrictEqual(teamNameChangeEvent, {
		teamName: "Abc",
		teamNumber: 42
	});
});
