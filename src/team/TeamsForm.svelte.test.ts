import { assert, test, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import TeamsForm from "./TeamsForm.svelte";

afterEach(cleanup);

test("<TeamsForm /> renders two team input fields as long as game is not started", () => {
	render(TeamsForm, { canGameBeStarted: true });

	const inputElement1 = screen.queryByPlaceholderText<HTMLInputElement>("Team 1");
	const inputElement2 = screen.queryByPlaceholderText<HTMLInputElement>("Team 2");

	assert.isNotNull(inputElement1);
	assert.isNotNull(inputElement2);
});

test('<TeamsForm /> dispatches "startgame" event when clicking on submit button', async () => {
	const user = userEvent.setup();
	const { component } = render(TeamsForm, { canGameBeStarted: true });

	let eventDispatched = false;
	component.$on("startgame", () => {
		eventDispatched = true;
	});

	const formElement = screen.getByRole("form");
	const inputElement1 = screen.getByPlaceholderText<HTMLInputElement>("Team 1");
	const inputElement2 = screen.getByPlaceholderText<HTMLInputElement>("Team 2");

	await user.click(inputElement1);
	await user.keyboard("team 1");
	await user.click(inputElement2);
	await user.keyboard("team 2");
	await fireEvent.submit(formElement);

	assert.isTrue(eventDispatched);
});
