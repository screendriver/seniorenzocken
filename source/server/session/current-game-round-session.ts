import { isArray } from "@sindresorhus/is";
import type { CurrentGameRoundSessions as CurrentGameRoundSessionsFromDatabase } from "./session-schema.js";

type Team = {
	readonly id: number;
	readonly name: string;
};

export type CurrentGameRoundSession = {
	readonly teams: readonly Team[];
	readonly gamePointsPerRound: readonly [0, 2, 3, 4];
	readonly hasPreviousGameRounds: boolean;
};

export function mapCurrentGameRoundSessionsFromDatabase(
	currentGameRoundSessionsFromDatabase: CurrentGameRoundSessionsFromDatabase
): CurrentGameRoundSession {
	const groupedTeams = Object.groupBy(currentGameRoundSessionsFromDatabase, (currentGameRoundSession) => {
		return currentGameRoundSession.teamId;
	});

	const teams = Object.entries(groupedTeams)
		.filter((entries): entries is [string, CurrentGameRoundSessionsFromDatabase] => {
			const [, teamMembers] = entries;

			return isArray(teamMembers);
		})
		.map<Team>((entries) => {
			const [teamId, teamMembers] = entries;
			const nicknames = teamMembers.map((teamMember) => {
				return teamMember.playerNickname;
			});

			return { id: Number.parseInt(teamId, 10), name: nicknames.join(" / ") };
		});

	return { teams, gamePointsPerRound: [0, 2, 3, 4], hasPreviousGameRounds: false };
}
