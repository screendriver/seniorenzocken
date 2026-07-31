import assert from "node:assert";
import { suite, test } from "mocha";
import { fake } from "sinon";
import { initTRPC, TRPCError, type inferProcedureInput } from "@trpc/server";
import { Factory } from "fishery";
import { Task } from "true-myth/task";
import { nothing } from "true-myth/maybe";
import type { createTrpcRouter } from "../index.js";
import type { TRPCRouterContext } from "../context.js";
import type { TRPCApplicationRouter } from "../application-router.js";
import type { NotPersistedTeam } from "../../../shared/team.js";
import type { AudioRepository, ReadAudio, ReadAudioWithoutGamePoints } from "../../audio/repository.js";
import { createAudioRouter, type AudioRouterOptions } from "./audio.js";

type GamePointsPlaylistInput = inferProcedureInput<TRPCApplicationRouter["audio"]["gamePointsPlaylist"]>;

type GamePointsPlaylistValidationTestCase = {
	readonly input: GamePointsPlaylistInput;
	readonly expectedErrorMessage: string;
};

function assertTrpcError(error: unknown, expectedCode: TRPCError["code"], expectedMessage: string): boolean {
	assert.ok(error instanceof TRPCError);
	assert.strictEqual(error.code, expectedCode);
	assert.strictEqual(error.message, expectedMessage);

	return true;
}

const notPersistedTeamFactory = Factory.define<NotPersistedTeam>(() => {
	return {
		teamNumber: 1,
		name: "team",
		currentRoundGamePoints: 0,
		matchTotalGamePoints: 0,
		isStretched: false
	};
});

const gamePointsPlaylistInputFactory = Factory.define(() => {
	return {
		team1: notPersistedTeamFactory.build({ teamNumber: 1 }),
		team2: notPersistedTeamFactory.build({ teamNumber: 2 }),
		gameRounds: [],
		hasWon: false
	};
});

type Overrides = {
	readonly trpcRouter: ReturnType<typeof createTrpcRouter>;
	readonly readGamePointsAudios?: AudioRepository["readGamePointsAudios"];
	readonly readAllFunAudios?: AudioRepository["readAllFunAudios"];
};

function createAudioRouterOptions(overrides: Overrides): AudioRouterOptions & {} {
	const { trpcRouter } = overrides;
	const audioRepository = {
		readGamePointsAudios:
			overrides.readGamePointsAudios ??
			(() => {
				return Task.reject(new Error("readGamePointsAudios was not expected"));
			}),
		readAllFunAudios:
			overrides.readAllFunAudios ??
			(() => {
				return Task.reject(new Error("readAllFunAudios was not expected"));
			})
	};

	return {
		trpcRouter: {
			router: trpcRouter.router,
			publicProcedure: trpcRouter.publicProcedure,
			protectedProcedure: trpcRouter.protectedProcedure
		},
		audioRepository,
		isTurnAround: () => {
			return false;
		}
	};
}

