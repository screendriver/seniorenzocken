<script setup lang="ts">
import { storeToRefs } from "pinia";
import { onMounted } from "vue";
import { useOnline } from "@vueuse/core";
import { useGameStore } from "../game-store/game-store.ts";

const isOnline = useOnline();
const gameStore = useGameStore();
const { isAudioPlaying } = storeToRefs(gameStore);

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
		const audioPlaylist = await gameStore.generateAudioPlaylist();

		const audioObjects = audioPlaylist
			.map((playlistItemUrls) => {
				return playlistItemUrls.map((playlistItemUrl) => {
					return new Audio(playlistItemUrl.toString());
				});
			})
			.unwrapOr<HTMLAudioElement[]>([]);

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
