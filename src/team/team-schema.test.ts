import { test, assert, type TestFunction } from "vitest";
import { Factory } from "fishery";
import dotProp from "dot-prop-immutable";
import { type Team, teamSchema } from "./team-schema.js";

const teamFactory = Factory.define<Team>(() => {
	return {
		teamName: "",
		gamePoints: 0,
		isStretched: false
	};
});

test("returns the validated response when all fields are provided", () => {
	const { success } = teamSchema.safeParse(teamFactory.build());

	assert.isTrue(success);
});

test('returns the validated response when "gamePoints" is a positive number', () => {
	const { success } = teamSchema.safeParse(
		teamFactory.build({
			gamePoints: 1
		})
	);

	assert.isTrue(success);
});

test('returns the validated response when "isStretched" is false', () => {
	const { success } = teamSchema.safeParse(
		teamFactory.build({
			isStretched: false
		})
	);

	assert.isTrue(success);
});

interface InvalidResponseTestCase {
	readonly data: unknown;
	readonly expectedFieldErrors?: Record<string, readonly string[]>;
	readonly expectedFormErrors?: readonly string[];
}

function checkInvalidResponse(testCase: InvalidResponseTestCase): TestFunction {
	const { data, expectedFormErrors = [], expectedFieldErrors = {} } = testCase;

	return function () {
		const result = teamSchema.safeParse(data);

		if (result.success) {
			assert.fail("Expected data validation to fail but it did not");
		} else {
			const errorDetails = result.error.flatten();

			assert.deepStrictEqual(errorDetails.fieldErrors, expectedFieldErrors);
			assert.deepStrictEqual(errorDetails.formErrors, expectedFormErrors);
		}
	};
}

test(
	"returns a validation error when data is not an object",
	checkInvalidResponse({
		data: "not-an-object",
		expectedFormErrors: ["Expected object, received string"]
	})
);

test(
	"returns a validation error when data is an empty object",
	checkInvalidResponse({
		data: {},
		expectedFieldErrors: {
			gamePoints: ["Required"],
			isStretched: ["Required"],
			teamName: ["Required"]
		}
	})
);

test(
	"returns a validation error when data has additional unknown properties",
	checkInvalidResponse({
		data: dotProp.set(teamFactory.build(), "unknown", "property"),
		expectedFormErrors: ["Unrecognized key(s) in object: 'unknown'"]
	})
);

test(
	'returns a validation error when "teamName" is not a string',
	checkInvalidResponse({
		data: dotProp.set(teamFactory.build(), "teamName", 42),
		expectedFieldErrors: { teamName: ["Expected string, received number"] }
	})
);

test(
	'returns a validation error when "gamePoints" is not a number',
	checkInvalidResponse({
		data: dotProp.set(teamFactory.build(), "gamePoints", "not-a-number"),
		expectedFieldErrors: { gamePoints: ["Expected number, received string"] }
	})
);

test(
	'returns a validation error when "gamePoints" is not a negative number',
	checkInvalidResponse({
		data: dotProp.set(teamFactory.build(), "gamePoints", -1),
		expectedFieldErrors: { gamePoints: ["Number must be greater than or equal to 0"] }
	})
);

test(
	'returns a validation error when "isStretched" is not a boolean',
	checkInvalidResponse({
		data: dotProp.set(teamFactory.build(), "isStretched", "not-a-boolean"),
		expectedFieldErrors: { isStretched: ["Expected boolean, received string"] }
	})
);
