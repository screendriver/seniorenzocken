import { isArray } from "@sindresorhus/is";
import type { CurrentGameRoundSessions as CurrentGameRoundSessionsFromDatabase } from "./session-schema.js";

export type CurrentGameRoundSession = {
	readonly teamNames: readonly string[];
};

export function mapCurrentGameRoundSessionsFromDatabase(
	currentGameRoundSessionsFromDatabase: CurrentGameRoundSessionsFromDatabase
): CurrentGameRoundSession {
	const groupedTeams = Object.groupBy(currentGameRoundSessionsFromDatabase, (currentGameRoundSession) => {
		return currentGameRoundSession.teamId;
	});

	const teamNames = Object.values(groupedTeams)
		.filter((teamMembers) => {
			return isArray(teamMembers);
		})
		.map((teamMembers) => {
			const nicknames = teamMembers.map((teamMember) => {
				return teamMember.playerNickname;
			});

			return nicknames.join(" / ");
		});

	return { teamNames };
}
