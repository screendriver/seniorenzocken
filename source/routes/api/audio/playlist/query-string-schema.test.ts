import test from "ava";
import { type BaseSchema, safeParse } from "valibot";
import { Factory } from "fishery";
import { teamsQueryStringSchema, includeStretchedQueryStringSchema } from "./query-string-schema.js";

const teamFactory = Factory.define<unknown>(() => {
	return {
		teamNumber: 1,
		teamName: "test",
		currentGamePoints: 0,
		totalGamePoints: 0,
		isStretched: false,
	};
});

type ParsingInput = {
	readonly schema: BaseSchema;
	readonly data: unknown;
};

type ParsingInputFailed = ParsingInput;

type ParsingInputSucceed = ParsingInput & {
	readonly expectedParsingResult?: unknown;
};

const parsingFailedTestMacro = test.macro((t, input: ParsingInputFailed) => {
	const { schema, data } = input;
	const parseResult = safeParse(schema, data);

	t.false(parseResult.success);
});

const parsingSucceedTestMacro = test.macro((t, input: ParsingInputSucceed) => {
	const { schema, data, expectedParsingResult } = input;
	const parseResult = safeParse(schema, data);

	if (!parseResult.success) {
		t.fail("Parsing was not successful");
		return;
	}

	if (expectedParsingResult !== undefined) {
		t.deepEqual(parseResult.output, expectedParsingResult);
	}

	t.pass();
});

test("teamsQueryStringSchema parsing failed when given data is undefined", parsingFailedTestMacro, {
	schema: teamsQueryStringSchema,
	data: undefined,
});

test("teamsQueryStringSchema parsing failed when given data is null", parsingFailedTestMacro, {
	schema: teamsQueryStringSchema,
	data: undefined,
});

test("teamsQueryStringSchema parsing failed when given data is not a Tuple", parsingFailedTestMacro, {
	schema: teamsQueryStringSchema,
	data: "not-a-tuple",
});

test("teamsQueryStringSchema parsing failed when given data is an empty Tuple", parsingFailedTestMacro, {
	schema: teamsQueryStringSchema,
	data: [],
});

test("teamsQueryStringSchema parsing failed when given data is a Tuple with just one element", parsingFailedTestMacro, {
	schema: teamsQueryStringSchema,
	data: teamFactory.buildList(1),
});

test("teamsQueryStringSchema parsing failed when teamNumber is undefined", parsingFailedTestMacro, {
	schema: teamsQueryStringSchema,
	data: teamFactory.buildList(2, {
		teamNumber: undefined,
	}),
});

test("teamsQueryStringSchema parsing failed when teamNumber is null", parsingFailedTestMacro, {
	schema: teamsQueryStringSchema,
	data: teamFactory.buildList(2, {
		teamNumber: null,
	}),
});

test("teamsQueryStringSchema parsing failed when teamNumber is not a number", parsingFailedTestMacro, {
	schema: teamsQueryStringSchema,
	data: teamFactory.buildList(2, {
		teamNumber: "not-a-number",
	}),
});

test("teamsQueryStringSchema parsing failed when teamNumber is 0", parsingFailedTestMacro, {
	schema: teamsQueryStringSchema,
	data: teamFactory.buildList(2, {
		teamNumber: 0,
	}),
});

test("teamsQueryStringSchema parsing failed when teamNumber is 3", parsingFailedTestMacro, {
	schema: teamsQueryStringSchema,
	data: teamFactory.buildList(2, {
		teamNumber: 3,
	}),
});

test("teamsQueryStringSchema parsing failed when teamName is undefined", parsingFailedTestMacro, {
	schema: teamsQueryStringSchema,
	data: teamFactory.buildList(2, {
		teamName: undefined,
	}),
});

test("teamsQueryStringSchema parsing failed when teamName is null", parsingFailedTestMacro, {
	schema: teamsQueryStringSchema,
	data: teamFactory.buildList(2, {
		teamName: null,
	}),
});

test("teamsQueryStringSchema parsing failed when teamName is not a string", parsingFailedTestMacro, {
	schema: teamsQueryStringSchema,
	data: teamFactory.buildList(2, {
		teamName: true,
	}),
});

test("teamsQueryStringSchema parsing failed when teamName is an empty string", parsingFailedTestMacro, {
	schema: teamsQueryStringSchema,
	data: teamFactory.buildList(2, {
		teamName: "",
	}),
});

test("teamsQueryStringSchema parsing failed when currentGamePoints is undefined", parsingFailedTestMacro, {
	schema: teamsQueryStringSchema,
	data: teamFactory.buildList(2, {
		currentGamePoints: undefined,
	}),
});

test("teamsQueryStringSchema parsing failed when currentGamePoints is null", parsingFailedTestMacro, {
	schema: teamsQueryStringSchema,
	data: teamFactory.buildList(2, {
		currentGamePoints: null,
	}),
});

