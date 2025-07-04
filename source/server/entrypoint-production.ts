import { createDatabase } from "./database/database.ts";
import { createServer } from "./server.ts";

createDatabase("file:database.sqlite");

createServer({
	cors: {
		origin: "https://www.seniorenzocken.net",
		methods: ["POST"],
	},
});
