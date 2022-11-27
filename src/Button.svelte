<script lang="ts">
	export let disabled = false;
	export let value: string;
</script>

<button
	{disabled}
	on:click
	class="bg-sky-500 text-white rounded-lg p-3 cursor-pointer hover:bg-sky-400 disabled:cursor-default disabled:hover:bg-sky-500 disabled:opacity-50"
>
	{value}
</button>
