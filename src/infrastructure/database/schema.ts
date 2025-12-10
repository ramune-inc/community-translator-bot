import { pgTable, serial, varchar, text, timestamp, index } from "drizzle-orm/pg-core";
import { vector } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// pgvector 拡張機能（マイグレーション時に手動で追加が必要）
export const createVectorExtension = sql`CREATE EXTENSION IF NOT EXISTS vector`;


// ========================================
// チャットログテーブル
// ========================================
export const chatLogs = pgTable("chat_logs", {
    id: serial("id").primaryKey(),
    discordUserId: varchar("discord_user_id", { length: 255 }).notNull(),
    discordUsername: varchar("discord_username", { length: 255 }).notNull(),
    channelType: varchar("channel_type", { length: 10 }).notNull(),
    originalMessage: text("original_message").notNull(),
    translatedMessage: text("translated_message"),
    embedding: vector("embedding", { dimensions: 1536 }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
}, (table) => [
    index("idx_chat_logs_created_at").on(table.createdAt),
    index("idx_chat_logs_channel_type").on(table.channelType),
    index("idx_chat_logs_user_id").on(table.discordUserId),
]);

export type ChatLogInsert = typeof chatLogs.$inferInsert;
export type ChatLogSelect = typeof chatLogs.$inferSelect;


// ========================================
// メッセージミラーテーブル
// 翻訳元と翻訳先メッセージの紐付けを保存
// 編集・削除の同期に使用
// ========================================
export const messageMirrors = pgTable("message_mirrors", {
    id: serial("id").primaryKey(),
    /** 元メッセージの Discord ID */
    originalMessageId: varchar("original_message_id", { length: 255 }).notNull(),
    /** ミラー先メッセージの Discord ID */
    mirroredMessageId: varchar("mirrored_message_id", { length: 255 }).notNull(),
    /** 元チャンネル ID */
    originalChannelId: varchar("original_channel_id", { length: 255 }).notNull(),
    /** ミラー先チャンネル ID */
    mirroredChannelId: varchar("mirrored_channel_id", { length: 255 }).notNull(),
    /** 使用した Webhook の ID */
    webhookId: varchar("webhook_id", { length: 255 }).notNull(),
    /** 作成日時 */
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
}, (table) => [
    index("idx_message_mirrors_original").on(table.originalMessageId),
    index("idx_message_mirrors_mirrored").on(table.mirroredMessageId),
]);

export type MessageMirrorInsert = typeof messageMirrors.$inferInsert;
export type MessageMirrorSelect = typeof messageMirrors.$inferSelect;
