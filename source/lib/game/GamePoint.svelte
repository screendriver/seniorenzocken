<script lang="ts">
	import { UsersIcon } from "svelte-feather-icons";
	import type { Team } from "../game-store/team.js";
	import { gameStore } from "../game-store/game-store.js";

	export let team: Team;
	export let enabled: boolean;

	const availableGamePoints = [0, 2, 3, 4] as const;
	let selectedGamePoint = 0;

	function setGamePoint(): void {
		gameStore.setCurrentGamePoints(team, selectedGamePoint);
	}
</script>

<section class="flex flex-col gap-3 w-full rounded-lg bg-slate-600">
	<div class="gap-2 items-center mx-3 mt-3 join bg-info text-info-content">
		<UsersIcon size="40" class="p-2 join-item" />
		<cite class="flex-grow not-italic join-item">{team.teamName}</cite>
		<mark class="self-stretch h-auto badge badge-accent join-item">
			<span class="countdown">
				<span style={`--value: ${team.totalGamePoints};`} />
			</span>
		</mark>
	</div>
	<div class="m-3 join">
		{#each availableGamePoints as availableGamePoint (availableGamePoint)}
			<input
				bind:group={selectedGamePoint}
				type="radio"
				disabled={!enabled}
				name={`game-point-${team.teamNumber}`}
				value={availableGamePoint}
				aria-label={`${availableGamePoint}`}
				class="flex-grow join-item btn"
				on:change={setGamePoint}
			/>
		{/each}
	</div>
</section>
