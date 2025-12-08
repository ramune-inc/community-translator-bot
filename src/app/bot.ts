import { Client, Message } from "discord.js";
import { translateToEnglish, translateToJapanese } from "../core/translator";
import type { IChatLogRepository } from "../core/repositories/chatLogRepository";

export function registerBotHandlers(client: Client, chatLogRepository: IChatLogRepository) {
    const JP_CHANNEL = process.env.JP_CHANNEL_ID!;
    const EN_CHANNEL = process.env.EN_CHANNEL_ID!;

    client.on("messageCreate", async (msg: Message) => {
        if (msg.author.bot) return;

        // JP → EN
        if (msg.channel.id === JP_CHANNEL) {
            try {
                const translated = await translateToEnglish(msg.content);

                // チャットログを保存
                await chatLogRepository.save({
                    discordUserId: msg.author.id,
                    discordUsername: msg.author.username,
                    channelType: "JP",
                    originalMessage: msg.content,
                    translatedMessage: translated,
                });

                const channel = await client.channels.fetch(EN_CHANNEL);

                if (channel?.isTextBased() && "send" in channel) {
                    const displayName = msg.member?.displayName ?? msg.author.username;
                    await channel.send(`**${displayName}：** ${translated}`);
                }
            } catch (error) {
                console.error("[JP→EN] Translation/save error:", error);
                // ユーザーにエラーを通知
                try {
                    await msg.react("⚠️");
                    await msg.reply("翻訳中にエラーが発生しました。しばらくしてからもう一度お試しください。");
                } catch (notifyError) {
                    console.error("Failed to notify user:", notifyError);
                }
            }
            return;
        }

        // EN → JP
        if (msg.channel.id === EN_CHANNEL) {
            try {
                const translated = await translateToJapanese(msg.content);

                // チャットログを保存
                await chatLogRepository.save({
                    discordUserId: msg.author.id,
                    discordUsername: msg.author.username,
                    channelType: "EN",
                    originalMessage: msg.content,
                    translatedMessage: translated,
                });

                const channel = await client.channels.fetch(JP_CHANNEL);

                if (channel?.isTextBased() && "send" in channel) {
                    const displayName = msg.member?.displayName ?? msg.author.username;
                    await channel.send(`**${displayName}：** ${translated}`);
                }
            } catch (error) {
                console.error("[EN→JP] Translation/save error:", error);
                // ユーザーにエラーを通知
                try {
                    await msg.react("⚠️");
                    await msg.reply("An error occurred during translation. Please try again later.");
                } catch (notifyError) {
                    console.error("Failed to notify user:", notifyError);
                }
            }
            return;
        }
    });
}
