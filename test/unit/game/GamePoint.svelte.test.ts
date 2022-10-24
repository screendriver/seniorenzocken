import { afterEach, assert, test } from "vitest";
import type { ComponentProps } from "svelte";
import { Factory } from "fishery";
import { Maybe } from "true-myth/maybe";
import { cleanup, render, screen, fireEvent } from "@testing-library/svelte";
import GamePoint from "../../../src/game/GamePoint.svelte";

const componentPropsFactory = Factory.define<ComponentProps<GamePoint>>(() => {
	return {
		teamNumber: 1,
		team: {
			teamName: "",
			gamePoints: Maybe.nothing()
		},
		disabled: false
	};
});

afterEach(cleanup);

test('<GamePoint /> renders an input of type "range"', () => {
	const props = componentPropsFactory.build({
		team: {
			teamName: "foo"
		}
	});
	render(GamePoint, props);

	const inputElement = screen.getByLabelText<HTMLInputElement>("foo:");

	assert.strictEqual(inputElement.type, "range");
});

test('<GamePoint /> does not dispatch "gamepointchange" when value is 0', async () => {
	const props = componentPropsFactory.build({
		team: {
			teamName: "foo"
		}
	});
	const { component } = render(GamePoint, props);

	let gamePointChangeCalled = false;
	component.$on("gamepointchange", () => {
		gamePointChangeCalled = true;
	});

	const inputElement = screen.getByLabelText<HTMLInputElement>("foo:");
	await fireEvent.change(inputElement, { target: { value: 0 } });

	assert.isFalse(gamePointChangeCalled);
});

test("<GamePoint /> does not allow setting the value to 1 and therefore immediately sets 2", async () => {
	const props = componentPropsFactory.build({
		team: {
			teamName: "foo"
		}
	});
	const { component } = render(GamePoint, props);

	let gamePoint: Maybe<number> = Maybe.nothing();
	component.$on("gamepointchange", (event) => {
		gamePoint = Maybe.just(event.detail.gamePoint);
	});

	const inputElement = screen.getByLabelText<HTMLInputElement>("foo:");
	await fireEvent.change(inputElement, { target: { value: 1 } });

	assert.deepStrictEqual(gamePoint, Maybe.just(2));
});

test("<GamePoint /> shows value changes in the output element", async () => {
	const props = componentPropsFactory.build({
		team: {
			teamName: "foo"
		}
	});
	render(GamePoint, props);

	const inputElement = screen.getByLabelText<HTMLInputElement>("foo:");
	await fireEvent.change(inputElement, { target: { value: 4 } });

	const outputElement = await screen.findByText<HTMLOutputElement>("4");

	assert.strictEqual(outputElement.nodeName, "OUTPUT");
	assert.isNotNull(outputElement);
});
