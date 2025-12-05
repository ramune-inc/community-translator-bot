import { Client, Message, TextBasedChannel } from "discord.js";
import { translateToEnglish, translateToJapanese } from "../core/translator";

export function registerBotHandlers(client: Client) {
    const JP_CHANNEL = process.env.JP_CHANNEL_ID!;
    const EN_CHANNEL = process.env.EN_CHANNEL_ID!;

    client.on("messageCreate", async (msg: Message) => {
        if (msg.author.bot) return;

        // JP → EN
        if (msg.channel.id === JP_CHANNEL) {
            const translated = await translateToEnglish(msg.content);

            const channel = await client.channels.fetch(EN_CHANNEL);

            if (channel && channel.isTextBased()) {
                await (channel as TextBasedChannel).send(
                    `**${msg.author.username}:** ${translated}`
                );
            }
            return;
        }

        // EN → JP
        if (msg.channel.id === EN_CHANNEL) {
            const translated = await translateToJapanese(msg.content);

            const channel = await client.channels.fetch(JP_CHANNEL);

            if (channel && channel.isTextBased()) {
                await (channel as TextBasedChannel).send(
                    `**${msg.author.username}:** ${translated}`
                );
            }
            return;
        }
    });
}
