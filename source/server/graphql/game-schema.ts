import type { SchemaBuilder } from "./schema-builder.ts";

export function registerGameSchema(schemaBuilder: SchemaBuilder): void {
	schemaBuilder.objectType("Game", {
		fields(fieldBuilder) {
			return {
				id: fieldBuilder.exposeInt("gameId"),
				datePlayed: fieldBuilder.exposeString("datePlayed"),
				team1Id: fieldBuilder.exposeInt("team1Id"),
				team2Id: fieldBuilder.exposeInt("team2Id"),
				team1Points: fieldBuilder.exposeInt("team1Points"),
				team2Points: fieldBuilder.exposeInt("team2Points"),
			};
		},
	});
}
