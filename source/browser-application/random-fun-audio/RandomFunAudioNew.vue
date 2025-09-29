<script setup lang="ts">
import { computed, inject, ref, useTemplateRef, watch } from "vue";
import { onKeyStroke, useMouse, useMousePressed, useTimeoutFn } from "@vueuse/core";
import { isNull, isUndefined } from "@sindresorhus/is";
import { assertDefined } from "ts-extras";
import { useQuery } from "@tanstack/vue-query";
import { trpcClientInjectionKey } from "../trpc/client.js";

const trpcClient = inject(trpcClientInjectionKey);

assertDefined(trpcClient);

const emptyAudioAlreadyPlayed = ref(false);
const playRandomFunAudio = ref(false);
const audioTickCounter = ref(0);
const audioElementReference = useTemplateRef("audio");
const { x, y } = useMouse();
const { pressed } = useMousePressed();

function getRandomDelay(): number {
	const oneMinuteInMilliseconds = 60_000;
	const minutes = 2;
	const twoMinutesInMilliseconds = minutes * oneMinuteInMilliseconds;

	return twoMinutesInMilliseconds + Math.floor(Math.random() * oneMinuteInMilliseconds);
}

const { start: startTimer, stop: stopTimer } = useTimeoutFn(
	() => {
		playRandomFunAudio.value = true;
	},
	getRandomDelay,
	{ immediate: false }
);

const randomFunAudioQueryEnabled = computed(() => {
	return emptyAudioAlreadyPlayed.value && playRandomFunAudio.value;
});

const { data: randomFunAudioUrl } = useQuery({
	queryKey: ["randomFunAudio", audioTickCounter],
	async queryFn() {
		return trpcClient.audio.getRandomFunAudio.query();
	},
	enabled: randomFunAudioQueryEnabled
});

function restartTimer(): void {
	if (isNull(audioElementReference.value) || !emptyAudioAlreadyPlayed.value) {
		return;
	}

	stopTimer();
	startTimer();
}

onKeyStroke(restartTimer);

watch([x, y, pressed], restartTimer);

watch(randomFunAudioUrl, async (randomFunAudioUrlValue) => {
	if (isUndefined(randomFunAudioUrlValue) || isNull(audioElementReference.value)) {
		return;
	}

	audioElementReference.value.src = randomFunAudioUrlValue;

	// eslint-disable-next-line @typescript-eslint/no-unsafe-call -- this rule should not complain here
	await audioElementReference.value.play();

	playRandomFunAudio.value = false;
	audioTickCounter.value += 1;
	startTimer();
});

async function playEmptyAudio(): Promise<void> {
	if (isNull(audioElementReference.value)) {
		return;
	}

	// eslint-disable-next-line @typescript-eslint/no-unsafe-call -- this rule should not complain here
	await audioElementReference.value.play();

	emptyAudioAlreadyPlayed.value = true;

	startTimer();
}

defineExpose({ playEmptyAudio });
</script>

<template>
	<audio
		ref="audio"
		src="data:audio/mp4;base64,AAAAHGZ0eXBNNEEgAAACAE00QSBpc29taXNvMgAAAAhmcmVlAAAAPW1kYXTeAgBMYXZjNjAuMzEuMTAyAEIgCMEYOCEQBGCMHCEQBGCMHCEQBGCMHCEQBGCMHCEQBGCMHAAAAxNtb292AAAAbG12aGQAAAAAAAAAAAAAAAAAAAPoAAAAZAABAAABAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAACPXRyYWsAAABcdGtoZAAAAAMAAAAAAAAAAAAAAAEAAAAAAAAAZAAAAAAAAAAAAAAAAQEAAAAAAQAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAACRlZHRzAAAAHGVsc3QAAAAAAAAAAQAAAGQAAAQAAAEAAAAAAbVtZGlhAAAAIG1kaGQAAAAAAAAAAAAAAAAAAKxEAAAVOlXEAAAAAAAtaGRscgAAAAAAAAAAc291bgAAAAAAAAAAAAAAAFNvdW5kSGFuZGxlcgAAAAFgbWluZgAAABBzbWhkAAAAAAAAAAAAAAAkZGluZgAAABxkcmVmAAAAAAAAAAEAAAAMdXJsIAAAAAEAAAEkc3RibAAAAGpzdHNkAAAAAAAAAAEAAABabXA0YQAAAAAAAAABAAAAAAAAAAAAAgAQAAAAAKxEAAAAAAA2ZXNkcwAAAAADgICAJQABAASAgIAXQBUAAAAAAfQAAAANcQWAgIAFEhBW5QAGgICAAQIAAAAgc3R0cwAAAAAAAAACAAAABQAABAAAAAABAAABOgAAABxzdHNjAAAAAAAAAAEAAAABAAAABgAAAAEAAAAsc3RzegAAAAAAAAAAAAAABgAAABcAAAAGAAAABgAAAAYAAAAGAAAABgAAABRzdGNvAAAAAAAAAAEAAAAsAAAAGnNncGQBAAAAcm9sbAAAAAIAAAAB//8AAAAcc2JncAAAAAByb2xsAAAAAQAAAAYAAAABAAAAYnVkdGEAAABabWV0YQAAAAAAAAAhaGRscgAAAAAAAAAAbWRpcmFwcGwAAAAAAAAAAAAAAAAtaWxzdAAAACWpdG9vAAAAHWRhdGEAAAABAAAAAExhdmY2MC4xNi4xMDA="
	/>
</template>
