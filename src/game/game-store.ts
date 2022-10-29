import { writable } from "svelte/store";

export const isGameStarted = writable(false);

export const isGameOver = writable(false);
