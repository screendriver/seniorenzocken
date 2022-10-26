import { assert, test } from "vitest";
import { get } from "svelte/store";
import { Factory } from "fishery";
import { teams, areTeamsFilled } from "./teams-store";
import type { Team } from "./teams-store-factory";

const teamFactory = Factory.define<Team>(() => {
	return {
		teamName: "",
		gamePoints: 0
	};
});

test("areTeamsFilled store returns false when teams store is empty", () => {
	teams.set(new Map());

	const filled = get(areTeamsFilled);

	assert.isFalse(filled);
});

test('areTeamsFilled store returns false when teams store has one item with an empty "teamName"', () => {
	teams.set(new Map([[1, teamFactory.build()]]));

	const filled = get(areTeamsFilled);

	assert.isFalse(filled);
});

test('areTeamsFilled store returns false when teams store has two items with an empty "teamName"', () => {
	teams.set(
		new Map([
			[1, teamFactory.build()],
			[2, teamFactory.build()]
		])
	);

	const filled = get(areTeamsFilled);

	assert.isFalse(filled);
});

test('areTeamsFilled store returns true when teams store has one item with a non empty "teamName"', () => {
	teams.set(new Map([[1, teamFactory.build({ teamName: "test" })]]));

	const filled = get(areTeamsFilled);

	assert.isTrue(filled);
});

test('areTeamsFilled store returns true when teams store has two items with a non empty "teamName"', () => {
	teams.set(
		new Map([
			[1, teamFactory.build({ teamName: "test" })],
			[1, teamFactory.build({ teamName: "test2" })]
		])
	);

	const filled = get(areTeamsFilled);

	assert.isTrue(filled);
});

test('areTeamsFilled store returns false when teams store has two items where one item has a non empty "teamName"', () => {
	teams.set(
		new Map([
			[1, teamFactory.build({ teamName: "test" })],
			[1, teamFactory.build()]
		])
	);

	const filled = get(areTeamsFilled);

	assert.isFalse(filled);
});
