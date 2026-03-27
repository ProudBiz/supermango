CREATE TABLE `todos` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`text` text NOT NULL,
	`completed` integer DEFAULT 0 NOT NULL,
	`createdAt` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
