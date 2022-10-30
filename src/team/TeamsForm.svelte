<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import Button from "../Button.svelte";
	import Team from "./Team.svelte";

	export let canGameBeStarted: boolean;

	const dispatch = createEventDispatcher<{ startgame: undefined }>();

	function startGame(): void {
		dispatch("startgame");
	}
</script>

<form
	name="teams"
	on:submit|preventDefault={startGame}
	class="relative top-20 bg-slate-800 bg-opacity-90 rounded-lg shadow-md mx-5 sm:mx-auto sm:max-w-xl py-8 flex flex-col items-center gap-3 m-auto"
>
	<Team teamNumber={1} on:teamnamechange />
	<Team teamNumber={2} on:teamnamechange />

	<Button buttonType="submit" value="Spiel starten" disabled={!canGameBeStarted} />
</form>
