import type { LibSQLDatabase } from "drizzle-orm/libsql";
import { drizzle } from "drizzle-orm/libsql/node";

export function createDatabase(relativeFilePath: string): LibSQLDatabase<Record<string, never>> {
	return drizzle(relativeFilePath, { casing: "snake_case" });
}
