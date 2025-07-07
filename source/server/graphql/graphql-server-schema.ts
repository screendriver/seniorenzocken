import SchemaBuilder from "@pothos/core";
import type { Database } from "../database/database.ts";
import { registerPlayerSchema } from "./player-schema.ts";
import { type Player, players } from "../database/schema.ts";

const builder = new SchemaBuilder<{ Objects: { Player: Player } }>({});

export function createGraphQLServerSchema(database: Database) {
	registerPlayerSchema(builder);

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

	return builder.toSchema();
}
