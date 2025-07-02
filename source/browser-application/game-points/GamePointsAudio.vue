<script setup lang="ts">
import { storeToRefs } from "pinia";
import { inject, onMounted } from "vue";
import { isUndefined } from "@sindresorhus/is";
import { useOnline } from "@vueuse/core";
import { useGameStore } from "../game-store/game-store.js";
import { pocketBaseInjectionKey } from "../pocketbase/pocketbase.js";
import { useAudioPlaylistStore } from "../audio-playlist/audio-playlist-store.js";

const isOnline = useOnline();
const gameStore = useGameStore();
const { isAudioPlaying, team1, team2, isGameOver } = storeToRefs(gameStore);

const pocketBase = inject(pocketBaseInjectionKey);

if (isUndefined(pocketBase)) {
	throw new Error("PocketBase is not defined");
}

const audioPlaylistStore = useAudioPlaylistStore();
audioPlaylistStore.initialize(pocketBase);

function onAudioError(): void {
	isAudioPlaying.value = false;
}

function onAudioWaiting(): void {
	if (!isOnline.value) {
		isAudioPlaying.value = false;
	}
}

onMounted(async () => {
	try {
		const audioPlaylist = await audioPlaylistStore.generateAudioPlaylist(team1, team2, isGameOver);

		const audioObjects = audioPlaylist.map((playlistItemUrl) => {
			return new Audio(playlistItemUrl.toString());
		});

		let currentAudioIndex = 0;

		async function playNext(): Promise<void> {
			if (currentAudioIndex < audioObjects.length) {
				const currentAudio = audioObjects[currentAudioIndex];
				currentAudio.addEventListener("error", onAudioError);
				currentAudio.addEventListener("waiting", onAudioWaiting);
				currentAudio.addEventListener("ended", playNext);

				await currentAudio.play();

				currentAudioIndex++;
			} else {
				isAudioPlaying.value = false;
			}
		}

		playNext();
	} catch {
		isAudioPlaying.value = false;
	}
});
</script>

<template>
	<audio />
</template>
