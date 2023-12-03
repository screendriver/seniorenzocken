export default {
	files: ["./source/**/*.test.ts", "./test/unit/**/*.test.ts"],
	typescript: {
		rewritePaths: {
			"source/": "target/build/source/",
			"test/": "target/build/test/",
		},
		compile: false,
	},
};
