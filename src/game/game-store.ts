import { writable } from "svelte/store";
import { createIsGameStartedStore } from "./game-store-factory";

export const isGameStarted = createIsGameStartedStore(window.sessionStorage);

export const isGameOver = writable(false);
