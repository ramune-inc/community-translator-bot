import { Client, Message, PartialMessage, TextChannel } from "discord.js";
import { getEnv } from "../../config/env.js";
import { getChannelType } from "../../translation/translationService.js";
import { deleteViaWebhook } from "../../webhook/webhookSender.js";
import { isWebhookCapableChannel } from "../../webhook/webhookManager.js";
import type { IMessageMirrorRepository } from "../repositories/messageMirrorRepository.js";

/**
 * messageDelete イベントハンドラ
 * 
 * 元メッセージが削除された場合、対応するミラーメッセージも削除する。
 * 
 * ※ リアクション同期は Discord API の仕様上不可能なため、実装対象外
 */
export function createMessageDeleteHandler(
    client: Client,
    messageMirrorRepository: IMessageMirrorRepository
) {
    return async (message: Message | PartialMessage): Promise<void> => {
        const env = getEnv();
        const channelType = getChannelType(
            message.channel.id,
            env.JP_CHANNEL_ID,
            env.EN_CHANNEL_ID
        );

        // 対象チャンネル以外はスキップ
        if (!channelType) {
            return;
        }

        try {
            // ミラー関係を検索
            const mirror = await messageMirrorRepository.findByOriginalMessageId(message.id);
            if (!mirror) {
                // ミラーメッセージ側が削除された場合の処理
                const reverseMirror = await messageMirrorRepository.findByMirroredMessageId(message.id);
                if (reverseMirror) {
                    // ミラー側が削除された場合は DB レコードのみ削除
                    await messageMirrorRepository.deleteByMirroredMessageId(message.id);
                    console.log(`[messageDelete] Removed mirror record for deleted mirrored message ${message.id}`);
                }
                return;
            }

            // ターゲットチャンネルを取得
            const targetChannel = await client.channels.fetch(mirror.mirroredChannelId);
            if (!targetChannel || !isWebhookCapableChannel(targetChannel)) {
                console.error(`[messageDelete] Target channel not found: ${mirror.mirroredChannelId}`);
                // チャンネルが見つからなくても DB レコードは削除
                await messageMirrorRepository.deleteByOriginalMessageId(message.id);
                return;
            }

            // Webhook 経由でメッセージを削除
            const deleted = await deleteViaWebhook(
                targetChannel,
                mirror.webhookId,
                mirror.mirroredMessageId
            );

            // DB からミラー関係を削除
            await messageMirrorRepository.deleteByOriginalMessageId(message.id);

            if (deleted) {
                console.log(`[messageDelete] Deleted mirrored message ${mirror.mirroredMessageId}`);
            }

        } catch (error) {
            console.error(`[messageDelete] Delete error:`, error);
        }
    };
}
