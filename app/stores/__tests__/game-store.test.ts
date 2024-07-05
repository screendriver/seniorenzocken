import { test, expect, beforeEach, vi, afterEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { Factory } from "fishery";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";

const teamFactory = Factory.define<Team>(() => {
	return {
		teamNumber: 1,
		teamName: "",
		gamePoints: 0,
		isStretched: false,
	};
});

mockNuxtImport("useCloned", () => {
	return vi.fn((source) => {
		return { cloned: source };
	});
});

beforeEach(() => {
	setActivePinia(createPinia());
});

afterEach(() => {
	vi.clearAllMocks();
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

test('game store has an initial "isGameRunning" set to false', () => {
	const gameStore = useGameStore();

	expect(gameStore.isGameRunning).toBe(false);
});

test('game store mutates "isGameRunning"', () => {
	const gameStore = useGameStore();
	gameStore.isGameRunning = true;

	expect(gameStore.isGameRunning).toBe(true);
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

test('game store "nextGameRound() sets new game points on team 1', () => {
	const gameStore = useGameStore();
	gameStore.team1GamePoint = 2;

	expect(gameStore.team1.gamePoints).toBe(0);

	gameStore.nextGameRound();

	expect(gameStore.team1.gamePoints).toBe(2);
});

test('game store "nextGameRound() sets new game points on team 2', () => {
	const gameStore = useGameStore();
	gameStore.team2GamePoint = 2;

	expect(gameStore.team2.gamePoints).toBe(0);

	gameStore.nextGameRound();

	expect(gameStore.team2.gamePoints).toBe(2);
});

test('game store "nextGameRound() sets "isStretched" to true when team 1 has 12 total game points', () => {
	const gameStore = useGameStore();
	gameStore.team1.gamePoints = 10;
	gameStore.team1GamePoint = 2;

	gameStore.nextGameRound();

	expect(gameStore.team1.isStretched).toBe(true);
});

test('game store "nextGameRound() sets "isStretched" to true when team 1 more than 12 total game points', () => {
	const gameStore = useGameStore();
	gameStore.team1.gamePoints = 10;
	gameStore.team1GamePoint = 3;

	gameStore.nextGameRound();

	expect(gameStore.team1.isStretched).toBe(true);
});

test('game store "nextGameRound() sets "isStretched" to true when team 2 has 12 total game points', () => {
	const gameStore = useGameStore();
	gameStore.team2.gamePoints = 10;
	gameStore.team2GamePoint = 2;

	gameStore.nextGameRound();

	expect(gameStore.team2.isStretched).toBe(true);
});

test('game store "nextGameRound() sets "isStretched" to true when team 2 more than 12 total game points', () => {
	const gameStore = useGameStore();
	gameStore.team2.gamePoints = 10;
	gameStore.team2GamePoint = 3;

	gameStore.nextGameRound();

	expect(gameStore.team2.isStretched).toBe(true);
});

test('game store "nextGameRound() sets "showConfetti" to false when team 1 has not reached maximum game points', () => {
	const gameStore = useGameStore();

	gameStore.team1GamePoint = 2;

	gameStore.nextGameRound();

	expect(gameStore.showConfetti).toBe(false);
});

test('game store "nextGameRound() sets "showConfetti" to true when team 1 has reached maximum game points', () => {
	const gameStore = useGameStore();

	gameStore.team1GamePoint = 4;

	gameStore.nextGameRound();

	expect(gameStore.showConfetti).toBe(true);
});

test('game store "nextGameRound() sets "showConfetti" to false when team 2 has not reached maximum game points', () => {
	const gameStore = useGameStore();

	gameStore.team2GamePoint = 2;

	gameStore.nextGameRound();

	expect(gameStore.showConfetti).toBe(false);
});

test('game store "nextGameRound() sets "showConfetti" to true when team 2 has reached maximum game points', () => {
	const gameStore = useGameStore();

	gameStore.team2GamePoint = 4;

	gameStore.nextGameRound();

	expect(gameStore.showConfetti).toBe(true);
});

test('game store "nextGameRound() resets team 1 and 2 game point to 0', () => {
	const gameStore = useGameStore();

	gameStore.team1GamePoint = 2;
	gameStore.team2GamePoint = 4;

	gameStore.nextGameRound();

	expect(gameStore.team1GamePoint).toBe(0);
	expect(gameStore.team2GamePoint).toBe(0);
});

test('game store "nextGameRound() sets "isAudioPlaying" to the value of "shouldPlayAudio"', () => {
	const gameStore = useGameStore();

	gameStore.shouldPlayAudio = true;

	gameStore.nextGameRound();

	expect(gameStore.isAudioPlaying).toBe(true);
});

test('game store "nextGameRound() adds a new game round with cloned teams', () => {
	const gameStore = useGameStore();

	gameStore.nextGameRound();

	expect(useCloned).toHaveBeenCalledTimes(2);
	expect(gameStore.gameRounds).toHaveLength(1);
	expect(gameStore.gameRounds).toContainEqual([
		teamFactory.build({ teamNumber: 1 }),
		teamFactory.build({ teamNumber: 2 }),
	]);
});
