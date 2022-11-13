import { z } from "zod";

export const teamSchema = z
	.object({
		teamName: z.string(),
		gamePoints: z.number().nonnegative(),
		isStretched: z.boolean()
	})
	.strict();

export type Team = z.infer<typeof teamSchema>;
