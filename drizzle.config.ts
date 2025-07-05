import { defineConfig } from "drizzle-kit";

export default defineConfig({
	out: "./drizzle",
	schema: "./source/server/database/schema.ts",
	dialect: "sqlite",
	casing: "snake_case",
	dbCredentials: {
		url: "./database.sqlite",
	},
});
