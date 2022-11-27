import { Factory } from "fishery";
import { test, assert } from "vitest";
import type { Team, Teams } from "./team-schema.js";
import { areTeamsFilled } from "./teams-filled.js";

const teamFactory = Factory.define<Team>(() => {
	return {
		teamName: "",
		gamePoints: 0,
		isStretched: false
	};
});

test("areTeamsFilled() returns false when both teams have an empty team name", () => {
	const teams: Teams = [teamFactory.build(), teamFactory.build()];

	const filled = areTeamsFilled(teams);

	assert.isFalse(filled);
});

test("areTeamsFilled() returns false when first teams has a team name set", () => {
	const teams: Teams = [teamFactory.build({ teamName: "test" }), teamFactory.build()];

	const filled = areTeamsFilled(teams);

	assert.isFalse(filled);
});

test("areTeamsFilled() returns false when second teams has a team name set", () => {
	const teams: Teams = [teamFactory.build(), teamFactory.build({ teamName: "test" })];

	const filled = areTeamsFilled(teams);

	assert.isFalse(filled);
});

test("areTeamsFilled() returns true both teams have a team name set", () => {
	const teams: Teams = [teamFactory.build({ teamName: "test" }), teamFactory.build({ teamName: "test" })];

	const filled = areTeamsFilled(teams);

	assert.isTrue(filled);
});
