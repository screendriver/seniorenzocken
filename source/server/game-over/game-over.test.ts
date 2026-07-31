import assert from "node:assert";
import { suite, test } from "mocha";
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

suite("isGameOver()", function () {
	test("returns false when every given team has less than 15 match total game points", function () {
		const team1 = notPersistedTeamFactory.build({ matchTotalGamePoints: 12 });
		const team2 = notPersistedTeamFactory.build({ matchTotalGamePoints: 12 });

		assert.strictEqual(isGameOver(team1, team2), false);
	});

	test("returns true when one of the given team has 15 match total game points", function () {
		const team1 = notPersistedTeamFactory.build({ matchTotalGamePoints: 15 });
		const team2 = notPersistedTeamFactory.build({ matchTotalGamePoints: 14 });

		assert.strictEqual(isGameOver(team1, team2), true);
	});

	test("returns true when one of the given team has more than 15 game points", function () {
		const team1 = notPersistedTeamFactory.build({ matchTotalGamePoints: 12 });
		const team2 = notPersistedTeamFactory.build({ matchTotalGamePoints: 16 });

		assert.strictEqual(isGameOver(team1, team2), true);
	});
});
