import PocketBase from "pocketbase";
import * as v from "valibot";

export function useMediaRecords() {
	const mediaRecords = ref<MediaRecords>([]);
	const runtimeConfig = useRuntimeConfig();

	async function fetchFullList() {
		const pb = new PocketBase(runtimeConfig.public.pocketbaseBaseUrl);

		const records = await pb.collection("media").getFullList();
		mediaRecords.value = v.parse(mediaRecordsSchema, records);
	}

	return { fetchFullList };
}
