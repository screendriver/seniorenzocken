<script lang="ts" context="module">
	export interface TeamNameChangeEvent {
		readonly teamNumber: number;
		readonly teamName: string;
	}
</script>

<script lang="ts">
	import { createEventDispatcher, onMount } from "svelte";
	import { UsersIcon } from "svelte-feather-icons";

	export let teamNumber: number;

	const dispatch = createEventDispatcher<{ teamnamechange: TeamNameChangeEvent }>();

	let teamName = "";

	onMount(() => {
		dispatch("teamnamechange", {
			teamNumber,
			teamName
		});
	});

	$: dispatch("teamnamechange", {
		teamNumber,
		teamName
	});
</script>

<label class="flex items-center">
	<UsersIcon size="40" class="rounded-l-lg bg-sky-700 p-2" />

	<input
		type="text"
		name="team-{teamNumber}"
		placeholder="Team {teamNumber}"
		bind:value={teamName}
		class="bg-slate-300 text-gray-900 w-60 rounded-r-lg p-2 focus-visible:outline-none"
	/>
</label>
