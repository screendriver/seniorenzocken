import { isArray } from "@sindresorhus/is";
import { identity } from "es-toolkit";
import { first, isJust, just, isInstance as isMaybe, type Maybe } from "true-myth/maybe";
import type { CurrentGameRoundSession, Team } from "../../shared/current-game-round.js";
import type {
	CurrentGameRoundSession as CurrentGameRoundSessionFromDatabase,
	CurrentGameRoundSessions as CurrentGameRoundSessionsFromDatabase
} from "./session-database-schema.js";

function calculateGamePoints(
	currentGameRoundSession: CurrentGameRoundSessionFromDatabase,
	uniquePlayers: ReadonlyMap<number, Maybe<number>>
): Maybe<number> {
	const { gamePoints: gamePointsFromDatabase } = currentGameRoundSession;

	const currentGamePoints = uniquePlayers.get(currentGameRoundSession.playerId);

	if (isJust(gamePointsFromDatabase) && isMaybe(currentGamePoints) && isJust(currentGamePoints)) {
		return just(gamePointsFromDatabase.value + currentGamePoints.value);
	}

	return gamePointsFromDatabase;
}

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
		.map<Team>(([teamId, currentGameRoundSessions]) => {
			const uniqueNicknames = new Set<string>();
			const uniquePlayers = new Map<number, Maybe<number>>();

			for (const currentGameRoundSession of currentGameRoundSessions) {
				const gamePoints = calculateGamePoints(currentGameRoundSession, uniquePlayers);

				uniqueNicknames.add(currentGameRoundSession.playerNickname);
				uniquePlayers.set(currentGameRoundSession.playerId, gamePoints);
			}

			const name = Array.from(uniqueNicknames).join(" / ");
			const gamePoints = first(Array.from(uniquePlayers.values()))
				.andThen(identity)
				.andThen(identity)
				.unwrapOr(0);

			return { id: Number.parseInt(teamId, 10), name, gamePoints };
		});

	return { teams, gamePointsPerRound: [0, 2, 3, 4], hasPreviousGameRounds: false };
}
