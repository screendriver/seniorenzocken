import { describe, it, expect, assert, vi } from "vitest";
import { isErr, isOk } from "true-myth/result";
import Unit from "true-myth/unit";
import { migrate } from "drizzle-orm/libsql/migrator";
import { assertError } from "@sindresorhus/is";
import { userSessions as userSessionsDatabaseSchema } from "../database/schema.js";
import { createDatabase } from "../database/database.js";
import { seedInMemoryDatabase } from "../seed-in-memory-database.js";
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
		await database.insert(userSessionsDatabaseSchema).values({ token: "test-token" });
		const randomUUID = vi.fn().mockReturnValue("");
		const sessionRepostory = createSessionRepository({ database, randomUUID });

		const result = await sessionRepostory.getSession("not-found");

		assert(isErr(result));

		expect(result.error.message).toBe("Could not parse session from database");
	});

	it("returns a Result Ok when session token could be found", async () => {
		const database = createDatabase(":memory:");
		await migrate(database, { migrationsFolder: "./drizzle" });
		await database.insert(userSessionsDatabaseSchema).values({ token: "test-token" });
		const randomUUID = vi.fn().mockReturnValue("");
		const sessionRepostory = createSessionRepository({ database, randomUUID });

		const result = await sessionRepostory.getSession("test-token");

		assert(isOk(result));

		expect(result.value).toStrictEqual({ token: "test-token" });
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

		expect(result.value).toStrictEqual({ token: "random-uuid" });
	});

	it("returns a Result Ok when database insertion succeeded and an IP address and user agent are given", async () => {
		const database = createDatabase(":memory:");
		await migrate(database, { migrationsFolder: "./drizzle" });
		const randomUUID = vi.fn().mockReturnValue("random-uuid");
		const sessionRepostory = createSessionRepository({ database, randomUUID });

		const result = await sessionRepostory.createSession({ ipAddress: "127.0.0.1", userAgent: "test-user-agent" });

		assert(isOk(result));

		expect(result.value).toStrictEqual({ token: "random-uuid" });
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

describe("createTeamSessions()", () => {
	it("returns a Result Err when database insertion failed", async () => {
		const database = createDatabase(":memory:");
		const randomUUID = vi.fn().mockReturnValue("");
		const sessionRepostory = createSessionRepository({ database, randomUUID });

		const result = await sessionRepostory.createTeamSessions("");

		assert(isErr(result));

		expect(result.error.message).toBe("Could not create team sessions");
	});

	it("returns a Result Err when session token could not be found in database", async () => {
		const database = createDatabase(":memory:");
		await migrate(database, { migrationsFolder: "./drizzle" });
		const randomUUID = vi.fn().mockReturnValue("random-uuid");
		const sessionRepostory = createSessionRepository({ database, randomUUID });

		const result = await sessionRepostory.createTeamSessions("not-found");

		assert(isErr(result));

		expect(result.error.message).toBe("Could not create team sessions");

		assertError(result.error.cause);

		expect(result.error.cause.message).toBe("User session could not be found");
	});

	it("returns a Result Ok when database insertion succeeded", async () => {
		const database = createDatabase(":memory:");
		await migrate(database, { migrationsFolder: "./drizzle" });
		await seedInMemoryDatabase(database);
		await database.insert(userSessionsDatabaseSchema).values({ token: "test-token" });
		const randomUUID = vi.fn().mockReturnValue("random-uuid");
		const sessionRepostory = createSessionRepository({ database, randomUUID });

		const result = await sessionRepostory.createTeamSessions("test-token", [7, 16], [5, 10]);

		assert(isOk(result));

		expect(result.value).toBe(Unit);
	});
});
