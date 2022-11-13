import ImageKit from "imagekit-javascript";
import { assert } from "@sindresorhus/is";
import App from "./App.svelte";
import { createGameStateMachine } from "./game-state/game-state-machine.js";
import { createToggleRouter } from "./toggle-router/toggle-router.js";
import { createWakeLockStateMachine } from "./screen/wake-lock-state-machine";
import { createGameWebStorage } from "./storage/game-web-storage";
import { createTeamStateMachine } from "./team/team-state-machine";

const htmlBodyElement = document.querySelector("body");
const imageKitBaseUrl = import.meta.env.VITE_IMAGEKIT_BASE_URL;

assert.domElement(htmlBodyElement);
assert.string(imageKitBaseUrl);

const imageKit = new ImageKit({
	urlEndpoint: imageKitBaseUrl,
	transformationPosition: "query"
});

const gameWebStorage = createGameWebStorage(globalThis.sessionStorage);
const toggleRouter = createToggleRouter();

const teamStateMachine = createTeamStateMachine(gameWebStorage);
const gameStateMachine = createGameStateMachine({ toggleRouter, teamStateMachine });
const wakeLockStateMachine = createWakeLockStateMachine(globalThis.navigator, globalThis.document);

new App({
	target: htmlBodyElement,
	props: {
		imageKit,
		gameStateMachine,
		wakeLockStateMachine
	}
});
