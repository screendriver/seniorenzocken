import { writeFile, appendFile } from "node:fs/promises";
import { rmSync } from "node:fs";
import { EOL } from "node:os";
import { createServer } from "vite";
import { consola } from "consola";
import { startStaticServer } from "./static-server/static-server";

const staticServerListeningAddress = await startStaticServer();

consola.info("Static server listening on", staticServerListeningAddress);

const environmentFileName = ".env.local";

await writeFile(environmentFileName, `VITE_IMAGEKIT_BASE_URL=${staticServerListeningAddress}`);
await appendFile(environmentFileName, EOL);
await appendFile(environmentFileName, `VITE_API_ROUTE_BASE_URL=${staticServerListeningAddress}`);
await appendFile(environmentFileName, EOL);
await appendFile(environmentFileName, `VITE_MEDIA_ASSETS_BASE_URL=${staticServerListeningAddress}`);

const viteServer = await createServer();

await viteServer.listen(3000);

viteServer.printUrls();

process.on("SIGINT", () => {
	viteServer
		.close()
		.then(() => {
			rmSync(environmentFileName);
			process.exit();
		})
		.catch(() => {
			process.exit();
		});
});
