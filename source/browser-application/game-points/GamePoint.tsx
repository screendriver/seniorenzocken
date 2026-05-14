import { Users } from "lucide-react";
import type { FunctionComponent } from "react";
import { isUndefined } from "@sindresorhus/is";
import { type GamePointsPerRound, gamePointsPerRound } from "../../shared/game-points.js";
import type { NotPersistedTeam } from "../../shared/team.js";
import { mergeClassNames } from "../ui/merge-class-names.js";
import { Card } from "../ui/card.js";
import { Badge } from "../ui/badge.js";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group.js";

type GamePointProperties = {
	readonly team: NotPersistedTeam;
	readonly enabled: boolean;
	readonly gamePoint: GamePointsPerRound;
	readonly onChange: (gamePoint: GamePointsPerRound) => void;
};

function getGamePointPerRoundValue(gamePointPerRound: GamePointsPerRound): string {
	return gamePointPerRound.toString();
}

export const GamePoint: FunctionComponent<GamePointProperties> = (properties) => {
	const { team, gamePoint, enabled, onChange } = properties;
	const teamHeaderClassName = mergeClassNames(
		"flex min-h-12 items-center overflow-hidden rounded-md",
		team.isStretched ? "bg-red-500 text-red-950" : "bg-sky-500 text-sky-950"
	);

	return (
		<Card>
			<div className={teamHeaderClassName}>
				<div className="flex items-center px-4">
					<Users className="size-5" />
				</div>
				<cite className="flex-grow text-xl font-semibold not-italic">{team.name}</cite>
				<Badge
					variant="score"
					className="flex min-h-12 min-w-14 items-center justify-center rounded-none px-3 text-xl font-semibold"
				>
					{team.matchTotalGamePoints}
				</Badge>
			</div>
			<ToggleGroup
				selectedValue={getGamePointPerRoundValue(gamePoint)}
				onValueChange={(selectedValue) => {
					const selectedGamePoint = gamePointsPerRound.find((gamePointPerRound) => {
						return getGamePointPerRoundValue(gamePointPerRound) === selectedValue;
					});

					if (!isUndefined(selectedGamePoint)) {
						onChange(selectedGamePoint);
					}
				}}
				className="mt-3 grid-cols-4"
				aria-label={`${team.name} Punkte`}
			>
				{gamePointsPerRound.map((gamePointPerRound) => {
					return (
						<ToggleGroupItem
							key={`${team.name}-${gamePointPerRound}`}
							value={getGamePointPerRoundValue(gamePointPerRound)}
							disabled={!enabled}
							aria-label={gamePointPerRound.toString()}
						>
							{gamePointPerRound}
						</ToggleGroupItem>
					);
				})}
			</ToggleGroup>
		</Card>
	);
};
