import { Client, MessageReaction, PartialMessageReaction, User, PartialUser } from "discord.js";
import { getEnv } from "../../config/env.js";
import { getChannelType } from "../../translation/translationService.js";
import type { IMessageMirrorRepository } from "../repositories/messageMirrorRepository.js";

/**
 * messageReactionAdd イベントハンドラ
 * 
 * 元メッセージにリアクションが追加された場合、ミラーメッセージにも同じリアクションを追加する。
 * 
 * 注意: Bot としてリアクションを追加するため、「誰がリアクションしたか」の情報は失われる。
 * これは Discord API の制限によるもの。
 */
export function createReactionAddHandler(
    client: Client,
    messageMirrorRepository: IMessageMirrorRepository
) {
    return async (
        reaction: MessageReaction | PartialMessageReaction,
        user: User | PartialUser
    ): Promise<void> => {
        // Bot のリアクションは無視（ループ防止）
        if (user.bot) {
            return;
        }

        // Partial リアクションの場合はフェッチ
        if (reaction.partial) {
            try {
                await reaction.fetch();
            } catch (error) {
                console.error("[reactionAdd] Failed to fetch partial reaction:", error);
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

            // 同じリアクションを追加
            await targetMessage.react(reaction.emoji);
            console.log(`[reactionAdd] Synced reaction ${reaction.emoji.name} to message ${targetMessageId}`);

        } catch (error) {
            console.error("[reactionAdd] Sync error:", error);
        }
    };
}
