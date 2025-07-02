export type Player = {
	readonly firstName: string;
	readonly lastName: string;
	readonly nickname: string;
	readonly totalGamePoints: number;
	readonly totalGameRounds: number;
};

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
				totalGamePoints: fieldBuilder.exposeInt("totalGamePoints"),
				totalGameRounds: fieldBuilder.exposeInt("totalGameRounds"),
			};
		},
	});
}
