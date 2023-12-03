<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import GamePointAudio from "./GamePointAudio.svelte";

	export let apiRouteBaseUrl: URL;

	let audioElementReference: HTMLAudioElement;

	const dispatch = createEventDispatcher<{ readonly audioEnded: void }>();

	async function playWinSound(): Promise<void> {
		await audioElementReference.play();
	}

	function dispatchAudioEnded(): void {
		dispatch("audioEnded");
	}
</script>

<GamePointAudio {apiRouteBaseUrl} includeStretched={false} on:audioEnded={playWinSound} />

<audio bind:this={audioElementReference} on:ended={dispatchAudioEnded}>
	<source src="/audio/gwonnen.webm" type="audio/webm" />
	<source src="/audio/gwonnen.aac" type="audio/aac" />
</audio>
