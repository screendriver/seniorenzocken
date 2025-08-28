<script setup lang="ts">
import { ref } from "vue";
import AlertErrorMessage from "../alert/AlertErrorMessage.vue";
import UsernameInput from "./UsernameInput.vue";
import PasswordInput from "./PasswordInput.vue";

const username = ref("");
const password = ref("");
const signInFailed = ref(false);
</script>

<template>
	<AlertErrorMessage v-if="signInFailed" error-message="Login fehlgeschlagen" />

	<section
		class="bg-neutral col-start-1 col-end-5 grid grid-cols-subgrid rounded-xl sm:col-start-2 sm:col-end-4 md:col-start-3 md:col-end-7 lg:col-start-4 lg:col-end-10"
	>
		<form
			@submit.prevent="signInFailed = true"
			class="col-span-full mx-6 my-8 grid grid-flow-col grid-cols-subgrid grid-rows-3 items-center gap-2 lg:col-start-2 lg:col-end-6"
		>
			<UsernameInput v-model="username" />

			<PasswordInput v-model="password" />

			<div class="col-span-full justify-self-center">
				<button type="submit" class="btn btn-primary">Anmelden</button>
			</div>
		</form>
	</section>
</template>
