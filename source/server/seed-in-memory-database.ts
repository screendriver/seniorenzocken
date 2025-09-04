import { seed } from "drizzle-seed";
import type { Client } from "@libsql/client";
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import * as schema from "./database/schema.js";

const oneHundredMillisecondsOfSilence = Buffer.from(
	"AAAAHGZ0eXBNNEEgAAACAE00QSBpc29taXNvMgAAAAhmcmVlAAAAPW1kYXTeAgBMYXZjNjAuMzEuMTAyAEIgCMEYOCEQBGCMHCEQBGCMHCEQBGCMHCEQBGCMHCEQBGCMHAAAAxNtb292AAAAbG12aGQAAAAAAAAAAAAAAAAAAAPoAAAAZAABAAABAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAACPXRyYWsAAABcdGtoZAAAAAMAAAAAAAAAAAAAAAEAAAAAAAAAZAAAAAAAAAAAAAAAAQEAAAAAAQAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAACRlZHRzAAAAHGVsc3QAAAAAAAAAAQAAAGQAAAQAAAEAAAAAAbVtZGlhAAAAIG1kaGQAAAAAAAAAAAAAAAAAAKxEAAAVOlXEAAAAAAAtaGRscgAAAAAAAAAAc291bgAAAAAAAAAAAAAAAFNvdW5kSGFuZGxlcgAAAAFgbWluZgAAABBzbWhkAAAAAAAAAAAAAAAkZGluZgAAABxkcmVmAAAAAAAAAAEAAAAMdXJsIAAAAAEAAAEkc3RibAAAAGpzdHNkAAAAAAAAAAEAAABabXA0YQAAAAAAAAABAAAAAAAAAAAAAgAQAAAAAKxEAAAAAAA2ZXNkcwAAAAADgICAJQABAASAgIAXQBUAAAAAAfQAAAANcQWAgIAFEhBW5QAGgICAAQIAAAAgc3R0cwAAAAAAAAACAAAABQAABAAAAAABAAABOgAAABxzdHNjAAAAAAAAAAEAAAABAAAABgAAAAEAAAAsc3RzegAAAAAAAAAAAAAABgAAABcAAAAGAAAABgAAAAYAAAAGAAAABgAAABRzdGNvAAAAAAAAAAEAAAAsAAAAGnNncGQBAAAAcm9sbAAAAAIAAAAB//8AAAAcc2JncAAAAAByb2xsAAAAAQAAAAYAAAABAAAAYnVkdGEAAABabWV0YQAAAAAAAAAhaGRscgAAAAAAAAAAbWRpcmFwcGwAAAAAAAAAAAAAAAAtaWxzdAAAACWpdG9vAAAAHWRhdGEAAAABAAAAAExhdmY2MC4xNi4xMDA=",
	"base64"
);

const seedNumber = 42;

