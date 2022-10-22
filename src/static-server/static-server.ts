import getPort from "get-port";
import createFastify from "fastify";
import fastifyCors from "@fastify/cors";
import fastifyStatic from "@fastify/static";
import * as url from "node:url";
import path from "node:path";

const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

export async function startStaticServer(): Promise<string> {
	const fastify = createFastify();

	try {
		await fastify.register(fastifyCors);
		await fastify.register(fastifyStatic, {
			root: path.join(__dirname, "assets")
		});

		const availablePort = await getPort();
		const listeningAddress = await fastify.listen({ port: availablePort });

		return listeningAddress;
	} catch (error: unknown) {
		fastify.log.error(error);
		throw error;
	}
}
