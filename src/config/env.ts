import { z } from "zod";

/**
 * 環境変数スキーマ定義
 * 起動時に必須の環境変数をバリデーションする
 */
const envSchema = z.object({
    // Discord Bot Settings
    DISCORD_TOKEN: z.string().min(1, "DISCORD_TOKEN is required"),
    JP_CHANNEL_ID: z.string().min(1, "JP_CHANNEL_ID is required"),
    EN_CHANNEL_ID: z.string().min(1, "EN_CHANNEL_ID is required"),

    // DeepL API
    DEEPL_API_KEY: z.string().min(1, "DEEPL_API_KEY is required"),

    // Database
    DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
});

export type Env = z.infer<typeof envSchema>;

let cachedEnv: Env | null = null;

/**
 * 環境変数をバリデーションして返す
 * 不正な場合はエラーメッセージと共にプロセスを終了
 */
export function validateEnv(): Env {
    if (cachedEnv) {
        return cachedEnv;
    }

    const result = envSchema.safeParse(process.env);

    if (!result.success) {
        console.error("❌ Environment variable validation failed:");
        for (const issue of result.error.issues) {
            console.error(`  - ${issue.path.join(".")}: ${issue.message}`);
        }
        process.exit(1);
    }

    cachedEnv = result.data;
    return cachedEnv;
}

/**
 * 環境変数を取得（バリデーション済み前提）
 */
export function getEnv(): Env {
    if (!cachedEnv) {
        return validateEnv();
    }
    return cachedEnv;
}
