import { Factory } from "fishery";
import { test, assert } from "vitest";
import type { Team, Teams } from "../team/team-schema.js";
import { checkIfGameWouldBeOver } from "./game-over.js";

const teamFactory = Factory.define<Team>(() => {
	return {
		teamName: "",
		gamePoints: 0,
		isStretched: false
	};
});

test("checkIfGameWouldBeOver() returns false when teams are an empty Map", () => {
	const teams = new Map();

	assert.isFalse(checkIfGameWouldBeOver(teams, 1, 15));
});

test("checkIfGameWouldBeOver() returns false when team does not have 15 game points reached", () => {
	const teams: Teams = new Map([[1, teamFactory.build({ gamePoints: 0 })]]);

	assert.isFalse(checkIfGameWouldBeOver(teams, 1, 2));
});

test("checkIfGameWouldBeOver() returns true when team has reached exactly 15 game points", () => {
	const teams: Teams = new Map([[1, teamFactory.build({ gamePoints: 13 })]]);

	assert.isTrue(checkIfGameWouldBeOver(teams, 1, 2));
});

test("checkIfGameWouldBeOver() returns true when team has more than 15 game points", () => {
	const teams: Teams = new Map([[1, teamFactory.build({ gamePoints: 13 })]]);

	assert.isTrue(checkIfGameWouldBeOver(teams, 1, 3));
});

test("checkIfGameWouldBeOver() returns false when multiple teams did not reach 15 game points", () => {
	const teams: Teams = new Map([
		[1, teamFactory.build({ gamePoints: 0 })],
		[2, teamFactory.build({ gamePoints: 2 })]
	]);

	assert.isFalse(checkIfGameWouldBeOver(teams, 1, 2));
});

test("checkIfGameWouldBeOver() returns false when one team in multiple teams reached almost 15 game points but the other team gets additional points", () => {
	const teams: Teams = new Map([
		[1, teamFactory.build({ gamePoints: 6 })],
		[2, teamFactory.build({ gamePoints: 12 })]
	]);

	assert.isFalse(checkIfGameWouldBeOver(teams, 1, 3));
});

test("checkIfGameWouldBeOver() returns true when one team in multiple teams reached exactly 15 game points", () => {
	const teams: Teams = new Map([
		[1, teamFactory.build({ gamePoints: 6 })],
		[2, teamFactory.build({ gamePoints: 12 })]
	]);

	assert.isTrue(checkIfGameWouldBeOver(teams, 2, 3));
});

test("checkIfGameWouldBeOver() returns true when one team in multiple teams has more than 15 game points", () => {
	const teams: Teams = new Map([
		[1, teamFactory.build({ gamePoints: 6 })],
		[2, teamFactory.build({ gamePoints: 13 })]
	]);

	assert.isTrue(checkIfGameWouldBeOver(teams, 2, 3));
});
