<script setup lang="ts">
import { storeToRefs } from "pinia";
import { onMounted } from "vue";
import { useOnline } from "@vueuse/core";
import { isUndefined } from "@sindresorhus/is";
import { useGameStore } from "../game-store/game-store.js";

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
	const audioPlaylist = await gameStore.generateGamePointsAudioPlaylist();

	const audioObjects = audioPlaylist.match({
		Ok(playlistItemAPIPaths) {
			return playlistItemAPIPaths.map((playlistItemAPIPath) => {
				return new Audio(playlistItemAPIPath);
			});
		},
		Err() {
			return [];
		}
	});

	let currentAudioIndex = 0;

	function playNext(): void {
		if (currentAudioIndex < audioObjects.length) {
			const currentAudio = audioObjects[currentAudioIndex];

			if (!isUndefined(currentAudio)) {
				currentAudio.addEventListener("error", onAudioError);
				currentAudio.addEventListener("waiting", onAudioWaiting);
				currentAudio.addEventListener("ended", playNext);

				// eslint-disable-next-line promise/catch-or-return, promise/prefer-await-to-then, @typescript-eslint/no-floating-promises -- needs to be refactored
				currentAudio.play().then(() => {
					currentAudioIndex += 1;
				});
			}
		} else {
			isAudioPlaying.value = false;
		}
	}

	playNext();
});
</script>

<template>
	<audio />
</template>
