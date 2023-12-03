import { Stack } from "js-sdsl";
import Maybe from "true-myth/maybe";
import type { Teams } from "./team.js";

export function cloneGameRounds(gameRounds: Stack<Teams>): Stack<Teams> {
	const existingGameRounds: Teams[] = [];
	let latestGameRound = Maybe.of(gameRounds.pop());

	while (latestGameRound.isJust) {
		existingGameRounds.push(latestGameRound.value);

		latestGameRound = Maybe.of(gameRounds.pop());
	}

	return new Stack(existingGameRounds.reverse());
}
