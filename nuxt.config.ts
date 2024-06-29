// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	future: {
		compatibilityVersion: 4,
	},
	modules: [
		"@nuxtjs/tailwindcss",
		"@nuxt/eslint",
		"@nuxt/test-utils/module",
		"@vueuse/nuxt",
		"@pinia/nuxt",
		"@nuxtjs/html-validator",
	],
	nitro: {
		preset: "node-server",
	},
	app: {
		head: {
			htmlAttrs: {
				lang: "de",
				"data-theme": "business",
			},
			title: "Senioren zocken",
			meta: [
				{ "http-equiv": "Accept-CH", content: "DPR, Width" },
				{ name: "description", content: "Punkte sammeln für das Kartenspiel Watten" },
				{ name: "keywords", content: "Watten,Watteln,Wattlung,Kartenspiel,Punkte,Bayern" },
				{ name: "theme-color", content: "#075985" },
				{ name: "robots", content: "noimageindex" },
			],
		},
	},
});

