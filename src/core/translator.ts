import deepl from "deepl-node";

const translator = new deepl.Translator(process.env.DEEPL_API_KEY!);

// 日本語 → 英語
export async function translateToEnglish(text: string): Promise<string> {
    const result = await translator.translateText(text, "ja", "en-US");
    return result.text;
}

// 英語 → 日本語
export async function translateToJapanese(text: string): Promise<string> {
    const result = await translator.translateText(text, "en", "ja");
    return result.text;
}
