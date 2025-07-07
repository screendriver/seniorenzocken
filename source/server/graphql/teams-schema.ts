import type { Player, Team } from "../database/schema.ts";

export function registerTeamSchema(
	schemaBuilder: PothosSchemaTypes.SchemaBuilder<
		PothosSchemaTypes.ExtendDefaultTypes<{ Objects: { Player: Player; Team: Team } }>
	>,
): void {
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
