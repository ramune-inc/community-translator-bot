import "dotenv/config";
import { createDiscordClient } from "./infrastructure/discord";
import { registerBotHandlers } from "./app/bot";
import { DrizzleChatLogRepository } from "./infrastructure/database/repositories/drizzleChatLogRepository";

async function main() {
    const client = createDiscordClient();
    const chatLogRepository = new DrizzleChatLogRepository();

    registerBotHandlers(client, chatLogRepository);

    client.once("ready", () => {
        console.log(`Bot logged in as ${client.user?.tag}`);
    });

    client.login(process.env.DISCORD_TOKEN);
}

main();
