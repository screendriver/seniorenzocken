import SchemaBuilder from "@pothos/core";
import type { Database } from "../database/database.ts";
import { registerPlayerSchema } from "./player-schema.ts";
import { type Player, players, type Team, teams } from "../database/schema.ts";
import { registerTeamSchema } from "./teams-schema.ts";

const builder = new SchemaBuilder<{ Objects: { Player: Player; Team: Team } }>({});

export function createGraphQLServerSchema(database: Database) {
	registerPlayerSchema(builder);
	registerTeamSchema(builder);

	builder.queryType({
		fields(fieldBuilder) {
			return {
				players: fieldBuilder.field({
					type: ["Player"],
					resolve() {
						return database.select().from(players).all();
					},
				}),
			};
		},
	});

	builder.queryType({
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

	return builder.toSchema();
}
