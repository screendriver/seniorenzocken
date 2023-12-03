import test from "ava";
import { fake, type SinonSpy } from "sinon";
import {
	findRandomAudioFileWithPrefix,
	type FindAudioFileWithPrefixDependencies,
	type FindAudioFileWithPrefixOptions,
} from "./random-audio-file.js";
import { Factory } from "fishery";

type DependenciesOverrides = {
	readonly list?: SinonSpy;
	readonly randomCollectionElement?: SinonSpy;
};

function createFindAudioFileWithPrefixDependencies(
	overrides: DependenciesOverrides = {},
): FindAudioFileWithPrefixDependencies {
	const list =
		overrides.list ??
		fake.resolves({
			objects: [],
		});
	const randomCollectionElement = overrides.randomCollectionElement ?? fake();

	return {
		mediaBucket: {
			list,
		} as unknown as R2Bucket,
		randomCollectionElement,
	};
}

const findAudioFileWithPrefixOptionsFactory = Factory.define<FindAudioFileWithPrefixOptions>(() => {
	return {
		prefix: "attention",
		baseUrl: new URL("https://example.com"),
	};
});

type TestErrorResultMacroInput = {
	readonly listOverride: SinonSpy;
	readonly expectedErrorMessage: string;
};

const testErrorResultMacro = test.macro(async (t, input: TestErrorResultMacroInput) => {
	const { listOverride, expectedErrorMessage } = input;
	const dependencies = createFindAudioFileWithPrefixDependencies({
		list: listOverride,
	});
	const options = findAudioFileWithPrefixOptionsFactory.build();

	const audioFileResult = await findRandomAudioFileWithPrefix(dependencies, options);

	if (audioFileResult.isOk) {
		t.fail();
		return;
	}

	t.is(audioFileResult.error.message, expectedErrorMessage);
});

test(
	"findRandomAudioFileWithPrefix() returns an Result Error when media bucket rejects listing objects",
	testErrorResultMacro,
	{
		listOverride: fake.rejects(new Error("Media bucket not available")),
		expectedErrorMessage: "Media bucket not available",
	},
);

test(
	"findRandomAudioFileWithPrefix() returns an Result Error when media bucket rejects listing objects with a non Error object",
	testErrorResultMacro,
	{
		listOverride: fake(() => {
			return Promise.reject(42);
		}),
		expectedErrorMessage: "An unknown error occurred",
	},
);

test(
	"findRandomAudioFileWithPrefix() returns an Result Error when media bucket returns an empty list",
	testErrorResultMacro,
	{
		listOverride: fake.resolves({
			objects: [],
		}),
		expectedErrorMessage: "No audio file found",
	},
);

test("findRandomAudioFileWithPrefix() list objects from media bucket with the given prefix", async (t) => {
	const list = fake.rejects("");
	const dependencies = createFindAudioFileWithPrefixDependencies({ list });
	const options = findAudioFileWithPrefixOptionsFactory.build({
		prefix: "zero",
	});

	await findRandomAudioFileWithPrefix(dependencies, options);

	const actual = list.calledOnceWithExactly({ prefix: "zero" });
	const expected = true;

	t.is(actual, expected);
});

test("findRandomAudioFileWithPrefix() returns a Result ok with a random audio file", async (t) => {
	const randomCollectionElement = fake.returns({ key: "foo.m4a" });
	const dependencies = createFindAudioFileWithPrefixDependencies({
		list: fake.resolves({
			objects: ["foo.m4a"],
		}),
		randomCollectionElement,
	});
	const options = findAudioFileWithPrefixOptionsFactory.build();

	const audioFileResult = await findRandomAudioFileWithPrefix(dependencies, options);

	t.is(randomCollectionElement.callCount, 1);
	t.deepEqual(randomCollectionElement.args[0], [["foo.m4a"]]);

	if (audioFileResult.isErr) {
		t.fail();
		return;
	}

	const actual = audioFileResult.value.toString();
	const expected = "https://example.com/foo.m4a";

	t.is(actual, expected);
});