export async function seedInMemoryDatabase(
	database: LibSQLDatabase<typeof schema> & { $client: Client }
): Promise<void> {
	// @ts-expect-error currently a bug in drizzle-seed
	await seed(database, { players: schema.players }, { seed: seedNumber }).refine((drizzleSeed) => {
		return {
			players: {
				count: 8,
				columns: {
					firstName: drizzleSeed.firstName(),
					totalPoints: drizzleSeed.int({
						minValue: 0,
						maxValue: 100
					}),
					totalGamesCount: drizzleSeed.int({
						minValue: 0,
						maxValue: 100
					})
				}
			}
		};
	});

	await database.insert(schema.teams).values([
		{
			createdAt: "2025-07-10 10:17:51",
			player1Id: 1,
			player2Id: 3
		},
		{
			createdAt: "2025-08-10 15:00:00",
			player1Id: 5,
			player2Id: 8
		}
	]);

	await database.insert(schema.games).values([
		{
			team1Id: 1,
			team2Id: 2,
			team1Points: 15,
			team2Points: 7
		},
		{
			team1Id: 1,
			team2Id: 2,
			team1Points: 8,
			team2Points: 15
		}
	]);

	await database.insert(schema.gamePointAudios).values([
		{
			name: "turn_around.m4a",
			audioFile: oneHundredMillisecondsOfSilence
		},
		{
			name: "attention.m4a",
			audioFile: oneHundredMillisecondsOfSilence
		},
		{
			name: "zero.m4a",
			gamePoints: 0,
			audioFile: oneHundredMillisecondsOfSilence
		},
		{
			name: "two.m4a",
			gamePoints: 2,
			audioFile: oneHundredMillisecondsOfSilence
		},
		{
			name: "three.m4a",
			gamePoints: 3,
			audioFile: oneHundredMillisecondsOfSilence
		},
		{
			name: "four.m4a",
			gamePoints: 4,
			audioFile: oneHundredMillisecondsOfSilence
		},
		{
			name: "five.m4a",
			gamePoints: 5,
			audioFile: oneHundredMillisecondsOfSilence
		},
		{
			name: "six.m4a",
			gamePoints: 6,
			audioFile: oneHundredMillisecondsOfSilence
		},
		{
			name: "seven.m4a",
			gamePoints: 7,
			audioFile: oneHundredMillisecondsOfSilence
		},
		{
			name: "eight.m4a",
			gamePoints: 8,
			audioFile: oneHundredMillisecondsOfSilence
		},
		{
			name: "nine.m4a",
			gamePoints: 9,
			audioFile: oneHundredMillisecondsOfSilence
		},
		{
			name: "ten.m4a",
			gamePoints: 10,
			audioFile: oneHundredMillisecondsOfSilence
		},
		{
			name: "eleven.m4a",
			gamePoints: 11,
			audioFile: oneHundredMillisecondsOfSilence
		},
		{
			name: "twelve.m4a",
			gamePoints: 12,
			audioFile: oneHundredMillisecondsOfSilence
		},
		{
			name: "thirteen.m4a",
			gamePoints: 13,
			audioFile: oneHundredMillisecondsOfSilence
		},
		{
			name: "fourteen.m4a",
			gamePoints: 14,
			audioFile: oneHundredMillisecondsOfSilence
		},
		{
			name: "fifteen.m4a",
			gamePoints: 15,
			audioFile: oneHundredMillisecondsOfSilence
		},
		{
			name: "sixteen.m4a",
			gamePoints: 16,
			audioFile: oneHundredMillisecondsOfSilence
		},
		{
			name: "seventeen.m4a",
			gamePoints: 17,
			audioFile: oneHundredMillisecondsOfSilence
		},
		{
			name: "eighteen.m4a",
			gamePoints: 18,
			audioFile: oneHundredMillisecondsOfSilence
		},
		{
			name: "to.m4a",
			audioFile: oneHundredMillisecondsOfSilence
		},
		{
			name: "gspandt.m4a",
			audioFile: oneHundredMillisecondsOfSilence
		},
		{
			name: "won.m4a",
			audioFile: oneHundredMillisecondsOfSilence
		},
		{
			name: "der_is_guad.m4a",
			audioFile: oneHundredMillisecondsOfSilence
		},
		{
			name: "der_war_deier.m4a",
			audioFile: oneHundredMillisecondsOfSilence
		},
		{
			name: "des_is_a_lauf.m4a",
			audioFile: oneHundredMillisecondsOfSilence
		},
		{
			name: "do_legst_di_nida.m4a",
			audioFile: oneHundredMillisecondsOfSilence
		},
		{
			name: "do_sagst_nix_ma.m4a",
			audioFile: oneHundredMillisecondsOfSilence
		},
		{
			name: "gehts_a_oder_gehts_a.m4a",
			audioFile: oneHundredMillisecondsOfSilence
		},
		{
			name: "kimmt_da_no_woas.m4a",
			audioFile: oneHundredMillisecondsOfSilence
		},
		{
			name: "machst_du_no_a_stich.m4a",
			audioFile: oneHundredMillisecondsOfSilence
		},
		{
			name: "sama_gspandt.m4a",
			audioFile: oneHundredMillisecondsOfSilence
		},
		{
			name: "seids_eigschlafa.m4a",
			audioFile: oneHundredMillisecondsOfSilence
		},
		{
			name: "spuilts_lieber_uno.m4a",
			audioFile: oneHundredMillisecondsOfSilence
		},
		{
			name: "was_isn_ogsogt.m4a",
			audioFile: oneHundredMillisecondsOfSilence
		}
	]);
}
