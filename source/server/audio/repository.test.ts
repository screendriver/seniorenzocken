import { suite, test, expect } from "vitest";
import { migrate } from "drizzle-orm/libsql/migrator";
import { seedInMemoryDatabase } from "../seed-in-memory-database.js";
import { createDatabase } from "../database/database.js";
import { createAudioRepository } from "./repository.js";

suite("readGamePointsAudios()", () => {
	test("returns the selected audio files in correct order", async () => {
		const database = createDatabase(":memory:");
		await migrate(database, { migrationsFolder: "./drizzle" });
		await seedInMemoryDatabase(database);

		const audioRepository = createAudioRepository({ database });

		const allAudios = await audioRepository.readGamePointsAudios({
			team1MatchTotalGamePoints: 4,
			team2MatchTotalGamePoints: 10
		});

		expect(allAudios).toStrictEqual([
			{
				gamePointAudioId: 1,
				gamePoints: null,
				name: "turn_around.m4a"
			},
			{
				gamePointAudioId: 2,
				gamePoints: null,
				name: "attention.m4a"
			},
			{
				gamePointAudioId: 6,
				gamePoints: 4,
				name: "four.m4a"
			},
			{
				gamePointAudioId: 21,
				gamePoints: null,
				name: "to.m4a"
			},
			{
				gamePointAudioId: 12,
				gamePoints: 10,
				name: "ten.m4a"
			},
			{
				gamePointAudioId: 22,
				gamePoints: null,
				name: "gspandt.m4a"
			},
			{
				gamePointAudioId: 23,
				gamePoints: null,
				name: "won.m4a"
			}
		]);
	});
});

suite("readAllFunAudios()", () => {
	test("returns all fun audio files", async () => {
		const database = createDatabase(":memory:");
		await migrate(database, { migrationsFolder: "./drizzle" });
		await seedInMemoryDatabase(database);

		const audioRepository = createAudioRepository({ database });

		const allFunAudios = await audioRepository.readAllFunAudios();

		expect(allFunAudios).toStrictEqual([
			{
				gamePointAudioId: 24,
				name: "der_is_guad.m4a"
			},
			{
				gamePointAudioId: 25,
				name: "der_war_deier.m4a"
			},
			{
				gamePointAudioId: 26,
				name: "des_is_a_lauf.m4a"
			},
			{
				gamePointAudioId: 27,
				name: "do_legst_di_nida.m4a"
			},
			{
				gamePointAudioId: 28,
				name: "do_sagst_nix_ma.m4a"
			},
			{
				gamePointAudioId: 29,
				name: "gehts_a_oder_gehts_a.m4a"
			},
			{
				gamePointAudioId: 30,
				name: "kimmt_da_no_woas.m4a"
			},
			{
				gamePointAudioId: 31,
				name: "machst_du_no_a_stich.m4a"
			},
			{
				gamePointAudioId: 32,
				name: "sama_gspandt.m4a"
			},
			{
				gamePointAudioId: 33,
				name: "seids_eigschlafa.m4a"
			},
			{
				gamePointAudioId: 34,
				name: "spuilts_lieber_uno.m4a"
			},
			{
				gamePointAudioId: 35,
				name: "was_isn_ogsogt.m4a"
			}
		]);
	});
});
