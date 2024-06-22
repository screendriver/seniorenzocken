/** @type {import('tailwindcss').Config} */
export default {
	plugins: [require("daisyui")],
	daisyui: {
		themes: ["business"],
		logs: false,
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
	plugins: [],
};
