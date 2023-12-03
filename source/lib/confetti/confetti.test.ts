import test from "ava";
import type { Teams } from "../game-store/team.js";
import { shouldShowConfetti } from "./confetti.js";
import { teamFactory } from "../../../test/team-factory.js";

test("shouldShowConfetti() returns false when no one of the given teams has more than 4 current game points", (t) => {
	const teams: Teams = [teamFactory.build({ currentGamePoints: 3 }), teamFactory.build({ currentGamePoints: 2 })];

	const actual = shouldShowConfetti(teams);
	const expected = false;

	t.is(actual, expected);
});

test("shouldShowConfetti() returns true when one of the given teams has more than 4 current game points", (t) => {
	const teams: Teams = [teamFactory.build({ currentGamePoints: 0 }), teamFactory.build({ currentGamePoints: 10 })];

	const actual = shouldShowConfetti(teams);
	const expected = true;

	t.is(actual, expected);
});

test("shouldShowConfetti() returns true when one of the given teams has exactly 4 current game points", (t) => {
	const teams: Teams = [teamFactory.build({ currentGamePoints: 0 }), teamFactory.build({ currentGamePoints: 4 })];

	const actual = shouldShowConfetti(teams);
	const expected = true;

	t.is(actual, expected);
});
