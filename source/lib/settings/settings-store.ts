import type { Readable } from "svelte/store";
import { writable } from "svelte/store";

export type SettingsStoreState = {
	readonly isWakeLockSupported: boolean;
	readonly keepDisplayTurnedOn: boolean;
	readonly audioEnabled: boolean;
};

export type SettingsStore = Readable<SettingsStoreState> & {
	setWakeLockSupported(isWakeLockSupported: boolean): void;
	setKeepDisplayTurnedOn(keepTurnedOn: boolean): void;
	setEnableAudio(audioEnabled: boolean): void;
};

export function createSettingsStore(): SettingsStore {
	const initialState: SettingsStoreState = {
		isWakeLockSupported: false,
		keepDisplayTurnedOn: true,
		audioEnabled: true,
	};

	const { subscribe, update } = writable(initialState);

	return {
		subscribe,
		setWakeLockSupported(isWakeLockSupported) {
			update((state) => {
				return { ...state, isWakeLockSupported };
			});
		},
		setKeepDisplayTurnedOn(keepTurnedOn) {
			update((state) => {
				return { ...state, keepDisplayTurnedOn: keepTurnedOn };
			});
		},
		setEnableAudio(audioEnabled) {
			update((state) => {
				return { ...state, audioEnabled };
			});
		},
	};
}

export const settingsStore = createSettingsStore();
