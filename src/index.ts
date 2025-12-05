import "dotenv/config";
import { createDiscordClient } from "./infrastructure/discord";
import { registerBotHandlers } from "./app/bot";

async function main() {
    const client = createDiscordClient();

    registerBotHandlers(client);

    client.once("ready", () => {
        console.log(`Bot logged in as ${client.user?.tag}`);
    });

    client.login(process.env.DISCORD_TOKEN);
}

main();
