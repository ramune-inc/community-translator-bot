import { Message, Webhook, TextChannel, Attachment, APIMessage } from "discord.js";
import { markAsTranslated } from "../utils/loopPrevention.js";
import { getOrCreateWebhook, getWebhookById } from "./webhookManager.js";

/**
 * Webhook 送信結果
 * Webhook 経由で送信したメッセージの情報
 */
export interface WebhookSendResult {
    /** メッセージ ID */
    id: string;
    /** Webhook ID */
    webhookId: string;
}

/**
 * Webhook 送信オプション
 */
export interface WebhookSendOptions {
    /** 表示名 */
    username: string;
    /** アバター URL */
    avatarURL: string | null;
    /** メッセージ本文 */
    content: string;
    /** 添付ファイルの URL リスト */
    attachmentUrls?: string[];
}

/**
 * Webhook 経由でメッセージを送信
 * 
 * @param targetChannel 送信先チャンネル
 * @param options 送信オプション
 * @returns 送信されたメッセージの情報
 */
export async function sendViaWebhook(
    targetChannel: TextChannel,
    options: WebhookSendOptions
): Promise<WebhookSendResult> {
    const webhook = await getOrCreateWebhook(targetChannel);

    // ループ防止マーカーを付与
    const markedUsername = markAsTranslated(options.username);

    const messagePayload: {
        username: string;
        avatarURL?: string;
        content: string;
        files?: string[];
    } = {
        username: markedUsername,
        content: options.content,
    };

    if (options.avatarURL) {
        messagePayload.avatarURL = options.avatarURL;
    }

    if (options.attachmentUrls && options.attachmentUrls.length > 0) {
        messagePayload.files = options.attachmentUrls;
    }

    const sentMessage = await webhook.send(messagePayload);

    return {
        id: sentMessage.id,
        webhookId: webhook.id,
    };
}

/**
 * Webhook 経由でメッセージを編集
 * 
 * @param targetChannel 送信先チャンネル
 * @param webhookId Webhook ID
 * @param messageId 編集対象メッセージ ID
 * @param newContent 新しいメッセージ内容
 * @returns 編集成功時 true
 */
export async function editViaWebhook(
    targetChannel: TextChannel,
    webhookId: string,
    messageId: string,
    newContent: string
): Promise<boolean> {
    const webhook = await getWebhookById(targetChannel, webhookId);
    if (!webhook) {
        console.error(`[WebhookSender] Webhook not found: ${webhookId}`);
        return false;
    }

    try {
        await webhook.editMessage(messageId, {
            content: newContent,
        });
        return true;
    } catch (error) {
        console.error(`[WebhookSender] Failed to edit message ${messageId}:`, error);
        return false;
    }
}

/**
 * Webhook 経由でメッセージを削除
 * 
 * @param targetChannel 送信先チャンネル
 * @param webhookId Webhook ID
 * @param messageId 削除対象メッセージ ID
 * @returns 削除成功時 true
 */
export async function deleteViaWebhook(
    targetChannel: TextChannel,
    webhookId: string,
    messageId: string
): Promise<boolean> {
    const webhook = await getWebhookById(targetChannel, webhookId);
    if (!webhook) {
        console.error(`[WebhookSender] Webhook not found: ${webhookId}`);
        return false;
    }

    try {
        await webhook.deleteMessage(messageId);
        return true;
    } catch (error) {
        console.error(`[WebhookSender] Failed to delete message ${messageId}:`, error);
        return false;
    }
}

/**
 * メッセージの添付ファイル URL を取得
 * 
 * @param message Discord メッセージ
 * @returns 添付ファイル URL のリスト
 */
export function getAttachmentUrls(message: Message): string[] {
    return message.attachments.map((attachment: Attachment) => attachment.url);
}
