import test from "ava";
import { canGameBeStarted } from "./can-game-be-started.js";
import type { Teams } from "./team.js";
import { teamFactory } from "../../../test/team-factory.js";

test("canGameBeStarted() returns false when all team names are empty strings", (t) => {
	const teams: Teams = [teamFactory.build({ teamName: "" }), teamFactory.build({ teamName: "" })];

	const actual = canGameBeStarted(teams);
	const expected = false;

	t.is(actual, expected);
});

test("canGameBeStarted() returns false when one team name is an empty string", (t) => {
	const teams: Teams = [teamFactory.build({ teamName: "foo" }), teamFactory.build({ teamName: "" })];

	const actual = canGameBeStarted(teams);
	const expected = false;

	t.is(actual, expected);
});

test("canGameBeStarted() returns true when both team names are filled", (t) => {
	const teams: Teams = [teamFactory.build({ teamName: "foo" }), teamFactory.build({ teamName: "bar" })];

	const actual = canGameBeStarted(teams);
	const expected = true;

	t.is(actual, expected);
});