suite("gamePointsPlaylist()", function () {
	const validationTestCases: readonly GamePointsPlaylistValidationTestCase[] = [
		{
			input: gamePointsPlaylistInputFactory.build({ team1: undefined }) as GamePointsPlaylistInput,
			expectedErrorMessage: "Invalid type: Expected Object but received undefined"
		},
		{
			input: gamePointsPlaylistInputFactory.build({ team1: "not-an-object" }) as GamePointsPlaylistInput,
			expectedErrorMessage: 'Invalid type: Expected Object but received "not-an-object"'
		},
		{
			input: gamePointsPlaylistInputFactory.build({ team2: undefined }) as GamePointsPlaylistInput,
			expectedErrorMessage: "Invalid type: Expected Object but received undefined"
		},
		{
			input: gamePointsPlaylistInputFactory.build({ team2: "not-an-object" }) as GamePointsPlaylistInput,
			expectedErrorMessage: 'Invalid type: Expected Object but received "not-an-object"'
		},
		{
			input: gamePointsPlaylistInputFactory.build({ gameRounds: undefined }) as GamePointsPlaylistInput,
			expectedErrorMessage: "Invalid type: Expected Array but received undefined"
		},
		{
			input: gamePointsPlaylistInputFactory.build({ gameRounds: "not-an-array" }) as GamePointsPlaylistInput,
			expectedErrorMessage: 'Invalid type: Expected Array but received "not-an-array"'
		},
		{
			input: gamePointsPlaylistInputFactory.build({ hasWon: undefined }) as GamePointsPlaylistInput,
			expectedErrorMessage: "Invalid type: Expected boolean but received undefined"
		},
		{
			input: gamePointsPlaylistInputFactory.build({ hasWon: "not-a-boolean" }) as GamePointsPlaylistInput,
			expectedErrorMessage: 'Invalid type: Expected boolean but received "not-a-boolean"'
		}
	];

	for (const testCase of validationTestCases) {
		const { input, expectedErrorMessage } = testCase;

		test(`throws an error with error code 'BAD_REQUEST' when input validation fails: ${expectedErrorMessage}`, async function () {
			const trpc = initTRPC.context<TRPCRouterContext>().create();
			const protectedProcedure = trpc.procedure.use(async (options) => {
				return options.next({
					ctx: { session: { token: "", ipAddress: nothing<string>(), userAgent: nothing<string>() } }
				});
			});
			const options = createAudioRouterOptions({
				trpcRouter: {
					router: trpc.router,
					publicProcedure: trpc.procedure,
					protectedProcedure
				}
			});

			const audioRouter = createAudioRouter(options);
			const createCaller = trpc.createCallerFactory(audioRouter);
			const caller = createCaller({ session: nothing() });

			await assert.rejects(caller.gamePointsPlaylist(input), (error: unknown) => {
				return assertTrpcError(error, "BAD_REQUEST", expectedErrorMessage);
			});
		});
	}

	test("throws an error when game points audios could not be read", async function () {
		const trpc = initTRPC.context<TRPCRouterContext>().create();
		const protectedProcedure = trpc.procedure.use(async (options) => {
			return options.next({
				ctx: { session: { token: "", ipAddress: nothing<string>(), userAgent: nothing<string>() } }
			});
		});
		const readGamePointsAudios = fake.returns(
			Task.reject<readonly ReadAudio[], Error>(new Error("Reading game points audios failed"))
		);
		const options = createAudioRouterOptions({
			trpcRouter: {
				router: trpc.router,
				publicProcedure: trpc.procedure,
				protectedProcedure
			},
			readGamePointsAudios
		});

		const audioRouter = createAudioRouter(options);
		const createCaller = trpc.createCallerFactory(audioRouter);
		const caller = createCaller({ session: nothing() });

		const input = gamePointsPlaylistInputFactory.build() as GamePointsPlaylistInput;

		await assert.rejects(caller.gamePointsPlaylist(input), (error: unknown) => {
			return assertTrpcError(error, "NOT_FOUND", "Could not find any attention audio files");
		});
	});

	test("throws an error when game points audios are an empty Array", async function () {
		const trpc = initTRPC.context<TRPCRouterContext>().create();
		const protectedProcedure = trpc.procedure.use(async (options) => {
			return options.next({
				ctx: { session: { token: "", ipAddress: nothing<string>(), userAgent: nothing<string>() } }
			});
		});
		const readGamePointsAudios = fake.returns(Task.resolve<readonly ReadAudio[], Error>([]));
		const options = createAudioRouterOptions({
			trpcRouter: {
				router: trpc.router,
				publicProcedure: trpc.procedure,
				protectedProcedure
			},
			readGamePointsAudios
		});

		const audioRouter = createAudioRouter(options);
		const createCaller = trpc.createCallerFactory(audioRouter);
		const caller = createCaller({ session: nothing() });

		const input = gamePointsPlaylistInputFactory.build() as GamePointsPlaylistInput;

		await assert.rejects(caller.gamePointsPlaylist(input), (error: unknown) => {
			return assertTrpcError(error, "NOT_FOUND", "Could not find any attention audio files");
		});
	});

	test("returns a list of game points audios", async function () {
		const trpc = initTRPC.context<TRPCRouterContext>().create();
		const protectedProcedure = trpc.procedure.use(async (options) => {
			return options.next({
				ctx: { session: { token: "", ipAddress: nothing<string>(), userAgent: nothing<string>() } }
			});
		});
		const readGamePointsAudios = fake.returns(
			Task.resolve<readonly ReadAudio[], Error>([
				{ gamePointAudioId: 1, name: "attention.m4a", gamePoints: null },
				{ gamePointAudioId: 1, name: "zero.m4a", gamePoints: 0 },
				{ gamePointAudioId: 1, name: "to.m4a", gamePoints: null }
			])
		);
		const options = createAudioRouterOptions({
			trpcRouter: {
				router: trpc.router,
				publicProcedure: trpc.procedure,
				protectedProcedure
			},
			readGamePointsAudios
		});

		const audioRouter = createAudioRouter(options);
		const createCaller = trpc.createCallerFactory(audioRouter);
		const caller = createCaller({ session: nothing() });

		const input = gamePointsPlaylistInputFactory.build() as GamePointsPlaylistInput;

		assert.deepStrictEqual(await caller.gamePointsPlaylist(input), [
			"/api/audio/1",
			"/api/audio/1",
			"/api/audio/1",
			"/api/audio/1"
		]);
	});
});

