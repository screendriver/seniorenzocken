import { readFile } from "node:fs/promises";

type ReadUtf8File = (secretFilePath: string, encoding: "utf8") => Promise<string>;

async function readSecretFile(secretFilePath: string, readUtf8File: ReadUtf8File): Promise<string> {
	try {
		return await readUtf8File(secretFilePath, "utf8");
	} catch {
		throw new Error(`Could not read required secret file "${secretFilePath}"`);
	}
}

export async function readRequiredSecret(
	secretFilePath: string,
	readUtf8File: ReadUtf8File = readFile
): Promise<string> {
	const secretValue = await readSecretFile(secretFilePath, readUtf8File);

	if (secretValue.length === 0) {
		throw new Error(`Required secret file "${secretFilePath}" is empty`);
	}

	return secretValue;
}
