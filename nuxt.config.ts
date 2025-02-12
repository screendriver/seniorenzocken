// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	compatibilityDate: "2024-07-03",

	future: {
		compatibilityVersion: 4,
	},

	modules: [
		"@nuxtjs/tailwindcss",
		"@nuxt/eslint",
		"@nuxt/test-utils/module",
		"@vueuse/nuxt",
		"@pinia/nuxt",
		"nuxt-typed-router",
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
				{ name: "description", content: "Punkte sammeln für das Kartenspiel Watten" },
				{ name: "keywords", content: "Watten,Watteln,Wattlung,Kartenspiel,Punkte,Bayern" },
				{ name: "theme-color", content: "#075985" },
				{ name: "robots", content: "noimageindex" },
			],
			link: [{ rel: "icon", type: "image/svg+xml", href: "/favicon.svg", sizes: "any" }],
		},
	},

	runtimeConfig: {
		public: {
			pocketBaseBaseUrl: "http://localhost:8081",
		},
	},
});
