import { describe, it, expect } from "vitest";
import { Factory } from "fishery";
import type { NotPersistedTeam } from "../../shared/team.js";
import { isGameOver } from "./game-over.js";

const notPersistedTeamFactory = Factory.define<NotPersistedTeam>(() => {
	return {
		teamNumber: 1,
		name: "",
		currentRoundGamePoints: 0,
		matchTotalGamePoints: 0,
		isStretched: false
	};
});

describe("isGameOver()", () => {
	it("returns false when every given team has less than 15 match total game points", () => {
		const team1 = notPersistedTeamFactory.build({ matchTotalGamePoints: 12 });
		const team2 = notPersistedTeamFactory.build({ matchTotalGamePoints: 12 });

		expect(isGameOver(team1, team2)).toBe(false);
	});

	it("returns true when one of the given team has 15 match total game points", () => {
		const team1 = notPersistedTeamFactory.build({ matchTotalGamePoints: 15 });
		const team2 = notPersistedTeamFactory.build({ matchTotalGamePoints: 14 });

		expect(isGameOver(team1, team2)).toBe(true);
	});

	it("returns true when one of the given team has more than 15 game points", () => {
		const team1 = notPersistedTeamFactory.build({ matchTotalGamePoints: 12 });
		const team2 = notPersistedTeamFactory.build({ matchTotalGamePoints: 16 });

		expect(isGameOver(team1, team2)).toBe(true);
	});
});
