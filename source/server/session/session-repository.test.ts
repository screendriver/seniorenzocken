import assert from "node:assert";
import { suite, test } from "mocha";
import { fake } from "sinon";
import { isErr, isOk } from "true-myth/result";
import { Unit } from "true-myth/unit";
import { migrate } from "drizzle-orm/libsql/migrator";
import { assertError } from "@sindresorhus/is";
import { assertDefined } from "ts-extras";
import {
	userSessions as userSessionsDatabaseSchema,
	teamSessions as teamSessionsDatabaseSchema,
	gameRoundHistorySessions as gameRoundHistorySessionsDatabaseSchema
} from "../database/raw-database-schema.js";
import { createDatabase } from "../database/database.js";
import { seedInMemoryDatabase } from "../seed-in-memory-database.js";
import { createSessionRepository } from "./session-repository.js";

const testRandomUuid = "00000000-0000-0000-0000-000000000000";

suite("getSession()", function () {
	test("returns a Result Err when database selection failed", async function () {
		const database = createDatabase(":memory:");
		const randomUUID = fake.returns<[], typeof testRandomUuid>(testRandomUuid);
		const sessionRepository = createSessionRepository({ database, randomUUID });

		const result = await sessionRepository.getSession("");

		assert.ok(isErr(result));

		assert.strictEqual(result.error.message, "Could not retrieve session");
	});

	test("returns a Result Err when parsing of session data from database failed", async function () {
		const database = createDatabase(":memory:");
		await migrate(database, { migrationsFolder: "./drizzle" });
		const randomUUID = fake.returns<[], typeof testRandomUuid>(testRandomUuid);
		const sessionRepository = createSessionRepository({ database, randomUUID });

		const result = await sessionRepository.getSession("");

		assert.ok(isErr(result));

		assert.strictEqual(result.error.message, "Could not parse session from database");
	});

	test("returns a Result Err when session token could not be found", async function () {
		const database = createDatabase(":memory:");
		await migrate(database, { migrationsFolder: "./drizzle" });
		await database.insert(userSessionsDatabaseSchema).values({ token: "test-token" });
		const randomUUID = fake.returns<[], typeof testRandomUuid>(testRandomUuid);
		const sessionRepository = createSessionRepository({ database, randomUUID });

		const result = await sessionRepository.getSession("not-found");

		assert.ok(isErr(result));

		assert.strictEqual(result.error.message, "Could not parse session from database");
	});

	test("returns a Result Ok when session token could be found", async function () {
		const database = createDatabase(":memory:");
		await migrate(database, { migrationsFolder: "./drizzle" });
		await database.insert(userSessionsDatabaseSchema).values({ token: "test-token" });
		const randomUUID = fake.returns<[], typeof testRandomUuid>(testRandomUuid);
		const sessionRepository = createSessionRepository({ database, randomUUID });

		const result = await sessionRepository.getSession("test-token");

		assert.ok(isOk(result));

		assert.deepStrictEqual(result.value, { token: "test-token" });
	});
});

suite("createSession()", function () {
	test("returns a Result Err when database insertion failed", async function () {
		const database = createDatabase(":memory:");
		const randomUUID = fake.returns<[], typeof testRandomUuid>(testRandomUuid);
		const sessionRepository = createSessionRepository({ database, randomUUID });

		const result = await sessionRepository.createSession({});

		assert.ok(isErr(result));

		assert.strictEqual(result.error.message, "Could not create session");
	});

	test("returns a Result Ok when database insertion succeeded and only a token is given", async function () {
		const database = createDatabase(":memory:");
		await migrate(database, { migrationsFolder: "./drizzle" });
		const randomUUID = fake.returns<[], typeof testRandomUuid>(testRandomUuid);
		const sessionRepository = createSessionRepository({ database, randomUUID });

		const result = await sessionRepository.createSession({});

		assert.ok(isOk(result));

		assert.deepStrictEqual(result.value, { token: testRandomUuid });
	});

	test("returns a Result Ok when database insertion succeeded and an IP address and user agent are given", async function () {
		const database = createDatabase(":memory:");
		await migrate(database, { migrationsFolder: "./drizzle" });
		const randomUUID = fake.returns<[], typeof testRandomUuid>(testRandomUuid);
		const sessionRepository = createSessionRepository({ database, randomUUID });

		const result = await sessionRepository.createSession({ ipAddress: "127.0.0.1", userAgent: "test-user-agent" });

		assert.ok(isOk(result));

		assert.deepStrictEqual(result.value, { token: testRandomUuid });
	});
});

