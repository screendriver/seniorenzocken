import { defineConfig } from "drizzle-kit";

export default defineConfig({
	out: "./drizzle",
	schema: "./source/server/database/schema.ts",
	dialect: "sqlite",
	dbCredentials: {
		url: "./database.sqlite",
	},
});
