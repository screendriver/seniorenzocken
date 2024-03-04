<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import GamePointAudio from "./GamePointAudio.svelte";

	export let apiRouteBaseUrl: URL;
	export let mediaAssetsRouteBaseUrl: URL;

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
	<source src={`${mediaAssetsRouteBaseUrl.toString()}gwonnen.m4a`} type="audio/webm" />
</audio>
