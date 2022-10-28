import { Factory } from "fishery";
import Maybe from "true-myth/maybe";
import { assert, test } from "vitest";
import type { Team, Teams } from "../team/teams-store";
import { checkIfGameIsOver } from "./rules";

const teamFactory = Factory.define<Team>(() => {
	return {
		teamName: "",
		gamePoints: 0
	};
});

test("checkIfGameIsOver() returns false when given teams are a Nothing", () => {
	const teams = Maybe.nothing<Teams>();

	assert.isFalse(checkIfGameIsOver(teams));
});

test("checkIfGameIsOver() returns false when teams are an empty Map", () => {
	const teams = Maybe.just<Teams>(new Map());

	assert.isFalse(checkIfGameIsOver(teams));
});

test("checkIfGameIsOver() returns false when team does not have 15 game points reached", () => {
	const teams = Maybe.just<Teams>(new Map([[1, teamFactory.build({ gamePoints: 0 })]]));

	assert.isFalse(checkIfGameIsOver(teams));
});

test("checkIfGameIsOver() returns true when team has reached exactly 15 game points", () => {
	const teams = Maybe.just<Teams>(new Map([[1, teamFactory.build({ gamePoints: 15 })]]));

	assert.isTrue(checkIfGameIsOver(teams));
});

test("checkIfGameIsOver() returns true when team has more than 15 game points", () => {
	const teams = Maybe.just<Teams>(new Map([[1, teamFactory.build({ gamePoints: 16 })]]));

	assert.isTrue(checkIfGameIsOver(teams));
});

test("checkIfGameIsOver() returns false when multiple teams did not reach 15 game points", () => {
	const teams = Maybe.just<Teams>(
		new Map([
			[1, teamFactory.build({ gamePoints: 0 })],
			[2, teamFactory.build({ gamePoints: 2 })]
		])
	);

	assert.isFalse(checkIfGameIsOver(teams));
});

test("checkIfGameIsOver() returns true when one team in multiple teams reached exactly 15 game points", () => {
	const teams = Maybe.just<Teams>(
		new Map([
			[1, teamFactory.build({ gamePoints: 6 })],
			[2, teamFactory.build({ gamePoints: 15 })]
		])
	);

	assert.isTrue(checkIfGameIsOver(teams));
});

test("checkIfGameIsOver() returns true when one team in multiple teams has more than 15 game points", () => {
	const teams = Maybe.just<Teams>(
		new Map([
			[1, teamFactory.build({ gamePoints: 6 })],
			[2, teamFactory.build({ gamePoints: 16 })]
		])
	);

	assert.isTrue(checkIfGameIsOver(teams));
});
