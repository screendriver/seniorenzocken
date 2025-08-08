<script setup lang="ts">
import { watch } from "vue";
import { onKeyStroke, useMouse, useMousePressed, useTimeoutFn } from "@vueuse/core";
import { useTRPCClientStore } from "../trpc-client-store/trpc-client-store.js";

const { trpcClient } = useTRPCClientStore();
const { x, y } = useMouse();
const { pressed } = useMousePressed();

function getRandomDelay(): number {
	const oneMinuteInMilliseconds = 60_000;
	const minutes = 3;
	const threeMinutesInMilliseconds = minutes * oneMinuteInMilliseconds;

	return threeMinutesInMilliseconds + Math.floor(Math.random() * oneMinuteInMilliseconds);
}

const { start: startTimer, stop: stopTimer } = useTimeoutFn(async () => {
	const randomFunAudioUrl = await trpcClient.audio.getRandomFunAudio.query();

	const randomFunAudio = new Audio(randomFunAudioUrl);

	await randomFunAudio.play();
}, getRandomDelay);

function restartTimer(): void {
	stopTimer();
	startTimer();
}

onKeyStroke(restartTimer);

watch([x, y, pressed], restartTimer);
</script>

<template>
	<audio />
</template>
