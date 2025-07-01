<script setup lang="ts">
import { storeToRefs } from "pinia";
import { inject, onMounted, onUnmounted, ref, watch, watchEffect } from "vue";
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
const sourceElementSource = ref<string>();

function onAudioError(): void {
	isAudioPlaying.value = false;
}

function onAudioWaiting(): void {
	if (!isOnline.value) {
		isAudioPlaying.value = false;
	}
}

watch(audioElementReference, (audioElement) => {
	audioElement?.addEventListener("waiting", onAudioWaiting);
	audioElement?.addEventListener("error", onAudioError);
});

onMounted(async () => {
	try {
		await audioPlaylistStore.generateAudioPlaylist(team1, team2, isGameOver);
	} catch {
		isAudioPlaying.value = false;
	}
});

onUnmounted(() => {
	audioElementReference.value?.removeEventListener("waiting", onAudioWaiting);
	audioElementReference.value?.removeEventListener("error", onAudioError);
});

watchEffect(async () => {
	const audioElementReferenceValue = audioElementReference.value;

	if (!isAudioPlaying.value || !isHtmlElement(audioElementReferenceValue) || audioSourceUrl.value.isNothing) {
		return;
	}

	sourceElementSource.value = audioSourceUrl.value.value.toString();

	try {
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
	<audio ref="audioElementReference" @ended="playNextAudioPlaylistItem">
		<source :src="sourceElementSource" type="audio/x-m4a" />
	</audio>
</template>
