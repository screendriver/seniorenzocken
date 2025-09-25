import { isArray } from "@sindresorhus/is";
import { identity } from "es-toolkit";
import { first } from "true-myth/maybe";
import type { CurrentGameRoundSession, Team } from "../../shared/current-game-round.js";
import type { CurrentGameRoundSessions as CurrentGameRoundSessionsFromDatabase } from "./session-schema.js";

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
		.map<Team>(([teamId, teamMembers]) => {
			const uniqueNicknames = new Set<string>();
			const uniquePlayers = new Map<number, number>();

			for (const teamMember of teamMembers) {
				let { gamePoints } = teamMember;

				if (uniquePlayers.has(teamMember.playerId)) {
					gamePoints += uniquePlayers.get(teamMember.playerId) ?? 0;
				}

				uniqueNicknames.add(teamMember.playerNickname);
				uniquePlayers.set(teamMember.playerId, gamePoints);
			}

			const name = Array.from(uniqueNicknames).join(" / ");
			const gamePoints = first(Array.from(uniquePlayers.values())).andThen(identity).unwrapOr(0);

			return { id: Number.parseInt(teamId, 10), name, gamePoints };
		});

	return { teams, gamePointsPerRound: [0, 2, 3, 4], hasPreviousGameRounds: false };
}
