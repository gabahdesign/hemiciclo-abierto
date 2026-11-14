CREATE TABLE `responses` (
	`account` text PRIMARY KEY NOT NULL,
	`party` text NOT NULL,
	`province` text NOT NULL,
	`created` text NOT NULL,
	`consent` text DEFAULT 'v1' NOT NULL
);

