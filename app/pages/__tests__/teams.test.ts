import { test, expect, vi } from "vitest";
import { mountSuspended, mockNuxtImport } from "@nuxt/test-utils/runtime";
import type { VueWrapper } from "@vue/test-utils";
import { createTestingPinia } from "@pinia/testing";
import type { PartialDeep } from "type-fest";
import Teams from "../teams.vue";
import type { GameStore } from "~/stores/game-store";

mockNuxtImport("navigateTo", () => {
	return vi.fn();
});

function mountTeams(initialGameStoreState?: PartialDeep<GameStore>): Promise<VueWrapper> {
	return mountSuspended(Teams, {
		global: {
			plugins: [
				createTestingPinia({
					createSpy: vi.fn,
					initialState: {
						game: initialGameStoreState,
					},
				}),
			],
		},
	});
}

test('<Teams /> renders a "Team 1" label', async () => {
	const wrapper = await mountTeams();

	const labelTexts = wrapper.findAll("label");

	expect(labelTexts).toHaveLength(2);
	expect(labelTexts[0]?.text()).toBe("Team 1");
});

test('<Teams /> renders a "Team 2" label', async () => {
	const wrapper = await mountTeams();

	const labelTexts = wrapper.findAll("label");

	expect(labelTexts).toHaveLength(2);
	expect(labelTexts[1]?.text()).toBe("Team 2");
});

test("<Teams /> renders a submit button", async () => {
	const wrapper = await mountTeams();

	const submitButton = wrapper.find("button");
	const typeAttribute = submitButton.attributes()["type"];

	expect(typeAttribute).toBe("submit");
	expect(submitButton.text()).toBe("Spiel starten");
});

test("<Teams /> submit button is disabled by default", async () => {
	const wrapper = await mountTeams();

	const submitButton = wrapper.get("button");
	const disabledAttribute = submitButton.attributes()["disabled"];

	expect(disabledAttribute).toBe("");
});

test("<Teams /> submit button is still disabled when Team 1 name is filled but Team 2 name is empty", async () => {
	const wrapper = await mountTeams({
		team1: { teamName: "foo" },
	});

	const submitButton = wrapper.get("button");
	const disabledAttribute = submitButton.attributes()["disabled"];

	expect(disabledAttribute).toBe("");
});

test("<Teams /> submit button is still disabled when Team 2 name is filled but Team 1 name is empty", async () => {
	const wrapper = await mountTeams({
		team2: { teamName: "bar" },
	});

	const submitButton = wrapper.get("button");
	const disabledAttribute = submitButton.attributes()["disabled"];

	expect(disabledAttribute).toBe("");
});

test("<Teams /> submit button is enabled when Team 1 and Team 2 name is filled", async () => {
	const wrapper = await mountTeams({
		team1: { teamName: "foo" },
		team2: { teamName: "bar" },
	});

	const submitButton = wrapper.get("button");
	const disabledAttribute = submitButton.attributes()["disabled"];

	expect(disabledAttribute).toBeUndefined();
});

test("<Teams /> changes the name of Team 1 when entering text", async () => {
	const wrapper = await mountTeams({
		team1: { teamName: "foo" },
	});
	const gameStore = useGameStore();

	const team1NameInput = wrapper.get("#team1-name");
	await team1NameInput.setValue("bar");

	expect(gameStore.team1.teamName).toBe("bar");
});

test("<Teams /> changes the name of Team 2 when entering text", async () => {
	const wrapper = await mountTeams({
		team2: { teamName: "foo" },
	});
	const gameStore = useGameStore();

	const team2NameInput = wrapper.get("#team2-name");
	await team2NameInput.setValue("bar");

	expect(gameStore.team2.teamName).toBe("bar");
});

test("<Teams /> navigates to /game route when submitting the form", async () => {
	const wrapper = await mountTeams({
		team1: { teamName: "foo" },
		team2: { teamName: "bar" },
	});
	const gameStore = useGameStore();

	wrapper.find("form").trigger("submit");

	expect(gameStore.isGameRunning).toBe(true);
	expect(navigateTo).toHaveBeenCalledWith({ name: "game", replace: true });
});
