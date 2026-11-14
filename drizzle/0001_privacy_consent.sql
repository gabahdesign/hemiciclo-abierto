ALTER TABLE `responses` ADD COLUMN `consent_at` text NOT NULL DEFAULT '';
ALTER TABLE `responses` ADD COLUMN `privacy_version` text NOT NULL DEFAULT '2026-11-14';
ALTER TABLE `responses` ADD COLUMN `updated` text NOT NULL DEFAULT '';
