import type { Player, Team } from "../database/schema.ts";

export function registerPlayerSchema(
	schemaBuilder: PothosSchemaTypes.SchemaBuilder<
		PothosSchemaTypes.ExtendDefaultTypes<{ Objects: { Player: Player; Team: Team } }>
	>,
): void {
	schemaBuilder.objectType("Player", {
		fields(fieldBuilder) {
			return {
				id: fieldBuilder.exposeInt("playerId"),
				firstName: fieldBuilder.exposeString("firstName"),
				lastName: fieldBuilder.exposeString("lastName"),
				nickname: fieldBuilder.exposeString("nickname"),
				totalPoints: fieldBuilder.exposeInt("totalPoints"),
				totalGameRounds: fieldBuilder.exposeInt("totalGameRounds"),
			};
		},
	});
}
