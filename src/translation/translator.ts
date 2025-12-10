import deepl from "deepl-node";
import { getEnv } from "../config/env.js";

let translator: deepl.Translator | null = null;

/**
 * DeepL Translator インスタンスを取得（シングルトン）
 */
function getTranslator(): deepl.Translator {
    if (!translator) {
        const env = getEnv();
        translator = new deepl.Translator(env.DEEPL_API_KEY);
    }
    return translator;
}

/**
 * 日本語 → 英語に翻訳
 * @param text 翻訳対象テキスト
 * @returns 翻訳結果
 */
export async function translateToEnglish(text: string): Promise<string> {
    const result = await getTranslator().translateText(text, "ja", "en-US");
    return result.text;
}

/**
 * 英語 → 日本語に翻訳
 * @param text 翻訳対象テキスト
 * @returns 翻訳結果
 */
export async function translateToJapanese(text: string): Promise<string> {
    const result = await getTranslator().translateText(text, "en", "ja");
    return result.text;
}
