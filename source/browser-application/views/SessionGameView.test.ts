import { describe, it, expect, vi } from "vitest";
import { mount, flushPromises, type VueWrapper } from "@vue/test-utils";
import { createTestingPinia } from "@pinia/testing";
import type { TRPCClient } from "@trpc/client";
import { VueQueryPlugin, QueryClient } from "@tanstack/vue-query";
import { Factory } from "fishery";
import { type Router, createRouter, createMemoryHistory } from "vue-router";
import type { TRPCApplicationRouter } from "../../server-shared/trpc-application-router";
import type { CurrentGameRoundSession } from "../../shared/current-game-round";
import { useSessionGameStore } from "../game-store/session-game-store.js";
import { trpcClientInjectionKey } from "../trpc/client.js";
import SessionGameView from "./SessionGameView.vue";
import GameOverView from "./GameOverView.vue";

const currentGameRoundFactory = Factory.define<CurrentGameRoundSession>(() => {
	return {
		teams: [
			{ teamId: 1, name: "One", gamePoints: 0 },
			{ teamId: 2, name: "Two", gamePoints: 0 }
		],
		gamePointsPerRound: [0, 2, 3, 4],
		hasPreviousGameRounds: false,
		isGameOver: false
	};
});

function createFakeTRPCClient(): TRPCClient<TRPCApplicationRouter> {
	return {
		session: {
			currentGameRound: {
				query: vi.fn().mockResolvedValue(currentGameRoundFactory.build())
			},
			nextGameRound: {
				mutate: vi.fn().mockResolvedValue(undefined)
			}
		}
	} as unknown as TRPCClient<TRPCApplicationRouter>;
}

type ComponentWrapperOptions = {
	readonly trpcClient?: TRPCClient<TRPCApplicationRouter>;
	readonly router?: Router;
};

type SessionGameViewComponentInstance = InstanceType<typeof SessionGameView>;

function createComponentWrapper(options: ComponentWrapperOptions = {}): VueWrapper<SessionGameViewComponentInstance> {
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				retry: false
			}
		}
	});
	const testingPinia = createTestingPinia({ createSpy: vi.fn });
	const router =
		options.router ??
		createRouter({
			history: createMemoryHistory(),
			routes: [{ path: "/", component: SessionGameView }]
		});
	const fakeTRPCClient = options.trpcClient ?? createFakeTRPCClient();

	return mount(SessionGameView, {
		global: {
			provide: {
				[trpcClientInjectionKey]: fakeTRPCClient
			},
			plugins: [testingPinia, router, [VueQueryPlugin, { queryClient }]]
		}
	});
}

