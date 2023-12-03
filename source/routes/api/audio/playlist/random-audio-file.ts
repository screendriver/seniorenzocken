import Result from "true-myth/result";
import Maybe from "true-myth/maybe";
import type sample from "lodash.sample";

export type FindAudioFileWithPrefixDependencies = {
	readonly mediaBucket: R2Bucket;
	readonly randomCollectionElement: typeof sample;
};

export type FindAudioFileWithPrefixOptions = {
	readonly prefix: "attention" | "zero";
	readonly baseUrl: URL;
};

export async function findRandomAudioFileWithPrefix(
	dependencies: FindAudioFileWithPrefixDependencies,
	options: FindAudioFileWithPrefixOptions,
): Promise<Result<URL, Error>> {
	const { mediaBucket, randomCollectionElement } = dependencies;
	const { prefix, baseUrl } = options;

	try {
		const allAudioFileObjects = await mediaBucket.list({ prefix });
		const randomAudioFileObject = Maybe.of(randomCollectionElement(allAudioFileObjects.objects));

		return randomAudioFileObject.mapOr(
			Result.err(new Error("No audio file found")),
			(randomAttentionAudioFileValue) => {
				const fullUrl = new URL(randomAttentionAudioFileValue.key, baseUrl);

				return Result.ok(fullUrl);
			},
		);
	} catch (error: unknown) {
		if (error instanceof Error) {
			return Result.err(error);
		}

		return Result.err(new Error("An unknown error occurred"));
	}
}
