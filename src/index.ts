import "dotenv/config";
import { validateEnv } from "./config/env.js";
import { createDiscordClient } from "./infrastructure/discord.js";
import { registerEventHandlers } from "./core/events/eventHandler.js";
import { DrizzleChatLogRepository } from "./infrastructure/database/repositories/drizzleChatLogRepository.js";
import { DrizzleMessageMirrorRepository } from "./infrastructure/database/repositories/drizzleMessageMirrorRepository.js";

/**
 * メインエントリポイント
 * 
 * Discord 翻訳 Bot を起動する。
 * - 環境変数をバリデーション
 * - Discord クライアントを作成
 * - リポジトリをインスタンス化
 * - イベントハンドラを登録
 * - Discord にログイン
 */
async function main() {
    // 環境変数をバリデーション（不正な場合はここで終了）
    const env = validateEnv();
    console.log("✅ Environment variables validated");

    // Discord クライアントを作成
    const client = createDiscordClient();

    // リポジトリをインスタンス化
    const chatLogRepository = new DrizzleChatLogRepository();
    const messageMirrorRepository = new DrizzleMessageMirrorRepository();

    // イベントハンドラを登録
    registerEventHandlers(client, chatLogRepository, messageMirrorRepository);

    // ready イベント
    client.once("ready", () => {
        console.log(`✅ Bot logged in as ${client.user?.tag}`);
        console.log(`📝 JP Channel: ${env.JP_CHANNEL_ID}`);
        console.log(`📝 EN Channel: ${env.EN_CHANNEL_ID}`);
    });

    // Discord にログイン
    await client.login(env.DISCORD_TOKEN);
}

main().catch((error) => {
    console.error("❌ Fatal error:", error);
    process.exit(1);
});

