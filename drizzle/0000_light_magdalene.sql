CREATE TABLE `players` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`firstName` text NOT NULL,
	`lastName` text NOT NULL,
	`nickname` text NOT NULL,
	`totalGamePoints` integer DEFAULT 0 NOT NULL,
	`totalGameRounds` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `players_nickname_unique` ON `players` (`nickname`);