import test from "ava";
import type { Teams } from "../game-store/team.js";
import { checkIfGameWouldBeOver } from "./game-over.js";
import { teamFactory } from "../../../test/team-factory.js";

test("checkIfGameWouldBeOver() returns false when every given team has less than 15 game points", (t) => {
	const teams: Teams = [teamFactory.build({ totalGamePoints: 12 }), teamFactory.build({ totalGamePoints: 14 })];

	const actual = checkIfGameWouldBeOver(teams);
	const expected = false;

	t.is(actual, expected);
});

test("checkIfGameWouldBeOver() returns true when one of the given team has 15 game points", (t) => {
	const teams: Teams = [teamFactory.build({ totalGamePoints: 15 }), teamFactory.build({ totalGamePoints: 14 })];

	const actual = checkIfGameWouldBeOver(teams);
	const expected = true;

	t.is(actual, expected);
});

test("checkIfGameWouldBeOver() returns true when one of the given team has more than 15 game points", (t) => {
	const teams: Teams = [teamFactory.build({ totalGamePoints: 12 }), teamFactory.build({ totalGamePoints: 16 })];

	const actual = checkIfGameWouldBeOver(teams);
	const expected = true;

	t.is(actual, expected);
});
