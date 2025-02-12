import { test, expect, vi } from "vitest";
import { mountSuspended, mockNuxtImport } from "@nuxt/test-utils/runtime";
import { createTestingPinia } from "@pinia/testing";
import type { VueWrapper } from "@vue/test-utils";
import SettingsDrawer from "../SettingsDrawer.vue";

vi.resetModules();

const wakeLockMock: ReturnType<typeof useWakeLock> = {
	isSupported: computed(() => true),
	isActive: computed(() => true),
	sentinel: ref(null),
	request: vi.fn(),
	forceRequest: vi.fn(),
	release: vi.fn(),
};

const { useWakeLockMock } = vi.hoisted(() => {
	return {
		useWakeLockMock: vi.fn().mockImplementation(() => {
			return wakeLockMock;
		}),
	};
});

mockNuxtImport<typeof useWakeLock>("useWakeLock", () => {
	return useWakeLockMock;
});

function mountSettingsDrawer(): Promise<VueWrapper> {
	return mountSuspended(SettingsDrawer, {
		global: { plugins: [createTestingPinia({ createSpy: vi.fn })] },
	});
}

test("<SettingsDrawer /> tries to request a wake lock when it is supported", async () => {
	const wakeLock = useWakeLock();
	const request = vi.spyOn(wakeLock, "request");

	await mountSettingsDrawer();

	expect(request).toHaveBeenCalledWith("screen");
});

test("<SettingsDrawer /> does not try to request a wake lock when it is not supported", async () => {
	useWakeLockMock.mockImplementation(() => {
		return { ...wakeLockMock, isSupported: computed(() => false) };
	});
	const wakeLock = useWakeLock();
	const request = vi.spyOn(wakeLock, "request");

	await mountSettingsDrawer();

	expect(request).not.toHaveBeenCalled();
});

test('<SettingsDrawer /> renders a label "Display aktiv"', async () => {
	const wrapper = await mountSettingsDrawer();

	const labelTexts = wrapper.findAll(".label-text");

	expect(labelTexts).toHaveLength(2);
	expect(labelTexts[0]?.text()).toBe("Display aktiv");
});

test('<SettingsDrawer /> renders a label "Punkestand vorlesen"', async () => {
	const wrapper = await mountSettingsDrawer();

	const labelTexts = wrapper.findAll(".label-text");

	expect(labelTexts).toHaveLength(2);
	expect(labelTexts[1]?.text()).toBe("Punktestand vorlesen");
});

test('<SettingsDrawer /> toggles if audio should be played when checkbox "Punktestand vorlesen" gets checked', async () => {
	const wrapper = await mountSettingsDrawer();
	const gameStore = useGameStore();

	const playAudioCheckbox = wrapper.get("#play-audio");
	await playAudioCheckbox.trigger("change");

	expect(gameStore.toggleShouldPlayAudio).toHaveBeenCalledOnce();
});
