import getPort from "get-port";
import createFastify from "fastify";
import type { RequestGenericInterface } from "fastify";
import fastifyCors from "@fastify/cors";
import fastifyStatic from "@fastify/static";
import path from "node:path";
import process from "node:process";

type AssetRequest = RequestGenericInterface & {
	readonly Params: {
		readonly asset: string;
	};
};

export async function startStaticServer(): Promise<string> {
	const fastify = createFastify();

	try {
		await fastify.register(fastifyCors);
		await fastify.register(fastifyStatic, {
			root: path.join(process.cwd(), "source", "static-server", "assets"),
		});

		fastify.get<AssetRequest>("/seniorenzocken/:transformation/:asset", (request, reply) => {
			const { asset } = request.params;

			return reply.sendFile(asset);
		});

		fastify.get("/api/audio/playlist", (_request, reply) => {
			return reply.send([]);
		});

		const availablePort = await getPort();
		const listeningAddress = await fastify.listen({ host: "127.0.0.1", port: availablePort });

		return listeningAddress;
	} catch (error: unknown) {
		fastify.log.error(error);
		throw error;
	}
}
