import { describe, it, expect, assert } from "vitest";
import { isErr, isOk } from "true-myth/result";
import { just } from "true-myth/maybe";
import { migrate } from "drizzle-orm/libsql/migrator";
import { sessions as sessionsDatabaseSchema } from "../database/schema.js";
import { createDatabase } from "../database/database.js";
import { createSessionRepository } from "./session-repository.js";

describe("getSession", () => {
	it("returns a Result Err when database selection failed", async () => {
		const database = createDatabase(":memory:");
		const sessionRepostory = createSessionRepository({ database });

		const result = await sessionRepostory.getSession("");

		assert(isErr(result));

		expect(result.error.message).toBe("Could not retrieve session");
	});

	it("returns a Result Err when parsing of session data from database failed", async () => {
		const database = createDatabase(":memory:");
		await migrate(database, { migrationsFolder: "./drizzle" });
		const sessionRepostory = createSessionRepository({ database });

		const result = await sessionRepostory.getSession("");

		assert(isErr(result));

		expect(result.error.message).toBe("Could not parse session from database");
	});

	it("returns a Result Err when session token could not be found", async () => {
		const database = createDatabase(":memory:");
		await migrate(database, { migrationsFolder: "./drizzle" });
		await database
			.insert(sessionsDatabaseSchema)
			.values({ token: "test-token", ipAddress: "127.0.0.1", userAgent: "test-user-agent" });
		const sessionRepostory = createSessionRepository({ database });

		const result = await sessionRepostory.getSession("not-found");

		assert(isErr(result));

		expect(result.error.message).toBe("Could not parse session from database");
	});

	it("returns a Result Ok when session token could be found", async () => {
		const database = createDatabase(":memory:");
		await migrate(database, { migrationsFolder: "./drizzle" });
		await database
			.insert(sessionsDatabaseSchema)
			.values({ token: "test-token", ipAddress: "127.0.0.1", userAgent: "test-user-agent" });
		const sessionRepostory = createSessionRepository({ database });

		const result = await sessionRepostory.getSession("test-token");

		assert(isOk(result));

		expect(result.value).toStrictEqual({
			token: "test-token",
			ipAddress: just("127.0.0.1"),
			userAgent: just("test-user-agent")
		});
	});
});
