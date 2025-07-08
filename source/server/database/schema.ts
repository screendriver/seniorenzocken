import type { InferSelectModel } from "drizzle-orm";
import { int, sqliteTable, text, unique, index } from "drizzle-orm/sqlite-core";

export const players = sqliteTable("players", {
	playerId: int().primaryKey({ autoIncrement: true }),
	firstName: text().notNull(),
	lastName: text().notNull(),
	nickname: text().notNull().unique(),
	totalPoints: int().notNull().default(0),
	totalGameRounds: int().notNull().default(0),
});

export type Player = InferSelectModel<typeof players>;

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

export type Team = InferSelectModel<typeof teams>;

export const games = sqliteTable("games", {
	gameId: int().primaryKey({ autoIncrement: true }),
	dateTimePlayed: text().notNull(),
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

export type Game = InferSelectModel<typeof games>;

export const gamePointAudios = sqliteTable(
	"game_point_audios",
	{
		gamePointAudioId: int().primaryKey({ autoIncrement: true }),
		name: text().notNull(),
		gamePoints: int().notNull(),
		fileName: text().notNull(),
	},
	(table) => {
		return [index("name_index").on(table.name)];
	},
);

export type GamePointAudio = InferSelectModel<typeof gamePointAudios>;
