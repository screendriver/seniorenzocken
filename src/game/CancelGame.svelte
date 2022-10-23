<script lang="ts">
	import Button from "../Button.svelte";
	import { isGameStarted } from "./game-store";

	function cancelGame(): void {
		$isGameStarted = false;
	}
</script>

<Button buttonType="button" value="Spiel abbrechen" on:click={cancelGame} />
