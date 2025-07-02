import type { Ref } from "vue";
import type PocketBase from "pocketbase";
import type { RecordModel } from "pocketbase";
import { isUndefined } from "@sindresorhus/is";

type UsePocketBase = {
	readonly fetchAllMediaRecords: () => Promise<readonly RecordModel[]>;
};

export function usePocketBase(pocketBase: Ref<PocketBase | undefined>): UsePocketBase {
	return {
		fetchAllMediaRecords: () => {
			if (isUndefined(pocketBase.value)) {
				throw new Error("No PocketBase instance provided");
			}

			return pocketBase.value.collection("media").getFullList(undefined, {
				fields: "collectionId,fileName,id,name,gamePoints",
			});
		},
	};
}
