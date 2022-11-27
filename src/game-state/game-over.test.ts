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

test("checkIfGameWouldBeOver() returns false when teams does not have 15 game points reached", () => {
	const teams: Teams = [teamFactory.build({ gamePoints: 2 }), teamFactory.build({ gamePoints: 0 })];

	assert.isFalse(checkIfGameWouldBeOver(teams));
});

test("checkIfGameWouldBeOver() returns true when first team has reached exactly 15 game points", () => {
	const teams: Teams = [teamFactory.build({ gamePoints: 15 }), teamFactory.build()];

	assert.isTrue(checkIfGameWouldBeOver(teams));
});

test("checkIfGameWouldBeOver() returns true when second team has reached exactly 15 game points", () => {
	const teams: Teams = [teamFactory.build(), teamFactory.build({ gamePoints: 15 })];

	assert.isTrue(checkIfGameWouldBeOver(teams));
});

test("checkIfGameWouldBeOver() returns true when first team has more than 15 game points", () => {
	const teams: Teams = [teamFactory.build({ gamePoints: 16 }), teamFactory.build()];

	assert.isTrue(checkIfGameWouldBeOver(teams));
});

test("checkIfGameWouldBeOver() returns true when second team has more than 15 game points", () => {
	const teams: Teams = [teamFactory.build(), teamFactory.build({ gamePoints: 16 })];

	assert.isTrue(checkIfGameWouldBeOver(teams));
});
