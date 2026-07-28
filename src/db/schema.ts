import { pgTable, text, timestamp, jsonb } from 'drizzle-orm/pg-core';

// Firebase Authenticated Users table
export const users = pgTable('users', {
  uid: text('uid').primaryKey(), // Firebase Auth UID
  email: text('email').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Key-Value App State Store for Online Synchronization across devices
export const appStore = pgTable('app_store', {
  key: text('key').primaryKey(),
  data: jsonb('data').notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
