CREATE TABLE `game_sessions` (
	`session_id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_session_id` integer NOT NULL,
	`team1_player1_id` integer NOT NULL,
	`team1_player2_id` integer NOT NULL,
	`team2_player1_id` integer NOT NULL,
	`team2_player2_id` integer NOT NULL,
	`state` text NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`user_session_id`) REFERENCES `user_sessions`(`session_id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`team1_player1_id`) REFERENCES `players`(`player_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`team1_player2_id`) REFERENCES `players`(`player_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`team2_player1_id`) REFERENCES `players`(`player_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`team2_player2_id`) REFERENCES `players`(`player_id`) ON UPDATE no action ON DELETE no action
);
