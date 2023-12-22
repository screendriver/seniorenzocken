import { error, json } from "@sveltejs/kit";
import Maybe from "true-myth/maybe";
import sample from "lodash.sample";
import { safeParse } from "valibot";
import { consola } from "consola/basic";
import type { RequestHandler } from "./$types";
import { createPlaylist } from "./playlist";
import { includeStretchedQueryStringSchema, teamsQueryStringSchema } from "./query-string-schema";

const baseUrl = new URL("https://media.seniorenzocken.net");

export const GET: RequestHandler = async ({ platform, url }) => {
	const includeStretchedFromSearchParameters = url.searchParams.get("includeStretched");
	const teamsFromSearchParameters = Maybe.of(url.searchParams.get("teams"));
	const includeStretchedParseResult = safeParse(
		includeStretchedQueryStringSchema,
		includeStretchedFromSearchParameters,
	);
	const teamsParseResult = teamsFromSearchParameters.map((teamsFromSearchParametersValue) => {
		return safeParse(teamsQueryStringSchema, JSON.parse(teamsFromSearchParametersValue));
	});

	if (!includeStretchedParseResult.success || teamsParseResult.isNothing || !teamsParseResult.value.success) {
		consola.error("Parsing of query string parameters failed");
		error(400);
	}

	const mediaBucket = Maybe.of(platform?.env?.MEDIA_BUCKET);

	if (mediaBucket.isNothing) {
		consola.error("Media bucket could not be found");
		error(500);
	}

	const playlistResult = await createPlaylist(
		{
			randomCollectionElement: sample,
		},
		{
			baseUrl,
			mediaBucket: mediaBucket.value,
			teams: teamsParseResult.value.output,
			includeStretched: includeStretchedParseResult.output,
		},
	);

	return playlistResult.match({
		Err(errorObject) {
			consola.error("Playlist could not be created:", errorObject.message);
			error(500);
		},
		Ok(playlist) {
			return json(playlist);
		},
	});
};
