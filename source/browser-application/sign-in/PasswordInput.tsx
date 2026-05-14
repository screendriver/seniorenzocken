import type { FunctionComponent } from "react";
import { Input } from "../ui/input.js";

type PasswordInputProperties = {
	readonly password: string;
	readonly onChange: (password: string) => void;
};

export const PasswordInput: FunctionComponent<PasswordInputProperties> = (properties) => {
	const { password, onChange } = properties;

	return (
		<label className="col-span-full grid w-full gap-2">
			<span className="text-slate-100">Passwort</span>
			<Input
				type="password"
				name="password"
				placeholder="Passwort"
				required={true}
				value={password}
				onChange={(changeEvent) => {
					onChange(changeEvent.currentTarget.value);
				}}
			/>
		</label>
	);
};
