<script lang="ts" context="module">
	import type { Team } from "../game-store/team.js";

	export type TeamNameChangeEvent = {
		readonly team: Team;
		readonly teamName: string;
	};
</script>

<script lang="ts">
	import { createEventDispatcher } from "svelte";

	export let team: Team;

	const dispatch = createEventDispatcher<{ readonly teamNameChange: TeamNameChangeEvent }>();

	let teamName = "";

	function dispatchTeamNameChange(): void {
		dispatch("teamNameChange", { team, teamName });
	}

	const placeholder = `Team ${team.teamNumber}`;
</script>

<label class="input input-bordered flex items-center gap-2 whitespace-nowrap">
	{placeholder}
	<input
		type="text"
		id={`team-${team.teamNumber}`}
		bind:value={teamName}
		on:keyup={dispatchTeamNameChange}
		class="grow"
		placeholder="Name"
	/>
</label>
