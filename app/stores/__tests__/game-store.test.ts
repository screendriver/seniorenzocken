import { test, expect, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { Factory } from "fishery";
import { useGameStore } from "../game-store";

const teamFactory = Factory.define<Team>(() => {
	return {
		teamNumber: 1,
		teamName: "",
		gamePoints: 0,
		isStretched: false,
	};
});

beforeEach(() => {
	setActivePinia(createPinia());
});

test("game store has an initial team1 set", () => {
	const gameStore = useGameStore();
	const expected = teamFactory.build({ teamNumber: 1 });

	expect(gameStore.team1).toStrictEqual(expected);
});

test("game store has an initial team2 set", () => {
	const gameStore = useGameStore();
	const expected = teamFactory.build({ teamNumber: 2 });

	expect(gameStore.team2).toStrictEqual(expected);
});

test("game store has an initial team 1 game point set", () => {
	const gameStore = useGameStore();

	expect(gameStore.team1GamePoint).toBe(0);
});

test("game store has an initial team 2 game point set", () => {
	const gameStore = useGameStore();

	expect(gameStore.team2GamePoint).toBe(0);
});

test('game store has an initial "should play audio" property set', () => {
	const gameStore = useGameStore();

	expect(gameStore.shouldPlayAudio).toBe(true);
});

test('game store has an initial "is audio playing" property set', () => {
	const gameStore = useGameStore();

	expect(gameStore.isAudioPlaying).toBe(false);
});

test("game store has an initial game rounds property set", () => {
	const gameStore = useGameStore();

	expect(gameStore.gameRounds).toHaveLength(0);
});

test('game store has an initial "show confetti" property set', () => {
	const gameStore = useGameStore();

	expect(gameStore.showConfetti).toBe(false);
});

test('game store toggleShouldPlayAudio() sets "shouldPlayAudio" to false when it was previously true', () => {
	const gameStore = useGameStore();

	gameStore.toggleShouldPlayAudio();

	expect(gameStore.shouldPlayAudio).toBe(false);
});

test('game store toggleShouldPlayAudio() sets "shouldPlayAudio" to true when it was previously false', () => {
	const gameStore = useGameStore();

	gameStore.toggleShouldPlayAudio();
	gameStore.toggleShouldPlayAudio();

	expect(gameStore.shouldPlayAudio).toBe(true);
});

test('game store "allTeamsAtZeroGamePoints" equals true when both teams has 0 game points', () => {
	const gameStore = useGameStore();
	gameStore.team1GamePoint = 0;
	gameStore.team2GamePoint = 0;

	expect(gameStore.allTeamsAtZeroGamePoints).toBe(true);
});

test('game store "allTeamsAtZeroGamePoints" equals false when team 1 has 0 game points', () => {
	const gameStore = useGameStore();
	gameStore.team1GamePoint = 0;
	gameStore.team2GamePoint = 2;

	expect(gameStore.allTeamsAtZeroGamePoints).toBe(false);
});

test('game store "allTeamsAtZeroGamePoints" equals false when team 2 has 0 game points', () => {
	const gameStore = useGameStore();
	gameStore.team1GamePoint = 2;
	gameStore.team2GamePoint = 0;

	expect(gameStore.allTeamsAtZeroGamePoints).toBe(false);
});

test('game store "allTeamsAtZeroGamePoints" equals false when both teams has 0 game points', () => {
	const gameStore = useGameStore();
	gameStore.team1GamePoint = 2;
	gameStore.team2GamePoint = 2;

	expect(gameStore.allTeamsAtZeroGamePoints).toBe(false);
});

test('game store "isGamePointEnabled" equals true when all teams has zero game points and given game point equals 0', () => {
	const gameStore = useGameStore();
	gameStore.isAudioPlaying = false;
	gameStore.team1GamePoint = 0;
	gameStore.team2GamePoint = 0;

	const isGamePointEnabled = gameStore.isGamePointEnabled(0);

	expect(isGamePointEnabled).toBe(true);
});

test('game store "isGamePointEnabled" equals true when all teams has zero game points and given game point is greater than 0', () => {
	const gameStore = useGameStore();
	gameStore.isAudioPlaying = false;
	gameStore.team1GamePoint = 0;
	gameStore.team2GamePoint = 0;

	const isGamePointEnabled = gameStore.isGamePointEnabled(2);

	expect(isGamePointEnabled).toBe(true);
});

test('game store "isGamePointEnabled" equals true when no team has zero game points but given game point is greater 0', () => {
	const gameStore = useGameStore();
	gameStore.isAudioPlaying = false;
	gameStore.team1GamePoint = 2;
	gameStore.team2GamePoint = 4;

	const isGamePointEnabled = gameStore.isGamePointEnabled(2);

	expect(isGamePointEnabled).toBe(true);
});

test('game store "isGamePointEnabled" equals false when no team has zero game points and given game point equals 0', () => {
	const gameStore = useGameStore();
	gameStore.isAudioPlaying = false;
	gameStore.team1GamePoint = 2;
	gameStore.team2GamePoint = 4;

	const isGamePointEnabled = gameStore.isGamePointEnabled(0);

	expect(isGamePointEnabled).toBe(false);
});

test('game store "isGamePointEnabled" equals false when audio is currently playing', () => {
	const gameStore = useGameStore();
	gameStore.isAudioPlaying = true;
	gameStore.team1GamePoint = 2;
	gameStore.team2GamePoint = 4;

	const isGamePointEnabled = gameStore.isGamePointEnabled(2);

	expect(isGamePointEnabled).toBe(false);
});

test('game store "isNextGameRoundEnabled" equals false when all teams has 0 game points and audio is not playing', () => {
	const gameStore = useGameStore();
	gameStore.team1GamePoint = 0;
	gameStore.team2GamePoint = 0;
	gameStore.isAudioPlaying = false;

	expect(gameStore.isNextGameRoundEnabled).toBe(false);
});

test('game store "isNextGameRoundEnabled" equals false when all teams has 0 game points and audio is playing', () => {
	const gameStore = useGameStore();
	gameStore.team1GamePoint = 0;
	gameStore.team2GamePoint = 0;
	gameStore.isAudioPlaying = true;

	expect(gameStore.isNextGameRoundEnabled).toBe(false);
});

test('game store "isNextGameRoundEnabled" equals true when team 1 has 0 game points and audio is not playing', () => {
	const gameStore = useGameStore();
	gameStore.team1GamePoint = 0;
	gameStore.team2GamePoint = 2;
	gameStore.isAudioPlaying = false;

	expect(gameStore.isNextGameRoundEnabled).toBe(true);
});

test('game store "isNextGameRoundEnabled" equals true when team 2 has 0 game points and audio is not playing', () => {
	const gameStore = useGameStore();
	gameStore.team1GamePoint = 2;
	gameStore.team2GamePoint = 0;
	gameStore.isAudioPlaying = false;

	expect(gameStore.isNextGameRoundEnabled).toBe(true);
});

test('game store "isNextGameRoundEnabled" equals false when team 1 has 0 game points and audio is playing', () => {
	const gameStore = useGameStore();
	gameStore.team1GamePoint = 0;
	gameStore.team2GamePoint = 2;
	gameStore.isAudioPlaying = true;

	expect(gameStore.isNextGameRoundEnabled).toBe(false);
});

test('game store "isNextGameRoundEnabled" equals false when team 2 has 0 game points and audio is playing', () => {
	const gameStore = useGameStore();
	gameStore.team1GamePoint = 2;
	gameStore.team2GamePoint = 0;
	gameStore.isAudioPlaying = true;

	expect(gameStore.isNextGameRoundEnabled).toBe(false);
});
