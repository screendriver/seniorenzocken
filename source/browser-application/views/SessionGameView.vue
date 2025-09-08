<script setup lang="ts">
import { useQuery } from "@tanstack/vue-query";
import { useTRPCClientStore } from "../trpc-client-store/trpc-client-store";

const { trpcClient } = useTRPCClientStore();

const { data: currentGameRoundData } = useQuery({
	queryKey: ["currentGameRound"],
	async queryFn() {
		return trpcClient.session.currentGameRound.query();
	}
});
</script>

<template>
	<h1 v-for="teamName in currentGameRoundData?.teamNames" :key="teamName">{{ teamName }}</h1>
</template>
