import { test, expect } from "vitest";
import { ref } from "vue";
import { Factory } from "fishery";
import type { Team, Teams } from "../../team/team.js";
import { checkIfGameWouldBeOver } from "../game-over.js";

const teamFactory = Factory.define<Team>(() => {
	return {
		teamNumber: 1,
		teamName: "",
		gamePoints: 0,
		isStretched: false,
	};
});

test("checkIfGameWouldBeOver() returns false when every given team has less than 15 game points", () => {
	const teams: Teams = [ref(teamFactory.build({ gamePoints: 12 })), ref(teamFactory.build({ gamePoints: 14 }))];

	expect(checkIfGameWouldBeOver(teams)).toBe(false);
});

test("checkIfGameWouldBeOver() returns true when one of the given team has 15 game points", () => {
	const teams: Teams = [ref(teamFactory.build({ gamePoints: 15 })), ref(teamFactory.build({ gamePoints: 14 }))];

	expect(checkIfGameWouldBeOver(teams)).toBe(true);
});

test("checkIfGameWouldBeOver() returns true when one of the given team has more than 15 game points", () => {
	const teams: Teams = [ref(teamFactory.build({ gamePoints: 12 })), ref(teamFactory.build({ gamePoints: 16 }))];

	expect(checkIfGameWouldBeOver(teams)).toBe(true);
});