describe("<SessionGameView />", () => {
	it("renders nothing when there is an error while fetching current game round", () => {
		const fakeTRPCClient = createFakeTRPCClient();

		using querySpy = vi.spyOn(fakeTRPCClient.session.currentGameRound, "query").mockImplementation(() => {
			throw new Error("test");
		});

		const wrapper = createComponentWrapper({ trpcClient: fakeTRPCClient });

		expect(querySpy).toHaveBeenCalledWith();
		expect(wrapper.text()).toBe("");
	});

	it("renders headings for all given teams", async () => {
		const fakeTRPCClient = createFakeTRPCClient();

		const wrapper = createComponentWrapper({ trpcClient: fakeTRPCClient });

		await flushPromises();

		const headings = wrapper.findAll("h2");

		expect(headings).toHaveLength(2);
		expect(headings[0]?.text()).toBe("One");
		expect(headings[1]?.text()).toBe("Two");
	});

	it("renders radio buttons for all given teams", async () => {
		const fakeTRPCClient = createFakeTRPCClient();

		const wrapper = createComponentWrapper({ trpcClient: fakeTRPCClient });

		await flushPromises();

		const radioButtons = wrapper.findAll("input[type='radio']");

		expect(radioButtons).toHaveLength(8);

		expect(radioButtons[0]?.attributes()).toMatchObject({ value: "0" });
		expect(radioButtons[1]?.attributes()).toMatchObject({ value: "2" });
		expect(radioButtons[2]?.attributes()).toMatchObject({ value: "3" });
		expect(radioButtons[3]?.attributes()).toMatchObject({ value: "4" });

		expect(radioButtons[4]?.attributes()).toMatchObject({ value: "0" });
		expect(radioButtons[5]?.attributes()).toMatchObject({ value: "2" });
		expect(radioButtons[6]?.attributes()).toMatchObject({ value: "3" });
		expect(radioButtons[7]?.attributes()).toMatchObject({ value: "4" });
	});

	it("renders disabled radio buttons when audio is currently playing", async () => {
		const fakeTRPCClient = createFakeTRPCClient();

		const wrapper = createComponentWrapper({ trpcClient: fakeTRPCClient });

		const sessionGameStore = useSessionGameStore();
		sessionGameStore.isAudioPlaying = true;

		await flushPromises();

		const radioButtons = wrapper.findAll("input[type='radio']");

		expect(radioButtons[0]?.attributes()).toMatchObject({ disabled: "" });
		expect(radioButtons[1]?.attributes()).toMatchObject({ disabled: "" });
		expect(radioButtons[2]?.attributes()).toMatchObject({ disabled: "" });
		expect(radioButtons[3]?.attributes()).toMatchObject({ disabled: "" });

		expect(radioButtons[4]?.attributes()).toMatchObject({ disabled: "" });
		expect(radioButtons[5]?.attributes()).toMatchObject({ disabled: "" });
		expect(radioButtons[6]?.attributes()).toMatchObject({ disabled: "" });
		expect(radioButtons[7]?.attributes()).toMatchObject({ disabled: "" });
	});

	it("renders disabled radio buttons for the second team when one game point from first team was selected", async () => {
		const fakeTRPCClient = createFakeTRPCClient();

		const wrapper = createComponentWrapper({ trpcClient: fakeTRPCClient });

		await flushPromises();

		await wrapper.findAll("input[type='radio']")[1]?.trigger("change");

		const radioButtons = wrapper.findAll("input[type='radio']");

		expect(radioButtons[0]?.attributes().disabled).toBeUndefined();
		expect(radioButtons[1]?.attributes().disabled).toBeUndefined();
		expect(radioButtons[2]?.attributes().disabled).toBeUndefined();
		expect(radioButtons[3]?.attributes().disabled).toBeUndefined();

		expect(radioButtons[4]?.attributes()).toMatchObject({ disabled: "" });
		expect(radioButtons[5]?.attributes()).toMatchObject({ disabled: "" });
		expect(radioButtons[6]?.attributes()).toMatchObject({ disabled: "" });
		expect(radioButtons[7]?.attributes()).toMatchObject({ disabled: "" });
	});

	it("renders disabled radio buttons for the first team when one game point from second team was selected", async () => {
		const fakeTRPCClient = createFakeTRPCClient();

		const wrapper = createComponentWrapper({ trpcClient: fakeTRPCClient });

		await flushPromises();

		await wrapper.findAll("input[type='radio']")[5]?.trigger("change");

		const radioButtons = wrapper.findAll("input[type='radio']");

		expect(radioButtons[0]?.attributes()).toMatchObject({ disabled: "" });
		expect(radioButtons[1]?.attributes()).toMatchObject({ disabled: "" });
		expect(radioButtons[2]?.attributes()).toMatchObject({ disabled: "" });
		expect(radioButtons[3]?.attributes()).toMatchObject({ disabled: "" });

		expect(radioButtons[4]?.attributes().disabled).toBeUndefined();
		expect(radioButtons[5]?.attributes().disabled).toBeUndefined();
		expect(radioButtons[6]?.attributes().disabled).toBeUndefined();
		expect(radioButtons[7]?.attributes().disabled).toBeUndefined();
	});

	it('renders a disabled "Runde zurück" button when tRPC server response has no previous game rounds', async () => {
		const fakeTRPCClient = createFakeTRPCClient();

		using querySpy = vi.spyOn(fakeTRPCClient.session.currentGameRound, "query").mockResolvedValue(
			currentGameRoundFactory.build({
				hasPreviousGameRounds: false
			})
		);

		const wrapper = createComponentWrapper({ trpcClient: fakeTRPCClient });

		await flushPromises();

		const previousGameRoundButton = wrapper.findAll("button")[0];

		expect(querySpy).toHaveBeenCalledWith();
		expect(previousGameRoundButton?.text()).toBe("Runde zurück");
		expect(previousGameRoundButton?.attributes().disabled).toBe("");
	});

	it('renders a disabled "Runde zurück" button when tRPC server response has previous game rounds but audio is currently playing', async () => {
		const fakeTRPCClient = createFakeTRPCClient();

		using querySpy = vi.spyOn(fakeTRPCClient.session.currentGameRound, "query").mockResolvedValue(
			currentGameRoundFactory.build({
				hasPreviousGameRounds: true
			})
		);

		const wrapper = createComponentWrapper({ trpcClient: fakeTRPCClient });

		const sessionGameStore = useSessionGameStore();
		sessionGameStore.isAudioPlaying = true;

		await flushPromises();

		const previousGameRoundButton = wrapper.findAll("button")[0];

		expect(querySpy).toHaveBeenCalledWith();
		expect(previousGameRoundButton?.text()).toBe("Runde zurück");
		expect(previousGameRoundButton?.attributes().disabled).toBe("");
	});

	it('renders a enabled "Runde zurück" button when tRPC server response has previous game rounds and audio is currently not playing', async () => {
		const fakeTRPCClient = createFakeTRPCClient();

		using querySpy = vi.spyOn(fakeTRPCClient.session.currentGameRound, "query").mockResolvedValue(
			currentGameRoundFactory.build({
				hasPreviousGameRounds: true
			})
		);

		const wrapper = createComponentWrapper({ trpcClient: fakeTRPCClient });

		const sessionGameStore = useSessionGameStore();
		sessionGameStore.isAudioPlaying = false;

		await flushPromises();

		const previousGameRoundButton = wrapper.findAll("button")[0];

		expect(querySpy).toHaveBeenCalledWith();
		expect(previousGameRoundButton?.text()).toBe("Runde zurück");
		expect(previousGameRoundButton?.attributes().disabled).toBeUndefined();
	});

	it('renders a disabled "Nächste Runde" button when audio is currently playing', async () => {
		const fakeTRPCClient = createFakeTRPCClient();

		const wrapper = createComponentWrapper({ trpcClient: fakeTRPCClient });

		const sessionGameStore = useSessionGameStore();
		sessionGameStore.isAudioPlaying = true;

		await flushPromises();

		const nextGameRoundButton = wrapper.findAll("button")[1];

		expect(nextGameRoundButton?.text()).toBe("Nächste Runde");
		expect(nextGameRoundButton?.attributes().disabled).toBe("");
	});

	it('renders a disabled "Nächste Runde" button when audio is currently not playing but all teams has zero game points', async () => {
		const fakeTRPCClient = createFakeTRPCClient();

		const wrapper = createComponentWrapper({ trpcClient: fakeTRPCClient });

		const sessionGameStore = useSessionGameStore();
		sessionGameStore.isAudioPlaying = false;

		await flushPromises();

		const nextGameRoundButton = wrapper.findAll("button")[1];

		expect(nextGameRoundButton?.text()).toBe("Nächste Runde");
		expect(nextGameRoundButton?.attributes().disabled).toBe("");
	});

	it('renders a enabled "Nächste Runde" button when audio is currently not playing and one team has game points selected', async () => {
		const fakeTRPCClient = createFakeTRPCClient();

		const wrapper = createComponentWrapper({ trpcClient: fakeTRPCClient });

		const sessionGameStore = useSessionGameStore();
		sessionGameStore.isAudioPlaying = false;

		await flushPromises();

		await wrapper.findAll("input[type='radio']")[1]?.trigger("change");

		const nextGameRoundButton = wrapper.findAll("button")[1];

		expect(nextGameRoundButton?.text()).toBe("Nächste Runde");
		expect(nextGameRoundButton?.attributes().disabled).toBeUndefined();
	});

	it("starts the next game round when the 'Nächste Runde' button is clicked", async () => {
		const fakeTRPCClient = createFakeTRPCClient();

		using mutateSpy = vi.spyOn(fakeTRPCClient.session.nextGameRound, "mutate").mockResolvedValue(undefined);

		const wrapper = createComponentWrapper({ trpcClient: fakeTRPCClient });

		await flushPromises();

		const nextGameRoundButton = wrapper.findAll("button")[1];

		expect(nextGameRoundButton?.text()).toBe("Nächste Runde");

		await wrapper.findAll("input[type='radio']")[1]?.trigger("change");
		await nextGameRoundButton?.trigger("click");

		expect(mutateSpy).toHaveBeenCalledExactlyOnceWith({ teamId: 1, gamePoints: 2 });
	});

	it("navigates to /game-over route when game is over", async () => {
		const fakeTRPCClient = createFakeTRPCClient();

		using querySpy = vi.spyOn(fakeTRPCClient.session.currentGameRound, "query").mockResolvedValue(
			currentGameRoundFactory.build({
				isGameOver: true
			})
		);

		const router = createRouter({
			history: createMemoryHistory(),
			routes: [
				{ path: "/", component: SessionGameView },
				{ path: "/game-over", name: "game-over", component: GameOverView }
			]
		});
		const push = vi.spyOn(router, "push");

		createComponentWrapper({ trpcClient: fakeTRPCClient, router });

		await flushPromises();

		expect(querySpy).toHaveBeenCalledWith();
		expect(push).toHaveBeenCalledExactlyOnceWith({ name: "game-over", replace: true });
	});
});
