import { Message } from "discord.js";
import { LOOP_PREVENTION_MARKER } from "./constants.js";

/**
 * 翻訳ループ防止ユーティリティ
 * 
 * Webhook で投稿されたミラーメッセージが再度翻訳対象にならないようにする。
 * ゼロ幅スペース（\u200B）を username に埋め込むことで識別する。
 */

/**
 * ユーザー名にループ防止マーカーを追加
 * @param username 元のユーザー名
 * @returns マーカー付きユーザー名
 */
export function markAsTranslated(username: string): string {
    return username + LOOP_PREVENTION_MARKER;
}

/**
 * メッセージが翻訳済み（ミラー）メッセージかどうかを判定
 * 
 * 以下の条件で判定：
 * 1. Bot が投稿したメッセージ
 * 2. Webhook メッセージで、username にマーカーが含まれる
 * 
 * @param message Discord メッセージ
 * @returns 翻訳済みメッセージの場合 true
 */
export function isTranslatedMessage(message: Message): boolean {
    // Bot が投稿したメッセージは無視
    if (message.author.bot) {
        return true;
    }

    // Webhook メッセージの場合、username にマーカーが含まれているかチェック
    if (message.webhookId) {
        return message.author.username.includes(LOOP_PREVENTION_MARKER);
    }

    return false;
}

/**
 * メッセージが翻訳対象かどうかを判定
 * @param message Discord メッセージ
 * @returns 翻訳対象の場合 true
 */
export function shouldTranslate(message: Message): boolean {
    return !isTranslatedMessage(message);
}
