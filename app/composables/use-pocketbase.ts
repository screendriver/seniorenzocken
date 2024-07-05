import PocketBase from "pocketbase";
import * as v from "valibot";

export function useMediaRecords() {
	const runtimeConfig = useRuntimeConfig();

	async function fetchFullList() {
		const pb = new PocketBase(runtimeConfig.public.pocketbaseBaseUrl);

		const records = await pb.collection("media").getFullList();
		return v.parse(mediaRecordsSchema, records);
	}

	return { fetchFullList };
}
