<script setup lang="ts">
import PocketBase from "pocketbase";

const runtimeConfig = useRuntimeConfig();
const pocketBase = new PocketBase(runtimeConfig.public.pocketBaseBaseUrl);

provide(pocketBaseInjectionKey, pocketBase);
</script>

<template>
	<NuxtRouteAnnouncer />
	<SettingsDrawer>
		<NuxtPage />
	</SettingsDrawer>
</template>
