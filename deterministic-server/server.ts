import createFastify from "fastify";
import cors from "@fastify/cors";
import { createPocketbaseRoutes } from "./routes/pocketbase";

const fastify = createFastify({
	disableRequestLogging: true,
	logger: true,
});

await fastify.register(cors);

fastify.get("/", () => {
	return "Deterministic server is working";
});

const pocketbaseRoutes = createPocketbaseRoutes();

pocketbaseRoutes.forEach((route) => {
	fastify.route(route);
});

try {
	await fastify.listen({ port: 8081 });
} catch (error: unknown) {
	fastify.log.error(error);
	process.exit(1);
}
