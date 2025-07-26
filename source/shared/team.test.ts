import { suite, test, expect } from "vitest";
import { safeParse } from "valibot";
import { Factory } from "fishery";
import { notPersistedTeam1Schema, notPersistedTeam2Schema } from "./team.js";

const notPersistedTeamFactory = Factory.define<unknown>(() => {
	return {
		teamNumber: 1,
		name: "test-team",
		currentRoundGamePoints: 0,
		matchTotalGamePoints: 0,
		isStretched: false,
	};
});

suite("notPersistedTeam1Schema", () => {
	test("parsing fails when given data is undefined", () => {
		const parseResult = safeParse(notPersistedTeam1Schema, undefined);

		expect(parseResult.success).toBe(false);
	});

	test("parsing fails when given data is null", () => {
		const parseResult = safeParse(notPersistedTeam1Schema, null);

		expect(parseResult.success).toBe(false);
	});

	test("parsing fails when given data is not an object", () => {
		const parseResult = safeParse(notPersistedTeam1Schema, "not-an-object");

		expect(parseResult.success).toBe(false);
	});

	test("parsing fails when given data is an empty object", () => {
		const parseResult = safeParse(notPersistedTeam1Schema, {});

		expect(parseResult.success).toBe(false);
	});

	test("parsing fails when teamNumber is undefined", () => {
		const team = notPersistedTeamFactory.build({ teamNumber: undefined });
		const parseResult = safeParse(notPersistedTeam1Schema, team);

		expect(parseResult.success).toBe(false);
	});

	test("parsing fails when teamNumber is null", () => {
		const team = notPersistedTeamFactory.build({ teamNumber: null });
		const parseResult = safeParse(notPersistedTeam1Schema, team);

		expect(parseResult.success).toBe(false);
	});

	test("parsing fails when teamNumber is not a number", () => {
		const team = notPersistedTeamFactory.build({ teamNumber: "not-a-number" });
		const parseResult = safeParse(notPersistedTeam1Schema, team);

		expect(parseResult.success).toBe(false);
	});

	test("parsing fails when teamNumber equals 0", () => {
		const team = notPersistedTeamFactory.build({ teamNumber: 0 });
		const parseResult = safeParse(notPersistedTeam1Schema, team);

		expect(parseResult.success).toBe(false);
	});

	test("parsing fails when teamNumber equals -1", () => {
		const team = notPersistedTeamFactory.build({ teamNumber: -1 });
		const parseResult = safeParse(notPersistedTeam1Schema, team);

		expect(parseResult.success).toBe(false);
	});

	test("parsing fails when teamNumber equals 3", () => {
		const team = notPersistedTeamFactory.build({ teamNumber: 3 });
		const parseResult = safeParse(notPersistedTeam1Schema, team);

		expect(parseResult.success).toBe(false);
	});

	test("parsing fails when name is undefined", () => {
		const team = notPersistedTeamFactory.build({ name: undefined });
		const parseResult = safeParse(notPersistedTeam1Schema, team);

		expect(parseResult.success).toBe(false);
	});

	test("parsing fails when name is null", () => {
		const team = notPersistedTeamFactory.build({ name: null });
		const parseResult = safeParse(notPersistedTeam1Schema, team);

		expect(parseResult.success).toBe(false);
	});

	test("parsing fails when name is not a string", () => {
		const team = notPersistedTeamFactory.build({ name: 42 });
		const parseResult = safeParse(notPersistedTeam1Schema, team);

		expect(parseResult.success).toBe(false);
	});

	test("parsing fails when name is an empty string", () => {
		const team = notPersistedTeamFactory.build({ name: "" });
		const parseResult = safeParse(notPersistedTeam1Schema, team);

		expect(parseResult.success).toBe(false);
	});

	test("parsing fails when currentRoundGamePoints is undefined", () => {
		const team = notPersistedTeamFactory.build({ currentRoundGamePoints: undefined });
		const parseResult = safeParse(notPersistedTeam1Schema, team);

		expect(parseResult.success).toBe(false);
	});

	test("parsing fails when currentRoundGamePoints is null", () => {
		const team = notPersistedTeamFactory.build({ currentRoundGamePoints: null });
		const parseResult = safeParse(notPersistedTeam1Schema, team);

		expect(parseResult.success).toBe(false);
	});

	test("parsing fails when currentRoundGamePoints is not a number", () => {
		const team = notPersistedTeamFactory.build({ currentRoundGamePoints: "not-a-number" });
		const parseResult = safeParse(notPersistedTeam1Schema, team);

		expect(parseResult.success).toBe(false);
	});

	test("parsing fails when currentRoundGamePoints equals -1", () => {
		const team = notPersistedTeamFactory.build({ currentRoundGamePoints: -1 });
		const parseResult = safeParse(notPersistedTeam1Schema, team);

		expect(parseResult.success).toBe(false);
	});

	test("parsing fails when currentRoundGamePoints equals 1", () => {
		const team = notPersistedTeamFactory.build({ currentRoundGamePoints: 1 });
		const parseResult = safeParse(notPersistedTeam1Schema, team);

		expect(parseResult.success).toBe(false);
	});

	test("parsing fails when currentRoundGamePoints equals 5", () => {
		const team = notPersistedTeamFactory.build({ currentRoundGamePoints: 5 });
		const parseResult = safeParse(notPersistedTeam1Schema, team);

		expect(parseResult.success).toBe(false);
	});

	test("parsing fails when matchTotalGamePoints is undefined", () => {
		const team = notPersistedTeamFactory.build({ matchTotalGamePoints: undefined });
		const parseResult = safeParse(notPersistedTeam1Schema, team);

		expect(parseResult.success).toBe(false);
	});

	test("parsing fails when matchTotalGamePoints is null", () => {
		const team = notPersistedTeamFactory.build({ matchTotalGamePoints: null });
		const parseResult = safeParse(notPersistedTeam1Schema, team);

		expect(parseResult.success).toBe(false);
	});

	test("parsing fails when matchTotalGamePoints is not a number", () => {
		const team = notPersistedTeamFactory.build({ matchTotalGamePoints: "not-a-number" });
		const parseResult = safeParse(notPersistedTeam1Schema, team);

		expect(parseResult.success).toBe(false);
	});

	test("parsing fails when matchTotalGamePoints equals -1", () => {
		const team = notPersistedTeamFactory.build({ matchTotalGamePoints: -1 });
		const parseResult = safeParse(notPersistedTeam1Schema, team);

		expect(parseResult.success).toBe(false);
	});

	test("parsing fails when matchTotalGamePoints equals 19", () => {
		const team = notPersistedTeamFactory.build({ matchTotalGamePoints: 19 });
		const parseResult = safeParse(notPersistedTeam1Schema, team);

		expect(parseResult.success).toBe(false);
	});

	test("parsing fails when isStretched is undefined", () => {
		const team = notPersistedTeamFactory.build({ isStretched: undefined });
		const parseResult = safeParse(notPersistedTeam1Schema, team);

		expect(parseResult.success).toBe(false);
	});

	test("parsing fails when isStretched is null", () => {
		const team = notPersistedTeamFactory.build({ isStretched: null });
		const parseResult = safeParse(notPersistedTeam1Schema, team);

		expect(parseResult.success).toBe(false);
	});

	test("parsing fails when isStretched is not a boolean", () => {
		const team = notPersistedTeamFactory.build({ isStretched: "not-a-boolean" });
		const parseResult = safeParse(notPersistedTeam1Schema, team);

		expect(parseResult.success).toBe(false);
	});

	test("parsing succeeds when teamNumber equals $teamNumber", () => {
		const team = notPersistedTeamFactory.build();
		const parseResult = safeParse(notPersistedTeam1Schema, team);

		expect(parseResult.success).toBe(true);
	});

	test("parsing succeeds when name is not an empty string", () => {
		const team = notPersistedTeamFactory.build({ name: "foo" });
		const parseResult = safeParse(notPersistedTeam1Schema, team);

		expect(parseResult.success).toBe(true);
	});

	test.each([
		{ currentRoundGamePoints: 0 },
		{ currentRoundGamePoints: 2 },
		{ currentRoundGamePoints: 3 },
		{ currentRoundGamePoints: 4 },
	])("parsing succeeds when currentRoundGamePoints equals $currentRoundGamePoints", ({ currentRoundGamePoints }) => {
		const team = notPersistedTeamFactory.build({ currentRoundGamePoints });
		const parseResult = safeParse(notPersistedTeam1Schema, team);

		expect(parseResult.success).toBe(true);
	});

	test.each([
		{ matchTotalGamePoints: 0 },
		{ matchTotalGamePoints: 2 },
		{ matchTotalGamePoints: 3 },
		{ matchTotalGamePoints: 4 },
		{ matchTotalGamePoints: 5 },
		{ matchTotalGamePoints: 6 },
		{ matchTotalGamePoints: 7 },
		{ matchTotalGamePoints: 8 },
		{ matchTotalGamePoints: 9 },
		{ matchTotalGamePoints: 10 },
		{ matchTotalGamePoints: 11 },
		{ matchTotalGamePoints: 12 },
		{ matchTotalGamePoints: 13 },
		{ matchTotalGamePoints: 14 },
		{ matchTotalGamePoints: 15 },
		{ matchTotalGamePoints: 16 },
		{ matchTotalGamePoints: 17 },
		{ matchTotalGamePoints: 18 },
	])("parsing succeeds when matchTotalGamePoints equals $matchTotalGamePoints", ({ matchTotalGamePoints }) => {
		const team = notPersistedTeamFactory.build({ matchTotalGamePoints });
		const parseResult = safeParse(notPersistedTeam1Schema, team);

		expect(parseResult.success).toBe(true);
	});

	test.each([{ isStretched: true }, { isStretched: false }])(
		"parsing succeeds when isStretched equals $isStretched",
		({ isStretched }) => {
			const team = notPersistedTeamFactory.build({ isStretched });
			const parseResult = safeParse(notPersistedTeam1Schema, team);

			expect(parseResult.success).toBe(true);
		},
	);
});

