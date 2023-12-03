<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { Toggle } from "flowbite-svelte";

	export let isWakeLockSupported: boolean;
	export let keepDisplayTurnedOn: boolean;
	export let isAudioEnabled: boolean;

	const dispatch = createEventDispatcher<{
		readonly enableAudio: void;
		readonly disableAudio: void;
		readonly keepDisplayTurnedOn: boolean;
	}>();

	function toggleKeepDisplayTurnedOn(event: Event): void {
		const currentTarget = event.currentTarget as HTMLInputElement;
		dispatch("keepDisplayTurnedOn", currentTarget.checked);
	}

	function toggleAudio(event: Event): void {
		const currentTarget = event.currentTarget as HTMLInputElement;
		if (currentTarget.checked) {
			dispatch("enableAudio");
		} else {
			dispatch("disableAudio");
		}
	}
</script>

<menu class="mt-4">
	<li>
		<Toggle
			disabled={!isWakeLockSupported}
			checked={keepDisplayTurnedOn}
			on:change={toggleKeepDisplayTurnedOn}
			class="text-md text-white">Display aktiv</Toggle
		>
	</li>
	<li class="mt-4">
		<Toggle checked={isAudioEnabled} on:change={toggleAudio} class="text-md text-white">Punktestand vorlesen</Toggle
		>
	</li>
</menu>