suite("deleteSession()", function () {
	test("returns a Result Err when database deletion failed", async function () {
		const database = createDatabase(":memory:");
		const randomUUID = fake.returns<[], typeof testRandomUuid>(testRandomUuid);
		const sessionRepository = createSessionRepository({ database, randomUUID });

		const result = await sessionRepository.deleteSession("");

		assert.ok(isErr(result));

		assert.strictEqual(result.error.message, "Could not delete session");
	});

	test("returns a Result Ok when session token did not exist", async function () {
		const database = createDatabase(":memory:");
		await migrate(database, { migrationsFolder: "./drizzle" });
		await database.insert(userSessionsDatabaseSchema).values({ token: "test-token" });
		const randomUUID = fake.returns<[], typeof testRandomUuid>(testRandomUuid);
		const sessionRepository = createSessionRepository({ database, randomUUID });

		const result = await sessionRepository.deleteSession("not-found");

		assert.ok(isOk(result));

		assert.strictEqual(result.value, Unit);
	});

	test("returns a Result Ok when session token was successfully deleted", async function () {
		const database = createDatabase(":memory:");
		await migrate(database, { migrationsFolder: "./drizzle" });
		await database.insert(userSessionsDatabaseSchema).values({ token: "test-token" });
		const randomUUID = fake.returns<[], typeof testRandomUuid>(testRandomUuid);
		const sessionRepository = createSessionRepository({ database, randomUUID });

		const result = await sessionRepository.deleteSession("test-token");

		assert.ok(isOk(result));

		assert.strictEqual(result.value, Unit);
	});
});

suite("createTeamsSessions()", function () {
	test("returns a Result Err when database insertion failed", async function () {
		const database = createDatabase(":memory:");
		const randomUUID = fake.returns<[], typeof testRandomUuid>(testRandomUuid);
		const sessionRepository = createSessionRepository({ database, randomUUID });

		const result = await sessionRepository.createTeamsSessions("");

		assert.ok(isErr(result));

		assert.strictEqual(result.error.message, "Could not create team sessions");
	});

	test("returns a Result Err when session token could not be found in database", async function () {
		const database = createDatabase(":memory:");
		await migrate(database, { migrationsFolder: "./drizzle" });
		const randomUUID = fake.returns<[], typeof testRandomUuid>(testRandomUuid);
		const sessionRepository = createSessionRepository({ database, randomUUID });

		const result = await sessionRepository.createTeamsSessions("not-found");

		assert.ok(isErr(result));

		assert.strictEqual(result.error.message, "Could not create team sessions");

		assertError(result.error.cause);

		assert.strictEqual(result.error.cause.message, "User session could not be found");
	});

	test("returns a Result Ok when database insertion succeeded", async function () {
		const database = createDatabase(":memory:");
		await migrate(database, { migrationsFolder: "./drizzle" });
		await seedInMemoryDatabase(database);
		await database.insert(userSessionsDatabaseSchema).values({ token: "test-token" });
		const randomUUID = fake.returns<[], typeof testRandomUuid>(testRandomUuid);
		const sessionRepository = createSessionRepository({ database, randomUUID });

		const result = await sessionRepository.createTeamsSessions("test-token", [7, 16], [5, 10]);

		assert.ok(isOk(result));

		assert.strictEqual(result.value, Unit);
	});
});

