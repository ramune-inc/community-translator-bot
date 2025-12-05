import { desc, eq } from "drizzle-orm";
import { db } from "../client";
import { chatLogs, type ChatLogSelect } from "../schema";
import type { ChatLog } from "../../../core/entities/chatLog";
import type { IChatLogRepository } from "../../../core/repositories/chatLogRepository";

export class DrizzleChatLogRepository implements IChatLogRepository {
    async save(chatLog: ChatLog): Promise<ChatLog> {
        const [result] = await db.insert(chatLogs).values({
            discordUserId: chatLog.discordUserId,
            discordUsername: chatLog.discordUsername,
            channelType: chatLog.channelType,
            originalMessage: chatLog.originalMessage,
            translatedMessage: chatLog.translatedMessage,
        }).returning();

        return {
            ...chatLog,
            id: result.id,
            createdAt: result.createdAt ?? undefined,
        };
    }

    async findByUserId(discordUserId: string): Promise<ChatLog[]> {
        const results = await db
            .select()
            .from(chatLogs)
            .where(eq(chatLogs.discordUserId, discordUserId))
            .orderBy(desc(chatLogs.createdAt));

        return results.map(this.toDomain);
    }

    async findRecent(limit: number): Promise<ChatLog[]> {
        const results = await db
            .select()
            .from(chatLogs)
            .orderBy(desc(chatLogs.createdAt))
            .limit(limit);

        return results.map(this.toDomain);
    }

    private toDomain(row: ChatLogSelect): ChatLog {
        return {
            id: row.id,
            discordUserId: row.discordUserId,
            discordUsername: row.discordUsername,
            channelType: row.channelType as "JP" | "EN",
            originalMessage: row.originalMessage,
            translatedMessage: row.translatedMessage ?? undefined,
            createdAt: row.createdAt ?? undefined,
        };
    }
}
