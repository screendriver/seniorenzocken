<script setup lang="ts">
import { onMounted, provide } from "vue";
import { RouterView } from "vue-router";
import { useHead } from "@unhead/vue";
import PocketBase from "pocketbase";
import { pocketBaseInjectionKey } from "./pocketbase/pocketbase";
import SettingsDrawer from "./settings/SettingsDrawer.vue";

const pocketBase = new PocketBase(import.meta.env.VITE_POCKETBASE_BASE_URL);

provide(pocketBaseInjectionKey, pocketBase);

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
