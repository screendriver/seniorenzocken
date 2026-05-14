import { QueryClient } from "@tanstack/react-query";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import { createStore } from "zustand";
import { Task } from "true-myth/task";
import type { ApplicationContext, BrowserRuntime, AuthenticationCredentials } from "../context/app-context.js";
import type { GameStoreState } from "../game-store/game-store.js";
import { createFireAndForgetExecutor } from "../asynchronous-effects/fire-and-forget-executor.js";
import type { GameRounds } from "../../shared/game-rounds.js";
import type { NotPersistedTeam1, NotPersistedTeam2 } from "../../shared/team.js";
import type { TRPCApplicationRouter } from "../../server-shared/trpc-application-router.js";
import { createTRPCClient } from "../trpc/client.js";

const emptyTeam1: NotPersistedTeam1 = {
	teamNumber: 1 as const,
	name: "",
	currentRoundGamePoints: 0,
	matchTotalGamePoints: 0,
	isStretched: false
};

const emptyTeam2: NotPersistedTeam2 = {
	teamNumber: 2 as const,
	name: "",
	currentRoundGamePoints: 0,
	matchTotalGamePoints: 0,
	isStretched: false
};

const emptyGameRounds: GameRounds = [];

const testGameStore = createStore<GameStoreState>(() => {
	return {
		hasError: false,
		isAudioPlaying: false,
		team1: emptyTeam1,
		team2: emptyTeam2,
		isGameRunning: false,
		showConfetti: false,
		isGameOver: false,
		gameRounds: emptyGameRounds,
		bothTeamsHasZeroGamePoints() {
			return true;
		},
		isGamePointEnabled() {
			return true;
		},
		isPreviousGameRoundEnabled() {
			return false;
		},
		isNextGameRoundEnabled() {
			return false;
		},
		setIsAudioPlaying() {
			return undefined;
		},
		setTeam1Name() {
			return undefined;
		},
		setTeam2Name() {
			return undefined;
		},
		newGame() {
			return Task.resolve(undefined);
		},
		startGame() {
			return Task.resolve(undefined);
		},
		nextGameRound() {
			return Task.resolve(undefined);
		},
		previousGameRound() {
			return Task.resolve(undefined);
		},
		generateGamePointsAudioPlaylist() {
			return Task.resolve([]);
		}
	};
});

export const testBrowserRuntime: BrowserRuntime = {
	async requestWakeLockScreen() {
		return undefined;
	},
	setTimeout() {
		return 0;
	},
	clearTimeout() {
		return undefined;
	},
	addWindowEventListener() {
		return undefined;
	},
	removeWindowEventListener() {
		return undefined;
	},
	isOnline() {
		return true;
	},
	getRandomFraction() {
		return 0;
	}
};

const testQueryClient = new QueryClient();
const testTrpcClient = createTRPCClient({ isRunningInProduction: false });
const testTrpc = createTRPCOptionsProxy<TRPCApplicationRouter>({
	client: testTrpcClient,
	queryClient: testQueryClient
});
const testFireAndForgetExecutor = createFireAndForgetExecutor({
	logError() {
		return undefined;
	}
});

export const testApplicationContext: ApplicationContext = {
	authenticationApi: {
		async authenticate(authenticationCredentials: AuthenticationCredentials) {
			if (
				authenticationCredentials.username === "__never__" &&
				authenticationCredentials.password === "__never__"
			) {
				return new Response(null, { status: 401 });
			}

			return new Response(null, { status: 204 });
		},
		async logout() {
			return new Response(null, { status: 204 });
		}
	},
	audioElementFactory: {
		createAudioElement(source: string) {
			return new Audio(source);
		}
	},
	browserRuntime: testBrowserRuntime,
	fireAndForgetExecutor: testFireAndForgetExecutor,
	gameStore: testGameStore,
	trpc: testTrpc
};
