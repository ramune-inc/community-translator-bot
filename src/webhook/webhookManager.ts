import { TextChannel, Webhook, ChannelType } from "discord.js";
import { BOT_WEBHOOK_NAME } from "../utils/constants.js";

/**
 * Webhook マネージャー
 * 
 * チャンネルごとの Webhook を作成・取得・キャッシュする。
 * Bot が使用する Webhook は一度作成したら再利用する。
 */

/** Webhook のキャッシュ（チャンネル ID → Webhook） */
const webhookCache = new Map<string, Webhook>();

/**
 * チャンネルの Webhook を取得または作成
 * 
 * @param channel テキストチャンネル
 * @returns Webhook インスタンス
 */
export async function getOrCreateWebhook(channel: TextChannel): Promise<Webhook> {
    // キャッシュにあればそれを返す
    const cached = webhookCache.get(channel.id);
    if (cached) {
        return cached;
    }

    // 既存の Webhook を検索
    const existingWebhook = await findExistingWebhook(channel);
    if (existingWebhook) {
        webhookCache.set(channel.id, existingWebhook);
        return existingWebhook;
    }

    // 新規作成
    const newWebhook = await createWebhook(channel);
    webhookCache.set(channel.id, newWebhook);
    return newWebhook;
}

/**
 * 指定された Webhook ID から Webhook インスタンスを取得
 * 
 * @param channel テキストチャンネル
 * @param webhookId Webhook ID
 * @returns Webhook インスタンス、見つからない場合は null
 */
export async function getWebhookById(
    channel: TextChannel,
    webhookId: string
): Promise<Webhook | null> {
    try {
        const webhooks = await channel.fetchWebhooks();
        const webhook = webhooks.get(webhookId);
        return webhook ?? null;
    } catch (error) {
        console.error(`[WebhookManager] Failed to fetch webhook by ID: ${webhookId}`, error);
        return null;
    }
}

/**
 * チャンネル内で Bot が作成した既存の Webhook を検索
 */
async function findExistingWebhook(channel: TextChannel): Promise<Webhook | null> {
    try {
        const webhooks = await channel.fetchWebhooks();
        const botWebhook = webhooks.find(
            (wh) => wh.name === BOT_WEBHOOK_NAME && wh.owner?.id === channel.client.user?.id
        );
        return botWebhook ?? null;
    } catch (error) {
        console.error(`[WebhookManager] Failed to fetch webhooks for channel ${channel.id}:`, error);
        return null;
    }
}

/**
 * 新しい Webhook を作成
 */
async function createWebhook(channel: TextChannel): Promise<Webhook> {
    const webhook = await channel.createWebhook({
        name: BOT_WEBHOOK_NAME,
        reason: "Community Translator Bot - Auto-created for message mirroring",
    });
    console.log(`[WebhookManager] Created new webhook in channel ${channel.id}`);
    return webhook;
}

/**
 * Webhook キャッシュをクリア
 * 
 * @param channelId 特定のチャンネル ID（省略時は全キャッシュをクリア）
 */
export function clearWebhookCache(channelId?: string): void {
    if (channelId) {
        webhookCache.delete(channelId);
    } else {
        webhookCache.clear();
    }
}

/**
 * チャンネルが Webhook 送信可能かチェック
 */
export function isWebhookCapableChannel(channel: unknown): channel is TextChannel {
    return (
        channel !== null &&
        typeof channel === "object" &&
        "type" in channel &&
        (channel as { type: ChannelType }).type === ChannelType.GuildText
    );
}
