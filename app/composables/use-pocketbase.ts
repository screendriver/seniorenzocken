import type { RecordModel } from "pocketbase";
import { isUndefined } from "@sindresorhus/is";

type UsePocketBase = {
	readonly fetchAllMediaRecords: () => Promise<readonly RecordModel[]>;
};

export function usePocketBase(): UsePocketBase {
	const pocketBase = inject(pocketBaseInjectionKey);

	return {
		fetchAllMediaRecords: () => {
			if (isUndefined(pocketBase)) {
				throw new Error("No PocketBase instance provided");
			}

			return pocketBase.collection("media").getFullList(undefined, {
				fields: "collectionId,fileName,id,name,gamePoints",
			});
		},
	};
}
