import { writable, type Writable } from "svelte/store";
import { z } from "zod";
import Maybe from "true-myth/maybe";

const teamSchema = z.boolean();

const storageKey = "is-game-started";

function mapIsGameStartedFromStorage(isGameStartedFromStorage: string): boolean {
	try {
		return teamSchema.parse(JSON.parse(isGameStartedFromStorage));
	} catch {
		return false;
	}
}

export function createIsGameStartedStore(storage: Storage): Writable<boolean> {
	const initialStoreValue = Maybe.of(storage.getItem(storageKey)).mapOr(false, mapIsGameStartedFromStorage);

	const { set, subscribe, update } = writable(initialStoreValue);

	subscribe((isGameStarted) => {
		const isGameStartedAsString = JSON.stringify(isGameStarted);

		storage.setItem(storageKey, isGameStartedAsString);
	});

	return {
		set,
		subscribe,
		update
	};
}
