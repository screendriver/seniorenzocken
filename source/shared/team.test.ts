import assert from "node:assert";
import { suite, test } from "mocha";
import { safeParse } from "valibot";
import { Factory } from "fishery";
import { notPersistedTeam1Schema, notPersistedTeam2Schema } from "./team.js";

const notPersistedTeamFactory = Factory.define<unknown>(() => {
	return {
		teamNumber: 1,
		name: "test-team",
		currentRoundGamePoints: 0,
		matchTotalGamePoints: 0,
		isStretched: false
	};
});

suite("notPersistedTeam1Schema", function () {
	test("fails parsing when given data is undefined", function () {
		const parseResult = safeParse(notPersistedTeam1Schema, undefined);

		assert.strictEqual(parseResult.success, false);
	});

	test("fails parsing when given data is null", function () {
		const parseResult = safeParse(notPersistedTeam1Schema, null);

		assert.strictEqual(parseResult.success, false);
	});

	test("fails parsing when given data is not an object", function () {
		const parseResult = safeParse(notPersistedTeam1Schema, "not-an-object");

		assert.strictEqual(parseResult.success, false);
	});

	test("fails parsing when given data is an empty object", function () {
		const parseResult = safeParse(notPersistedTeam1Schema, {});

		assert.strictEqual(parseResult.success, false);
	});

	test("fails parsing when teamNumber is undefined", function () {
		const team = notPersistedTeamFactory.build({ teamNumber: undefined });
		const parseResult = safeParse(notPersistedTeam1Schema, team);

		assert.strictEqual(parseResult.success, false);
	});

	test("fails parsing when teamNumber is null", function () {
		const team = notPersistedTeamFactory.build({ teamNumber: null });
		const parseResult = safeParse(notPersistedTeam1Schema, team);

		assert.strictEqual(parseResult.success, false);
	});

	test("fails parsing when teamNumber is not a number", function () {
		const team = notPersistedTeamFactory.build({ teamNumber: "not-a-number" });
		const parseResult = safeParse(notPersistedTeam1Schema, team);

		assert.strictEqual(parseResult.success, false);
	});

	test("fails parsing when teamNumber equals 0", function () {
		const team = notPersistedTeamFactory.build({ teamNumber: 0 });
		const parseResult = safeParse(notPersistedTeam1Schema, team);

		assert.strictEqual(parseResult.success, false);
	});

	test("fails parsing when teamNumber equals -1", function () {
		const team = notPersistedTeamFactory.build({ teamNumber: -1 });
		const parseResult = safeParse(notPersistedTeam1Schema, team);

		assert.strictEqual(parseResult.success, false);
	});

	test("fails parsing when teamNumber equals 3", function () {
		const team = notPersistedTeamFactory.build({ teamNumber: 3 });
		const parseResult = safeParse(notPersistedTeam1Schema, team);

		assert.strictEqual(parseResult.success, false);
	});

	test("fails parsing when name is undefined", function () {
		const team = notPersistedTeamFactory.build({ name: undefined });
		const parseResult = safeParse(notPersistedTeam1Schema, team);

		assert.strictEqual(parseResult.success, false);
	});

	test("fails parsing when name is null", function () {
		const team = notPersistedTeamFactory.build({ name: null });
		const parseResult = safeParse(notPersistedTeam1Schema, team);

		assert.strictEqual(parseResult.success, false);
	});

	test("fails parsing when name is not a string", function () {
		const team = notPersistedTeamFactory.build({ name: 42 });
		const parseResult = safeParse(notPersistedTeam1Schema, team);

		assert.strictEqual(parseResult.success, false);
	});

	test("fails parsing when name is an empty string", function () {
		const team = notPersistedTeamFactory.build({ name: "" });
		const parseResult = safeParse(notPersistedTeam1Schema, team);

		assert.strictEqual(parseResult.success, false);
	});

	test("fails parsing when currentRoundGamePoints is undefined", function () {
		const team = notPersistedTeamFactory.build({ currentRoundGamePoints: undefined });
		const parseResult = safeParse(notPersistedTeam1Schema, team);

		assert.strictEqual(parseResult.success, false);
	});

	test("fails parsing when currentRoundGamePoints is null", function () {
		const team = notPersistedTeamFactory.build({ currentRoundGamePoints: null });
		const parseResult = safeParse(notPersistedTeam1Schema, team);

		assert.strictEqual(parseResult.success, false);
	});

	test("fails parsing when currentRoundGamePoints is not a number", function () {
		const team = notPersistedTeamFactory.build({ currentRoundGamePoints: "not-a-number" });
		const parseResult = safeParse(notPersistedTeam1Schema, team);

		assert.strictEqual(parseResult.success, false);
	});

	test("fails parsing when currentRoundGamePoints equals -1", function () {
		const team = notPersistedTeamFactory.build({ currentRoundGamePoints: -1 });
		const parseResult = safeParse(notPersistedTeam1Schema, team);

		assert.strictEqual(parseResult.success, false);
	});

	test("fails parsing when currentRoundGamePoints equals 1", function () {
		const team = notPersistedTeamFactory.build({ currentRoundGamePoints: 1 });
		const parseResult = safeParse(notPersistedTeam1Schema, team);

		assert.strictEqual(parseResult.success, false);
	});

	test("fails parsing when currentRoundGamePoints equals 5", function () {
		const team = notPersistedTeamFactory.build({ currentRoundGamePoints: 5 });
		const parseResult = safeParse(notPersistedTeam1Schema, team);

		assert.strictEqual(parseResult.success, false);
	});

	test("fails parsing when matchTotalGamePoints is undefined", function () {
		const team = notPersistedTeamFactory.build({ matchTotalGamePoints: undefined });
		const parseResult = safeParse(notPersistedTeam1Schema, team);

		assert.strictEqual(parseResult.success, false);
	});

	test("fails parsing when matchTotalGamePoints is null", function () {
		const team = notPersistedTeamFactory.build({ matchTotalGamePoints: null });
		const parseResult = safeParse(notPersistedTeam1Schema, team);

		assert.strictEqual(parseResult.success, false);
	});

	test("fails parsing when matchTotalGamePoints is not a number", function () {
		const team = notPersistedTeamFactory.build({ matchTotalGamePoints: "not-a-number" });
		const parseResult = safeParse(notPersistedTeam1Schema, team);

		assert.strictEqual(parseResult.success, false);
	});

	test("fails parsing when matchTotalGamePoints equals -1", function () {
		const team = notPersistedTeamFactory.build({ matchTotalGamePoints: -1 });
		const parseResult = safeParse(notPersistedTeam1Schema, team);

		assert.strictEqual(parseResult.success, false);
	});

	test("fails parsing when matchTotalGamePoints equals 19", function () {
		const team = notPersistedTeamFactory.build({ matchTotalGamePoints: 19 });
		const parseResult = safeParse(notPersistedTeam1Schema, team);

		assert.strictEqual(parseResult.success, false);
	});

	test("fails parsing when isStretched is undefined", function () {
		const team = notPersistedTeamFactory.build({ isStretched: undefined });
		const parseResult = safeParse(notPersistedTeam1Schema, team);

		assert.strictEqual(parseResult.success, false);
	});

	test("fails parsing when isStretched is null", function () {
		const team = notPersistedTeamFactory.build({ isStretched: null });
		const parseResult = safeParse(notPersistedTeam1Schema, team);

		assert.strictEqual(parseResult.success, false);
	});

	test("fails parsing when isStretched is not a boolean", function () {
		const team = notPersistedTeamFactory.build({ isStretched: "not-a-boolean" });
		const parseResult = safeParse(notPersistedTeam1Schema, team);

		assert.strictEqual(parseResult.success, false);
	});

	test("succeeds parsing when teamNumber equals $teamNumber", function () {
		const team = notPersistedTeamFactory.build();
		const parseResult = safeParse(notPersistedTeam1Schema, team);

		assert.strictEqual(parseResult.success, true);
	});

	test("succeeds parsing when name is not an empty string", function () {
		const team = notPersistedTeamFactory.build({ name: "foo" });
		const parseResult = safeParse(notPersistedTeam1Schema, team);

		assert.strictEqual(parseResult.success, true);
	});

	for (const currentRoundGamePoints of [0, 2, 3, 4]) {
		test(`succeeds parsing when currentRoundGamePoints equals ${currentRoundGamePoints}`, function () {
			const team = notPersistedTeamFactory.build({ currentRoundGamePoints });
			const parseResult = safeParse(notPersistedTeam1Schema, team);

			assert.strictEqual(parseResult.success, true);
		});
	}

	for (const matchTotalGamePoints of [0, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18]) {
		test(`succeeds parsing when matchTotalGamePoints equals ${matchTotalGamePoints}`, function () {
			const team = notPersistedTeamFactory.build({ matchTotalGamePoints });
			const parseResult = safeParse(notPersistedTeam1Schema, team);

			assert.strictEqual(parseResult.success, true);
		});
	}

	for (const isStretched of [true, false]) {
		test(`succeeds parsing when isStretched equals ${isStretched}`, function () {
			const team = notPersistedTeamFactory.build({ isStretched });
			const parseResult = safeParse(notPersistedTeam1Schema, team);

			assert.strictEqual(parseResult.success, true);
		});
	}
});

