<script setup lang="ts">
import { RouterView } from "vue-router";
import { useWakeLock } from "@vueuse/core";
import { VueQueryDevtools } from "@tanstack/vue-query-devtools";
import HeaderArea from "./header/HeaderArea.vue";
import { useGameStore } from "./game-store/game-store.js";

const gameStore = useGameStore();
const { isSupported: isWakeLockSupported, isActive: isWakeLockActive, request: requestWakeLock } = useWakeLock();

function activateWakeLock(): void {
	if (isWakeLockSupported.value && !isWakeLockActive.value) {
		void requestWakeLock("screen");
	}
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

		<HeaderArea />

		<main
			@click.once="activateWakeLock()"
			class="mx-6 grid min-h-screen grid-cols-4 items-center gap-4 md:mx-auto md:grid-cols-8 lg:max-w-7xl lg:grid-cols-12"
		>
			<RouterView />
		</main>
	</template>

	<VueQueryDevtools />
</template>
