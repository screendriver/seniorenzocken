import { TRPCError } from "@trpc/server";
import { object, pipe, minValue, number, integer } from "valibot";
import type { TRPCRouter } from "../index.js";
import type { SessionRepository } from "../../session/session-repository.js";

type Options = {
	readonly trpcRouter: TRPCRouter;
	readonly sessionRepository: SessionRepository;
};

const playerIdSchema = pipe(number(), integer(), minValue(1));

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
					team1Player1Id: playerIdSchema,
					team1Player2Id: playerIdSchema,
					team2Player1Id: playerIdSchema,
					team2Player2Id: playerIdSchema
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
			})
	});
}
