<script setup lang="ts">
import { onMounted } from "vue";
import { RouterView } from "vue-router";
import { useHead } from "@unhead/vue";
import SettingsDrawer from "./settings/SettingsDrawer.vue";
import { useGameStore } from "./game-store/game-store.ts";

const gameStore = useGameStore();

onMounted(() => {
	if (import.meta.env.PROD) {
		useHead({
			script: [
				{
					async: true,
					defer: true,
					"data-website-id": "16d1825d-3f6c-46fb-9243-1d281224605e",
					src: "https://statistics.82r.de/tasty.js",
				},
			],
		});
	}
});
</script>

<template>
	<template v-if="$route.name === 'notFound'">
		<RouterView />
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

		<header class="hero absolute">
			<img
				src="./assets/images/watten-karten.jpg"
				alt="Karten"
				class="hero-content h-48 w-full max-w-full object-cover p-0 blur-sm"
			/>
		</header>

		<SettingsDrawer>
			<RouterView />
		</SettingsDrawer>
	</template>
</template>
