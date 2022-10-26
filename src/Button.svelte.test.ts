import { cleanup, render, screen } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { afterEach, assert, test, type TestFunction } from "vitest";
import Button from "./Button.svelte";

afterEach(cleanup);

interface TestClickEventOptions {
	readonly buttonType: "submit" | "button";
	readonly clickHandledExpected: boolean;
	readonly disabled?: boolean;
}

function testClickEvent(testOptions: TestClickEventOptions): TestFunction {
	const { buttonType, clickHandledExpected, disabled = false } = testOptions;

	return async () => {
		const user = userEvent.setup();
		const { component } = render(Button, {
			buttonType,
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

test(
	'<Button /> listens to click events when button type is "button"',
	testClickEvent({ buttonType: "button", clickHandledExpected: true })
);

test(
	'<Button /> listens to click events when button type is "submit"',
	testClickEvent({ buttonType: "submit", clickHandledExpected: true })
);

test(
	'<Button /> does not listen to click events when it is disabled and button type is "button"',
	testClickEvent({ buttonType: "button", disabled: true, clickHandledExpected: false })
);

test(
	'<Button /> does not listen to click events when it is disabled and button type is "submit"',
	testClickEvent({ buttonType: "submit", disabled: true, clickHandledExpected: false })
);
