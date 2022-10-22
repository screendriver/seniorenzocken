import { createServer } from "vite";
import os from "node:os";
import { writeFile, rm } from "node:fs/promises";
import { startStaticServer } from "./static-server/static-server";

const envFilePath = "./.env";

const staticServerListeningAddress = await startStaticServer();

console.info("Static server listening on", staticServerListeningAddress);

await writeFile(envFilePath, `VITE_IMAGEKIT_BASE_URL=${staticServerListeningAddress}${os.EOL}`, { encoding: "utf-8" });

process.on("SIGINT", () => {
	rm(envFilePath)
		.then(() => {
			console.info(envFilePath, "deleted");
			process.exit();
		})
		.catch(() => {
			console.info(envFilePath, "could not be deleted!");
			process.exit(1);
		});
});

const viteServer = await createServer();
await viteServer.listen();
viteServer.printUrls();
