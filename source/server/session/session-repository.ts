import { Task, tryOrElse } from "true-myth/task";
import { eq } from "drizzle-orm";
import { safeParse, summarize } from "valibot";
import { sessions as sessionsDatabaseSchema } from "../database/schema.js";
import type { Database } from "../database/database.js";
import { sessionSchema, type Session } from "./session-schema.js";

export type SessionRepository = {
	readonly getSession: (sessionToken: string) => Task<Session, Error>;
};

type SessionRepositoryDependencies = {
	readonly database: Database;
};

export function createSessionRepository(dependencies: SessionRepositoryDependencies): SessionRepository {
	const { database } = dependencies;

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
		}
	};
}
