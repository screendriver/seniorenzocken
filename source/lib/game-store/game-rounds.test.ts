import test from "ava";
import { Stack } from "js-sdsl";
import type { Teams } from "./team.js";
import { cloneGameRounds } from "./game-rounds.js";
import { teamFactory } from "../../../test/team-factory.js";

test("cloneGameRounds() returns an empty Stack when given game rounds Stack is empty", (t) => {
	const gameRounds = new Stack<Teams>();

	const actual = cloneGameRounds(gameRounds).empty();
	const expected = true;

	t.is(actual, expected);
});

test("cloneGameRounds() returns a Stack with just one element when given game rounds Stack just has one item", (t) => {
	const teams: Teams = [teamFactory.build(), teamFactory.build()];
	const gameRounds = new Stack<Teams>();
	gameRounds.push(teams);

	const clonedGameRounds = cloneGameRounds(gameRounds);

	t.is(clonedGameRounds.size(), 1);

	const actual = clonedGameRounds.pop();
	const expected = teams;

	t.is(actual, expected);
});

test("cloneGameRounds() returns a Stack with the correct order of all elements", (t) => {
	const teamsOne: Teams = [teamFactory.build(), teamFactory.build()];
	const teamsTwo: Teams = [teamFactory.build(), teamFactory.build()];
	const teamsThree: Teams = [teamFactory.build(), teamFactory.build()];
	const gameRounds = new Stack<Teams>();
	gameRounds.push(teamsOne);
	gameRounds.push(teamsTwo);
	gameRounds.push(teamsThree);

	const clonedGameRounds = cloneGameRounds(gameRounds);

	t.is(clonedGameRounds.size(), 3);
	t.is(clonedGameRounds.pop(), teamsThree);
	t.is(clonedGameRounds.pop(), teamsTwo);
	t.is(clonedGameRounds.pop(), teamsOne);
});
