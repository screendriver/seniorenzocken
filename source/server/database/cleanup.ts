import pino from "pino";
import { sql, lt } from "drizzle-orm";
import { type Task, tryOrElse } from "true-myth/task";
import type { Cron } from "croner";
import type { Database } from "./database.js";
import * as schema from "./schema.js";

const logger = pino({ base: null });

export function cleanupDatabase(database: Database): Task<number, Error> {
	return tryOrElse(
		(errorReason: unknown) => {
			return new Error("Cleanup failed", { cause: errorReason });
		},
		async () => {
			const { rowsAffected } = await database
				.delete(schema.sessions)
				.where(lt(schema.sessions.createdAt, sql`datetime('now', '-14 days')`));

			await database.run("VACUUM");

			return rowsAffected;
		}
	);
}

type CleanupCronJobOptions = {
	readonly Cron: typeof Cron;
	readonly database: Database;
};

export function startCleanupDatabaseCronJob(options: CleanupCronJobOptions): void {
	const { Cron, database } = options;
	const cronTime = "20 1 * * *";

	logger.info(`Starting database cleanup cron job with following time: "${cronTime}"`);

	// eslint-disable-next-line no-new -- we have to use new here
	new Cron(cronTime, { timezone: "Europe/Berlin" }, async () => {
		logger.info("Cleaning database from old entries");

		const cleanupResult = await cleanupDatabase(database);

		cleanupResult.match({
			Ok(deletedRuns) {
				logger.info("Deleted %d old database entries", deletedRuns);
			},
			Err(error) {
				logger.error(error, "An error occurred while cleaning database");
			}
		});
	});
}
