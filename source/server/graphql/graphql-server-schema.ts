import SchemaBuilder from "@pothos/core";
import { type Player, registerPlayerSchema } from "./player-schema.ts";

const builder = new SchemaBuilder<{ Objects: { Player: Player } }>({});

registerPlayerSchema(builder);

builder.queryType({
	fields(fieldBuilder) {
		return {
			players: fieldBuilder.field({
				type: ["Player"],
				resolve() {
					return [
						{
							firstName: "John",
							lastName: "Doe",
							nickname: "JohnDoe",
							totalGamePoints: 0,
							totalGameRounds: 0,
						},
					];
				},
			}),
		};
	},
});

export const schema = builder.toSchema();
