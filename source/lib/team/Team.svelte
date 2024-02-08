<script lang="ts" context="module">
	import type { Team } from "../game-store/team.js";

	export type TeamNameChangeEvent = {
		readonly team: Team;
		readonly teamName: string;
	};
</script>

<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { Label, ButtonGroup, Input, InputAddon } from "flowbite-svelte";
	import { UsersIcon } from "svelte-feather-icons";

	export let team: Team;

	const dispatch = createEventDispatcher<{ readonly teamNameChange: TeamNameChangeEvent }>();

	let teamName = "";

	function dispatchTeamNameChange(): void {
		dispatch("teamNameChange", { team, teamName });
	}

	const placeholder = `Team ${team.teamNumber}`;
</script>

<Label>
	<ButtonGroup>
		<InputAddon>
			<UsersIcon size="25" class="text-black" />
		</InputAddon>
		<Input
			type="text"
			id={`team-${team.teamNumber}`}
			{placeholder}
			bind:value={teamName}
			on:keyup={dispatchTeamNameChange}
			class="text-gray-900 bg-gray-50 border-gray-300 focus:border-gray-300 focus:ring-transparent"
		/>
	</ButtonGroup>
</Label>
