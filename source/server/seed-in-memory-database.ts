import { seed } from "drizzle-seed";
import type { Client } from "@libsql/client";
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import * as schema from "./database/schema.ts";

const halfSecondOfSilence = Buffer.from(
	"AAAAHGZ0eXBNNEEgAAACAE00QSBpc29taXNvMgAAAAhmcmVlAAAAo21kYXTeAgBMYXZjNjAuMzEuMTAyAEIgCMEYOCEQBGCMHCEQBGCMHCEQBGCMHCEQBGCMHCEQBGCMHCEQBGCMHCEQBGCMHCEQBGCMHCEQBGCMHCEQBGCMHCEQBGCMHCEQBGCMHCEQBGCMHCEQBGCMHCEQBGCMHCEQBGCMHCEQBGCMHCEQBGCMHCEQBGCMHCEQBGCMHCEQBGCMHCEQBGCMHAAAA1dtb292AAAAbG12aGQAAAAAAAAAAAAAAAAAAAPoAAAB9AABAAABAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAACgXRyYWsAAABcdGtoZAAAAAMAAAAAAAAAAAAAAAEAAAAAAAAB9AAAAAAAAAAAAAAAAQEAAAAAAQAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAACRlZHRzAAAAHGVsc3QAAAAAAAAAAQAAAfQAAAQAAAEAAAAAAfltZGlhAAAAIG1kaGQAAAAAAAAAAAAAAAAAAKxEAABaIlXEAAAAAAAtaGRscgAAAAAAAAAAc291bgAAAAAAAAAAAAAAAFNvdW5kSGFuZGxlcgAAAAGkbWluZgAAABBzbWhkAAAAAAAAAAAAAAAkZGluZgAAABxkcmVmAAAAAAAAAAEAAAAMdXJsIAAAAAEAAAFoc3RibAAAAGpzdHNkAAAAAAAAAAEAAABabXA0YQAAAAAAAAABAAAAAAAAAAAAAgAQAAAAAKxEAAAAAAA2ZXNkcwAAAAADgICAJQABAASAgIAXQBUAAAAAAfQAAAAJQQWAgIAFEhBW5QAGgICAAQIAAAAgc3R0cwAAAAAAAAACAAAAFgAABAAAAAABAAACIgAAABxzdHNjAAAAAAAAAAEAAAABAAAAFwAAAAEAAABwc3RzegAAAAAAAAAAAAAAFwAAABcAAAAGAAAABgAAAAYAAAAGAAAABgAAAAYAAAAGAAAABgAAAAYAAAAGAAAABgAAAAYAAAAGAAAABgAAAAYAAAAGAAAABgAAAAYAAAAGAAAABgAAAAYAAAAGAAAAFHN0Y28AAAAAAAAAAQAAACwAAAAac2dwZAEAAAByb2xsAAAAAgAAAAH//wAAABxzYmdwAAAAAHJvbGwAAAABAAAAFwAAAAEAAABidWR0YQAAAFptZXRhAAAAAAAAACFoZGxyAAAAAAAAAABtZGlyYXBwbAAAAAAAAAAAAAAAAC1pbHN0AAAAJal0b28AAAAdZGF0YQAAAAEAAAAATGF2ZjYwLjE2LjEwMA==",
	"base64",
);

const seedNumber = 42;

export async function seedInMemoryDatabase(database: LibSQLDatabase<typeof schema> & { $client: Client }) {
	// @ts-expect-error currently a bug in drizzle-seed
	await seed(database, { players: schema.players }, { seed: seedNumber }).refine((drizzleSeed) => {
		return {
			players: {
				count: 8,
				columns: {
					totalPoints: drizzleSeed.int({
						minValue: 0,
						maxValue: 100,
					}),
					totalGameRounds: drizzleSeed.int({
						minValue: 0,
						maxValue: 100,
					}),
				},
			},
		};
	});

	await database.insert(schema.teams).values([
		{
			createdAt: "2025-07-10 10:17:51",
			player1Id: 1,
			player2Id: 3,
		},
		{
			createdAt: "2025-08-10 15:00:00",
			player1Id: 5,
			player2Id: 8,
		},
	]);

	await database.insert(schema.games).values([
		{
			team1Id: 1,
			team2Id: 2,
			team1Points: 15,
			team2Points: 7,
		},
		{
			team1Id: 1,
			team2Id: 2,
			team1Points: 8,
			team2Points: 15,
		},
	]);

	await database.insert(schema.gamePointAudios).values([
		{
			name: "attention.m4a",
			audioFile: halfSecondOfSilence,
		},
		{
			name: "zero.m4a",
			gamePoints: 0,
			audioFile: halfSecondOfSilence,
		},
		{
			name: "two.m4a",
			gamePoints: 2,
			audioFile: halfSecondOfSilence,
		},
		{
			name: "three.m4a",
			gamePoints: 3,
			audioFile: halfSecondOfSilence,
		},
		{
			name: "four.m4a",
			gamePoints: 4,
			audioFile: halfSecondOfSilence,
		},
		{
			name: "five.m4a",
			gamePoints: 5,
			audioFile: halfSecondOfSilence,
		},
		{
			name: "six.m4a",
			gamePoints: 6,
			audioFile: halfSecondOfSilence,
		},
		{
			name: "seven.m4a",
			gamePoints: 7,
			audioFile: halfSecondOfSilence,
		},
		{
			name: "eight.m4a",
			gamePoints: 8,
			audioFile: halfSecondOfSilence,
		},
		{
			name: "nine.m4a",
			gamePoints: 9,
			audioFile: halfSecondOfSilence,
		},
		{
			name: "ten.m4a",
			gamePoints: 10,
			audioFile: halfSecondOfSilence,
		},
		{
			name: "eleven.m4a",
			gamePoints: 11,
			audioFile: halfSecondOfSilence,
		},
		{
			name: "twelve.m4a",
			gamePoints: 12,
			audioFile: halfSecondOfSilence,
		},
		{
			name: "thirteen.m4a",
			gamePoints: 13,
			audioFile: halfSecondOfSilence,
		},
		{
			name: "fourteen.m4a",
			gamePoints: 14,
			audioFile: halfSecondOfSilence,
		},
		{
			name: "fifteen.m4a",
			gamePoints: 15,
			audioFile: halfSecondOfSilence,
		},
		{
			name: "sixteen.m4a",
			gamePoints: 16,
			audioFile: halfSecondOfSilence,
		},
		{
			name: "seventeen.m4a",
			gamePoints: 17,
			audioFile: halfSecondOfSilence,
		},
		{
			name: "eighteen.m4a",
			gamePoints: 18,
			audioFile: halfSecondOfSilence,
		},
		{
			name: "to.m4a",
			audioFile: halfSecondOfSilence,
		},
		{
			name: "stretched.m4a",
			audioFile: halfSecondOfSilence,
		},
		{
			name: "won.m4a",
			audioFile: halfSecondOfSilence,
		},
	]);
}
