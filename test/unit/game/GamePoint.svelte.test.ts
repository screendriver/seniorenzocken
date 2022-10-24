import { afterEach, assert, test } from "vitest";
import type { ComponentProps } from "svelte";
import { Factory } from "fishery";
import { Maybe } from "true-myth/maybe";
import { cleanup, render, screen, fireEvent } from "@testing-library/svelte";
import GamePoint from "../../../src/game/GamePoint.svelte";
import type { Team } from "../../../src/team/teams-store";

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

	const inputElement = screen.getByLabelText<HTMLInputElement>("foo (0)");

	assert.strictEqual(inputElement.type, "range");
});

test('<GamePoint /> does not dispatch "gamepointchange" after initial rendering', () => {
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

	const inputElement = screen.getByLabelText<HTMLInputElement>("foo (0)");
	await fireEvent.input(inputElement, { target: { value: "1" } });
	await fireEvent.change(inputElement, { target: { value: "2" } });

	assert.deepStrictEqual(gamePoint, Maybe.just(2));
});

test("<GamePoint /> shows game point changes nearby team name", async () => {
	const props = componentPropsFactory.build({
		team: {
			teamName: "foo"
		}
	});
	const { component } = render(GamePoint, props);

	component.$on("gamepointchange", (event) => {
		const team: Team = {
			teamName: event.detail.team.teamName,
			gamePoints: Maybe.just(event.detail.gamePoint)
		};

		component.$set({
			team
		});
	});

	const inputElement = screen.getByLabelText<HTMLInputElement>("foo (0)");
	await fireEvent.change(inputElement, { target: { value: 4 } });

	const labelElement = await screen.findByText<HTMLLabelElement>("foo (4)");

	assert.isNotNull(labelElement);
});

test("<GamePoint /> shows value changes in the output element", async () => {
	const props = componentPropsFactory.build({
		team: {
			teamName: "foo"
		}
	});
	render(GamePoint, props);

	const inputElement = screen.getByLabelText<HTMLInputElement>("foo (0)");
	await fireEvent.change(inputElement, { target: { value: 4 } });

	const outputElement = await screen.findByText<HTMLOutputElement>("4");

	assert.strictEqual(outputElement.nodeName, "OUTPUT");
	assert.isNotNull(outputElement);
});
