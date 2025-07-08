PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_game_point_audios` (
	`game_point_audio_id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`game_points` integer,
	`audio_file` blob NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_game_point_audios`("game_point_audio_id", "name", "game_points", "audio_file") SELECT "game_point_audio_id", "name", "game_points", "audio_file" FROM `game_point_audios`;--> statement-breakpoint
DROP TABLE `game_point_audios`;--> statement-breakpoint
ALTER TABLE `__new_game_point_audios` RENAME TO `game_point_audios`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `name_index` ON `game_point_audios` (`name`);