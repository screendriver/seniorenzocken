<script setup lang="ts">
import { useTemplateRef } from "vue";
import RandomFunAudio from "../random-fun-audio/RandomFunAudio.vue";
import SignInForm from "../sign-in/SignInForm.vue";

const randomFunAudioReference = useTemplateRef("randomFunAudio");
</script>

<template>
	<RandomFunAudio ref="randomFunAudio" />

	<SignInForm @submit="randomFunAudioReference?.playEmptyAudio()" />
</template>
