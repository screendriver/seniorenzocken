import type { SchemaBuilder } from "./schema-builder.ts";

export function registerPlayerSchema(schemaBuilder: SchemaBuilder): void {
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
