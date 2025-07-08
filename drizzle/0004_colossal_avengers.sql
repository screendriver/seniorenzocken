CREATE TABLE `game_point_audios` (
	`game_point_audio_id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`game_points` integer NOT NULL,
	`file_name` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `name_index` ON `game_point_audios` (`name`);