import { isEmptyArray } from "@sindresorhus/is";

function hasEverySelectedPlayerAnId(selectedPlayerIds: readonly number[]): boolean {
	return selectedPlayerIds.every((selectedPlayerId) => {
		return selectedPlayerId > -1;
	});
}

export function areSelectedPlayerIdsValid(selectedPlayerIds: readonly number[]): boolean {
	if (isEmptyArray(selectedPlayerIds)) {
		return false;
	}

	if (!hasEverySelectedPlayerAnId(selectedPlayerIds)) {
		return false;
	}

	const uniqueSelectedPlayerIds = new Set(selectedPlayerIds);

	return uniqueSelectedPlayerIds.size === selectedPlayerIds.length;
}
