import { defineConfig } from "drizzle-kit";

export default defineConfig({
	out: "./drizzle",
	schema: "./target/build/source/server/database/schema.js",
	dialect: "sqlite",
	casing: "snake_case",
	dbCredentials: {
		url: "file:database.sqlite",
	},
});
