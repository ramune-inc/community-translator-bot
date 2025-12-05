export interface ChatLog {
    id?: number;
    discordUserId: string;
    discordUsername: string;
    channelType: "JP" | "EN";
    originalMessage: string;
    translatedMessage?: string;
    embedding?: number[];
    createdAt?: Date;
}
