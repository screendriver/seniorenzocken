CREATE TABLE `game_round_history_sessions` (
	`game_round_history_id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`game_session_id` integer NOT NULL,
	`round_number` integer NOT NULL,
	`team1_points` integer NOT NULL,
	`team2_points` integer NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`game_session_id`) REFERENCES `game_sessions`(`session_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `game_session_id_index` ON `game_round_history_sessions` (`game_session_id`);--> statement-breakpoint
CREATE INDEX `round_number_index` ON `game_round_history_sessions` (`round_number`);