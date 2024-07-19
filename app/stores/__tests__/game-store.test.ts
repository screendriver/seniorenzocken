import { test, expect, beforeEach, vi, afterEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { Factory } from "fishery";

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

test('game store has an initial "is game over" property set', () => {
	const gameStore = useGameStore();

	expect(gameStore.isGameOver).toBe(false);
});

test('game store action toggleShouldPlayAudio() sets "shouldPlayAudio" to false when it was previously true', () => {
	const gameStore = useGameStore();

	gameStore.toggleShouldPlayAudio();

	expect(gameStore.shouldPlayAudio).toBe(false);
});

test('game store action toggleShouldPlayAudio() sets "shouldPlayAudio" to true when it was previously false', () => {
	const gameStore = useGameStore();

	gameStore.toggleShouldPlayAudio();
	gameStore.toggleShouldPlayAudio();

	expect(gameStore.shouldPlayAudio).toBe(true);
});

test('game store "allTeamsAtZeroGamePoints" equals true when both teams has 0 game points', () => {
	const gameStore = useGameStore();

	gameStore.$patch({
		team1GamePoint: 0,
		team2GamePoint: 0,
	});

	expect(gameStore.allTeamsAtZeroGamePoints).toBe(true);
});

test('game store "allTeamsAtZeroGamePoints" equals false when team 1 has 0 game points', () => {
	const gameStore = useGameStore();

	gameStore.$patch({
		team1GamePoint: 0,
		team2GamePoint: 2,
	});

	expect(gameStore.allTeamsAtZeroGamePoints).toBe(false);
});

test('game store "allTeamsAtZeroGamePoints" equals false when team 2 has 0 game points', () => {
	const gameStore = useGameStore();

	gameStore.$patch({
		team1GamePoint: 2,
		team2GamePoint: 0,
	});

	expect(gameStore.allTeamsAtZeroGamePoints).toBe(false);
});

test('game store "allTeamsAtZeroGamePoints" equals false when both teams has 0 game points', () => {
	const gameStore = useGameStore();

	gameStore.$patch({
		team1GamePoint: 2,
		team2GamePoint: 2,
	});

	expect(gameStore.allTeamsAtZeroGamePoints).toBe(false);
});

test('game store "isGamePointEnabled" equals true when all teams has zero game points and given game point equals 0', () => {
	const gameStore = useGameStore();

	gameStore.$patch({
		isAudioPlaying: false,
		team1GamePoint: 0,
		team2GamePoint: 0,
	});

	expect(gameStore.isGamePointEnabled(0)).toBe(true);
});

test('game store "isGamePointEnabled" equals true when all teams has zero game points and given game point is greater than 0', () => {
	const gameStore = useGameStore();

	gameStore.$patch({
		isAudioPlaying: false,
		team1GamePoint: 0,
		team2GamePoint: 0,
	});

	expect(gameStore.isGamePointEnabled(2)).toBe(true);
});

test('game store "isGamePointEnabled" equals true when no team has zero game points but given game point is greater 0', () => {
	const gameStore = useGameStore();

	gameStore.$patch({
		isAudioPlaying: false,
		team1GamePoint: 2,
		team2GamePoint: 4,
	});

	expect(gameStore.isGamePointEnabled(2)).toBe(true);
});

test('game store "isGamePointEnabled" equals false when no team has zero game points and given game point equals 0', () => {
	const gameStore = useGameStore();

	gameStore.$patch({
		isAudioPlaying: false,
		team1GamePoint: 2,
		team2GamePoint: 4,
	});

	expect(gameStore.isGamePointEnabled(0)).toBe(false);
});

test('game store "isGamePointEnabled" equals false when audio is currently playing', () => {
	const gameStore = useGameStore();

	gameStore.$patch({
		isAudioPlaying: true,
		team1GamePoint: 2,
		team2GamePoint: 4,
	});

	expect(gameStore.isGamePointEnabled(2)).toBe(false);
});

test('game store "isPreviousGameRoundEnabled" returns false when game rounds are empty', () => {
	const gameStore = useGameStore();

	gameStore.$patch({
		gameRounds: [],
		isAudioPlaying: false,
	});

	expect(gameStore.isPreviousGameRoundEnabled).toBe(false);
});

test('game store "isPreviousGameRoundEnabled" returns false when audio is currently playing', () => {
	const gameStore = useGameStore();

	gameStore.$patch({
		gameRounds: [[teamFactory.build(), teamFactory.build()]],
		isAudioPlaying: true,
	});

	expect(gameStore.isPreviousGameRoundEnabled).toBe(false);
});

test('game store "isPreviousGameRoundEnabled" returns true when there are game rounds and audio is currently not playing', () => {
	const gameStore = useGameStore();

	gameStore.$patch({
		gameRounds: [[teamFactory.build(), teamFactory.build()]],
		isAudioPlaying: false,
	});

	expect(gameStore.isPreviousGameRoundEnabled).toBe(true);
});

test('game store "isNextGameRoundEnabled" equals false when all teams has 0 game points and audio is not playing', () => {
	const gameStore = useGameStore();

	gameStore.$patch({
		team1GamePoint: 0,
		team2GamePoint: 0,
		isAudioPlaying: false,
	});

	expect(gameStore.isNextGameRoundEnabled).toBe(false);
});

test('game store "isNextGameRoundEnabled" equals false when all teams has 0 game points and audio is playing', () => {
	const gameStore = useGameStore();

	gameStore.$patch({
		team1GamePoint: 0,
		team2GamePoint: 0,
		isAudioPlaying: true,
	});

	expect(gameStore.isNextGameRoundEnabled).toBe(false);
});

test('game store "isNextGameRoundEnabled" equals true when team 1 has 0 game points and audio is not playing', () => {
	const gameStore = useGameStore();

	gameStore.$patch({
		team1GamePoint: 0,
		team2GamePoint: 2,
		isAudioPlaying: false,
	});

	expect(gameStore.isNextGameRoundEnabled).toBe(true);
});

test('game store "isNextGameRoundEnabled" equals true when team 2 has 0 game points and audio is not playing', () => {
	const gameStore = useGameStore();

	gameStore.$patch({
		team1GamePoint: 2,
		team2GamePoint: 0,
		isAudioPlaying: false,
	});

	expect(gameStore.isNextGameRoundEnabled).toBe(true);
});

test('game store "isNextGameRoundEnabled" equals false when team 1 has 0 game points and audio is playing', () => {
	const gameStore = useGameStore();

	gameStore.$patch({
		team1GamePoint: 0,
		team2GamePoint: 2,
		isAudioPlaying: true,
	});

	expect(gameStore.isNextGameRoundEnabled).toBe(false);
});

test('game store "isNextGameRoundEnabled" equals false when team 2 has 0 game points and audio is playing', () => {
	const gameStore = useGameStore();

	gameStore.$patch({
		team1GamePoint: 2,
		team2GamePoint: 0,
		isAudioPlaying: true,
	});

	expect(gameStore.isNextGameRoundEnabled).toBe(false);
});

test("game store action previousGameRound() resets game points on both teams when there are no game rounds at all", () => {
	const gameStore = useGameStore();

	gameStore.$patch({
		team1: { gamePoints: 4 },
		team2: { gamePoints: 2 },
		gameRounds: [],
	});

	gameStore.previousGameRound();

	expect(gameStore.team1.gamePoints).toBe(0);
	expect(gameStore.team2.gamePoints).toBe(0);
});

test("game store action previousGameRound() resets game points on both teams when there are no previous game rounds", () => {
	const gameStore = useGameStore();

	gameStore.$patch({
		team1: { gamePoints: 3 },
		team2: { gamePoints: 4 },
		gameRounds: [[teamFactory.build(), teamFactory.build()]],
	});

	gameStore.previousGameRound();

	expect(gameStore.team1.gamePoints).toBe(0);
	expect(gameStore.team2.gamePoints).toBe(0);
});

test("game store action previousGameRound() sets game points on both teams from previous game round", () => {
	const gameStore = useGameStore();

	gameStore.gameRounds = [
		[teamFactory.build({ gamePoints: 7 }), teamFactory.build({ gamePoints: 2 })],
		[teamFactory.build({ gamePoints: 3 }), teamFactory.build({ gamePoints: 2 })],
	];

	gameStore.previousGameRound();

	expect(gameStore.team1.gamePoints).toBe(3);
	expect(gameStore.team2.gamePoints).toBe(2);
});

test("game store action nextGameRound() sets new game points on team 1", () => {
	const gameStore = useGameStore();

	gameStore.team1GamePoint = 2;

	expect(gameStore.team1.gamePoints).toBe(0);

	gameStore.nextGameRound();

	expect(gameStore.team1.gamePoints).toBe(2);
});

test("game store action nextGameRound() sets new game points on team 2", () => {
	const gameStore = useGameStore();

	gameStore.team2GamePoint = 2;

	expect(gameStore.team2.gamePoints).toBe(0);

	gameStore.nextGameRound();

	expect(gameStore.team2.gamePoints).toBe(2);
});

test('game store action nextGameRound() sets "isStretched" to true when team 1 has 12 total game points', () => {
	const gameStore = useGameStore();

	gameStore.$patch({
		team1: { gamePoints: 10 },
		team1GamePoint: 2,
	});

	gameStore.nextGameRound();

	expect(gameStore.team1.isStretched).toBe(true);
});

test('game store action nextGameRound() sets "isStretched" to true when team 1 more than 12 total game points', () => {
	const gameStore = useGameStore();

	gameStore.$patch({
		team1: { gamePoints: 10 },
		team1GamePoint: 3,
	});

	gameStore.nextGameRound();

	expect(gameStore.team1.isStretched).toBe(true);
});

test('game store action nextGameRound() sets "isStretched" to true when team 2 has 12 total game points', () => {
	const gameStore = useGameStore();

	gameStore.$patch({
		team2: { gamePoints: 10 },
		team2GamePoint: 2,
	});

	gameStore.nextGameRound();

	expect(gameStore.team2.isStretched).toBe(true);
});

test('game store action nextGameRound() sets "isStretched" to true when team 2 more than 12 total game points', () => {
	const gameStore = useGameStore();

	gameStore.$patch({
		team2: { gamePoints: 10 },
		team2GamePoint: 3,
	});

	gameStore.nextGameRound();

	expect(gameStore.team2.isStretched).toBe(true);
});

test('game store action nextGameRound() sets "showConfetti" to false when team 1 has not reached maximum game points', () => {
	const gameStore = useGameStore();

	gameStore.team1GamePoint = 2;

	gameStore.nextGameRound();

	expect(gameStore.showConfetti).toBe(false);
});

test('game store action nextGameRound() sets "showConfetti" to true when team 1 has reached maximum game points', () => {
	const gameStore = useGameStore();

	gameStore.team1GamePoint = 4;

	gameStore.nextGameRound();

	expect(gameStore.showConfetti).toBe(true);
});

test('game store action nextGameRound() sets "showConfetti" to false when team 2 has not reached maximum game points', () => {
	const gameStore = useGameStore();

	gameStore.team2GamePoint = 2;

	gameStore.nextGameRound();

	expect(gameStore.showConfetti).toBe(false);
});

test('game store action nextGameRound() sets "showConfetti" to true when team 2 has reached maximum game points', () => {
	const gameStore = useGameStore();

	gameStore.team2GamePoint = 4;

	gameStore.nextGameRound();

	expect(gameStore.showConfetti).toBe(true);
});

test("game store action nextGameRound() resets team 1 and 2 game point to 0", () => {
	const gameStore = useGameStore();

	gameStore.$patch({
		team1GamePoint: 2,
		team2GamePoint: 4,
	});

	gameStore.nextGameRound();

	expect(gameStore.team1GamePoint).toBe(0);
	expect(gameStore.team2GamePoint).toBe(0);
});

test('game store action nextGameRound() sets "isAudioPlaying" to the value of "shouldPlayAudio"', () => {
	const gameStore = useGameStore();

	gameStore.shouldPlayAudio = true;

	gameStore.nextGameRound();

	expect(gameStore.isAudioPlaying).toBe(true);
});

test("game store action nextGameRound() adds a new game round with cloned teams", () => {
	const gameStore = useGameStore();

	gameStore.nextGameRound();

	expect(gameStore.gameRounds).toHaveLength(1);
	expect(gameStore.gameRounds).toContainEqual([
		teamFactory.build({ teamNumber: 1 }),
		teamFactory.build({ teamNumber: 2 }),
	]);
});

test("game store action nextGameRound() adds new game rounds at the beginning of the game rounds Array", () => {
	const gameStore = useGameStore();

	gameStore.$patch({
		team1GamePoint: 3,
		team2GamePoint: 0,
	});

	gameStore.nextGameRound();

	gameStore.$patch({
		team1GamePoint: 4,
		team2GamePoint: 0,
	});

	gameStore.nextGameRound();

	expect(gameStore.gameRounds).toHaveLength(2);
	expect(gameStore.gameRounds).toStrictEqual([
		[teamFactory.build({ teamNumber: 1, gamePoints: 7 }), teamFactory.build({ teamNumber: 2, gamePoints: 0 })],
		[teamFactory.build({ teamNumber: 1, gamePoints: 3 }), teamFactory.build({ teamNumber: 2, gamePoints: 0 })],
	]);
});

test('game store action nextGameRound() sets "isGameOver" property to false when game is not over', () => {
	const gameStore = useGameStore();

	gameStore.$patch({
		team1: { gamePoints: 10 },
		team2: { gamePoints: 7 },
	});

	gameStore.nextGameRound();

	expect(gameStore.isGameOver).toBe(false);
});

test('game store action nextGameRound() sets "isGameOver" property to true when game is over', () => {
	const gameStore = useGameStore();

	gameStore.$patch({
		team1: { gamePoints: 15 },
		team2: { gamePoints: 0 },
	});

	gameStore.nextGameRound();

	expect(gameStore.isGameOver).toBe(true);
});

test('game store action nextGameRound() sets "isGameRunning" property to true when game is not over', () => {
	const gameStore = useGameStore();

	gameStore.$patch({
		team1: { gamePoints: 2 },
		team2: { gamePoints: 0 },
	});

	gameStore.nextGameRound();

	expect(gameStore.isGameRunning).toBe(true);
});

test('game store action nextGameRound() sets "isGameRunning" property to false when game is over', () => {
	const gameStore = useGameStore();

	gameStore.$patch({
		team1: { gamePoints: 0 },
		team2: { gamePoints: 15 },
	});

	gameStore.nextGameRound();

	expect(gameStore.isGameRunning).toBe(false);
});

test("game store action startNewGame() resets complete state", () => {
	const gameStore = useGameStore();

	gameStore.$patch({
		team1: teamFactory.build({ teamName: "one" }),
		team2: teamFactory.build({ teamName: "two" }),
		isGameRunning: true,
		team1GamePoint: 4,
		team2GamePoint: 2,
		isAudioPlaying: true,
		gameRounds: [[teamFactory.build(), teamFactory.build()]],
		showConfetti: true,
		isGameOver: true,
	});

	gameStore.startNewGame();

	expect(gameStore.$state).toMatchObject({
		team1: teamFactory.build({ teamNumber: 1 }),
		team2: teamFactory.build({ teamNumber: 2 }),
		isGameRunning: false,
		team1GamePoint: 0,
		team2GamePoint: 0,
		isAudioPlaying: false,
		gameRounds: [],
		showConfetti: false,
		isGameOver: false,
	});
});
