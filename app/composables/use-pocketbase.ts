import PocketBase from "pocketbase";
import * as v from "valibot";

export function useMediaRecords() {
	const runtimeConfig = useRuntimeConfig();
	const pocketBase = new PocketBase(runtimeConfig.public.pocketBaseBaseUrl);

	async function fetchAttentionMediaRecords(): Promise<MediaRecords> {
		const records = await pocketBase.collection("media").getFullList({
			filter: 'name = "attention"',
		});

		return v.parse(mediaRecordsSchema, records);
	}

	return { fetchAttentionMediaRecords };
}
