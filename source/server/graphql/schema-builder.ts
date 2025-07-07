import SchemaBuilder from "@pothos/core";
import { DateTimeResolver } from "graphql-scalars";
import type { Game, Player, Team } from "../database/schema.ts";

export const schemaBuilder = new SchemaBuilder<{
	Scalars: {
		DateTime: {
			Input: Date | string;
			Output: Date | string;
		};
	};
	Objects: { Player: Player; Team: Team; Game: Game };
}>({});

schemaBuilder.addScalarType("DateTime", DateTimeResolver);

export type SchemaBuilder = typeof schemaBuilder;
