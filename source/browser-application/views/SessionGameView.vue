<script setup lang="ts">
import { useMutation, useQuery } from "@tanstack/vue-query";
import ky from "ky";
import { useRouter } from "vue-router";
import { useTRPCClientStore } from "../trpc-client-store/trpc-client-store";

const { trpcClient } = useTRPCClientStore();
const router = useRouter();

const { data: currentGameRoundData } = useQuery({
	queryKey: ["currentGameRound"],
	async queryFn() {
		return trpcClient.session.currentGameRound.query();
	}
});

const { mutate: logout } = useMutation({
	async mutationFn() {
		return ky.post("/api/logout");
	},
	async onSuccess() {
		await router.push({ name: "sign-in", replace: true });
	}
});
</script>

<template>
	<button type="button" class="btn btn-primary" @click="logout()">Abmelden</button>

	<h1 v-for="teamName in currentGameRoundData?.teamNames" :key="teamName">{{ teamName }}</h1>
</template>
