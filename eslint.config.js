import pluginVue from "eslint-plugin-vue";
import { defineConfigWithVueTs, vueTsConfigs } from "@vue/eslint-config-typescript";
import pluginVitest from "@vitest/eslint-plugin";
import skipFormatting from "@vue/eslint-config-prettier/skip-formatting";

export default defineConfigWithVueTs(
	{
		name: "application",
		files: ["**/*.{ts,vue}"],
	},

	{
		name: "app/files-to-ignore",
		ignores: ["tailwind.config.js", "**/dist/**", "**/dist-ssr/**", "**/coverage/**", "**/target/**"],
	},

	pluginVue.configs["flat/essential"],
	vueTsConfigs.recommended,

	{
		...pluginVitest.configs.recommended,
		files: ["source/**/__tests__/*"],
	},
	skipFormatting,
);
