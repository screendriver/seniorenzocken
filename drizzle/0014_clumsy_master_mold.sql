ALTER TABLE `game_point_audios` RENAME COLUMN "game_point_audio_id" TO "id";--> statement-breakpoint
ALTER TABLE `players` RENAME COLUMN "player_id" TO "id";--> statement-breakpoint
ALTER TABLE `user_sessions` RENAME COLUMN "session_id" TO "id";--> statement-breakpoint
CREATE TABLE `team_members_sessions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`team_session_id` integer NOT NULL,
	`player_id` integer NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`team_session_id`) REFERENCES `team_sessions`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`player_id`) REFERENCES `players`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `team_sessions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_session_id` integer NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`user_session_id`) REFERENCES `user_sessions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
DROP TABLE `game_round_history_sessions`;--> statement-breakpoint
DROP TABLE `game_sessions`;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_games` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`team1_id` integer NOT NULL,
	`team2_id` integer NOT NULL,
	`team1_points` integer NOT NULL,
	`team2_points` integer NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`team1_id`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`team2_id`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_games`("id", "team1_id", "team2_id", "team1_points", "team2_points", "created_at") SELECT "game_id", "team1_id", "team2_id", "team1_points", "team2_points", "created_at" FROM `games`;--> statement-breakpoint
DROP TABLE `games`;--> statement-breakpoint
ALTER TABLE `__new_games` RENAME TO `games`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_teams` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`player1_id` integer NOT NULL,
	`player2_id` integer NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`player1_id`) REFERENCES `players`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`player2_id`) REFERENCES `players`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_teams`("id", "player1_id", "player2_id", "created_at") SELECT "team_id", "player1_id", "player2_id", "created_at" FROM `teams`;--> statement-breakpoint
DROP TABLE `teams`;--> statement-breakpoint
ALTER TABLE `__new_teams` RENAME TO `teams`;--> statement-breakpoint
CREATE UNIQUE INDEX `teams_player1Id_player2Id_unique` ON `teams` (`player1_id`,`player2_id`);
