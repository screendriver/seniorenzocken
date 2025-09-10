import { acceptHMRUpdate, defineStore } from "pinia";
import { ref } from "vue";

export const useSessionGameStore = defineStore("sessionGame", () => {
	const isAudioPlaying = ref(false);

	return { isAudioPlaying };
});

if (import.meta.hot !== undefined) {
	import.meta.hot.accept(acceptHMRUpdate(useSessionGameStore, import.meta.hot));
}
