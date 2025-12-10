import { Client, MessageReaction, PartialMessageReaction, User, PartialUser } from "discord.js";
import { getEnv } from "../../config/env.js";
import { getChannelType } from "../../translation/translationService.js";
import type { IMessageMirrorRepository } from "../repositories/messageMirrorRepository.js";

/**
 * messageReactionRemove イベントハンドラ
 * 
 * 元メッセージからリアクションが削除された場合、ミラーメッセージからも同じリアクションを削除する。
 * 
 * 注意: Bot が追加したリアクションのみ削除可能。他ユーザーのリアクションは削除できない。
 */
export function createReactionRemoveHandler(
    client: Client,
    messageMirrorRepository: IMessageMirrorRepository
) {
    return async (
        reaction: MessageReaction | PartialMessageReaction,
        user: User | PartialUser
    ): Promise<void> => {
        // Bot のリアクション削除は無視（ループ防止）
        if (user.bot) {
            return;
        }

        // Partial リアクションの場合はフェッチ
        if (reaction.partial) {
            try {
                await reaction.fetch();
            } catch (error) {
                console.error("[reactionRemove] Failed to fetch partial reaction:", error);
                return;
            }
        }

        const env = getEnv();
        const channelType = getChannelType(
            reaction.message.channel.id,
            env.JP_CHANNEL_ID,
            env.EN_CHANNEL_ID
        );

        // 対象チャンネル以外はスキップ
        if (!channelType) {
            return;
        }

        try {
            // ミラー関係を検索（元メッセージ側からの検索）
            let mirror = await messageMirrorRepository.findByOriginalMessageId(reaction.message.id);
            let targetMessageId: string | null = null;
            let targetChannelId: string | null = null;

            if (mirror) {
                targetMessageId = mirror.mirroredMessageId;
                targetChannelId = mirror.mirroredChannelId;
            } else {
                // ミラー側からの検索（逆方向）
                mirror = await messageMirrorRepository.findByMirroredMessageId(reaction.message.id);
                if (mirror) {
                    targetMessageId = mirror.originalMessageId;
                    targetChannelId = mirror.originalChannelId;
                }
            }

            if (!targetMessageId || !targetChannelId) {
                return;
            }

            // ターゲットチャンネルとメッセージを取得
            const targetChannel = await client.channels.fetch(targetChannelId);
            if (!targetChannel?.isTextBased() || !("messages" in targetChannel)) {
                return;
            }

            const targetMessage = await targetChannel.messages.fetch(targetMessageId);

            // 同じリアクションを削除（Bot のリアクションのみ）
            const emojiIdentifier = reaction.emoji.id
                ? `${reaction.emoji.name}:${reaction.emoji.id}`
                : reaction.emoji.name;

            if (emojiIdentifier) {
                const targetReaction = targetMessage.reactions.cache.get(emojiIdentifier);
                if (targetReaction?.me) {
                    await targetReaction.users.remove(client.user!.id);
                    console.log(`[reactionRemove] Removed reaction ${reaction.emoji.name} from message ${targetMessageId}`);
                }
            }

        } catch (error) {
            console.error("[reactionRemove] Sync error:", error);
        }
    };
}
