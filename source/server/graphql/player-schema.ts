import type { Player } from "../database/schema.ts";

export function registerPlayerSchema(
	schemaBuilder: PothosSchemaTypes.SchemaBuilder<
		PothosSchemaTypes.ExtendDefaultTypes<{ Objects: { Player: Player } }>
	>,
): void {
	schemaBuilder.objectType("Player", {
		fields(fieldBuilder) {
			return {
				firstName: fieldBuilder.exposeString("firstName"),
				lastName: fieldBuilder.exposeString("lastName"),
				nickname: fieldBuilder.exposeString("nickname"),
				totalPoints: fieldBuilder.exposeInt("totalPoints"),
				totalGameRounds: fieldBuilder.exposeInt("totalGameRounds"),
			};
		},
	});
}
