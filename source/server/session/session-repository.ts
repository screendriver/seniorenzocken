import type { randomUUID } from "node:crypto";
import { Task, tryOrElse } from "true-myth/task";
import { Unit } from "true-myth/unit";
import { first } from "true-myth/maybe";
import { eq } from "drizzle-orm";
import { safeParse, summarize } from "valibot";
import { identity } from "es-toolkit";
import {
	userSessions as userSessionsDatabaseSchema,
	gameSessions as gameSessionsDatabaseSchema
} from "../database/schema.js";
import type { Database } from "../database/database.js";
import { sessionSchema, type Session } from "./session-schema.js";

type CreateSessionOptions = {
	readonly ipAddress?: string | undefined;
	readonly userAgent?: string | undefined;
};

export type CreateGameSessionOptions = {
	readonly sessionToken: string;
	readonly team1Player1Id: number;
	readonly team1Player2Id: number;
	readonly team2Player1Id: number;
	readonly team2Player2Id: number;
};

export type SessionRepository = {
	readonly getSession: (sessionToken: string) => Task<Session, Error>;
	readonly createSession: (options: CreateSessionOptions) => Task<Session, Error>;
	readonly createGameSession: (options: CreateGameSessionOptions) => Task<Unit, Error>;
	readonly deleteSession: (sessionToken: string) => Task<Unit, Error>;
};

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

		createGameSession(options) {
			return tryOrElse(
				(error: unknown) => {
					return new Error("Could not create game session", { cause: error });
				},
				async () => {
					const userSessionsDatabaseRecords = await database
						.select({ userSessionId: userSessionsDatabaseSchema.sessionId })
						.from(userSessionsDatabaseSchema)
						.where(eq(userSessionsDatabaseSchema.token, options.sessionToken))
						.limit(1);

					const userSessionId = first(userSessionsDatabaseRecords)
						.andThen(identity)
						.map((userSessionDatabaseRecord) => {
							return userSessionDatabaseRecord.userSessionId;
						});

					if (userSessionId.isNothing) {
						throw new Error("User session could not be found");
					}

					await database.insert(gameSessionsDatabaseSchema).values({
						userSessionId: userSessionId.value,
						team1Player1Id: options.team1Player1Id,
						team1Player2Id: options.team1Player2Id,
						team2Player1Id: options.team2Player1Id,
						team2Player2Id: options.team2Player2Id,
						state: "active"
					});

					return Unit;
				}
			);
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
		}
	};
}
