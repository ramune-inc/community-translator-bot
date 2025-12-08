import deepl from "deepl-node";

let translator: deepl.Translator | null = null;

function getTranslator(): deepl.Translator {
    if (!translator) {
        const apiKey = process.env.DEEPL_API_KEY;
        if (!apiKey) {
            throw new Error("DEEPL_API_KEY is not set");
        }
        translator = new deepl.Translator(apiKey);
    }
    return translator;
}

// 日本語 → 英語
export async function translateToEnglish(text: string): Promise<string> {
    const result = await getTranslator().translateText(text, "ja", "en-US");
    return result.text;
}

// 英語 → 日本語
export async function translateToJapanese(text: string): Promise<string> {
    const result = await getTranslator().translateText(text, "en", "ja");
    return result.text;
}
