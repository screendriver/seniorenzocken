import { cleanup, render, screen } from "@testing-library/svelte";
import { afterEach, assert, test } from "vitest";
import Score from "./Score.svelte";

afterEach(cleanup);

test("<Score /> renders the element when visible is set to true", () => {
	render(Score, { visible: true, score: 2 });

	const markElement = screen.queryByText("2");
	assert.isNotNull(markElement);
});

test('<Score /> renders the element when visible is set to false but set it to "invisible"', () => {
	render(Score, { visible: false, score: 2 });

	const markElement = screen.getByText("2");

	assert.strictEqual(markElement.classList.item(0), "invisible");
});
