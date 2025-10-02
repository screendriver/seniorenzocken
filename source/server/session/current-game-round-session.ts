import { isArray } from "@sindresorhus/is";
import { identity } from "es-toolkit";
import { first, isJust, just, isInstance as isMaybe, find, type Maybe } from "true-myth/maybe";
import type { CurrentGameRoundSession, Team } from "../../shared/current-game-round.js";
import type {
	CurrentGameRoundSessionDatabaseSelect,
	CurrentGameRoundSessionsDatabaseSelect
} from "./session-database-schema.js";

const gameOverGamePoints = 15;

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
	const hasPreviousGameRounds = currentGameRoundSessionsFromDatabase.some((currentGameRoundSession) => {
		return currentGameRoundSession.hasPreviousGameRounds;
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
			const gamePoints = first(Array.from(uniquePlayers.values())).andThen(identity).flatten().unwrapOr(0);

			return { teamId: Number.parseInt(teamId, 10), name, gamePoints };
		});
	const teamWithGameOverGamePoints = find((team) => {
		return team.gamePoints >= gameOverGamePoints;
	}, teams);

	const baseCurrentGameRoundSession = { teams, gamePointsPerRound: [0, 2, 3, 4], hasPreviousGameRounds } as const;

	return teamWithGameOverGamePoints.match<CurrentGameRoundSession>({
		Just(winnerTeam) {
			return { ...baseCurrentGameRoundSession, isGameOver: true, winnerTeam };
		},
		Nothing() {
			return { ...baseCurrentGameRoundSession, isGameOver: false };
		}
	});
}
