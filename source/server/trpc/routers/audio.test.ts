import { describe, it, expect, vi, type Mock } from "vitest";
import { initTRPC, TRPCError, type inferProcedureInput } from "@trpc/server";
import { Factory } from "fishery";
import { Task } from "true-myth/task";
import { nothing } from "true-myth/maybe";
import type { createTrpcRouter } from "../index.js";
import type { TRPCRouterContext } from "../context.js";
import type { TRPCApplicationRouter } from "../application-router.js";
import type { NotPersistedTeam } from "../../../shared/team.js";
import type {
	AudioRepository,
	ReadAllAudiosOptions,
	ReadAudio,
	ReadAudioWithoutGamePoints
} from "../../audio/repository.js";
import { createAudioRouter, type AudioRouterOptions } from "./audio.js";

type GamePointsPlaylistInput = inferProcedureInput<TRPCApplicationRouter["audio"]["gamePointsPlaylist"]>;

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
	readonly readGamePointsAudios?: Mock<(options: ReadAllAudiosOptions) => Task<readonly ReadAudio[], Error>>;
	readonly readAllFunAudios?: Mock<(options: ReadAllAudiosOptions) => Task<readonly ReadAudio[], Error>>;
};

function createAudioRouterOptions(overrides: Overrides): AudioRouterOptions & {} {
	const { trpcRouter } = overrides;
	const audioRepository = {
		readGamePointsAudios: overrides.readGamePointsAudios ?? vi.fn(),
		readAllFunAudios: overrides.readAllFunAudios ?? vi.fn()
	};

	return {
		trpcRouter: {
			router: trpcRouter.router,
			publicProcedure: trpcRouter.publicProcedure,
			protectedProcedure: trpcRouter.protectedProcedure
		},
		audioRepository: audioRepository as unknown as AudioRepository,
		isTurnAround: vi.fn()
	};
}

describe("gamePointsPlaylist()", () => {
	it.each<{ input: GamePointsPlaylistInput; expectedErrorMessage: string }>([
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
	])(
		"throws an error with error code 'BAD_REQUEST' when input validation fails",
		async ({ input, expectedErrorMessage }) => {
			const trpc = initTRPC.context<TRPCRouterContext>().create();
			const protectedProcedure = trpc.procedure.use(async (options) => {
				return options.next({ ctx: { sessionToken: "" } });
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
			const caller = createCaller({ sessionToken: nothing() });

			await expect(caller.gamePointsPlaylist(input)).rejects.toThrow(TRPCError);

			await expect(caller.gamePointsPlaylist(input)).rejects.toThrow(
				expect.objectContaining({
					code: "BAD_REQUEST",
					message: expectedErrorMessage
				})
			);
		}
	);

	it("throws an error when game points audios could not be read", async () => {
		const trpc = initTRPC.context<TRPCRouterContext>().create();
		const protectedProcedure = trpc.procedure.use(async (options) => {
			return options.next({ ctx: { sessionToken: "" } });
		});
		const readGamePointsAudios = vi
			.fn()
			.mockReturnValue(Task.reject<readonly ReadAudio[], Error>(new Error("Reading game points audios failed")));
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
		const caller = createCaller({ sessionToken: nothing() });

		const input = gamePointsPlaylistInputFactory.build() as GamePointsPlaylistInput;

		await expect(caller.gamePointsPlaylist(input)).rejects.toThrow(
			expect.objectContaining({
				code: "NOT_FOUND",
				message: "Could not find any attention audio files"
			})
		);
	});

	it("throws an error when game points audios are an empty Array", async () => {
		const trpc = initTRPC.context<TRPCRouterContext>().create();
		const protectedProcedure = trpc.procedure.use(async (options) => {
			return options.next({ ctx: { sessionToken: "" } });
		});
		const readGamePointsAudios = vi.fn().mockReturnValue(Task.resolve<readonly ReadAudio[], Error>([]));
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
		const caller = createCaller({ sessionToken: nothing() });

		const input = gamePointsPlaylistInputFactory.build() as GamePointsPlaylistInput;

		await expect(caller.gamePointsPlaylist(input)).rejects.toThrow(
			expect.objectContaining({
				code: "NOT_FOUND",
				message: "Could not find any attention audio files"
			})
		);
	});

	it("returns a list of game points audios", async () => {
		const trpc = initTRPC.context<TRPCRouterContext>().create();
		const protectedProcedure = trpc.procedure.use(async (options) => {
			return options.next({ ctx: { sessionToken: "" } });
		});
		const readGamePointsAudios = vi.fn().mockReturnValue(
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
		const caller = createCaller({ sessionToken: nothing() });

		const input = gamePointsPlaylistInputFactory.build() as GamePointsPlaylistInput;

		await expect(caller.gamePointsPlaylist(input)).resolves.toStrictEqual([
			"/api/audio/1",
			"/api/audio/1",
			"/api/audio/1",
			"/api/audio/1"
		]);
	});
});

describe("getRandomFunAudio()", () => {
	it("throws an error when fun audios could not be read", async () => {
		const trpc = initTRPC.context<TRPCRouterContext>().create();
		const protectedProcedure = trpc.procedure.use(async (options) => {
			return options.next({ ctx: { sessionToken: "" } });
		});
		const readAllFunAudios = vi
			.fn()
			.mockReturnValue(Task.reject<readonly ReadAudioWithoutGamePoints[], Error>(new Error("Test error")));
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
		const caller = createCaller({ sessionToken: nothing() });

		await expect(caller.getRandomFunAudio()).rejects.toThrow(
			expect.objectContaining({
				code: "NOT_FOUND",
				message: "Could not find any fun audio files"
			})
		);
	});

	it("throws an error when fun audios are an empty Array", async () => {
		const trpc = initTRPC.context<TRPCRouterContext>().create();
		const protectedProcedure = trpc.procedure.use(async (options) => {
			return options.next({ ctx: { sessionToken: "" } });
		});
		const readAllFunAudios = vi
			.fn()
			.mockReturnValue(Task.resolve<readonly ReadAudioWithoutGamePoints[], Error>([]));
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
		const caller = createCaller({ sessionToken: nothing() });

		await expect(caller.getRandomFunAudio()).rejects.toThrow(
			expect.objectContaining({
				code: "NOT_FOUND",
				message: "Could not find any fun audio files"
			})
		);
	});

	it("returns a random fun audio", async () => {
		const trpc = initTRPC.context<TRPCRouterContext>().create();
		const protectedProcedure = trpc.procedure.use(async (options) => {
			return options.next({ ctx: { sessionToken: "" } });
		});
		const readAllFunAudios = vi
			.fn()
			.mockReturnValue(
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
		const caller = createCaller({ sessionToken: nothing() });

		await expect(caller.getRandomFunAudio()).resolves.toBe("/api/audio/1");
	});
});
