/**
 * Bot 関連の定数定義
 */

/** Webhook 名（Bot が作成する Webhook の識別用） */
export const BOT_WEBHOOK_NAME = "Community Translator Bot";

/** 翻訳ループ防止用のマーカー（ゼロ幅スペース） */
export const LOOP_PREVENTION_MARKER = "\u200B";

/** チャンネルタイプ */
export const CHANNEL_TYPES = {
    JP: "JP",
    EN: "EN",
} as const;

export type ChannelType = (typeof CHANNEL_TYPES)[keyof typeof CHANNEL_TYPES];
