import type { randomUUID } from "node:crypto";
import { Task, tryOrElse } from "true-myth/task";
import { eq } from "drizzle-orm";
import { safeParse, summarize } from "valibot";
import { Unit } from "true-myth/unit";
import { sessions as sessionsDatabaseSchema } from "../database/schema.js";
import type { Database } from "../database/database.js";
import { sessionSchema, type Session } from "./session-schema.js";

type CreateSessionOptions = {
	readonly ipAddress?: string;
	readonly userAgent?: string;
};

export type SessionRepository = {
	readonly getSession: (sessionToken: string) => Task<Session, Error>;
	readonly createSession: (options: CreateSessionOptions) => Task<Session, Error>;
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
						.select({
							token: sessionsDatabaseSchema.token,
							ipAddress: sessionsDatabaseSchema.ipAddress,
							userAgent: sessionsDatabaseSchema.userAgent
						})
						.from(sessionsDatabaseSchema)
						.where(eq(sessionsDatabaseSchema.token, sessionToken))
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
						.insert(sessionsDatabaseSchema)
						.values({
							token: randomUUID(),
							ipAddress: options.ipAddress,
							userAgent: options.userAgent
						})
						.returning({
							token: sessionsDatabaseSchema.token,
							ipAddress: sessionsDatabaseSchema.ipAddress,
							userAgent: sessionsDatabaseSchema.userAgent
						});
				}
			).andThen((databaseRecords) => {
				const { success, output, issues } = safeParse(sessionSchema, databaseRecords[0]);

				if (success) {
					return Task.resolve({
						token: output.token,
						ipAddress: output.ipAddress,
						userAgent: output.userAgent
					});
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
					return database
						.delete(sessionsDatabaseSchema)
						.where(eq(sessionsDatabaseSchema.token, sessionToken));
				}
			).map(() => {
				return Unit;
			});
		}
	};
}