suite("getRandomFunAudio()", function () {
	test("throws an error when fun audios could not be read", async function () {
		const trpc = initTRPC.context<TRPCRouterContext>().create();
		const protectedProcedure = trpc.procedure.use(async (options) => {
			return options.next({
				ctx: { session: { token: "", ipAddress: nothing<string>(), userAgent: nothing<string>() } }
			});
		});
		const readAllFunAudios = fake.returns(
			Task.reject<readonly ReadAudioWithoutGamePoints[], Error>(new Error("Test error"))
		);
		const options = createAudioRouterOptions({
			trpcRouter: {
				router: trpc.router,
				publicProcedure: trpc.procedure,
				protectedProcedure
			},
			readAllFunAudios
		});

		const audioRouter = createAudioRouter(options);
		const createCaller = trpc.createCallerFactory(audioRouter);
		const caller = createCaller({ session: nothing() });

		await assert.rejects(caller.getRandomFunAudio(), (error: unknown) => {
			return assertTrpcError(error, "NOT_FOUND", "Could not find any fun audio files");
		});
	});

	test("throws an error when fun audios are an empty Array", async function () {
		const trpc = initTRPC.context<TRPCRouterContext>().create();
		const protectedProcedure = trpc.procedure.use(async (options) => {
			return options.next({
				ctx: { session: { token: "", ipAddress: nothing<string>(), userAgent: nothing<string>() } }
			});
		});
		const readAllFunAudios = fake.returns(Task.resolve<readonly ReadAudioWithoutGamePoints[], Error>([]));
		const options = createAudioRouterOptions({
			trpcRouter: {
				router: trpc.router,
				publicProcedure: trpc.procedure,
				protectedProcedure
			},
			readAllFunAudios
		});

		const audioRouter = createAudioRouter(options);
		const createCaller = trpc.createCallerFactory(audioRouter);
		const caller = createCaller({ session: nothing() });

		await assert.rejects(caller.getRandomFunAudio(), (error: unknown) => {
			return assertTrpcError(error, "NOT_FOUND", "Could not find any fun audio files");
		});
	});

	test("returns a random fun audio", async function () {
		const trpc = initTRPC.context<TRPCRouterContext>().create();
		const protectedProcedure = trpc.procedure.use(async (options) => {
			return options.next({
				ctx: { session: { token: "", ipAddress: nothing<string>(), userAgent: nothing<string>() } }
			});
		});
		const readAllFunAudios = fake.returns(
			Task.resolve<readonly ReadAudioWithoutGamePoints[], Error>([
				{ gamePointAudioId: 1, name: "spuilts_lieber_uno.m4a" }
			])
		);
		const options = createAudioRouterOptions({
			trpcRouter: {
				router: trpc.router,
				publicProcedure: trpc.procedure,
				protectedProcedure
			},
			readAllFunAudios
		});

		const audioRouter = createAudioRouter(options);
		const createCaller = trpc.createCallerFactory(audioRouter);
		const caller = createCaller({ session: nothing() });

		assert.strictEqual(await caller.getRandomFunAudio(), "/api/audio/1");
	});
});
