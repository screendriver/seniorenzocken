import type { FunctionComponent } from "react";
import type { Players } from "../../server-shared/player.js";
import { Select } from "../ui/select.js";

type SelectPlayerProperties = {
	readonly playerNumber: number;
	readonly players: Players;
	readonly selectedPlayerId: number;
	readonly onChange: (playerId: number) => void;
};

export const SelectPlayer: FunctionComponent<SelectPlayerProperties> = (properties) => {
	const { selectedPlayerId, onChange, playerNumber, players } = properties;

	return (
		<Select
			value={selectedPlayerId}
			onChange={(changeEvent) => {
				onChange(Number.parseInt(changeEvent.currentTarget.value, 10));
			}}
		>
			<option disabled={true} value={-1}>
				Spieler {playerNumber}
			</option>
			{players.map((player) => {
				return (
					<option key={player.playerId} value={player.playerId}>
						{player.nickname} ({player.firstName})
					</option>
				);
			})}
		</Select>
	);
};
