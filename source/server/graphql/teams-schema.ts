import type { SchemaBuilder } from "./schema-builder.ts";

export function registerTeamSchema(schemaBuilder: SchemaBuilder): void {
	schemaBuilder.objectType("Team", {
		fields(fieldBuilder) {
			return {
				id: fieldBuilder.exposeInt("teamId"),
				player1Id: fieldBuilder.exposeInt("player1Id"),
				player2Id: fieldBuilder.exposeInt("player2Id"),
			};
		},
	});
}
