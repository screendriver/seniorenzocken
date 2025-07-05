PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_games` (
	`game_id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`date_played` text NOT NULL,
	`team1_id` integer NOT NULL,
	`team2_id` integer NOT NULL,
	`team1_points` integer NOT NULL,
	`team2_points` integer NOT NULL,
	FOREIGN KEY (`team1_id`) REFERENCES `teams`(`team_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`team2_id`) REFERENCES `teams`(`team_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_games`("game_id", "date_played", "team1_id", "team2_id", "team1_points", "team2_points") SELECT "game_id", "date_played", "team1_id", "team2_id", "team1_points", "team2_points" FROM `games`;--> statement-breakpoint
DROP TABLE `games`;--> statement-breakpoint
ALTER TABLE `__new_games` RENAME TO `games`;--> statement-breakpoint
PRAGMA foreign_keys=ON;