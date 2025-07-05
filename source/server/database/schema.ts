import type { InferInsertModel } from "drizzle-orm";
import { int, sqliteTable, text, unique } from "drizzle-orm/sqlite-core";

export const players = sqliteTable("players", {
	playerId: int().primaryKey({ autoIncrement: true }),
	firstName: text().notNull(),
	lastName: text().notNull(),
	nickname: text().notNull().unique(),
	totalPoints: int().notNull().default(0),
	totalGameRounds: int().notNull().default(0),
});

export type InsertPlayer = InferInsertModel<typeof players>;

export const teams = sqliteTable(
	"teams",
	{
		teamId: int().primaryKey({ autoIncrement: true }),
		player1Id: int()
			.notNull()
			.references(() => {
				return players.playerId;
			}),
		player2Id: int()
			.notNull()
			.references(() => {
				return players.playerId;
			}),
	},
	(table) => {
		return [unique().on(table.player1Id, table.player2Id)];
	},
);

export const games = sqliteTable("games", {
	gameId: int().primaryKey({ autoIncrement: true }),
	datePlayed: text().notNull().default(new Date().toISOString()),
	team1Id: int()
		.notNull()
		.references(() => {
			return teams.teamId;
		}),
	team2Id: int()
		.notNull()
		.references(() => {
			return teams.teamId;
		}),
	team1Points: int().notNull(),
	team2Points: int().notNull(),
});
