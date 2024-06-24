// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	devtools: { enabled: true },
	modules: ["@nuxtjs/tailwindcss", "@nuxt/eslint", "@nuxt/test-utils/module"],
	nitro: {
		preset: "node-server",
	},
	app: {
		head: {
			htmlAttrs: {
				lang: "de",
				"data-theme": "business",
			},
			title: "Seniorenzocken",
		},
	},
});
