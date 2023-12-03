import { writeFile, appendFile, rm } from "node:fs/promises";
import { EOL } from "node:os";
import { build, preview } from "vite";
import { consola } from "consola";
import { startStaticServer } from "./static-server/static-server";

const staticServerListeningAddress = await startStaticServer();

consola.info("Static server listening on", staticServerListeningAddress);

const environmentFileName = ".env.local";

await writeFile(environmentFileName, `VITE_IMAGEKIT_BASE_URL=${staticServerListeningAddress}`);
await appendFile(environmentFileName, EOL);
await appendFile(environmentFileName, `VITE_API_ROUTE_BASE_URL=${staticServerListeningAddress}`);

await build({
	mode: "testing",
});

await rm(environmentFileName);

const viteServer = await preview({
	preview: {
		port: 4173,
		strictPort: true,
		open: false,
	},
});

viteServer.printUrls();
