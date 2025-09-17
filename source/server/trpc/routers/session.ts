import { TRPCError } from "@trpc/server";
import { object, pipe, minValue, number, integer } from "valibot";
import type { TRPCRouter } from "../index.js";
import type { SessionRepository } from "../../session/session-repository.js";

type Options = {
	readonly trpcRouter: TRPCRouter;
	readonly sessionRepository: SessionRepository;
};

const databaseIdSchema = pipe(number(), integer(), minValue(1));

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type -- tRPC works with type inference
export function createSessionRouter(options: Options) {
	const {
		trpcRouter: { router, publicProcedure, protectedProcedure },
		sessionRepository
	} = options;

	return router({
		token: publicProcedure.query(async (procedureOptions) => {
			return procedureOptions.ctx.session
				.map((session) => {
					return session.token;
				})
				.unwrapOr(null);
		}),

		startGame: protectedProcedure
			.input(
				object({
					team1Player1Id: databaseIdSchema,
					team1Player2Id: databaseIdSchema,
					team2Player1Id: databaseIdSchema,
					team2Player2Id: databaseIdSchema
				})
			)
			.mutation(async (procedureOptions) => {
				const { team1Player1Id, team1Player2Id, team2Player1Id, team2Player2Id } = procedureOptions.input;
				const { token: sessionToken } = procedureOptions.ctx.session;

				const creationResult = await sessionRepository.createTeamsSessions(
					sessionToken,
					[team1Player1Id, team1Player2Id],
					[team2Player1Id, team2Player2Id]
				);

				if (creationResult.isErr) {
					throw new TRPCError({
						code: "INTERNAL_SERVER_ERROR",
						cause: creationResult.error
					});
				}
			}),

		currentGameRound: protectedProcedure.query(async (procedureOptions) => {
			const { token: sessionToken } = procedureOptions.ctx.session;

			return sessionRepository.getCurrentGameRoundSession(sessionToken).match({
				Resolved(currentGameRound) {
					return currentGameRound;
				},
				Rejected(error) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "Could not find current game round",
						cause: error
					});
				}
			});
		}),

		nextGameRound: protectedProcedure
			.input(object({ teamId: pipe(databaseIdSchema), gamePoints: pipe(number(), integer(), minValue(2)) }))
			.mutation(async (procedureOptions) => {
				const { teamId, gamePoints } = procedureOptions.input;
				const creationResult = await sessionRepository.createGameRoundHistorySession({ teamId, gamePoints });

				if (creationResult.isErr) {
					throw new TRPCError({
						code: "INTERNAL_SERVER_ERROR",
						cause: creationResult.error
					});
				}

				return undefined;
			})
	});
}
