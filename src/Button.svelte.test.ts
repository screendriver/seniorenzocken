import { cleanup, render, screen } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { afterEach, assert, test, type TestFunction } from "vitest";
import Button from "./Button.svelte";

afterEach(cleanup);

interface TestClickEventOptions {
	readonly clickHandledExpected: boolean;
	readonly disabled?: boolean;
}

function testClickEvent(testOptions: TestClickEventOptions): TestFunction {
	const { clickHandledExpected, disabled = false } = testOptions;

	return async () => {
		const user = userEvent.setup();
		const { component } = render(Button, {
			value: "Click me",
			disabled
		});

		let clickHandled = false;
		component.$on("click", () => {
			clickHandled = true;
		});

		const buttonElement = screen.getByText<HTMLButtonElement>("Click me");

		await user.click(buttonElement);

		assert.strictEqual(clickHandled, clickHandledExpected);
	};
}

test("<Button /> listens to click events", testClickEvent({ clickHandledExpected: true }));

test(
	"<Button /> does not listen to click events when it is disabled",
	testClickEvent({ disabled: true, clickHandledExpected: false })
);
