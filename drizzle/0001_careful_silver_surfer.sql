ALTER TABLE `players` RENAME COLUMN "id" TO "player_id";--> statement-breakpoint
ALTER TABLE `players` RENAME COLUMN "firstName" TO "first_name";--> statement-breakpoint
ALTER TABLE `players` RENAME COLUMN "lastName" TO "last_name";--> statement-breakpoint
ALTER TABLE `players` RENAME COLUMN "totalGamePoints" TO "total_points";--> statement-breakpoint
ALTER TABLE `players` RENAME COLUMN "totalGameRounds" TO "total_game_rounds";--> statement-breakpoint
CREATE TABLE `games` (
	`game_id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`date_played` text DEFAULT '2025-07-05T14:40:19.263Z' NOT NULL,
	`team1_id` integer NOT NULL,
	`team2_id` integer NOT NULL,
	`team1_points` integer NOT NULL,
	`team2_points` integer NOT NULL,
	FOREIGN KEY (`team1_id`) REFERENCES `teams`(`team_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`team2_id`) REFERENCES `teams`(`team_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `teams` (
	`team_id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`player1_id` integer NOT NULL,
	`player2_id` integer NOT NULL,
	FOREIGN KEY (`player1_id`) REFERENCES `players`(`player_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`player2_id`) REFERENCES `players`(`player_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `teams_player1Id_player2Id_unique` ON `teams` (`player1_id`,`player2_id`);