import type { FunctionComponent } from "react";
import { Input } from "../ui/input.js";

type UsernameInputProperties = {
	readonly username: string;
	readonly onChange: (username: string) => void;
};

export const UsernameInput: FunctionComponent<UsernameInputProperties> = (properties) => {
	const { username, onChange } = properties;

	return (
		<label className="col-span-full grid w-full gap-2">
			<span className="text-slate-100">Username</span>
			<Input
				type="text"
				required={true}
				placeholder="Username"
				name="username"
				value={username}
				onChange={(changeEvent) => {
					onChange(changeEvent.currentTarget.value);
				}}
			/>
		</label>
	);
};
