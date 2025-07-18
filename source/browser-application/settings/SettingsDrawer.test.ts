import { suite, test, expect, vi, afterEach } from "vitest";
import { createTestingPinia } from "@pinia/testing";
import { mount } from "@vue/test-utils";
import { computed, ref } from "vue";
import { useWakeLock } from "@vueuse/core";
import SettingsDrawer from "./SettingsDrawer.vue";
import { useGameStore } from "../game-store/game-store.ts";

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

suite("<SettingsDrawer />", () => {
	test("tries to request a wake lock when it is supported and not already active", async () => {
		const wakeLock = useWakeLock();
		wakeLock.isSupported = computed(() => true);
		wakeLock.isActive = computed(() => false);
		const request = vi.spyOn(wakeLock, "request");

		const wrapper = mountSettingsDrawer();

		const playAudioCheckbox = wrapper.get("div");
		await playAudioCheckbox.trigger("click");

		expect(request).toHaveBeenCalledWith("screen");
	});

	test("does not try to request a wake lock when it is supported and already active", async () => {
		const wakeLock = useWakeLock();
		wakeLock.isSupported = computed(() => true);
		wakeLock.isActive = computed(() => true);
		const request = vi.spyOn(wakeLock, "request");

		const wrapper = mountSettingsDrawer();

		const playAudioCheckbox = wrapper.get("div");
		await playAudioCheckbox.trigger("click");

		expect(request).not.toHaveBeenCalledWith("screen");
	});

	test("does not try to request a wake lock when it is not supported", async () => {
		const wakeLock = useWakeLock();
		wakeLock.isSupported = computed(() => false);
		wakeLock.isActive = computed(() => false);
		const request = vi.spyOn(wakeLock, "request");

		const wrapper = mountSettingsDrawer();

		const playAudioCheckbox = wrapper.get("div");
		await playAudioCheckbox.trigger("click");

		expect(request).not.toHaveBeenCalled();
	});

	test('renders a label "Punkestand vorlesen"', () => {
		const wrapper = mountSettingsDrawer();

		const labelTexts = wrapper.findAll(".label-text");

		expect(labelTexts).toHaveLength(1);
		expect(labelTexts[0]?.text()).toBe("Punktestand vorlesen");
	});

	test('toggles if audio should be played when checkbox "Punktestand vorlesen" gets unchecked', async () => {
		const wrapper = mountSettingsDrawer();
		const gameStore = useGameStore();

		const playAudioCheckbox = wrapper.get("#play-audio");
		await playAudioCheckbox.trigger("change");

		expect(gameStore.shouldPlayAudio).toBe(false);
	});
});
