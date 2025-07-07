import type { Database } from "../database/database.ts";
import { players, teams, games } from "../database/schema.ts";
import { registerPlayerSchema } from "./player-schema.ts";
import { registerTeamSchema } from "./teams-schema.ts";
import { registerGameSchema } from "./game-schema.ts";
import { schemaBuilder } from "./schema-builder.ts";

export function createGraphQLServerSchema(database: Database) {
	registerPlayerSchema(schemaBuilder);
	registerTeamSchema(schemaBuilder);
	registerGameSchema(schemaBuilder);

	schemaBuilder.queryType({
		fields(fieldBuilder) {
			return {
				players: fieldBuilder.field({
					type: ["Player"],
					resolve() {
						return database.select().from(players).orderBy(players.nickname).all();
					},
				}),
			};
		},
	});

	schemaBuilder.queryType({
		fields(fieldBuilder) {
			return {
				teams: fieldBuilder.field({
					type: ["Team"],
					resolve() {
						return database.select().from(teams).all();
					},
				}),
			};
		},
	});

	schemaBuilder.queryType({
		fields(fieldBuilder) {
			return {
				games: fieldBuilder.field({
					type: ["Game"],
					resolve() {
						return database.select().from(games).all();
					},
				}),
			};
		},
	});

	return schemaBuilder.toSchema();
}
