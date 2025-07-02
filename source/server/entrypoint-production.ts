import { createServer } from "./server.ts";

createServer({
	cors: {
		origin: "https://www.seniorenzocken.net",
		methods: ["POST"],
	},
});
