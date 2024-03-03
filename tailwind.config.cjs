/** @type {import('tailwindcss').Config} */

module.exports = {
	content: ["./source/app.html", "./source/**/*.svelte"],
	plugins: [require("daisyui")],
	daisyui: {
		themes: ["dark"],
	},
	theme: {
		extend: {
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
