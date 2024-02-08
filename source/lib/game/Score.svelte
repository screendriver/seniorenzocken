<script lang="ts">
	export let visible: boolean;
	export let score: number;
</script>

{#if visible}
	<mark class="bg-transparent text-slate-200">{score.toString()}</mark>
{:else}
	<mark class="invisible">{score.toString()}</mark>
{/if}
