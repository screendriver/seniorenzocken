/** @type {import('tailwindcss').Config} */

module.exports = {
	content: ["./source/app.html", "./source/**/*.svelte", "./node_modules/flowbite-svelte/**/*.{html,js,svelte,ts}"],
	plugins: [require("flowbite/plugin")],
	theme: {
		extend: {
			colors: {
				// flowbite-svelte
				primary: {
					50: "#ecfeff",
					100: "#cffafe",
					200: "#a5f3fc",
					300: "#67e8f9",
					400: "#22d3ee",
					500: "#06b6d4",
					600: "#0891b2",
					700: "#0e7490",
					800: "#155e75",
					900: "#164e63",
				},
			},
			animation: {
				"blinking-text": "blinkingText 0.8s infinite",
			},
			keyframes: {
				blinkingText: {
					"0%": {
						opacity: 0,
					},

					"49%": {
						opacity: 0,
					},

					"50%": {
						opacity: 1,
					},
				},
			},
		},
	},
};
