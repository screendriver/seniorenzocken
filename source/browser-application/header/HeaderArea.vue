<script setup lang="ts">
import { inject } from "vue";
import { useRouter } from "vue-router";
import { assertDefined } from "ts-extras";
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { isNonEmptyString } from "@sindresorhus/is";
import ky from "ky";
import { trpcClientInjectionKey } from "../trpc/client.js";

const router = useRouter();
const queryClient = useQueryClient();
const trpcClient = inject(trpcClientInjectionKey);

assertDefined(trpcClient);

const { data: sessionToken } = useQuery({
	queryKey: ["session"],
	async queryFn() {
		return trpcClient.session.token.query();
	}
});

const { mutate: logout } = useMutation({
	async mutationFn() {
		return ky.post("/api/logout");
	},
	async onSuccess() {
		await queryClient.invalidateQueries({ queryKey: ["session"] });
		await router.push({ name: "sign-in", replace: true });
	}
});
</script>

<template>
	<header v-if="isNonEmptyString(sessionToken)" class="bg-secondary mb-4 flex justify-end p-3">
		<button @click="logout()" class="btn btn-outline btn-sm">Abmelden</button>
	</header>

	<header v-else class="hero absolute -z-10">
		<img
			src="../assets/images/watten-karten.jpg"
			alt="Karten"
			class="hero-content h-48 w-full max-w-full object-cover p-0 blur-sm"
		/>
	</header>
</template>
