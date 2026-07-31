import assert from "node:assert";
import { suite, test } from "mocha";
import { Factory } from "fishery";
import type { NotPersistedTeam } from "../../shared/team.js";
import { shouldShowConfetti } from "./confetti.js";

const notPersistedTeamFactory = Factory.define<NotPersistedTeam>(() => {
	return {
		teamNumber: 1,
		name: "",
		currentRoundGamePoints: 0,
		matchTotalGamePoints: 0,
		isStretched: false
	};
});

suite("shouldShowConfetti()", function () {
	test("returns false when given current round game points for both teams equals 0", function () {
		const team1 = notPersistedTeamFactory.build({ teamNumber: 1, currentRoundGamePoints: 0 });
		const team2 = notPersistedTeamFactory.build({ teamNumber: 2, currentRoundGamePoints: 0 });

		assert.strictEqual(shouldShowConfetti(team1, team2), false);
	});

	test("returns false when given current round game points for team 1 equals 2", function () {
		const team1 = notPersistedTeamFactory.build({ teamNumber: 1, currentRoundGamePoints: 2 });
		const team2 = notPersistedTeamFactory.build({ teamNumber: 2, currentRoundGamePoints: 0 });

		assert.strictEqual(shouldShowConfetti(team1, team2), false);
	});

	test("returns false when given current round game points for team 1 equals 3", function () {
		const team1 = notPersistedTeamFactory.build({ teamNumber: 1, currentRoundGamePoints: 3 });
		const team2 = notPersistedTeamFactory.build({ teamNumber: 2, currentRoundGamePoints: 0 });

		assert.strictEqual(shouldShowConfetti(team1, team2), false);
	});

	test("returns true when given current round game points for team 1 equals 4", function () {
		const team1 = notPersistedTeamFactory.build({ teamNumber: 1, currentRoundGamePoints: 4 });
		const team2 = notPersistedTeamFactory.build({ teamNumber: 2, currentRoundGamePoints: 0 });

		assert.strictEqual(shouldShowConfetti(team1, team2), true);
	});

	test("returns false when given current round game points for team 2 equals 2", function () {
		const team1 = notPersistedTeamFactory.build({ teamNumber: 1, currentRoundGamePoints: 0 });
		const team2 = notPersistedTeamFactory.build({ teamNumber: 2, currentRoundGamePoints: 2 });

		assert.strictEqual(shouldShowConfetti(team1, team2), false);
	});

	test("returns false when given current round game points for team 2 equals 3", function () {
		const team1 = notPersistedTeamFactory.build({ teamNumber: 1, currentRoundGamePoints: 0 });
		const team2 = notPersistedTeamFactory.build({ teamNumber: 2, currentRoundGamePoints: 3 });

		assert.strictEqual(shouldShowConfetti(team1, team2), false);
	});

	test("returns true when given current round game points for team 2 equals 4", function () {
		const team1 = notPersistedTeamFactory.build({ teamNumber: 1, currentRoundGamePoints: 0 });
		const team2 = notPersistedTeamFactory.build({ teamNumber: 2, currentRoundGamePoints: 4 });

		assert.strictEqual(shouldShowConfetti(team1, team2), true);
	});
});
