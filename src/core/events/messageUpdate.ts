import { Client, Message, PartialMessage, TextChannel } from "discord.js";
import { getEnv } from "../../config/env.js";
import { translateByChannelType, getChannelType } from "../../translation/translationService.js";
import { editViaWebhook } from "../../webhook/webhookSender.js";
import { isWebhookCapableChannel } from "../../webhook/webhookManager.js";
import type { IMessageMirrorRepository } from "../repositories/messageMirrorRepository.js";

/**
 * messageUpdate イベントハンドラ
 * 
 * 元メッセージが編集された場合、対応するミラーメッセージも編集する。
 * 
 * ※ リアクション同期は Discord API の仕様上不可能なため、実装対象外
 */
export function createMessageUpdateHandler(
    client: Client,
    messageMirrorRepository: IMessageMirrorRepository
) {
    return async (
        oldMessage: Message | PartialMessage,
        newMessage: Message | PartialMessage
    ): Promise<void> => {
        // Partial メッセージの場合はフェッチ
        if (newMessage.partial) {
            try {
                await newMessage.fetch();
            } catch (error) {
                console.error("[messageUpdate] Failed to fetch partial message:", error);
                return;
            }
        }

        // Bot/Webhook メッセージは無視
        if (newMessage.author?.bot) {
            return;
        }

        // 内容が変わっていない場合はスキップ（embed 更新など）
        if (oldMessage.content === newMessage.content) {
            return;
        }

        const env = getEnv();
        const channelType = getChannelType(
            newMessage.channel.id,
            env.JP_CHANNEL_ID,
            env.EN_CHANNEL_ID
        );

        // 対象チャンネル以外はスキップ
        if (!channelType) {
            return;
        }

        try {
            // ミラー関係を検索
            const mirror = await messageMirrorRepository.findByOriginalMessageId(newMessage.id);
            if (!mirror) {
                console.log(`[messageUpdate] No mirror found for message ${newMessage.id}`);
                return;
            }

            // 新しい内容を翻訳
            const translationResult = await translateByChannelType(
                newMessage.content ?? "",
                channelType
            );

            // ターゲットチャンネルを取得
            const targetChannel = await client.channels.fetch(mirror.mirroredChannelId);
            if (!targetChannel || !isWebhookCapableChannel(targetChannel)) {
                console.error(`[messageUpdate] Target channel not found: ${mirror.mirroredChannelId}`);
                return;
            }

            // Webhook 経由でメッセージを編集
            const result = await editViaWebhook(
                targetChannel,
                mirror.webhookId,
                mirror.mirroredMessageId,
                translationResult.translatedText
            );

            if (result) {
                console.log(`[messageUpdate] Edited mirrored message ${mirror.mirroredMessageId}`);
            }

        } catch (error) {
            console.error(`[messageUpdate] Edit error:`, error);
        }
    };
}
