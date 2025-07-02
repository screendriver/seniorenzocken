import { test, expect, beforeEach, vi, afterEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import Maybe from "true-myth/maybe";
import { useAudioPlaylistStore } from "../audio-playlist-store.js";

beforeEach(() => {
	setActivePinia(createPinia());
});

afterEach(() => {
	vi.clearAllMocks();
});

test("audio playlist store has initial an empty audio playlist set", () => {
	const audioPlaylistStore = useAudioPlaylistStore();

	expect(audioPlaylistStore.audioPlaylist).toStrictEqual([]);
});

test("audio playlist store has initial an audio source URL set to a Nothing", () => {
	const audioPlaylistStore = useAudioPlaylistStore();

	expect(audioPlaylistStore.audioSourceUrl).toStrictEqual(Maybe.nothing());
});

test.todo("audio playlist store generateAudioPlaylist()");

test("audio playlist store nextAudioPlaylistItem() returns a Nothing when audio playlist is empty", () => {
	const audioPlaylistStore = useAudioPlaylistStore();
	audioPlaylistStore.audioPlaylist = [];

	expect(audioPlaylistStore.nextAudioPlaylistItem()).toStrictEqual(Maybe.nothing());
	expect(audioPlaylistStore.audioSourceUrl).toStrictEqual(Maybe.nothing());
});

test("audio playlist store nextAudioPlaylistItem() returns a Nothing when audio playlist has only one item left", () => {
	const audioFileUrl = new URL("http://example.com/one.m4a");
	const audioPlaylistStore = useAudioPlaylistStore();

	audioPlaylistStore.audioPlaylist = [audioFileUrl];

	expect(audioPlaylistStore.nextAudioPlaylistItem()).toStrictEqual(Maybe.nothing());
	expect(audioPlaylistStore.audioSourceUrl).toStrictEqual(Maybe.nothing());
});

test("audio playlist store nextAudioPlaylistItem() returns a Just and sets the audio source URL when audio playlist has more than one item", () => {
	const firstAudioFileUrl = new URL("http://example.com/one.m4a");
	const secondAudioFileUrl = new URL("http://example.com/two.m4a");
	const audioPlaylistStore = useAudioPlaylistStore();

	audioPlaylistStore.audioPlaylist = [firstAudioFileUrl, secondAudioFileUrl];

	expect(audioPlaylistStore.nextAudioPlaylistItem()).toStrictEqual(Maybe.just(secondAudioFileUrl));
	expect(audioPlaylistStore.audioSourceUrl).toStrictEqual(Maybe.just(secondAudioFileUrl));
});
