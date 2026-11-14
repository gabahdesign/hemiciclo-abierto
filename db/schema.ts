// Intentionally empty by default.
// Add Drizzle tables here when the site actually needs a database.
// See examples/d1/db/schema.ts for an opt-in example.
import { sqliteTable, text } from 'drizzle-orm/sqlite-core';
export const responses = sqliteTable('responses', {
 account: text('account').primaryKey(),
 party: text('party').notNull(),
 province: text('province').notNull(),
 created: text('created').notNull(),
  consent: text('consent').notNull().default('v1'),
  consentAt: text('consent_at').notNull().default(''),
  privacyVersion: text('privacy_version').notNull().default('2026-11-14'),
  updated: text('updated').notNull().default(''),
});
