import { afterEach, assert, test } from "vitest";
import type { ComponentProps } from "svelte";
import { Factory } from "fishery";
import { Maybe } from "true-myth/maybe";
import { cleanup, render, screen, fireEvent } from "@testing-library/svelte";
import { teams, type Team } from "../../../src/team/teams-store";
import GamePoint from "../../../src/game/GamePoint.svelte";

const teamFactory = Factory.define<Team>(() => {
	return {
		teamName: "foo",
		gamePoints: 0
	};
});

const componentPropsFactory = Factory.define<ComponentProps<GamePoint>>(() => {
	return {
		teamNumber: 1,
		disabled: false
	};
});

afterEach(cleanup);

test("<GamePoint /> shows game points nearby team name", async () => {
	teams.set(
		new Map([
			[
				1,
				teamFactory.build({
					gamePoints: 3
				})
			]
		])
	);
	const props = componentPropsFactory.build();
	render(GamePoint, props);

	const labelElement = await screen.findByText<HTMLLabelElement>("foo (3)");

	assert.isNotNull(labelElement);
});

test("<GamePoint /> updates game points nearby team name when teams store gets updated", async () => {
	teams.set(
		new Map([
			[
				1,
				teamFactory.build({
					gamePoints: 0
				})
			]
		])
	);
	const props = componentPropsFactory.build();
	render(GamePoint, props);

	teams.update((teamsMap) => {
		teamsMap.set(
			1,
			teamFactory.build({
				gamePoints: 4
			})
		);
		return new Map(teamsMap);
	});

	const labelElement = await screen.findByText<HTMLLabelElement>("foo (4)");

	assert.isNotNull(labelElement);
});

test('<GamePoint /> renders an input of type "range"', () => {
	teams.set(new Map([[1, teamFactory.build()]]));
	const props = componentPropsFactory.build();
	render(GamePoint, props);

	const inputElement = screen.getByLabelText<HTMLInputElement>("foo (0)");

	assert.strictEqual(inputElement.type, "range");
});

test('<GamePoint /> does not dispatch "gamepointchange" after initial rendering', () => {
	teams.set(new Map([[1, teamFactory.build()]]));
	const props = componentPropsFactory.build();
	const { component } = render(GamePoint, props);

	let gamePointChangeCalled = false;
	component.$on("gamepointchange", () => {
		gamePointChangeCalled = true;
	});

	assert.isFalse(gamePointChangeCalled);
});

test('<GamePoint /> dispatches "gamepointchange" when value changed', async () => {
	teams.set(new Map([[1, teamFactory.build()]]));
	const props = componentPropsFactory.build();
	const { component } = render(GamePoint, props);

	let gamePointChangeCalled = false;
	component.$on("gamepointchange", () => {
		gamePointChangeCalled = true;
	});

	const inputElement = screen.getByLabelText<HTMLInputElement>("foo (0)");
	await fireEvent.change(inputElement, { target: { value: "4" } });

	assert.isTrue(gamePointChangeCalled);
});

test("<GamePoint /> does not allow setting the value to 1 and therefore immediately sets 2", async () => {
	teams.set(new Map([[1, teamFactory.build()]]));
	const props = componentPropsFactory.build();
	const { component } = render(GamePoint, props);

	let gamePoint: Maybe<number> = Maybe.nothing();
	component.$on("gamepointchange", (event) => {
		gamePoint = Maybe.just(event.detail.gamePoint);
	});

	const inputElement = screen.getByLabelText<HTMLInputElement>("foo (0)");
	await fireEvent.input(inputElement, { target: { value: "1" } });
	await fireEvent.change(inputElement, { target: { value: "2" } });

	assert.deepStrictEqual(gamePoint, Maybe.just(2));
});

test("<GamePoint /> shows value changes in the output element", async () => {
	teams.set(new Map([[1, teamFactory.build()]]));
	const props = componentPropsFactory.build();
	render(GamePoint, props);

	const inputElement = screen.getByLabelText<HTMLInputElement>("foo (0)");
	await fireEvent.change(inputElement, { target: { value: 4 } });

	const outputElement = await screen.findByText<HTMLOutputElement>("4");

	assert.strictEqual(outputElement.nodeName, "OUTPUT");
	assert.isNotNull(outputElement);
});

test("<GamePoint /> resets game points when calling reset()", async () => {
	teams.set(new Map([[1, teamFactory.build()]]));
	const props = componentPropsFactory.build();
	const { component } = render(GamePoint, props);

	const inputElement = screen.getByLabelText<HTMLInputElement>("foo (0)");
	await fireEvent.change(inputElement, { target: { value: "4" } });
	component.reset();

	const outputElement = screen.queryByLabelText<HTMLInputElement>("foo (0)");

	assert.isNotNull(outputElement);
});
