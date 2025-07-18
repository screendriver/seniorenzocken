<script setup lang="ts">
import { computed } from "vue";
import { FeUsers as UsersIcon } from "@kalimahapps/vue-icons";
import { type GamePointsPerRound, gamePointsPerRound } from "../../shared/game-points.ts";
import type { NotPersistedTeam } from "../../shared/team.ts";

const { team, enabled } = defineProps<{
	team: NotPersistedTeam;
	enabled: boolean;
}>();

const gamePoint = defineModel<GamePointsPerRound>("gamePoint", { required: true });

function updateGamePoint(newGamePoint: GamePointsPerRound): void {
	gamePoint.value = newGamePoint;
}

const teamAreaClassName = computed(() => {
	return `gap-2 items-center mx-3 mt-3 join text-info-content ${team.isStretched ? "bg-error" : "bg-info"}`;
});
</script>

<template>
	<section class="flex flex-col gap-3 rounded-lg bg-slate-600">
		<div :class="teamAreaClassName">
			<UsersIcon class="join-item m-2 text-xl text-black" />
			<cite class="join-item flex-grow not-italic">{{ team.name }}</cite>
			<mark class="badge join-item badge-accent h-auto self-stretch">
				<span class="countdown">
					<span :style="{ '--value': team.matchTotalGamePoints }" />
				</span>
			</mark>
		</div>
		<div class="join m-3">
			<input
				v-for="gamePointPerRound in gamePointsPerRound"
				:key="`${team.name}-${gamePointPerRound}`"
				type="radio"
				:value="gamePointPerRound.toString()"
				:checked="gamePoint === gamePointPerRound"
				:disabled="!enabled"
				:name="`${team.name}-${gamePointPerRound}`"
				:aria-label="gamePointPerRound.toString()"
				class="btn join-item flex-grow"
				@click="updateGamePoint(gamePointPerRound)"
			/>
		</div>
	</section>
</template>
