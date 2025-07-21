import { type InferSelectModel, sql } from "drizzle-orm";
import { int, sqliteTable, text, unique, index, blob } from "drizzle-orm/sqlite-core";

const timestamps = {
	createdAt: text()
		.notNull()
		.default(sql`(current_timestamp)`),
};

export const players = sqliteTable("players", {
	playerId: int().primaryKey({ autoIncrement: true }),
	firstName: text().notNull(),
	lastName: text().notNull(),
	nickname: text().notNull().unique(),
	totalPoints: int().notNull().default(0),
	totalGamesCount: int().notNull().default(0),
	...timestamps,
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
		...timestamps,
	},
	(table) => {
		return [unique().on(table.player1Id, table.player2Id)];
	},
);

export type Team = InferSelectModel<typeof teams>;

export const games = sqliteTable("games", {
	gameId: int().primaryKey({ autoIncrement: true }),
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
	...timestamps,
});

export type Game = InferSelectModel<typeof games>;

export const gamePointAudios = sqliteTable(
	"game_point_audios",
	{
		gamePointAudioId: int().primaryKey({ autoIncrement: true }),
		name: text({
			enum: [
				"attention.m4a",
				"zero.m4a",
				"two.m4a",
				"three.m4a",
				"four.m4a",
				"five.m4a",
				"six.m4a",
				"seven.m4a",
				"eight.m4a",
				"nine.m4a",
				"ten.m4a",
				"eleven.m4a",
				"thirteen.m4a",
				"fourteen.m4a",
				"fifteen.m4a",
				"sixteen.m4a",
				"seventeen.m4a",
				"eighteen.m4a",
				"twelve.m4a",
				"stretched.m4a",
				"won.m4a",
				"to.m4a",
				"turn_around.m4a",
			],
		}).notNull(),
		gamePoints: int(),
		audioFile: blob({ mode: "buffer" }).notNull(),
		...timestamps,
	},
	(table) => {
		return [index("name_index").on(table.name)];
	},
);

export type GamePointAudio = InferSelectModel<typeof gamePointAudios>;
