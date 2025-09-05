import { describe, it, expect, assert, vi } from "vitest";
import { isErr, isOk } from "true-myth/result";
import { just, nothing } from "true-myth/maybe";
import Unit from "true-myth/unit";
import { migrate } from "drizzle-orm/libsql/migrator";
import { userSessions as userSessionsDatabaseSchema } from "../database/schema.js";
import { createDatabase } from "../database/database.js";
import { createSessionRepository } from "./session-repository.js";

describe("getSession()", () => {
	it("returns a Result Err when database selection failed", async () => {
		const database = createDatabase(":memory:");
		const randomUUID = vi.fn().mockReturnValue("");
		const sessionRepostory = createSessionRepository({ database, randomUUID });

		const result = await sessionRepostory.getSession("");

		assert(isErr(result));

		expect(result.error.message).toBe("Could not retrieve session");
	});

	it("returns a Result Err when parsing of session data from database failed", async () => {
		const database = createDatabase(":memory:");
		await migrate(database, { migrationsFolder: "./drizzle" });
		const randomUUID = vi.fn().mockReturnValue("");
		const sessionRepostory = createSessionRepository({ database, randomUUID });

		const result = await sessionRepostory.getSession("");

		assert(isErr(result));

		expect(result.error.message).toBe("Could not parse session from database");
	});

	it("returns a Result Err when session token could not be found", async () => {
		const database = createDatabase(":memory:");
		await migrate(database, { migrationsFolder: "./drizzle" });
		await database
			.insert(userSessionsDatabaseSchema)
			.values({ token: "test-token", ipAddress: "127.0.0.1", userAgent: "test-user-agent" });
		const randomUUID = vi.fn().mockReturnValue("");
		const sessionRepostory = createSessionRepository({ database, randomUUID });

		const result = await sessionRepostory.getSession("not-found");

		assert(isErr(result));

		expect(result.error.message).toBe("Could not parse session from database");
	});

	it("returns a Result Ok when session token could be found", async () => {
		const database = createDatabase(":memory:");
		await migrate(database, { migrationsFolder: "./drizzle" });
		await database
			.insert(userSessionsDatabaseSchema)
			.values({ token: "test-token", ipAddress: "127.0.0.1", userAgent: "test-user-agent" });
		const randomUUID = vi.fn().mockReturnValue("");
		const sessionRepostory = createSessionRepository({ database, randomUUID });

		const result = await sessionRepostory.getSession("test-token");

		assert(isOk(result));

		expect(result.value).toStrictEqual({
			token: "test-token",
			ipAddress: just("127.0.0.1"),
			userAgent: just("test-user-agent")
		});
	});
});

describe("createSession()", () => {
	it("returns a Result Err when database insertion failed", async () => {
		const database = createDatabase(":memory:");
		const randomUUID = vi.fn().mockReturnValue("");
		const sessionRepostory = createSessionRepository({ database, randomUUID });

		const result = await sessionRepostory.createSession({});

		assert(isErr(result));

		expect(result.error.message).toBe("Could not create session");
	});

	it("returns a Result Ok when database insertion succeeded and only a token is given", async () => {
		const database = createDatabase(":memory:");
		await migrate(database, { migrationsFolder: "./drizzle" });
		const randomUUID = vi.fn().mockReturnValue("random-uuid");
		const sessionRepostory = createSessionRepository({ database, randomUUID });

		const result = await sessionRepostory.createSession({});

		assert(isOk(result));

		expect(result.value).toStrictEqual({
			token: "random-uuid",
			ipAddress: nothing(),
			userAgent: nothing()
		});
	});

	it("returns a Result Ok when database insertion succeeded and an IP address and user agent are given", async () => {
		const database = createDatabase(":memory:");
		await migrate(database, { migrationsFolder: "./drizzle" });
		const randomUUID = vi.fn().mockReturnValue("random-uuid");
		const sessionRepostory = createSessionRepository({ database, randomUUID });

		const result = await sessionRepostory.createSession({ ipAddress: "127.0.0.1", userAgent: "test-user-agent" });

		assert(isOk(result));

		expect(result.value).toStrictEqual({
			token: "random-uuid",
			ipAddress: just("127.0.0.1"),
			userAgent: just("test-user-agent")
		});
	});
});

describe("deleteSession()", () => {
	it("returns a Result Err when database deletion failed", async () => {
		const database = createDatabase(":memory:");
		const randomUUID = vi.fn().mockReturnValue("");
		const sessionRepostory = createSessionRepository({ database, randomUUID });

		const result = await sessionRepostory.deleteSession("");

		assert(isErr(result));

		expect(result.error.message).toBe("Could not delete session");
	});

	it("returns a Result Ok when session token did not exist", async () => {
		const database = createDatabase(":memory:");
		await migrate(database, { migrationsFolder: "./drizzle" });
		await database.insert(userSessionsDatabaseSchema).values({ token: "test-token" });
		const randomUUID = vi.fn().mockReturnValue("");
		const sessionRepostory = createSessionRepository({ database, randomUUID });

		const result = await sessionRepostory.deleteSession("not-found");

		assert(isOk(result));

		expect(result.value).toBe(Unit);
	});

	it("returns a Result Ok when session token was successfully deleted", async () => {
		const database = createDatabase(":memory:");
		await migrate(database, { migrationsFolder: "./drizzle" });
		await database.insert(userSessionsDatabaseSchema).values({ token: "test-token" });
		const randomUUID = vi.fn().mockReturnValue("");
		const sessionRepostory = createSessionRepository({ database, randomUUID });

		const result = await sessionRepostory.deleteSession("test-token");

		assert(isOk(result));

		expect(result.value).toBe(Unit);
	});
});
