import { suite, test, expect } from "vitest";
import { Factory } from "fishery";
import type { NotPersistedTeam } from "../../shared/team.ts";
import { shouldShowConfetti } from "./confetti.ts";

const notPersistedTeamFactory = Factory.define<NotPersistedTeam>(() => {
	return {
		teamNumber: 1,
		name: "",
		currentRoundGamePoints: 0,
		matchTotalGamePoints: 0,
		isStretched: false,
	};
});

suite("shouldShowConfetti()", () => {
	test("returns false when given current round game points for both teams equals 0", () => {
		const team1 = notPersistedTeamFactory.build({ teamNumber: 1, currentRoundGamePoints: 0 });
		const team2 = notPersistedTeamFactory.build({ teamNumber: 2, currentRoundGamePoints: 0 });

		expect(shouldShowConfetti(team1, team2)).toBe(false);
	});

	test("returns false when given current round game points for team 1 equals 2", () => {
		const team1 = notPersistedTeamFactory.build({ teamNumber: 1, currentRoundGamePoints: 2 });
		const team2 = notPersistedTeamFactory.build({ teamNumber: 2, currentRoundGamePoints: 0 });

		expect(shouldShowConfetti(team1, team2)).toBe(false);
	});

	test("returns false when given current round game points for team 1 equals 3", () => {
		const team1 = notPersistedTeamFactory.build({ teamNumber: 1, currentRoundGamePoints: 3 });
		const team2 = notPersistedTeamFactory.build({ teamNumber: 2, currentRoundGamePoints: 0 });

		expect(shouldShowConfetti(team1, team2)).toBe(false);
	});

	test("returns true when given current round game points for team 1 equals 4", () => {
		const team1 = notPersistedTeamFactory.build({ teamNumber: 1, currentRoundGamePoints: 4 });
		const team2 = notPersistedTeamFactory.build({ teamNumber: 2, currentRoundGamePoints: 0 });

		expect(shouldShowConfetti(team1, team2)).toBe(true);
	});

	test("returns false when given current round game points for team 2 equals 2", () => {
		const team1 = notPersistedTeamFactory.build({ teamNumber: 1, currentRoundGamePoints: 0 });
		const team2 = notPersistedTeamFactory.build({ teamNumber: 2, currentRoundGamePoints: 2 });

		expect(shouldShowConfetti(team1, team2)).toBe(false);
	});

	test("returns false when given current round game points for team 2 equals 3", () => {
		const team1 = notPersistedTeamFactory.build({ teamNumber: 1, currentRoundGamePoints: 0 });
		const team2 = notPersistedTeamFactory.build({ teamNumber: 2, currentRoundGamePoints: 3 });

		expect(shouldShowConfetti(team1, team2)).toBe(false);
	});

	test("returns true when given current round game points for team 2 equals 4", () => {
		const team1 = notPersistedTeamFactory.build({ teamNumber: 1, currentRoundGamePoints: 0 });
		const team2 = notPersistedTeamFactory.build({ teamNumber: 2, currentRoundGamePoints: 4 });

		expect(shouldShowConfetti(team1, team2)).toBe(true);
	});
});
