import { createIsGameStartedStore } from "./game-store-factory";

export const isGameStarted = createIsGameStartedStore(window.sessionStorage);