suite("createGameRoundHistorySession()", function () {
	test("returns a Result Err when database insertion failed", async function () {
		const database = createDatabase(":memory:");
		const randomUUID = fake.returns<[], typeof testRandomUuid>(testRandomUuid);
		const sessionRepository = createSessionRepository({ database, randomUUID });

		const result = await sessionRepository.createGameRoundHistorySession({ teamId: 0, gamePoints: 0 });

		assert.ok(isErr(result));

		assert.strictEqual(result.error.message, "Could not create game round history session");
	});

	test("returns a Result Ok when database insertion succeeded", async function () {
		const database = createDatabase(":memory:");
		await migrate(database, { migrationsFolder: "./drizzle" });
		await seedInMemoryDatabase(database);
		const randomUUID = fake.returns<[], typeof testRandomUuid>(testRandomUuid);
		const sessionRepository = createSessionRepository({ database, randomUUID });

		const [firstUserSessionDatabaseRecord] = await database
			.insert(userSessionsDatabaseSchema)
			.values({ token: "test-token" })
			.returning({ userSessionId: userSessionsDatabaseSchema.userSessionId });

		assertDefined(firstUserSessionDatabaseRecord);

		await database
			.insert(teamSessionsDatabaseSchema)
			.values({ userSessionId: firstUserSessionDatabaseRecord.userSessionId });

		const result = await sessionRepository.createGameRoundHistorySession({ teamId: 1, gamePoints: 2 });

		assert.ok(isOk(result));

		assert.strictEqual(result.value, Unit);
	});
});

suite("deleteLastGameRoundHistorySession()", function () {
	test("returns a Result Err when database deletion failed", async function () {
		const database = createDatabase(":memory:");
		const randomUUID = fake.returns<[], typeof testRandomUuid>(testRandomUuid);
		const sessionRepository = createSessionRepository({ database, randomUUID });

		const result = await sessionRepository.deleteLastGameRoundHistorySession("test-token");

		assert.ok(isErr(result));

		assert.strictEqual(result.error.message, "Could not delete last game round history session");
	});

	test("returns a Result Ok when there is no last game round history session", async function () {
		const database = createDatabase(":memory:");
		await migrate(database, { migrationsFolder: "./drizzle" });
		await seedInMemoryDatabase(database);
		const randomUUID = fake.returns<[], typeof testRandomUuid>(testRandomUuid);
		const sessionRepository = createSessionRepository({ database, randomUUID });

		const result = await sessionRepository.deleteLastGameRoundHistorySession("test-token");

		assert.ok(isOk(result));

		assert.strictEqual(result.value, Unit);
	});

	test("deletes the very last game round history session and returns a Result Ok when database deletion succeeded", async function () {
		const database = createDatabase(":memory:");
		await migrate(database, { migrationsFolder: "./drizzle" });
		await seedInMemoryDatabase(database);
		const randomUUID = fake.returns<[], typeof testRandomUuid>(testRandomUuid);
		const sessionRepository = createSessionRepository({ database, randomUUID });

		const [firstUserSessionDatabaseRecord] = await database
			.insert(userSessionsDatabaseSchema)
			.values({ token: "test-token" })
			.returning({ userSessionId: userSessionsDatabaseSchema.userSessionId });

		assertDefined(firstUserSessionDatabaseRecord);

		const [firstTeamSessionDatabaseRecord] = await database
			.insert(teamSessionsDatabaseSchema)
			.values({ userSessionId: firstUserSessionDatabaseRecord.userSessionId })
			.returning({ teamSessionId: teamSessionsDatabaseSchema.teamSessionId });

		assertDefined(firstTeamSessionDatabaseRecord);

		await database.insert(gameRoundHistorySessionsDatabaseSchema).values([
			{
				teamSessionId: firstTeamSessionDatabaseRecord.teamSessionId,
				gamePoints: 2,
				createdAt: "2025-09-26 15:30:00"
			},
			{
				teamSessionId: firstTeamSessionDatabaseRecord.teamSessionId,
				gamePoints: 3,
				createdAt: "2025-09-26 15:30:01"
			}
		]);

		const result = await sessionRepository.deleteLastGameRoundHistorySession("test-token");

		assert.ok(isOk(result));

		assert.strictEqual(result.value, Unit);

		assert.deepStrictEqual(await database.select().from(gameRoundHistorySessionsDatabaseSchema), [
			{
				createdAt: "2025-09-26 15:30:00",
				gamePoints: 2,
				gameRoundHistorySessionsId: 1,
				teamSessionId: 1
			}
		]);
	});
});
