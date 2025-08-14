import { baseConfig } from "@enormora/eslint-config-base";
import { browserConfig } from "@enormora/eslint-config-browser";
import { typescriptConfig } from "@enormora/eslint-config-typescript";
import { nodeConfig, nodeConfigFileConfig, nodeEntryPointFileConfig } from "@enormora/eslint-config-node";
import { vueConfig } from "@enormora/eslint-config-vue-ts";
import { vitestConfig } from "@enormora/eslint-config-vitest";
import globals from "globals";

export default [
	{
		ignores: ["drizzle/**/*", "source/browser-application/vue-shim.d.ts", "tailwind.config.js", "target/**/*"]
	},
	{
		...baseConfig,
		files: ["**/*.{js,jsx,cjs,mjs,ts,mts,cts,vue}"],
		rules: {
			...baseConfig.rules,

			"@cspell/spellchecker": "off",
			"@stylistic/quotes": ["error", "double", { avoidEscape: true }],
			"@stylistic/no-tabs": "off",
			"@stylistic/indent": [
				"error",
				"tab",
				{
					SwitchCase: 1,
					VariableDeclarator: 1,
					MemberExpression: 1
				}
			],
			"@stylistic/max-len": "off",
			"max-lines": "off",
			"import/no-unassigned-import": "off",
			"import/no-cycle": "off"
		}
	},
	{
		...typescriptConfig,
		files: ["**/*.ts"]
	},
	{
		files: ["**/*.ts"],
		rules: {
			"@typescript-eslint/no-magic-numbers": "off",
			"@stylistic/indent-binary-ops": "off",
			complexity: ["error", { max: 7 }],
			"functional/type-declaration-immutability": "off",
			"functional/prefer-immutable-types": "off",
			"import/max-dependencies": "off",
			"import/no-useless-path-segments": ["error", { noUselessIndex: false }],
			"max-statements": "off",
			"no-continue": "off",
			"no-void": "off"
		}
	},
	{
		...vueConfig,
		files: ["**/*.vue"]
	},
	{
		files: ["**/*.vue"],
		rules: {
			"vue/no-bare-strings-in-template": "off",
			"no-useless-assignment": "off"
		},
		languageOptions: {
			globals: globals.browser
		}
	},
	{
		...nodeConfig,
		files: ["source/server/**/*.ts"],
		languageOptions: {
			globals: {
				...globals.es2024,
				...globals.nodeBuiltin,
				NodeJS: "readonly",
				RequestInit: false
			}
		}
	},
	{
		files: ["source/browser-application/**/*.ts"],
		languageOptions: { globals: globals["shared-node-browser"] }
	},
	{
		...browserConfig,
		files: ["source/browser-application/**/*.ts"]
	},
	{
		...vitestConfig,
		files: ["**/*.test.ts"],
		rules: {
			...vitestConfig.rules,

			"@typescript-eslint/no-magic-numbers": "off",
			"@typescript-eslint/no-shadow": "off",
			"@typescript-eslint/no-unsafe-type-assertion": "off",
			"@typescript-eslint/no-unsafe-argument": "off",
			"destructuring/in-params": "off"
		}
	},
	{
		...nodeConfigFileConfig,
		files: ["drizzle.config.js", "eslint.config.js", "prettier.config.js", "vite.config.js", "vitest.config.js"]
	},
	{
		...nodeEntryPointFileConfig,
		files: ["source/server/entrypoint-local.ts", "source/server/entrypoint-production.ts"]
	}
];
