import { Client, Message, TextChannel } from "discord.js";
import { getEnv } from "../../config/env.js";
import { shouldTranslate } from "../../utils/loopPrevention.js";
import { translateByChannelType, getChannelType, getTargetChannelId } from "../../translation/translationService.js";
import { sendViaWebhook, getAttachmentUrls } from "../../webhook/webhookSender.js";
import { isWebhookCapableChannel } from "../../webhook/webhookManager.js";
import type { IChatLogRepository } from "../repositories/chatLogRepository.js";
import type { IMessageMirrorRepository } from "../repositories/messageMirrorRepository.js";
import { CHANNEL_TYPES } from "../../utils/constants.js";

/**
 * messageCreate イベントハンドラ
 * 
 * JP ↔ EN チャンネル間の双方向翻訳を行う。
 * Webhook を使用して元ユーザーのアバター・名前で投稿する。
 * 
 * ※ リアクション同期は Discord API の仕様上不可能なため、実装対象外
 */
export function createMessageCreateHandler(
    client: Client,
    chatLogRepository: IChatLogRepository,
    messageMirrorRepository: IMessageMirrorRepository
) {
    return async (message: Message): Promise<void> => {
        // 翻訳対象外のメッセージはスキップ
        if (!shouldTranslate(message)) {
            return;
        }

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
            // 翻訳を実行
            const translationResult = await translateByChannelType(
                message.content,
                channelType
            );

            // チャットログを保存
            await chatLogRepository.save({
                discordUserId: message.author.id,
                discordUsername: message.author.username,
                channelType: channelType,
                originalMessage: message.content,
                translatedMessage: translationResult.translatedText,
            });

            // ターゲットチャンネルを取得
            const targetChannelId = getTargetChannelId(
                channelType,
                env.JP_CHANNEL_ID,
                env.EN_CHANNEL_ID
            );
            const targetChannel = await client.channels.fetch(targetChannelId);

            if (!targetChannel || !isWebhookCapableChannel(targetChannel)) {
                console.error(`[messageCreate] Target channel not found or not webhook capable: ${targetChannelId}`);
                return;
            }

            // Webhook 経由でミラーメッセージを送信
            const displayName = message.member?.displayName ?? message.author.username;
            const avatarURL = message.author.displayAvatarURL({ size: 256 });
            const attachmentUrls = getAttachmentUrls(message);

            const mirroredMessage = await sendViaWebhook(targetChannel, {
                username: displayName,
                avatarURL: avatarURL,
                content: translationResult.translatedText,
                attachmentUrls: attachmentUrls.length > 0 ? attachmentUrls : undefined,
            });

            // ミラー関係を保存（編集・削除の同期用）
            await messageMirrorRepository.save({
                originalMessageId: message.id,
                mirroredMessageId: mirroredMessage.id,
                originalChannelId: message.channel.id,
                mirroredChannelId: targetChannelId,
                webhookId: mirroredMessage.webhookId ?? "",
            });

            console.log(`[messageCreate] ${channelType} → ${translationResult.targetChannelType}: Mirrored message ${message.id} → ${mirroredMessage.id}`);

        } catch (error) {
            console.error(`[messageCreate] Translation/mirror error:`, error);

            // ユーザーにエラーを通知
            try {
                await message.react("⚠️");
                const errorMessage = channelType === CHANNEL_TYPES.JP
                    ? "翻訳中にエラーが発生しました。しばらくしてからもう一度お試しください。"
                    : "An error occurred during translation. Please try again later.";
                await message.reply(errorMessage);
            } catch (notifyError) {
                console.error("[messageCreate] Failed to notify user:", notifyError);
            }
        }
    };
}