suite("notPersistedTeam2Schema", function () {
	test("fails parsing when given data is undefined", function () {
		const parseResult = safeParse(notPersistedTeam2Schema, undefined);

		assert.strictEqual(parseResult.success, false);
	});

	test("fails parsing when given data is null", function () {
		const parseResult = safeParse(notPersistedTeam2Schema, null);

		assert.strictEqual(parseResult.success, false);
	});

	test("fails parsing when given data is not an object", function () {
		const parseResult = safeParse(notPersistedTeam2Schema, "not-an-object");

		assert.strictEqual(parseResult.success, false);
	});

	test("fails parsing when given data is an empty object", function () {
		const parseResult = safeParse(notPersistedTeam2Schema, {});

		assert.strictEqual(parseResult.success, false);
	});

	test("fails parsing when teamNumber is undefined", function () {
		const team = notPersistedTeamFactory.build({ teamNumber: undefined });
		const parseResult = safeParse(notPersistedTeam2Schema, team);

		assert.strictEqual(parseResult.success, false);
	});

	test("fails parsing when teamNumber is null", function () {
		const team = notPersistedTeamFactory.build({ teamNumber: null });
		const parseResult = safeParse(notPersistedTeam2Schema, team);

		assert.strictEqual(parseResult.success, false);
	});

	test("fails parsing when teamNumber is not a number", function () {
		const team = notPersistedTeamFactory.build({ teamNumber: "not-a-number" });
		const parseResult = safeParse(notPersistedTeam2Schema, team);

		assert.strictEqual(parseResult.success, false);
	});

	test("fails parsing when teamNumber equals 0", function () {
		const team = notPersistedTeamFactory.build({ teamNumber: 0 });
		const parseResult = safeParse(notPersistedTeam2Schema, team);

		assert.strictEqual(parseResult.success, false);
	});

	test("fails parsing when teamNumber equals -1", function () {
		const team = notPersistedTeamFactory.build({ teamNumber: -1 });
		const parseResult = safeParse(notPersistedTeam2Schema, team);

		assert.strictEqual(parseResult.success, false);
	});

	test("fails parsing when teamNumber equals 3", function () {
		const team = notPersistedTeamFactory.build({ teamNumber: 3 });
		const parseResult = safeParse(notPersistedTeam2Schema, team);

		assert.strictEqual(parseResult.success, false);
	});

	test("fails parsing when name is undefined", function () {
		const team = notPersistedTeamFactory.build({ teamNumber: 2, name: undefined });
		const parseResult = safeParse(notPersistedTeam2Schema, team);

		assert.strictEqual(parseResult.success, false);
	});

	test("fails parsing when name is null", function () {
		const team = notPersistedTeamFactory.build({ teamNumber: 2, name: null });
		const parseResult = safeParse(notPersistedTeam2Schema, team);

		assert.strictEqual(parseResult.success, false);
	});

	test("fails parsing when name is not a string", function () {
		const team = notPersistedTeamFactory.build({ teamNumber: 2, name: 42 });
		const parseResult = safeParse(notPersistedTeam2Schema, team);

		assert.strictEqual(parseResult.success, false);
	});

	test("fails parsing when name is an empty string", function () {
		const team = notPersistedTeamFactory.build({ teamNumber: 2, name: "" });
		const parseResult = safeParse(notPersistedTeam2Schema, team);

		assert.strictEqual(parseResult.success, false);
	});

	test("fails parsing when currentRoundGamePoints is undefined", function () {
		const team = notPersistedTeamFactory.build({ teamNumber: 2, currentRoundGamePoints: undefined });
		const parseResult = safeParse(notPersistedTeam2Schema, team);

		assert.strictEqual(parseResult.success, false);
	});

	test("fails parsing when currentRoundGamePoints is null", function () {
		const team = notPersistedTeamFactory.build({ teamNumber: 2, currentRoundGamePoints: null });
		const parseResult = safeParse(notPersistedTeam2Schema, team);

		assert.strictEqual(parseResult.success, false);
	});

	test("fails parsing when currentRoundGamePoints is not a number", function () {
		const team = notPersistedTeamFactory.build({ teamNumber: 2, currentRoundGamePoints: "not-a-number" });
		const parseResult = safeParse(notPersistedTeam2Schema, team);

		assert.strictEqual(parseResult.success, false);
	});

	test("fails parsing when currentRoundGamePoints equals -1", function () {
		const team = notPersistedTeamFactory.build({ teamNumber: 2, currentRoundGamePoints: -1 });
		const parseResult = safeParse(notPersistedTeam2Schema, team);

		assert.strictEqual(parseResult.success, false);
	});

	test("fails parsing when currentRoundGamePoints equals 1", function () {
		const team = notPersistedTeamFactory.build({ teamNumber: 2, currentRoundGamePoints: 1 });
		const parseResult = safeParse(notPersistedTeam2Schema, team);

		assert.strictEqual(parseResult.success, false);
	});

	test("fails parsing when currentRoundGamePoints equals 5", function () {
		const team = notPersistedTeamFactory.build({ teamNumber: 2, currentRoundGamePoints: 5 });
		const parseResult = safeParse(notPersistedTeam2Schema, team);

		assert.strictEqual(parseResult.success, false);
	});

	test("fails parsing when matchTotalGamePoints is undefined", function () {
		const team = notPersistedTeamFactory.build({ teamNumber: 2, matchTotalGamePoints: undefined });
		const parseResult = safeParse(notPersistedTeam2Schema, team);

		assert.strictEqual(parseResult.success, false);
	});

	test("fails parsing when matchTotalGamePoints is null", function () {
		const team = notPersistedTeamFactory.build({ teamNumber: 2, matchTotalGamePoints: null });
		const parseResult = safeParse(notPersistedTeam2Schema, team);

		assert.strictEqual(parseResult.success, false);
	});

	test("fails parsing when matchTotalGamePoints is not a number", function () {
		const team = notPersistedTeamFactory.build({ teamNumber: 2, matchTotalGamePoints: "not-a-number" });
		const parseResult = safeParse(notPersistedTeam2Schema, team);

		assert.strictEqual(parseResult.success, false);
	});

	test("fails parsing when matchTotalGamePoints equals -1", function () {
		const team = notPersistedTeamFactory.build({ teamNumber: 2, matchTotalGamePoints: -1 });
		const parseResult = safeParse(notPersistedTeam2Schema, team);

		assert.strictEqual(parseResult.success, false);
	});

	test("fails parsing when matchTotalGamePoints equals 19", function () {
		const team = notPersistedTeamFactory.build({ teamNumber: 2, matchTotalGamePoints: 19 });
		const parseResult = safeParse(notPersistedTeam2Schema, team);

		assert.strictEqual(parseResult.success, false);
	});

	test("fails parsing when isStretched is undefined", function () {
		const team = notPersistedTeamFactory.build({ teamNumber: 2, isStretched: undefined });
		const parseResult = safeParse(notPersistedTeam2Schema, team);

		assert.strictEqual(parseResult.success, false);
	});

	test("fails parsing when isStretched is null", function () {
		const team = notPersistedTeamFactory.build({ teamNumber: 2, isStretched: null });
		const parseResult = safeParse(notPersistedTeam2Schema, team);

		assert.strictEqual(parseResult.success, false);
	});

	test("fails parsing when isStretched is not a boolean", function () {
		const team = notPersistedTeamFactory.build({ teamNumber: 2, isStretched: "not-a-boolean" });
		const parseResult = safeParse(notPersistedTeam2Schema, team);

		assert.strictEqual(parseResult.success, false);
	});

	test("succeeds parsing when teamNumber equals 2", function () {
		const team = notPersistedTeamFactory.build({ teamNumber: 2 });
		const parseResult = safeParse(notPersistedTeam2Schema, team);

		assert.strictEqual(parseResult.success, true);
	});

	test("succeeds parsing when name is not an empty string", function () {
		const team = notPersistedTeamFactory.build({ teamNumber: 2, name: "foo" });
		const parseResult = safeParse(notPersistedTeam2Schema, team);

		assert.strictEqual(parseResult.success, true);
	});

	for (const currentRoundGamePoints of [0, 2, 3, 4]) {
		test(`succeeds parsing when currentRoundGamePoints equals ${currentRoundGamePoints}`, function () {
			const team = notPersistedTeamFactory.build({ teamNumber: 2, currentRoundGamePoints });
			const parseResult = safeParse(notPersistedTeam2Schema, team);

			assert.strictEqual(parseResult.success, true);
		});
	}

	for (const matchTotalGamePoints of [0, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18]) {
		test(`succeeds parsing when matchTotalGamePoints equals ${matchTotalGamePoints}`, function () {
			const team = notPersistedTeamFactory.build({ teamNumber: 2, matchTotalGamePoints });
			const parseResult = safeParse(notPersistedTeam2Schema, team);

			assert.strictEqual(parseResult.success, true);
		});
	}

	for (const isStretched of [true, false]) {
		test(`succeeds parsing when isStretched equals ${isStretched}`, function () {
			const team = notPersistedTeamFactory.build({ teamNumber: 2, isStretched });
			const parseResult = safeParse(notPersistedTeam2Schema, team);

			assert.strictEqual(parseResult.success, true);
		});
	}
});
