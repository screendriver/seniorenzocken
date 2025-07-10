ALTER TABLE `game_point_audios` ADD `created_at` text DEFAULT (current_timestamp) NOT NULL;--> statement-breakpoint
ALTER TABLE `games` ADD `created_at` text DEFAULT (current_timestamp) NOT NULL;--> statement-breakpoint
ALTER TABLE `games` DROP COLUMN `date_time_played`;--> statement-breakpoint
ALTER TABLE `players` ADD `created_at` text DEFAULT (current_timestamp) NOT NULL;--> statement-breakpoint
ALTER TABLE `teams` ADD `created_at` text DEFAULT (current_timestamp) NOT NULL;