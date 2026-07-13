import type { LibSQLDatabase } from "drizzle-orm/libsql";
import { drizzle } from "drizzle-orm/libsql/node";
import type { Client } from "@libsql/client";
import * as schema from "./raw-database-schema.js";

export type Database = LibSQLDatabase<typeof schema> & { readonly $client: Client };

export function createDatabase(relativeFilePath: string): Database {
	return drizzle(relativeFilePath, { casing: "snake_case", schema });
}
