import { cleanup, render, screen } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { afterEach, assert, test } from "vitest";
import { get } from "svelte/store";
import { isGameStarted } from "../../../src/game/game-store";
import CancelGame from "../../../src/game/CancelGame.svelte";

afterEach(cleanup);

test("<CancelGame /> renders a button", () => {
	render(CancelGame);

	const cancelButton = screen.getByText<HTMLButtonElement>("Spiel abbrechen");

	assert.strictEqual(cancelButton.type, "button");
});

test('<CancelGame /> sets "isGameStarted" store to false', async () => {
	const user = userEvent.setup();
	isGameStarted.set(true);
	render(CancelGame);

	const cancelButton = screen.getByText<HTMLButtonElement>("Spiel abbrechen");
	await user.click(cancelButton);

	assert.isFalse(get(isGameStarted));
});
