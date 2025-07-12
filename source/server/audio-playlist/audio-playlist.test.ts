import { suite, test, assert, expect } from "vitest";
import { Factory } from "fishery";
import { isErr, isOk } from "true-myth/result";
import { generateAudioPlaylist, type SelectedGamePointAudio, type Options } from "./audio-playlist.ts";

const selectedGamePointAudioFactory = Factory.define<SelectedGamePointAudio>(() => {
	return {
		gamePointAudioId: 0,
		name: "attention.m4a",
		gamePoints: null,
	};
});

const optionsFactory = Factory.define<Options>(() => {
	return {
		allAudios: [],
		team1MatchTotalGamePoints: 0,
		team2MatchTotalGamePoints: 0,
		isStretched: false,
		hasWon: false,
	};
});

suite("generateAudioPlaylist()", () => {
	test("returns an Result Err when attention.m4a could not be found", () => {
		const options = optionsFactory.build({
			allAudios: [
				selectedGamePointAudioFactory.build({ name: "zero.m4a", gamePoints: 0 }),
				selectedGamePointAudioFactory.build({ name: "to.m4a" }),
			],
		});

		expect(isErr(generateAudioPlaylist(options))).toBe(true);
	});

	test("returns an Result Err when to.m4a could not be found", () => {
		const options = optionsFactory.build({
			allAudios: [
				selectedGamePointAudioFactory.build({ name: "attention.m4a" }),
				selectedGamePointAudioFactory.build({ name: "zero.m4a", gamePoints: 0 }),
			],
		});

		expect(isErr(generateAudioPlaylist(options))).toBe(true);
	});

	test("returns an Result Err when zero.m4a could not be found", () => {
		const options = optionsFactory.build({
			allAudios: [
				selectedGamePointAudioFactory.build({ name: "attention.m4a" }),
				selectedGamePointAudioFactory.build({ name: "to.m4a" }),
			],
		});

		expect(isErr(generateAudioPlaylist(options))).toBe(true);
	});

	test("returns an Result Err when two.m4a could not be found", () => {
		const options = optionsFactory.build({
			allAudios: [
				selectedGamePointAudioFactory.build({ name: "attention.m4a" }),
				selectedGamePointAudioFactory.build({ name: "to.m4a" }),
				selectedGamePointAudioFactory.build({ name: "zero.m4a", gamePoints: 0 }),
			],
			team1MatchTotalGamePoints: 2,
		});

		expect(isErr(generateAudioPlaylist(options))).toBe(true);
	});

	test("returns an Result Err when three.m4a could not be found", () => {
		const options = optionsFactory.build({
			allAudios: [
				selectedGamePointAudioFactory.build({ name: "attention.m4a" }),
				selectedGamePointAudioFactory.build({ name: "to.m4a" }),
				selectedGamePointAudioFactory.build({ name: "zero.m4a", gamePoints: 0 }),
			],
			team1MatchTotalGamePoints: 3,
		});

		expect(isErr(generateAudioPlaylist(options))).toBe(true);
	});

	test("returns an Result Err when four.m4a could not be found", () => {
		const options = optionsFactory.build({
			allAudios: [
				selectedGamePointAudioFactory.build({ name: "attention.m4a" }),
				selectedGamePointAudioFactory.build({ name: "to.m4a" }),
				selectedGamePointAudioFactory.build({ name: "zero.m4a", gamePoints: 0 }),
			],
			team1MatchTotalGamePoints: 4,
		});

		expect(isErr(generateAudioPlaylist(options))).toBe(true);
	});

	test("returns an Result Err when five.m4a could not be found", () => {
		const options = optionsFactory.build({
			allAudios: [
				selectedGamePointAudioFactory.build({ name: "attention.m4a" }),
				selectedGamePointAudioFactory.build({ name: "to.m4a" }),
				selectedGamePointAudioFactory.build({ name: "zero.m4a", gamePoints: 0 }),
			],
			team1MatchTotalGamePoints: 5,
		});

		expect(isErr(generateAudioPlaylist(options))).toBe(true);
	});

	test("returns an Result Err when six.m4a could not be found", () => {
		const options = optionsFactory.build({
			allAudios: [
				selectedGamePointAudioFactory.build({ name: "attention.m4a" }),
				selectedGamePointAudioFactory.build({ name: "to.m4a" }),
				selectedGamePointAudioFactory.build({ name: "zero.m4a", gamePoints: 0 }),
			],
			team1MatchTotalGamePoints: 6,
		});

		expect(isErr(generateAudioPlaylist(options))).toBe(true);
	});

	test("returns an Result Err when seven.m4a could not be found", () => {
		const options = optionsFactory.build({
			allAudios: [
				selectedGamePointAudioFactory.build({ name: "attention.m4a" }),
				selectedGamePointAudioFactory.build({ name: "to.m4a" }),
				selectedGamePointAudioFactory.build({ name: "zero.m4a", gamePoints: 0 }),
			],
			team1MatchTotalGamePoints: 7,
		});

		expect(isErr(generateAudioPlaylist(options))).toBe(true);
	});

	test("returns an Result Err when eight.m4a could not be found", () => {
		const options = optionsFactory.build({
			allAudios: [
				selectedGamePointAudioFactory.build({ name: "attention.m4a" }),
				selectedGamePointAudioFactory.build({ name: "to.m4a" }),
				selectedGamePointAudioFactory.build({ name: "zero.m4a", gamePoints: 0 }),
			],
			team1MatchTotalGamePoints: 8,
		});

		expect(isErr(generateAudioPlaylist(options))).toBe(true);
	});

	test("returns an Result Err when nine.m4a could not be found", () => {
		const options = optionsFactory.build({
			allAudios: [
				selectedGamePointAudioFactory.build({ name: "attention.m4a" }),
				selectedGamePointAudioFactory.build({ name: "to.m4a" }),
				selectedGamePointAudioFactory.build({ name: "zero.m4a", gamePoints: 0 }),
			],
			team1MatchTotalGamePoints: 9,
		});

		expect(isErr(generateAudioPlaylist(options))).toBe(true);
	});

	test("returns an Result Err when ten.m4a could not be found", () => {
		const options = optionsFactory.build({
			allAudios: [
				selectedGamePointAudioFactory.build({ name: "attention.m4a" }),
				selectedGamePointAudioFactory.build({ name: "to.m4a" }),
				selectedGamePointAudioFactory.build({ name: "zero.m4a", gamePoints: 0 }),
			],
			team1MatchTotalGamePoints: 10,
		});

		expect(isErr(generateAudioPlaylist(options))).toBe(true);
	});

	test("returns an Result Err when eleven.m4a could not be found", () => {
		const options = optionsFactory.build({
			allAudios: [
				selectedGamePointAudioFactory.build({ name: "attention.m4a" }),
				selectedGamePointAudioFactory.build({ name: "to.m4a" }),
				selectedGamePointAudioFactory.build({ name: "zero.m4a", gamePoints: 0 }),
			],
			team1MatchTotalGamePoints: 11,
		});

		expect(isErr(generateAudioPlaylist(options))).toBe(true);
	});

	test("returns an Result Err when twelve.m4a could not be found", () => {
		const options = optionsFactory.build({
			allAudios: [
				selectedGamePointAudioFactory.build({ name: "attention.m4a" }),
				selectedGamePointAudioFactory.build({ name: "to.m4a" }),
				selectedGamePointAudioFactory.build({ name: "zero.m4a", gamePoints: 0 }),
			],
			team1MatchTotalGamePoints: 12,
		});

		expect(isErr(generateAudioPlaylist(options))).toBe(true);
	});

	test("returns an Result Err when thirteen.m4a could not be found", () => {
		const options = optionsFactory.build({
			allAudios: [
				selectedGamePointAudioFactory.build({ name: "attention.m4a" }),
				selectedGamePointAudioFactory.build({ name: "to.m4a" }),
				selectedGamePointAudioFactory.build({ name: "zero.m4a", gamePoints: 0 }),
			],
			team1MatchTotalGamePoints: 13,
		});

		expect(isErr(generateAudioPlaylist(options))).toBe(true);
	});

	test("returns an Result Err when fourteen.m4a could not be found", () => {
		const options = optionsFactory.build({
			allAudios: [
				selectedGamePointAudioFactory.build({ name: "attention.m4a" }),
				selectedGamePointAudioFactory.build({ name: "to.m4a" }),
				selectedGamePointAudioFactory.build({ name: "zero.m4a", gamePoints: 0 }),
			],
			team1MatchTotalGamePoints: 14,
		});

		expect(isErr(generateAudioPlaylist(options))).toBe(true);
	});

	test("returns an Result Err when fifteen.m4a could not be found", () => {
		const options = optionsFactory.build({
			allAudios: [
				selectedGamePointAudioFactory.build({ name: "attention.m4a" }),
				selectedGamePointAudioFactory.build({ name: "to.m4a" }),
				selectedGamePointAudioFactory.build({ name: "zero.m4a", gamePoints: 0 }),
			],
			team1MatchTotalGamePoints: 15,
		});

		expect(isErr(generateAudioPlaylist(options))).toBe(true);
	});

	test("returns an Result Err when sixteen.m4a could not be found", () => {
		const options = optionsFactory.build({
			allAudios: [
				selectedGamePointAudioFactory.build({ name: "attention.m4a" }),
				selectedGamePointAudioFactory.build({ name: "to.m4a" }),
				selectedGamePointAudioFactory.build({ name: "zero.m4a", gamePoints: 0 }),
			],
			team1MatchTotalGamePoints: 16,
		});

		expect(isErr(generateAudioPlaylist(options))).toBe(true);
	});

	test("returns an Result Err when seventeen.m4a could not be found", () => {
		const options = optionsFactory.build({
			allAudios: [
				selectedGamePointAudioFactory.build({ name: "attention.m4a" }),
				selectedGamePointAudioFactory.build({ name: "to.m4a" }),
				selectedGamePointAudioFactory.build({ name: "zero.m4a", gamePoints: 0 }),
			],
			team1MatchTotalGamePoints: 18,
		});

		expect(isErr(generateAudioPlaylist(options))).toBe(true);
	});

	test("returns an Result Err when eighteen.m4a could not be found", () => {
		const options = optionsFactory.build({
			allAudios: [
				selectedGamePointAudioFactory.build({ name: "attention.m4a" }),
				selectedGamePointAudioFactory.build({ name: "to.m4a" }),
				selectedGamePointAudioFactory.build({ name: "zero.m4a", gamePoints: 0 }),
			],
			team1MatchTotalGamePoints: 18,
		});

		expect(isErr(generateAudioPlaylist(options))).toBe(true);
	});

	test("returns an Result Err when stretched.m4a could not be found", () => {
		const options = optionsFactory.build({
			allAudios: [
				selectedGamePointAudioFactory.build({ name: "attention.m4a" }),
				selectedGamePointAudioFactory.build({ name: "to.m4a" }),
				selectedGamePointAudioFactory.build({ name: "zero.m4a", gamePoints: 0 }),
			],
			isStretched: true,
		});

		expect(isErr(generateAudioPlaylist(options))).toBe(true);
	});

	test("returns an Result Err when won.m4a could not be found", () => {
		const options = optionsFactory.build({
			allAudios: [
				selectedGamePointAudioFactory.build({ name: "attention.m4a" }),
				selectedGamePointAudioFactory.build({ name: "to.m4a" }),
				selectedGamePointAudioFactory.build({ name: "zero.m4a", gamePoints: 0 }),
			],
			hasWon: true,
		});

		expect(isErr(generateAudioPlaylist(options))).toBe(true);
	});

	test("returns an Result Ok without stretched.m4a and won.m4a when no team is stretched and no team has won", () => {
		const options = optionsFactory.build({
			allAudios: [
				selectedGamePointAudioFactory.build({ name: "attention.m4a" }),
				selectedGamePointAudioFactory.build({ name: "ten.m4a", gamePoints: 10 }),
				selectedGamePointAudioFactory.build({ name: "to.m4a" }),
				selectedGamePointAudioFactory.build({ name: "five.m4a", gamePoints: 5 }),
			],
			team1MatchTotalGamePoints: 10,
			team2MatchTotalGamePoints: 5,
			isStretched: false,
			hasWon: false,
		});

		const audioPlaylist = generateAudioPlaylist(options);

		assert(isOk(audioPlaylist));
		expect(audioPlaylist.value).toEqual([
			{
				gamePointAudioId: 0,
				gamePoints: null,
				name: "attention.m4a",
			},
			{
				gamePointAudioId: 0,
				gamePoints: 10,
				name: "ten.m4a",
			},
			{
				gamePointAudioId: 0,
				gamePoints: null,
				name: "to.m4a",
			},
			{
				gamePointAudioId: 0,
				gamePoints: 5,
				name: "five.m4a",
			},
		]);
	});

	test("returns an Result Ok with stretched.m4a but without won.m4a when one team is stretched but no team has won", () => {
		const options = optionsFactory.build({
			allAudios: [
				selectedGamePointAudioFactory.build({ name: "attention.m4a" }),
				selectedGamePointAudioFactory.build({ name: "eight.m4a", gamePoints: 8 }),
				selectedGamePointAudioFactory.build({ name: "to.m4a" }),
				selectedGamePointAudioFactory.build({ name: "twelve.m4a", gamePoints: 12 }),
				selectedGamePointAudioFactory.build({ name: "stretched.m4a" }),
			],
			team1MatchTotalGamePoints: 8,
			team2MatchTotalGamePoints: 12,
			isStretched: true,
			hasWon: false,
		});

		const audioPlaylist = generateAudioPlaylist(options);

		assert(isOk(audioPlaylist));
		expect(audioPlaylist.value).toEqual([
			{
				gamePointAudioId: 0,
				gamePoints: null,
				name: "attention.m4a",
			},
			{
				gamePointAudioId: 0,
				gamePoints: 8,
				name: "eight.m4a",
			},
			{
				gamePointAudioId: 0,
				gamePoints: null,
				name: "to.m4a",
			},
			{
				gamePointAudioId: 0,
				gamePoints: 12,
				name: "twelve.m4a",
			},
			{
				gamePointAudioId: 0,
				gamePoints: null,
				name: "stretched.m4a",
			},
		]);
	});

	test("returns an Result Ok with stretched.m4a and won.m4a when one team is stretched and has won", () => {
		const options = optionsFactory.build({
			allAudios: [
				selectedGamePointAudioFactory.build({ name: "attention.m4a" }),
				selectedGamePointAudioFactory.build({ name: "eleven.m4a", gamePoints: 11 }),
				selectedGamePointAudioFactory.build({ name: "to.m4a" }),
				selectedGamePointAudioFactory.build({ name: "fifteen.m4a", gamePoints: 15 }),
				selectedGamePointAudioFactory.build({ name: "stretched.m4a" }),
				selectedGamePointAudioFactory.build({ name: "won.m4a" }),
			],
			team1MatchTotalGamePoints: 11,
			team2MatchTotalGamePoints: 15,
			isStretched: true,
			hasWon: true,
		});

		const audioPlaylist = generateAudioPlaylist(options);

		assert(isOk(audioPlaylist));
		expect(audioPlaylist.value).toEqual([
			{
				gamePointAudioId: 0,
				gamePoints: null,
				name: "attention.m4a",
			},
			{
				gamePointAudioId: 0,
				gamePoints: 11,
				name: "eleven.m4a",
			},
			{
				gamePointAudioId: 0,
				gamePoints: null,
				name: "to.m4a",
			},
			{
				gamePointAudioId: 0,
				gamePoints: 15,
				name: "fifteen.m4a",
			},
			{
				gamePointAudioId: 0,
				gamePoints: null,
				name: "stretched.m4a",
			},
			{
				gamePointAudioId: 0,
				gamePoints: null,
				name: "won.m4a",
			},
		]);
	});
});
