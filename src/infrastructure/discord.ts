import { Client, GatewayIntentBits, Partials } from "discord.js";

/**
 * Discord クライアントを作成
 * 
 * 必要な Intent:
 * - Guilds: サーバー情報
 * - GuildMessages: メッセージイベント
 * - MessageContent: メッセージ内容の取得（Privileged Intent）
 * - GuildWebhooks: Webhook 操作
 * 
 * 必要な Partials:
 * - Channel: DM チャンネル対応
 * - Message: 古いメッセージの編集/削除イベント受信
 */
export function createDiscordClient(): Client {
    return new Client({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.MessageContent,
            GatewayIntentBits.GuildWebhooks,
        ],
        partials: [
            Partials.Channel,
            Partials.Message,
        ],
    });
}

