import { baseConfig } from "@enormora/eslint-config-base";
import { browserConfig } from "@enormora/eslint-config-browser";
import { typescriptConfig } from "@enormora/eslint-config-typescript";
import { nodeConfig, nodeConfigFileConfig, nodeEntryPointFileConfig } from "@enormora/eslint-config-node";
import { reactTsxConfig } from "@enormora/eslint-config-react-tsx";
import { vitestConfig } from "@enormora/eslint-config-vitest";
import pluginTanStackQuery from "@tanstack/eslint-plugin-query";
import globals from "globals";

export default [
	{
		ignores: ["drizzle/**/*", "source/browser-application/*.d.ts", "tailwind.config.js", "target/**/*"]
	},
	{
		...baseConfig,
		files: ["**/*.{js,jsx,cjs,mjs,ts,mts,cts,tsx}"],
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
			"max-lines": "off"
		}
	},
	{
		files: ["source/server-shared/player.ts", "source/server-shared/trpc-application-router.ts"],
		rules: {
			"no-barrel-files/no-barrel-files": "off"
		}
	},
	{
		...typescriptConfig,
		files: ["**/*.{ts,tsx}"]
	},
	{
		files: ["**/*.{ts,tsx}"],
		rules: {
			"@typescript-eslint/no-magic-numbers": "off",
			"@typescript-eslint/no-floating-promises": "error",
			"@stylistic/indent-binary-ops": "off",
			complexity: ["error", { max: 7 }],
			"functional/type-declaration-immutability": "off",
			"functional/prefer-immutable-types": "off",
			"import/max-dependencies": "off",
			"import/no-useless-path-segments": ["error", { noUselessIndex: false }],
			"max-statements": "off",
			"no-void": ["error", { allowAsStatement: true }]
		}
	},
	{
		...reactTsxConfig,
		files: ["**/*.tsx"]
	},
	{
		files: ["**/*.tsx"],
		plugins: {
			"@tanstack/query": pluginTanStackQuery
		},
		rules: {
			"@tanstack/query/exhaustive-deps": "error",
			"@tanstack/query/no-rest-destructuring": "error",
			"@tanstack/query/stable-query-client": "error",
			"@tanstack/query/no-unstable-deps": "error",
			"@tanstack/query/infinite-query-property-order": "error",
			"@tanstack/query/no-void-query-fn": "error"
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
		files: ["source/browser-application/**/*.{ts,tsx}"],
		languageOptions: { globals: globals["shared-node-browser"] }
	},
	{
		...browserConfig,
		files: ["source/browser-application/**/*.{ts,tsx}"]
	},
	{
		files: ["source/browser-application/**/*.{ts,tsx}"],
		rules: {
			"react/react-in-jsx-scope": "off",
			"react/jsx-no-literals": "off",
			"jsx-quotes": "off"
		},
		settings: {
			react: {
				version: "detect"
			}
		}
	},
	{
		files: ["source/browser-application/ui/*.tsx"],
		rules: {
			"react/jsx-props-no-spreading": "off"
		}
	},
	{
		files: ["source/browser-application/main.tsx"],
		rules: {
			"import/no-unassigned-import": "off"
		}
	},
	{
		files: ["source/browser-application/ui/button.tsx"],
		rules: {
			"react/button-has-type": "off"
		}
	},
	{
		...vitestConfig,
		files: ["**/*.test.ts", "**/*.test.tsx"],
		rules: {
			...vitestConfig.rules,

			"@typescript-eslint/no-magic-numbers": "off",
			"@typescript-eslint/no-shadow": "off",
			"@typescript-eslint/no-unsafe-type-assertion": "off",
			"@typescript-eslint/no-unsafe-argument": "off",
			"destructuring/in-params": "off",
			complexity: "off",
			"sonarjs/assertions-in-tests": "off"
		}
	},
	{
		files: ["source/server/database/cleanup.ts", "source/server/trpc/routers/audio.test.ts"],
		rules: {
			"sonarjs/constructor-for-side-effects": "off",
			"sonarjs/no-useless-intersection": "off"
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
