<script lang="ts">
	import type ImageKit from "imagekit-javascript";

	export let imageKit: ImageKit;

	const headerImageUrl = imageKit.url({
		path: "/watten-karten.jpg",
		transformation: [{ width: "1920" }]
	});
</script>

<header
	style="background-image: url('{headerImageUrl}')"
	class="absolute top-0 h-48 w-full bg-no-repeat bg-cover bg-center blur-sm -z-10"
/>