suite("notPersistedTeam2Schema", () => {
	test("parsing fails when given data is undefined", () => {
		const parseResult = safeParse(notPersistedTeam2Schema, undefined);

		expect(parseResult.success).toBe(false);
	});

	test("parsing fails when given data is null", () => {
		const parseResult = safeParse(notPersistedTeam2Schema, null);

		expect(parseResult.success).toBe(false);
	});

	test("parsing fails when given data is not an object", () => {
		const parseResult = safeParse(notPersistedTeam2Schema, "not-an-object");

		expect(parseResult.success).toBe(false);
	});

	test("parsing fails when given data is an empty object", () => {
		const parseResult = safeParse(notPersistedTeam2Schema, {});

		expect(parseResult.success).toBe(false);
	});

	test("parsing fails when teamNumber is undefined", () => {
		const team = notPersistedTeamFactory.build({ teamNumber: undefined });
		const parseResult = safeParse(notPersistedTeam2Schema, team);

		expect(parseResult.success).toBe(false);
	});

	test("parsing fails when teamNumber is null", () => {
		const team = notPersistedTeamFactory.build({ teamNumber: null });
		const parseResult = safeParse(notPersistedTeam2Schema, team);

		expect(parseResult.success).toBe(false);
	});

	test("parsing fails when teamNumber is not a number", () => {
		const team = notPersistedTeamFactory.build({ teamNumber: "not-a-number" });
		const parseResult = safeParse(notPersistedTeam2Schema, team);

		expect(parseResult.success).toBe(false);
	});

	test("parsing fails when teamNumber equals 0", () => {
		const team = notPersistedTeamFactory.build({ teamNumber: 0 });
		const parseResult = safeParse(notPersistedTeam2Schema, team);

		expect(parseResult.success).toBe(false);
	});

	test("parsing fails when teamNumber equals -1", () => {
		const team = notPersistedTeamFactory.build({ teamNumber: -1 });
		const parseResult = safeParse(notPersistedTeam2Schema, team);

		expect(parseResult.success).toBe(false);
	});

	test("parsing fails when teamNumber equals 3", () => {
		const team = notPersistedTeamFactory.build({ teamNumber: 3 });
		const parseResult = safeParse(notPersistedTeam2Schema, team);

		expect(parseResult.success).toBe(false);
	});

	test("parsing fails when name is undefined", () => {
		const team = notPersistedTeamFactory.build({ teamNumber: 2, name: undefined });
		const parseResult = safeParse(notPersistedTeam2Schema, team);

		expect(parseResult.success).toBe(false);
	});

	test("parsing fails when name is null", () => {
		const team = notPersistedTeamFactory.build({ teamNumber: 2, name: null });
		const parseResult = safeParse(notPersistedTeam2Schema, team);

		expect(parseResult.success).toBe(false);
	});

	test("parsing fails when name is not a string", () => {
		const team = notPersistedTeamFactory.build({ teamNumber: 2, name: 42 });
		const parseResult = safeParse(notPersistedTeam2Schema, team);

		expect(parseResult.success).toBe(false);
	});

	test("parsing fails when name is an empty string", () => {
		const team = notPersistedTeamFactory.build({ teamNumber: 2, name: "" });
		const parseResult = safeParse(notPersistedTeam2Schema, team);

		expect(parseResult.success).toBe(false);
	});

	test("parsing fails when currentRoundGamePoints is undefined", () => {
		const team = notPersistedTeamFactory.build({ teamNumber: 2, currentRoundGamePoints: undefined });
		const parseResult = safeParse(notPersistedTeam2Schema, team);

		expect(parseResult.success).toBe(false);
	});

	test("parsing fails when currentRoundGamePoints is null", () => {
		const team = notPersistedTeamFactory.build({ teamNumber: 2, currentRoundGamePoints: null });
		const parseResult = safeParse(notPersistedTeam2Schema, team);

		expect(parseResult.success).toBe(false);
	});

	test("parsing fails when currentRoundGamePoints is not a number", () => {
		const team = notPersistedTeamFactory.build({ teamNumber: 2, currentRoundGamePoints: "not-a-number" });
		const parseResult = safeParse(notPersistedTeam2Schema, team);

		expect(parseResult.success).toBe(false);
	});

	test("parsing fails when currentRoundGamePoints equals -1", () => {
		const team = notPersistedTeamFactory.build({ teamNumber: 2, currentRoundGamePoints: -1 });
		const parseResult = safeParse(notPersistedTeam2Schema, team);

		expect(parseResult.success).toBe(false);
	});

	test("parsing fails when currentRoundGamePoints equals 1", () => {
		const team = notPersistedTeamFactory.build({ teamNumber: 2, currentRoundGamePoints: 1 });
		const parseResult = safeParse(notPersistedTeam2Schema, team);

		expect(parseResult.success).toBe(false);
	});

	test("parsing fails when currentRoundGamePoints equals 5", () => {
		const team = notPersistedTeamFactory.build({ teamNumber: 2, currentRoundGamePoints: 5 });
		const parseResult = safeParse(notPersistedTeam2Schema, team);

		expect(parseResult.success).toBe(false);
	});

	test("parsing fails when matchTotalGamePoints is undefined", () => {
		const team = notPersistedTeamFactory.build({ teamNumber: 2, matchTotalGamePoints: undefined });
		const parseResult = safeParse(notPersistedTeam2Schema, team);

		expect(parseResult.success).toBe(false);
	});

	test("parsing fails when matchTotalGamePoints is null", () => {
		const team = notPersistedTeamFactory.build({ teamNumber: 2, matchTotalGamePoints: null });
		const parseResult = safeParse(notPersistedTeam2Schema, team);

		expect(parseResult.success).toBe(false);
	});

	test("parsing fails when matchTotalGamePoints is not a number", () => {
		const team = notPersistedTeamFactory.build({ teamNumber: 2, matchTotalGamePoints: "not-a-number" });
		const parseResult = safeParse(notPersistedTeam2Schema, team);

		expect(parseResult.success).toBe(false);
	});

	test("parsing fails when matchTotalGamePoints equals -1", () => {
		const team = notPersistedTeamFactory.build({ teamNumber: 2, matchTotalGamePoints: -1 });
		const parseResult = safeParse(notPersistedTeam2Schema, team);

		expect(parseResult.success).toBe(false);
	});

	test("parsing fails when matchTotalGamePoints equals 19", () => {
		const team = notPersistedTeamFactory.build({ teamNumber: 2, matchTotalGamePoints: 19 });
		const parseResult = safeParse(notPersistedTeam2Schema, team);

		expect(parseResult.success).toBe(false);
	});

	test("parsing fails when isStretched is undefined", () => {
		const team = notPersistedTeamFactory.build({ teamNumber: 2, isStretched: undefined });
		const parseResult = safeParse(notPersistedTeam2Schema, team);

		expect(parseResult.success).toBe(false);
	});

	test("parsing fails when isStretched is null", () => {
		const team = notPersistedTeamFactory.build({ teamNumber: 2, isStretched: null });
		const parseResult = safeParse(notPersistedTeam2Schema, team);

		expect(parseResult.success).toBe(false);
	});

	test("parsing fails when isStretched is not a boolean", () => {
		const team = notPersistedTeamFactory.build({ teamNumber: 2, isStretched: "not-a-boolean" });
		const parseResult = safeParse(notPersistedTeam2Schema, team);

		expect(parseResult.success).toBe(false);
	});

	test("parsing succeeds when teamNumber equals 2", () => {
		const team = notPersistedTeamFactory.build({ teamNumber: 2 });
		const parseResult = safeParse(notPersistedTeam2Schema, team);

		expect(parseResult.success).toBe(true);
	});

	test("parsing succeeds when name is not an empty string", () => {
		const team = notPersistedTeamFactory.build({ teamNumber: 2, name: "foo" });
		const parseResult = safeParse(notPersistedTeam2Schema, team);

		expect(parseResult.success).toBe(true);
	});

	test.each([
		{ currentRoundGamePoints: 0 },
		{ currentRoundGamePoints: 2 },
		{ currentRoundGamePoints: 3 },
		{ currentRoundGamePoints: 4 },
	])("parsing succeeds when currentRoundGamePoints equals $currentRoundGamePoints", ({ currentRoundGamePoints }) => {
		const team = notPersistedTeamFactory.build({ teamNumber: 2, currentRoundGamePoints });
		const parseResult = safeParse(notPersistedTeam2Schema, team);

		expect(parseResult.success).toBe(true);
	});

	test.each([
		{ matchTotalGamePoints: 0 },
		{ matchTotalGamePoints: 2 },
		{ matchTotalGamePoints: 3 },
		{ matchTotalGamePoints: 4 },
		{ matchTotalGamePoints: 5 },
		{ matchTotalGamePoints: 6 },
		{ matchTotalGamePoints: 7 },
		{ matchTotalGamePoints: 8 },
		{ matchTotalGamePoints: 9 },
		{ matchTotalGamePoints: 10 },
		{ matchTotalGamePoints: 11 },
		{ matchTotalGamePoints: 12 },
		{ matchTotalGamePoints: 13 },
		{ matchTotalGamePoints: 14 },
		{ matchTotalGamePoints: 15 },
		{ matchTotalGamePoints: 16 },
		{ matchTotalGamePoints: 17 },
		{ matchTotalGamePoints: 18 },
	])("parsing succeeds when matchTotalGamePoints equals $matchTotalGamePoints", ({ matchTotalGamePoints }) => {
		const team = notPersistedTeamFactory.build({ teamNumber: 2, matchTotalGamePoints });
		const parseResult = safeParse(notPersistedTeam2Schema, team);

		expect(parseResult.success).toBe(true);
	});

	test.each([{ isStretched: true }, { isStretched: false }])(
		"parsing succeeds when isStretched equals $isStretched",
		({ isStretched }) => {
			const team = notPersistedTeamFactory.build({ teamNumber: 2, isStretched });
			const parseResult = safeParse(notPersistedTeam2Schema, team);

			expect(parseResult.success).toBe(true);
		},
	);
});
