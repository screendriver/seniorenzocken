<script setup lang="ts">
import { ref, watch } from "vue";
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import ky from "ky";
import { useRouter } from "vue-router";
import AlertErrorMessage from "../alert/AlertErrorMessage.vue";
import UsernameInput from "./UsernameInput.vue";
import PasswordInput from "./PasswordInput.vue";

const username = ref("");
const password = ref("");
const signInFailed = ref(false);
const signInButtonClass = ref({
	btn: true,
	"btn-primary": true,
	"btn-disabled": false
});

const router = useRouter();
const queryClient = useQueryClient();

const { mutate: authenticate, isPending } = useMutation({
	async mutationFn() {
		return ky.post("/api/authenticate", {
			json: {
				username: username.value,
				password: password.value
			}
		});
	},
	onError() {
		signInFailed.value = true;
	},
	async onSuccess() {
		await queryClient.invalidateQueries({ queryKey: ["session"] });
		await router.push({ name: "teams-selection" });
	}
});

watch([username, password], () => {
	signInFailed.value = false;
});

watch(isPending, () => {
	signInButtonClass.value["btn-disabled"] = isPending.value;
});
</script>

<template>
	<AlertErrorMessage v-if="signInFailed" error-message="Login fehlgeschlagen" />

	<section
		class="bg-neutral col-start-1 col-end-5 grid grid-cols-subgrid rounded-xl sm:col-start-2 sm:col-end-4 md:col-start-3 md:col-end-7 lg:col-start-4 lg:col-end-10"
	>
		<form
			@submit.prevent="authenticate()"
			class="col-span-full mx-6 my-8 grid grid-flow-col grid-cols-subgrid grid-rows-3 items-center gap-2 lg:col-start-2 lg:col-end-6"
		>
			<UsernameInput v-model="username" />

			<PasswordInput v-model="password" />

			<div class="col-span-full justify-self-center">
				<button type="submit" :class="signInButtonClass">Anmelden</button>
			</div>
		</form>
	</section>
</template>
