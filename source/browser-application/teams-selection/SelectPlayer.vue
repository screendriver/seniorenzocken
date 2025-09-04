<script setup lang="ts">
import type { Players } from "../../server-shared/player.js";

const { playerNumber, players } = defineProps<{
	readonly playerNumber: number;
	readonly players: Players;
}>();
</script>

<template>
	<select class="select w-full">
		<option disabled selected>Spieler {{ playerNumber }}</option>

		<option v-for="player in players" :key="player.playerId">{{ player.nickname }} ({{ player.firstName }})</option>
	</select>
</template>
