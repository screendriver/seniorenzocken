import PocketBase from "pocketbase";
import * as v from "valibot";

export function useMediaRecords() {
	const runtimeConfig = useRuntimeConfig();
	const pocketBase = new PocketBase(runtimeConfig.public.pocketBaseBaseUrl);

	async function fetchAttentionMediaRecords(): Promise<MediaRecords> {
		const records = await pocketBase.collection("media").getList(1, 1, {
			filter: 'name="attention"',
			fields: "collectionId,fileName,id,name",
		});

		return v.parse(mediaRecordsSchema, records);
	}

	return { fetchAttentionMediaRecords };
}
