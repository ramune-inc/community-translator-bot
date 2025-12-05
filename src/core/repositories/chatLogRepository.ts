import type { ChatLog } from "../entities/chatLog";

export interface IChatLogRepository {
    save(chatLog: ChatLog): Promise<ChatLog>;
    findByUserId(discordUserId: string): Promise<ChatLog[]>;
    findRecent(limit: number): Promise<ChatLog[]>;
}
