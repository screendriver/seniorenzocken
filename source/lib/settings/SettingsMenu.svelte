<script lang="ts">
	import { MenuIcon } from "svelte-feather-icons";
	import Settings from "./Settings.svelte";
	import { settingsStore } from "./settings-store.js";

	function enableAudio(): void {
		settingsStore.setEnableAudio(true);
	}

	function disableAudio(): void {
		settingsStore.setEnableAudio(false);
	}

	function toggleKeepDisplayTurnedOn(event: CustomEvent<boolean>): void {
		settingsStore.setKeepDisplayTurnedOn(event.detail);
	}
</script>

<details title="Menü" class="dropdown absolute z-10">
	<summary class="btn m-1">
		<MenuIcon size="30" class="cursor-pointer" />
	</summary>

	<Settings
		isWakeLockSupported={$settingsStore.isWakeLockSupported}
		keepDisplayTurnedOn={$settingsStore.keepDisplayTurnedOn}
		isAudioEnabled={$settingsStore.audioEnabled}
		on:enableAudio={enableAudio}
		on:disableAudio={disableAudio}
		on:keepDisplayTurnedOn={toggleKeepDisplayTurnedOn}
	/>
</details>
