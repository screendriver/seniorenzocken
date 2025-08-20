<script setup lang="ts">
import { useTemplateRef, watch } from "vue";
import { onKeyStroke, useMouse, useMousePressed, useTimeoutFn } from "@vueuse/core";
import { isNull } from "@sindresorhus/is";
import { storeToRefs } from "pinia";
import { useTRPCClientStore } from "../trpc-client-store/trpc-client-store.js";
import { useGameStore } from "../game-store/game-store.js";

const audioElementReference = useTemplateRef("audio");
const gameStore = useGameStore();
const { isGameRunning } = storeToRefs(gameStore);
const { trpcClient } = useTRPCClientStore();
const { x, y } = useMouse();
const { pressed } = useMousePressed();

function playEmptyAudio(): void {
	// eslint-disable-next-line @typescript-eslint/no-unsafe-call -- this rule should not complain here
	void audioElementReference.value?.play();
}

defineExpose({ playEmptyAudio });

function getRandomDelay(): number {
	const oneMinuteInMilliseconds = 60_000;
	const minutes = 2;
	const twoMinutesInMilliseconds = minutes * oneMinuteInMilliseconds;

	return twoMinutesInMilliseconds + Math.floor(Math.random() * oneMinuteInMilliseconds);
}

const { start: startTimer, stop: stopTimer } = useTimeoutFn(
	async () => {
		if (isNull(audioElementReference.value) || !isGameRunning.value) {
			return;
		}

		const randomFunAudioUrl = await trpcClient.audio.getRandomFunAudio.query();

		// eslint-disable-next-line require-atomic-updates -- done on purpose
		audioElementReference.value.src = randomFunAudioUrl;

		// eslint-disable-next-line @typescript-eslint/no-unsafe-call -- this rule should not complain here
		await audioElementReference.value.play();

		startTimer();
	},
	getRandomDelay,
	{ immediate: false }
);

function restartTimer(): void {
	if (isNull(audioElementReference.value) || !isGameRunning.value) {
		return;
	}

	stopTimer();
	startTimer();
}

onKeyStroke(restartTimer);

watch([isGameRunning, x, y, pressed], restartTimer);
</script>

<template>
	<audio
		ref="audio"
		src="data:audio/mp4;base64,AAAAHGZ0eXBNNEEgAAACAE00QSBpc29taXNvMgAAAAhmcmVlAAAAPW1kYXTeAgBMYXZjNjAuMzEuMTAyAEIgCMEYOCEQBGCMHCEQBGCMHCEQBGCMHCEQBGCMHCEQBGCMHAAAAxNtb292AAAAbG12aGQAAAAAAAAAAAAAAAAAAAPoAAAAZAABAAABAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAACPXRyYWsAAABcdGtoZAAAAAMAAAAAAAAAAAAAAAEAAAAAAAAAZAAAAAAAAAAAAAAAAQEAAAAAAQAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAACRlZHRzAAAAHGVsc3QAAAAAAAAAAQAAAGQAAAQAAAEAAAAAAbVtZGlhAAAAIG1kaGQAAAAAAAAAAAAAAAAAAKxEAAAVOlXEAAAAAAAtaGRscgAAAAAAAAAAc291bgAAAAAAAAAAAAAAAFNvdW5kSGFuZGxlcgAAAAFgbWluZgAAABBzbWhkAAAAAAAAAAAAAAAkZGluZgAAABxkcmVmAAAAAAAAAAEAAAAMdXJsIAAAAAEAAAEkc3RibAAAAGpzdHNkAAAAAAAAAAEAAABabXA0YQAAAAAAAAABAAAAAAAAAAAAAgAQAAAAAKxEAAAAAAA2ZXNkcwAAAAADgICAJQABAASAgIAXQBUAAAAAAfQAAAANcQWAgIAFEhBW5QAGgICAAQIAAAAgc3R0cwAAAAAAAAACAAAABQAABAAAAAABAAABOgAAABxzdHNjAAAAAAAAAAEAAAABAAAABgAAAAEAAAAsc3RzegAAAAAAAAAAAAAABgAAABcAAAAGAAAABgAAAAYAAAAGAAAABgAAABRzdGNvAAAAAAAAAAEAAAAsAAAAGnNncGQBAAAAcm9sbAAAAAIAAAAB//8AAAAcc2JncAAAAAByb2xsAAAAAQAAAAYAAAABAAAAYnVkdGEAAABabWV0YQAAAAAAAAAhaGRscgAAAAAAAAAAbWRpcmFwcGwAAAAAAAAAAAAAAAAtaWxzdAAAACWpdG9vAAAAHWRhdGEAAAABAAAAAExhdmY2MC4xNi4xMDA="
	/>
</template>
