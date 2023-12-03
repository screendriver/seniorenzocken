<script lang="ts">
	import { MenuIcon } from "svelte-feather-icons";
	import Settings from "./Settings.svelte";
	import { settingsStore } from "./settings-store.js";

	let isSettingsMenuOpen = false;

	const navClassNameClosed = "absolute z-10 flex flex-col pl-4 pt-4";
	const navClassNameOpen = `${navClassNameClosed} w-64 h-screen bg-slate-800`;
	let navClassName = "";

	$: navClassName = isSettingsMenuOpen ? navClassNameOpen : navClassNameClosed;

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

<nav class={navClassName}>
	<details bind:open={isSettingsMenuOpen} title="Menü">
		<summary class="list-none">
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
</nav>
