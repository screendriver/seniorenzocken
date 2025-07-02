<script setup lang="ts">
import { storeToRefs } from "pinia";
import { inject, onMounted, ref, watchEffect } from "vue";
import { isHtmlElement, isUndefined } from "@sindresorhus/is";
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
const { audioSourceUrl } = storeToRefs(audioPlaylistStore);

const audioElementReference = ref<HTMLAudioElement>();

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
		await audioPlaylistStore.generateAudioPlaylist(team1, team2, isGameOver);
	} catch {
		isAudioPlaying.value = false;
	}
});

watchEffect(async () => {
	const audioElementReferenceValue = audioElementReference.value;

	if (!isAudioPlaying.value || !isHtmlElement(audioElementReferenceValue) || audioSourceUrl.value.isNothing) {
		return;
	}

	try {
		const audioFile = await fetch(audioSourceUrl.value.value.toString());
		const audioFileBlob = await audioFile.blob();
		audioElementReferenceValue.src = URL.createObjectURL(audioFileBlob);
		audioElementReferenceValue.load();
		await audioElementReferenceValue.play();
	} catch {
		isAudioPlaying.value = false;
	}
});

function playNextAudioPlaylistItem() {
	const nextAudioPlaylistItem = audioPlaylistStore.nextAudioPlaylistItem();

	isAudioPlaying.value = nextAudioPlaylistItem.isJust;
}
</script>

<template>
	<audio
		ref="audioElementReference"
		preload="auto"
		@ended="playNextAudioPlaylistItem"
		@error="onAudioError"
		@waiting="onAudioWaiting"
	/>
</template>
