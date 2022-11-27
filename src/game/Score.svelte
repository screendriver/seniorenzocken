<script lang="ts">
	export let visible: boolean;
	export let score: number;
</script>

{#if visible}
	<mark class="text-slate-200 bg-transparent">{score.toString()}</mark>
{:else}
	<mark class="invisible">{score.toString()}</mark>
{/if}
