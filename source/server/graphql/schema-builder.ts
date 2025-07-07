import SchemaBuilder from "@pothos/core";
import type { Game, Player, Team } from "../database/schema.ts";

export const schemaBuilder = new SchemaBuilder<{ Objects: { Player: Player; Team: Team; Game: Game } }>({});

export type SchemaBuilder = typeof schemaBuilder;