test("teamsQueryStringSchema parsing failed when currentGamePoints is not a number", parsingFailedTestMacro, {
	schema: teamsQueryStringSchema,
	data: teamFactory.buildList(2, {
		currentGamePoints: "not-a-number",
	}),
});

test("teamsQueryStringSchema parsing failed when currentGamePoints is a negative number", parsingFailedTestMacro, {
	schema: teamsQueryStringSchema,
	data: teamFactory.buildList(2, {
		currentGamePoints: -1,
	}),
});

test("teamsQueryStringSchema parsing failed when totalGamePoints is undefined", parsingFailedTestMacro, {
	schema: teamsQueryStringSchema,
	data: teamFactory.buildList(2, {
		totalGamePoints: undefined,
	}),
});

test("teamsQueryStringSchema parsing failed when totalGamePoints is null", parsingFailedTestMacro, {
	schema: teamsQueryStringSchema,
	data: teamFactory.buildList(2, {
		totalGamePoints: null,
	}),
});

test("teamsQueryStringSchema parsing failed when totalGamePoints is not a number", parsingFailedTestMacro, {
	schema: teamsQueryStringSchema,
	data: teamFactory.buildList(2, {
		totalGamePoints: "not-a-number",
	}),
});

test("teamsQueryStringSchema parsing failed when totalGamePoints is a negative number", parsingFailedTestMacro, {
	schema: teamsQueryStringSchema,
	data: teamFactory.buildList(2, {
		totalGamePoints: -1,
	}),
});

test("teamsQueryStringSchema parsing failed when isStretched is undefined", parsingFailedTestMacro, {
	schema: teamsQueryStringSchema,
	data: teamFactory.buildList(2, {
		isStretched: undefined,
	}),
});

test("teamsQueryStringSchema parsing failed when isStretched is null", parsingFailedTestMacro, {
	schema: teamsQueryStringSchema,
	data: teamFactory.buildList(2, {
		isStretched: null,
	}),
});

test("teamsQueryStringSchema parsing failed when isStretched is not a boolean", parsingFailedTestMacro, {
	schema: teamsQueryStringSchema,
	data: teamFactory.buildList(2, {
		isStretched: "not-a-boolean",
	}),
});

test("includeStretchedQueryStringSchema parsing failed when data is undefined", parsingFailedTestMacro, {
	schema: includeStretchedQueryStringSchema,
	data: undefined,
});

test("includeStretchedQueryStringSchema parsing failed when data is null", parsingFailedTestMacro, {
	schema: includeStretchedQueryStringSchema,
	data: null,
});

test("includeStretchedQueryStringSchema parsing failed when data is not a string", parsingFailedTestMacro, {
	schema: includeStretchedQueryStringSchema,
	data: true,
});

test("teamsQueryStringSchema parsing succeeds when teamNumber is 1", parsingSucceedTestMacro, {
	schema: teamsQueryStringSchema,
	data: teamFactory.buildList(2, {
		teamNumber: 1,
	}),
});

test("teamsQueryStringSchema parsing succeeds when teamNumber is 2", parsingSucceedTestMacro, {
	schema: teamsQueryStringSchema,
	data: teamFactory.buildList(2, {
		teamNumber: 2,
	}),
});

test("teamsQueryStringSchema parsing succeeds when teamName is not an empty string", parsingSucceedTestMacro, {
	schema: teamsQueryStringSchema,
	data: teamFactory.buildList(2, {
		teamName: "Test team",
	}),
});

test("teamsQueryStringSchema parsing succeeds when currentGamePoints is a positive number", parsingSucceedTestMacro, {
	schema: teamsQueryStringSchema,
	data: teamFactory.buildList(2, {
		currentGamePoints: 1,
	}),
});

test("teamsQueryStringSchema parsing succeeds when totalGamePoints is a positive number", parsingSucceedTestMacro, {
	schema: teamsQueryStringSchema,
	data: teamFactory.buildList(2, {
		totalGamePoints: 1,
	}),
});

test("teamsQueryStringSchema parsing succeeds when isStretched is true", parsingSucceedTestMacro, {
	schema: teamsQueryStringSchema,
	data: teamFactory.buildList(2, {
		isStretched: true,
	}),
});

test("teamsQueryStringSchema parsing succeeds when isStretched is false", parsingSucceedTestMacro, {
	schema: teamsQueryStringSchema,
	data: teamFactory.buildList(2, {
		isStretched: false,
	}),
});

test('includeStretchedQueryStringSchema parsing succeeds and returns true when it is "true"', parsingSucceedTestMacro, {
	schema: includeStretchedQueryStringSchema,
	data: "true",
	expectedParsingResult: true,
});

test(
	'includeStretchedQueryStringSchema parsing succeeds and returns false when it is "false"',
	parsingSucceedTestMacro,
	{
		schema: includeStretchedQueryStringSchema,
		data: "false",
		expectedParsingResult: false,
	},
);
