import { translateToEnglish, translateToJapanese } from "./translator.js";
import type { ChannelType } from "../utils/constants.js";
import { CHANNEL_TYPES } from "../utils/constants.js";

/**
 * 翻訳サービス
 * 
 * 翻訳ロジックの抽象化レイヤー。
 * 将来的な拡張（キャッシュ、言語自動判定など）に対応しやすい設計。
 */

export interface TranslationResult {
    /** 翻訳後のテキスト */
    translatedText: string;
    /** 元のチャンネルタイプ */
    sourceChannelType: ChannelType;
    /** 翻訳先のチャンネルタイプ */
    targetChannelType: ChannelType;
}

/**
 * チャンネルタイプに基づいて翻訳を実行
 * 
 * @param text 翻訳対象テキスト
 * @param sourceChannelType 元のチャンネルタイプ（JP or EN）
 * @returns 翻訳結果
 */
export async function translateByChannelType(
    text: string,
    sourceChannelType: ChannelType
): Promise<TranslationResult> {
    // 空白のみのテキストは翻訳しない
    const trimmedText = text.trim();
    if (!trimmedText) {
        return {
            translatedText: text,
            sourceChannelType,
            targetChannelType: sourceChannelType === CHANNEL_TYPES.JP
                ? CHANNEL_TYPES.EN
                : CHANNEL_TYPES.JP,
        };
    }

    if (sourceChannelType === CHANNEL_TYPES.JP) {
        const translatedText = await translateToEnglish(trimmedText);
        return {
            translatedText,
            sourceChannelType: CHANNEL_TYPES.JP,
            targetChannelType: CHANNEL_TYPES.EN,
        };
    } else {
        const translatedText = await translateToJapanese(trimmedText);
        return {
            translatedText,
            sourceChannelType: CHANNEL_TYPES.EN,
            targetChannelType: CHANNEL_TYPES.JP,
        };
    }
}

/**
 * チャンネル ID からチャンネルタイプを判定
 * 
 * @param channelId チャンネル ID
 * @param jpChannelId JP チャンネル ID
 * @param enChannelId EN チャンネル ID
 * @returns チャンネルタイプ、該当しない場合は null
 */
export function getChannelType(
    channelId: string,
    jpChannelId: string,
    enChannelId: string
): ChannelType | null {
    if (channelId === jpChannelId) {
        return CHANNEL_TYPES.JP;
    }
    if (channelId === enChannelId) {
        return CHANNEL_TYPES.EN;
    }
    return null;
}

/**
 * ターゲットチャンネル ID を取得
 * 
 * @param sourceChannelType 元のチャンネルタイプ
 * @param jpChannelId JP チャンネル ID
 * @param enChannelId EN チャンネル ID
 * @returns ターゲットチャンネル ID
 */
export function getTargetChannelId(
    sourceChannelType: ChannelType,
    jpChannelId: string,
    enChannelId: string
): string {
    return sourceChannelType === CHANNEL_TYPES.JP ? enChannelId : jpChannelId;
}
