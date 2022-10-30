import is from "@sindresorhus/is";

export interface Team {
	readonly teamName: string;
	readonly gamePoints: number;
}

export type Teams = ReadonlyMap<number, Team>;

export function areTeamsFilled(teams: Teams): boolean {
	if (is.emptyMap(teams)) {
		return false;
	}

	return Array.from(teams.values()).every((team) => {
		return is.nonEmptyString(team.teamName);
	});
}
