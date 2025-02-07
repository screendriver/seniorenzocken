<script setup lang="ts">
import { isHtmlElement, isUndefined } from "@sindresorhus/is";

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

onMounted(async () => {
	await audioPlaylistStore.generateAudioPlaylist(team1, team2, isGameOver);
});

watchEffect(async () => {
	const audioElementReferenceValue = audioElementReference.value;

	if (!isAudioPlaying.value || !isHtmlElement(audioElementReferenceValue) || audioSourceUrl.value.isNothing) {
		return;
	}

	sourceElementSource.value = audioSourceUrl.value.value.toString();

	audioElementReferenceValue.load();
	await audioElementReferenceValue.play();
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
