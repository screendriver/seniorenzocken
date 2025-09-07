CREATE TABLE `game_round_history_sessions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`team_session_id` integer NOT NULL,
	`game_points` integer NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`team_session_id`) REFERENCES `team_sessions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `game_round_history_sessions_team_session_index` ON `game_round_history_sessions` (`team_session_id`);