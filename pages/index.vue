<script setup lang="ts">
definePageMeta({
	middleware: [
		() => {
			return navigateTo("/teams", { redirectCode: 301 });
		},
	],
});
</script>
