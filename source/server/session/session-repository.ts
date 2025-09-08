import type { randomUUID } from "node:crypto";
import { Task, tryOrElse } from "true-myth/task";
import { Unit } from "true-myth/unit";
import { first } from "true-myth/maybe";
import { eq } from "drizzle-orm";
import { safeParse, summarize } from "valibot";
import { identity } from "es-toolkit";
import { isUndefined } from "@sindresorhus/is";
import {
	players as playersDatabaseSchema,
	userSessions as userSessionsDatabaseSchema,
	teamSessions as teamSessionsDatabaseSchema,
	teamMembersSessions as teamMembersSessionsDatabaseSchema,
	gameRoundHistorySessions as gameRoundHistorySessionsDatabaseSchema
} from "../database/schema.js";
import type { Database } from "../database/database.js";
import { currentGameRoundSessionsSchema, sessionSchema, type Session } from "./session-schema.js";
import { mapCurrentGameRoundSessionsFromDatabase, type CurrentGameRoundSession } from "./current-game-round-session.js";

type CreateSessionOptions = {
	readonly ipAddress?: string | undefined;
	readonly userAgent?: string | undefined;
};

export type SessionRepository = {
	readonly getSession: (sessionToken: string) => Task<Session, Error>;
	readonly createSession: (options: CreateSessionOptions) => Task<Session, Error>;
	readonly deleteSession: (sessionToken: string) => Task<Unit, Error>;
	readonly createTeamsSessions: (
		sessionToken: string,
		...teamMembersPlayerIds: readonly number[][]
	) => Task<Unit, Error>;
	readonly getCurrentGameRoundSession: (sessionToken: string) => Task<CurrentGameRoundSession, Error>;
};

type WithUserSessionIdOptions<T> = {
	readonly database: Database;
	readonly sessionToken: string;
	readonly callback: (userSessionId: number) => Promise<T>;
};

function withUserSessionId<T>(options: WithUserSessionIdOptions<T>) {
	const { database, sessionToken, callback } = options;

	return async () => {
		const userSessionsDatabaseRecords = await database
			.select({ userSessionId: userSessionsDatabaseSchema.userSessionId })
			.from(userSessionsDatabaseSchema)
			.where(eq(userSessionsDatabaseSchema.token, sessionToken))
			.limit(1);

		const userSessionId = first(userSessionsDatabaseRecords)
			.andThen(identity)
			.map((userSessionDatabaseRecord) => {
				return userSessionDatabaseRecord.userSessionId;
			});

		if (userSessionId.isNothing) {
			throw new Error("User session could not be found");
		}

		return callback(userSessionId.value);
	};
}
type SessionRepositoryDependencies = {
	readonly database: Database;
	readonly randomUUID: typeof randomUUID;
};

export function createSessionRepository(dependencies: SessionRepositoryDependencies): SessionRepository {
	const { database, randomUUID } = dependencies;

	return {
		getSession(sessionToken) {
			return tryOrElse(
				(error: unknown) => {
					return new Error("Could not retrieve session", { cause: error });
				},
				async () => {
					return database
						.select({ token: userSessionsDatabaseSchema.token })
						.from(userSessionsDatabaseSchema)
						.where(eq(userSessionsDatabaseSchema.token, sessionToken))
						.limit(1);
				}
			).andThen((sessionsFromDatabase) => {
				const { success, output, issues } = safeParse(sessionSchema, sessionsFromDatabase[0]);

				if (success) {
					return Task.resolve(output);
				}

				return Task.reject(new Error("Could not parse session from database", { cause: summarize(issues) }));
			});
		},

		createSession(options) {
			return tryOrElse(
				(error: unknown) => {
					return new Error("Could not create session", { cause: error });
				},
				async () => {
					return database
						.insert(userSessionsDatabaseSchema)
						.values({
							token: randomUUID(),
							ipAddress: options.ipAddress,
							userAgent: options.userAgent
						})
						.returning({ token: userSessionsDatabaseSchema.token });
				}
			).andThen((databaseRecords) => {
				const { success, output, issues } = safeParse(sessionSchema, databaseRecords[0]);

				if (success) {
					return Task.resolve({ token: output.token });
				}

				return Task.reject(new Error("Could not create session", { cause: summarize(issues) }));
			});
		},

		deleteSession(sessionToken) {
			return tryOrElse(
				(error: unknown) => {
					return new Error("Could not delete session", { cause: error });
				},
				async () => {
					await database
						.delete(userSessionsDatabaseSchema)
						.where(eq(userSessionsDatabaseSchema.token, sessionToken));

					return Unit;
				}
			);
		},

		createTeamsSessions(sessionToken, ...teamMembersPlayerIds) {
			return tryOrElse(
				(error: unknown) => {
					return new Error("Could not create team sessions", { cause: error });
				},
				withUserSessionId({
					database,
					sessionToken,
					async callback(userSessionId) {
						for (const teamMemberPlayerIds of teamMembersPlayerIds) {
							const [teamSessionDatabaseRecord] = await database
								.insert(teamSessionsDatabaseSchema)
								.values({ userSessionId })
								.returning({ teamSessionId: teamSessionsDatabaseSchema.teamSessionId });

							if (isUndefined(teamSessionDatabaseRecord)) {
								continue;
							}

							const teamMembers = teamMemberPlayerIds.map((playerId) => {
								return { teamSessionId: teamSessionDatabaseRecord.teamSessionId, playerId };
							});

							await database.insert(teamMembersSessionsDatabaseSchema).values(teamMembers);
						}

						return Unit;
					}
				})
			);
		},

		getCurrentGameRoundSession(sessionToken) {
			return tryOrElse(
				(error: unknown) => {
					return new Error("Could not read current game round session", { cause: error });
				},
				withUserSessionId({
					database,
					sessionToken,
					async callback(userSessionId) {
						return database
							.select({
								playerNickname: playersDatabaseSchema.nickname,
								playerFirstName: playersDatabaseSchema.firstName,
								teamId: teamSessionsDatabaseSchema.teamSessionId
							})
							.from(teamSessionsDatabaseSchema)
							.innerJoin(
								teamMembersSessionsDatabaseSchema,
								eq(
									teamSessionsDatabaseSchema.teamSessionId,
									teamMembersSessionsDatabaseSchema.teamSessionId
								)
							)
							.innerJoin(
								playersDatabaseSchema,
								eq(teamMembersSessionsDatabaseSchema.playerId, playersDatabaseSchema.playerId)
							)
							.leftJoin(
								gameRoundHistorySessionsDatabaseSchema,
								eq(
									teamSessionsDatabaseSchema.teamSessionId,
									gameRoundHistorySessionsDatabaseSchema.teamSessionId
								)
							)
							.where(eq(teamSessionsDatabaseSchema.userSessionId, userSessionId))
							.orderBy(teamSessionsDatabaseSchema.createdAt, playersDatabaseSchema.nickname);
					}
				})
			)
				.andThen((databaseRecords) => {
					const { success, output, issues } = safeParse(currentGameRoundSessionsSchema, databaseRecords);

					if (success) {
						return Task.resolve(output);
					}

					return Task.reject(new Error("Could not parse database records", { cause: summarize(issues) }));
				})
				.map(mapCurrentGameRoundSessionsFromDatabase);
		}
	};
}
