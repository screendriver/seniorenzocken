<script lang="ts">
	import { createEventDispatcher } from "svelte";

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

<menu class="p-2 ml-1 w-max shadow menu dropdown-content z-[1] bg-base-100 rounded-box">
	<li class="form-control">
		<label class="cursor-pointer label">
			<span class="label-text">Display aktiv</span>
			<input
				type="checkbox"
				disabled={!isWakeLockSupported}
				checked={keepDisplayTurnedOn}
				on:change={toggleKeepDisplayTurnedOn}
				class="checkbox"
			/>
		</label>
	</li>
	<li class="mt-4"></li>
	<li class="form-control">
		<label class="cursor-pointer label">
			<span class="label-text">Punktestand vorlesen</span>
			<input type="checkbox" checked={isAudioEnabled} on:change={toggleAudio} class="checkbox" />
		</label>
	</li>
</menu>
