<script setup lang="ts">
import { useTemplateRef } from "vue";
import { RouterView } from "vue-router";
import { useWakeLock } from "@vueuse/core";
import RandomFunAudio from "./random-fun-audio/RandomFunAudio.vue";
import { useGameStore } from "./game-store/game-store.js";

const gameStore = useGameStore();
const { isSupported: isWakeLockSupported, isActive: isWakeLockActive, request: requestWakeLock } = useWakeLock();
const randomFunAudioReference = useTemplateRef("randomFunAudio");

function activateWakeLock(): void {
	if (isWakeLockSupported.value && !isWakeLockActive.value) {
		void requestWakeLock("screen");
	}
}

function playEmptyAudio(): void {
	// eslint-disable-next-line @typescript-eslint/no-unsafe-call -- this rule should not complain here
	randomFunAudioReference.value?.playEmptyAudio();
}
</script>

<template>
	<template v-if="$route.name === 'notFound'">
		<RouterView v-if="$route.name === 'notFound'" />
	</template>

	<template v-else>
		<div v-if="gameStore.hasError" role="alert" class="alert alert-error">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="h-6 w-6 shrink-0 stroke-current"
				fill="none"
				viewBox="0 0 24 24"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
				/>
			</svg>

			<span>Es ist ein unbekannter Fehler augetreten</span>
		</div>

		<header class="hero absolute -z-10">
			<img
				src="./assets/images/watten-karten.jpg"
				alt="Karten"
				class="hero-content h-48 w-full max-w-full object-cover p-0 blur-sm"
			/>
		</header>

		<main
			@click.once="
				activateWakeLock();
				playEmptyAudio();
			"
			class="mx-6 grid min-h-screen grid-cols-4 items-center gap-4 md:mx-auto md:grid-cols-8 lg:max-w-7xl lg:grid-cols-12"
		>
			<RandomFunAudio ref="randomFunAudio" />

			<RouterView />
		</main>
	</template>
</template>
