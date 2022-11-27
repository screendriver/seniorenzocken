import { afterEach, assert, test } from "vitest";
import type { ComponentProps } from "svelte";
import { Factory } from "fishery";
import { Maybe } from "true-myth/maybe";
import { cleanup, render, screen, fireEvent } from "@testing-library/svelte";
import GamePoint from "./GamePoint.svelte";
import type { Team } from "../team/team-schema.js";

const teamFactory = Factory.define<Team>(() => {
	return {
		teamName: "foo",
		gamePoints: 0,
		isStretched: false
	};
});

const componentPropsFactory = Factory.define<ComponentProps<GamePoint>>(() => {
	return {
		teamNumber: 1,
		teams: new Map(),
		disabled: false
	};
});

afterEach(cleanup);

test("<GamePoint /> shows the team name", async () => {
	const teams = new Map([
		[
			1,
			teamFactory.build({
				teamName: "test team"
			})
		]
	]);
	const props = componentPropsFactory.build({ teams });
	render(GamePoint, props);

	const citeElement = await screen.findByText("test team");

	assert.isNotNull(citeElement);
});

test("<GamePoint /> shows game points", async () => {
	const teams = new Map([
		[
			1,
			teamFactory.build({
				gamePoints: 3
			})
		]
	]);
	const props = componentPropsFactory.build({ teams });
	render(GamePoint, props);

	const labelElement = await screen.findByLabelText<HTMLLabelElement>("foo 3");

	assert.isNotNull(labelElement);
});

test('<GamePoint /> renders an input of type "range"', () => {
	const teams = new Map([[1, teamFactory.build()]]);
	const props = componentPropsFactory.build({ teams });
	render(GamePoint, props);

	const inputElement = screen.getByLabelText<HTMLInputElement>("foo 0");

	assert.strictEqual(inputElement.type, "range");
});

test('<GamePoint /> does not dispatch "gamepointchange" after initial rendering', () => {
	const teams = new Map([[1, teamFactory.build()]]);
	const props = componentPropsFactory.build({ teams });
	const { component } = render(GamePoint, props);

	let gamePointChangeCalled = false;
	component.$on("gamepointchange", () => {
		gamePointChangeCalled = true;
	});

	assert.isFalse(gamePointChangeCalled);
});

test('<GamePoint /> dispatches "gamepointchange" when value changed', async () => {
	const teams = new Map([[1, teamFactory.build()]]);
	const props = componentPropsFactory.build({ teams });
	const { component } = render(GamePoint, props);

	let gamePointChangeCalled = false;
	component.$on("gamepointchange", () => {
		gamePointChangeCalled = true;
	});

	const inputElement = screen.getByLabelText<HTMLInputElement>("foo 0");
	await fireEvent.input(inputElement, { target: { value: "4" } });

	assert.isTrue(gamePointChangeCalled);
});

test("<GamePoint /> does not allow setting the value to 1 and therefore immediately sets 2", async () => {
	const teams = new Map([[1, teamFactory.build()]]);
	const props = componentPropsFactory.build({ teams });
	const { component } = render(GamePoint, props);

	let gamePoint: Maybe<number> = Maybe.nothing();
	component.$on("gamepointchange", (event) => {
		gamePoint = Maybe.just(event.detail.gamePoint);
	});

	const inputElement = screen.getByLabelText<HTMLInputElement>("foo 0");
	await fireEvent.input(inputElement, { target: { value: "2" } });

	assert.deepStrictEqual(gamePoint, Maybe.just(2));
});

test("<GamePoint /> shows 5 different score markings", () => {
	const teams = new Map([
		[
			1,
			teamFactory.build({
				gamePoints: 12
			})
		]
	]);
	const props = componentPropsFactory.build({ teams });
	render(GamePoint, props);

	assert.isNotNull(screen.queryByText("0"));
	assert.isNotNull(screen.queryByText("1"));
	assert.isNotNull(screen.queryByText("2"));
	assert.isNotNull(screen.queryByText("3"));
	assert.isNotNull(screen.queryByText("4"));
});

test("<GamePoint /> resets game points when calling reset()", async () => {
	const teams = new Map([[1, teamFactory.build()]]);
	const props = componentPropsFactory.build({ teams });
	const { component } = render(GamePoint, props);

	const inputElement = screen.getByLabelText<HTMLInputElement>("foo 0");
	await fireEvent.change(inputElement, { target: { value: "4" } });
	component.reset();

	const outputElement = screen.queryByLabelText<HTMLInputElement>("foo 0");

	assert.isNotNull(outputElement);
});
