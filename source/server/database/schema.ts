import type { InferInsertModel } from "drizzle-orm";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const players = sqliteTable("players", {
	id: int().primaryKey({ autoIncrement: true }),
	firstName: text().notNull(),
	lastName: text().notNull(),
	nickname: text().notNull().unique(),
	totalGamePoints: int().notNull().default(0),
	totalGameRounds: int().notNull().default(0),
});

export type InsertPlayer = InferInsertModel<typeof players>;
