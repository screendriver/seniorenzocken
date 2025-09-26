import { isArray } from "@sindresorhus/is";
import { identity } from "es-toolkit";
import { first, isJust, just, isInstance as isMaybe, type Maybe } from "true-myth/maybe";
import type { CurrentGameRoundSession, Team } from "../../shared/current-game-round.js";
import type {
	CurrentGameRoundSessionDatabaseSelect,
	CurrentGameRoundSessionsDatabaseSelect
} from "./session-database-schema.js";

function calculateGamePoints(
	currentGameRoundSessionFromDatabase: CurrentGameRoundSessionDatabaseSelect,
	uniquePlayers: ReadonlyMap<number, Maybe<number>>
): Maybe<number> {
	const { gamePoints: gamePointsFromDatabase } = currentGameRoundSessionFromDatabase;

	const currentGamePoints = uniquePlayers.get(currentGameRoundSessionFromDatabase.playerId);

	if (isJust(gamePointsFromDatabase) && isMaybe(currentGamePoints) && isJust(currentGamePoints)) {
		return just(gamePointsFromDatabase.value + currentGamePoints.value);
	}

	return gamePointsFromDatabase;
}

export function mapCurrentGameRoundSessionsFromDatabase(
	currentGameRoundSessionsFromDatabase: CurrentGameRoundSessionsDatabaseSelect
): CurrentGameRoundSession {
	const groupedTeams = Object.groupBy(currentGameRoundSessionsFromDatabase, (currentGameRoundSession) => {
		return currentGameRoundSession.teamId;
	});

	const teams = Object.entries(groupedTeams)
		.filter((entries): entries is [string, CurrentGameRoundSessionsDatabaseSelect] => {
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

			return { teamId: Number.parseInt(teamId, 10), name, gamePoints };
		});

	return { teams, gamePointsPerRound: [0, 2, 3, 4], hasPreviousGameRounds: false };
}
