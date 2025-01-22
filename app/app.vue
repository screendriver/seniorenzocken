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
					"data-website-id": "16d1825d-3f6c-46fb-9243-1d281224605e",
					src: "https://statistics.82r.de/tasty.js",
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
