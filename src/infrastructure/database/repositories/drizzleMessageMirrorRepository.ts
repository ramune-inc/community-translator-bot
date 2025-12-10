import { eq } from "drizzle-orm";
import { db } from "../client.js";
import { messageMirrors, type MessageMirrorSelect } from "../schema.js";
import type { MessageMirror } from "../../../core/entities/messageMirror.js";
import type { IMessageMirrorRepository } from "../../../core/repositories/messageMirrorRepository.js";

/**
 * Drizzle ORM を使用したメッセージミラーリポジトリ実装
 */
export class DrizzleMessageMirrorRepository implements IMessageMirrorRepository {
    async save(mirror: MessageMirror): Promise<MessageMirror> {
        const [result] = await db.insert(messageMirrors).values({
            originalMessageId: mirror.originalMessageId,
            mirroredMessageId: mirror.mirroredMessageId,
            originalChannelId: mirror.originalChannelId,
            mirroredChannelId: mirror.mirroredChannelId,
            webhookId: mirror.webhookId,
        }).returning();

        return {
            ...mirror,
            id: result.id,
            createdAt: result.createdAt ?? undefined,
        };
    }

    async findByOriginalMessageId(originalMessageId: string): Promise<MessageMirror | null> {
        const results = await db
            .select()
            .from(messageMirrors)
            .where(eq(messageMirrors.originalMessageId, originalMessageId))
            .limit(1);

        if (results.length === 0) {
            return null;
        }

        return this.toDomain(results[0]);
    }

    async findByMirroredMessageId(mirroredMessageId: string): Promise<MessageMirror | null> {
        const results = await db
            .select()
            .from(messageMirrors)
            .where(eq(messageMirrors.mirroredMessageId, mirroredMessageId))
            .limit(1);

        if (results.length === 0) {
            return null;
        }

        return this.toDomain(results[0]);
    }

    async deleteByOriginalMessageId(originalMessageId: string): Promise<void> {
        await db
            .delete(messageMirrors)
            .where(eq(messageMirrors.originalMessageId, originalMessageId));
    }

    async deleteByMirroredMessageId(mirroredMessageId: string): Promise<void> {
        await db
            .delete(messageMirrors)
            .where(eq(messageMirrors.mirroredMessageId, mirroredMessageId));
    }

    private toDomain(row: MessageMirrorSelect): MessageMirror {
        return {
            id: row.id,
            originalMessageId: row.originalMessageId,
            mirroredMessageId: row.mirroredMessageId,
            originalChannelId: row.originalChannelId,
            mirroredChannelId: row.mirroredChannelId,
            webhookId: row.webhookId,
            createdAt: row.createdAt ?? undefined,
        };
    }
}
