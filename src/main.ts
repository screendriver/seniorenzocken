import ImageKit from "imagekit-javascript";
import { assert } from "@sindresorhus/is";
import App from "./App.svelte";
import { createGameStateMachine } from "./game-state/game-state-machine";
import { createToggleRouter } from "./toggle-router/toggle-router";

const htmlBodyElement = document.querySelector("body");
const imageKitBaseUrl = import.meta.env.VITE_IMAGEKIT_BASE_URL;

assert.domElement(htmlBodyElement);
assert.string(imageKitBaseUrl);

const imageKit = new ImageKit({
	urlEndpoint: imageKitBaseUrl,
	transformationPosition: "query"
});

const toggleRouter = createToggleRouter();

const gameStateMachine = createGameStateMachine(toggleRouter);

new App({
	target: htmlBodyElement,
	props: {
		imageKit,
		gameStateMachine
	}
});
