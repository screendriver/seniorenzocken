import { type InferSelectModel, sql } from "drizzle-orm";
import { int, sqliteTable, text, unique, index, blob } from "drizzle-orm/sqlite-core";

const timestamps = {
	createdAt: text()
		.notNull()
		.default(sql`(current_timestamp)`)
};

export const players = sqliteTable("players", {
	playerId: int().primaryKey({ autoIncrement: true }),
	firstName: text().notNull(),
	lastName: text().notNull(),
	nickname: text().notNull().unique(),
	totalPoints: int().notNull().default(0),
	totalGamesCount: int().notNull().default(0),
	...timestamps
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
		...timestamps
	},
	(table) => {
		return [unique().on(table.player1Id, table.player2Id)];
	}
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
	...timestamps
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
				"gspandt.m4a",
				"won.m4a",
				"to.m4a",
				"turn_around.m4a",
				"der_is_guad.m4a",
				"der_war_deier.m4a",
				"des_is_a_lauf.m4a",
				"do_legst_di_nida.m4a",
				"do_sagst_nix_ma.m4a",
				"gehts_a_oder_gehts_a.m4a",
				"kimmt_da_no_woas.m4a",
				"machst_du_no_a_stich.m4a",
				"sama_gspandt.m4a",
				"seids_eigschlafa.m4a",
				"spuilts_lieber_uno.m4a",
				"was_isn_ogsogt.m4a"
			]
		}).notNull(),
		gamePoints: int(),
		audioFile: blob({ mode: "buffer" }).notNull(),
		...timestamps
	},
	(table) => {
		return [index("name_index").on(table.name)];
	}
);

export type GamePointAudio = InferSelectModel<typeof gamePointAudios>;

export const userSessions = sqliteTable("user_sessions", {
	sessionId: int().primaryKey({ autoIncrement: true }),
	token: text().notNull().unique(),
	ipAddress: text(),
	userAgent: text(),
	...timestamps
});

export type UserSession = InferSelectModel<typeof userSessions>;

export const gameSessions = sqliteTable("game_sessions", {
	sessionId: int().primaryKey({ autoIncrement: true }),
	userSessionId: int()
		.notNull()
		.references(
			() => {
				return userSessions.sessionId;
			},
			{ onDelete: "cascade" }
		),
	team1Player1Id: int()
		.notNull()
		.references(() => {
			return players.playerId;
		}),
	team1Player2Id: int()
		.notNull()
		.references(() => {
			return players.playerId;
		}),
	team2Player1Id: int()
		.notNull()
		.references(() => {
			return players.playerId;
		}),
	team2Player2Id: int()
		.notNull()
		.references(() => {
			return players.playerId;
		}),
	state: text({ enum: ["active", "completed"] }).notNull(),
	...timestamps
});

export type GameSession = InferSelectModel<typeof gameSessions>;

export const gameRoundHistorySessions = sqliteTable(
	"game_round_history_sessions",
	{
		gameRoundHistoryId: int().primaryKey({ autoIncrement: true }),
		gameSessionId: int()
			.notNull()
			.references(
				() => {
					return gameSessions.sessionId;
				},
				{ onDelete: "cascade" }
			),
		roundNumber: int().notNull(),
		team1Points: int().notNull(),
		team2Points: int().notNull(),
		...timestamps
	},
	(table) => {
		return [
			index("game_session_id_index").on(table.gameSessionId),
			index("round_number_index").on(table.roundNumber)
		];
	}
);
