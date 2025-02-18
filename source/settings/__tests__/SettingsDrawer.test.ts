import { test, expect, vi, afterEach } from "vitest";
import { createTestingPinia } from "@pinia/testing";
import { mount } from "@vue/test-utils";
import { computed, ref } from "vue";
import { useWakeLock } from "@vueuse/core";
import SettingsDrawer from "../SettingsDrawer.vue";
import { useGameStore } from "../../game-store/game-store";

vi.mock("vue-router");

vi.mock("@vueuse/core", () => {
	return {
		useWakeLock: vi.fn().mockReturnValue({
			isSupported: computed(() => true),
			isActive: computed(() => true),
			sentinel: ref(null),
			request: vi.fn(),
			forceRequest: vi.fn(),
			release: vi.fn(),
		}),
	};
});

function mountSettingsDrawer() {
	return mount(SettingsDrawer, {
		global: { plugins: [createTestingPinia({ createSpy: vi.fn })] },
	});
}

afterEach(() => {
	vi.clearAllMocks();
});

test("<SettingsDrawer /> tries to request a wake lock when it is supported", () => {
	const wakeLock = useWakeLock();
	const request = vi.spyOn(wakeLock, "request");

	mountSettingsDrawer();

	expect(request).toHaveBeenCalledWith("screen");
});

test("<SettingsDrawer /> does not try to request a wake lock when it is not supported", () => {
	useWakeLock().isSupported = computed(() => false);
	const wakeLock = useWakeLock();
	const request = vi.spyOn(wakeLock, "request");

	mountSettingsDrawer();

	expect(request).not.toHaveBeenCalled();
});

test('<SettingsDrawer /> renders a label "Display aktiv"', () => {
	const wrapper = mountSettingsDrawer();

	const labelTexts = wrapper.findAll(".label-text");

	expect(labelTexts).toHaveLength(2);
	expect(labelTexts[0]?.text()).toBe("Display aktiv");
});

test('<SettingsDrawer /> renders a label "Punkestand vorlesen"', () => {
	const wrapper = mountSettingsDrawer();

	const labelTexts = wrapper.findAll(".label-text");

	expect(labelTexts).toHaveLength(2);
	expect(labelTexts[1]?.text()).toBe("Punktestand vorlesen");
});

test('<SettingsDrawer /> toggles if audio should be played when checkbox "Punktestand vorlesen" gets checked', async () => {
	const wrapper = mountSettingsDrawer();
	const gameStore = useGameStore();

	const playAudioCheckbox = wrapper.get("#play-audio");
	await playAudioCheckbox.trigger("change");

	expect(gameStore.toggleShouldPlayAudio).toHaveBeenCalledOnce();
});
