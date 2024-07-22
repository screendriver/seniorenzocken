<script setup lang="ts">
import PocketBase from "pocketbase";

const runtimeConfig = useRuntimeConfig();
const pocketBase = new PocketBase(runtimeConfig.public.pocketBaseBaseUrl);

provide(pocketBaseInjectionKey, pocketBase);

onMounted(() => {
	if (import.meta.env.PROD) {
		useHead({
			script: [
				{
					async: true,
					defer: true,
					"data-website-id": "19ad1338-6801-4b9b-b08c-f38e9ed95c86",
					"data-do-not-track": true,
					src: "https://statistics.echooff.de/tasty.js",
				},
			],
		});
	}
});
</script>

<template>
	<NuxtRouteAnnouncer />
	<NuxtLayout>
		<SettingsDrawer>
			<NuxtPage />
		</SettingsDrawer>
	</NuxtLayout>
</template>
