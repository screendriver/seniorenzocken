<script lang="ts">
	import { onMount } from "svelte";

	let audioElement: HTMLAudioElement;

	onMount(() => {
		audioElement.play();
	});
</script>

<audio bind:this={audioElement}>
	<source src="/audio/gwonnen.webm" type="audio/webm" />
	<source src="/audio/gwonnen.aac" type="audio/aac" />
</audio>
