import { suite, test, expect } from "vitest";
import { migrate } from "drizzle-orm/libsql/migrator";
import { seedInMemoryDatabase } from "../seed-in-memory-database.ts";
import { createDatabase } from "../database/database.ts";
import { createAudioRepository } from "./repository.ts";

suite("audio repository", () => {
	test("readAllAudios() returns the selected audio files in correct order", async () => {
		const database = createDatabase(":memory:");
		await migrate(database, { migrationsFolder: "./drizzle" });
		await seedInMemoryDatabase(database);

		const audioRepository = createAudioRepository({ database });

		const allAudios = await audioRepository.readAllAudios({
			team1MatchTotalGamePoints: 4,
			team2MatchTotalGamePoints: 10,
		});

		expect(allAudios).toEqual([
			{
				gamePointAudioId: 1,
				gamePoints: null,
				name: "attention.m4a",
			},
			{
				gamePointAudioId: 5,
				gamePoints: 4,
				name: "four.m4a",
			},
			{
				gamePointAudioId: 20,
				gamePoints: null,
				name: "to.m4a",
			},
			{
				gamePointAudioId: 11,
				gamePoints: 10,
				name: "ten.m4a",
			},
			{
				gamePointAudioId: 21,
				gamePoints: null,
				name: "stretched.m4a",
			},
			{
				gamePointAudioId: 22,
				gamePoints: null,
				name: "won.m4a",
			},
		]);
	});
});
