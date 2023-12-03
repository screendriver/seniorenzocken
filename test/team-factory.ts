import { Factory } from "fishery";
import type { Team } from "../source/lib/game-store/team.js";

export const teamFactory = Factory.define<Team>(() => {
	return {
		teamNumber: 1,
		teamName: "",
		currentGamePoints: 0,
		totalGamePoints: 0,
		isStretched: false,
	};
});
