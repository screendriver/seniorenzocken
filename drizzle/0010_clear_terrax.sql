ALTER TABLE `sessions` RENAME TO `user_sessions`;--> statement-breakpoint
DROP INDEX `sessions_token_unique`;--> statement-breakpoint
CREATE UNIQUE INDEX `user_sessions_token_unique` ON `user_sessions` (`token`);