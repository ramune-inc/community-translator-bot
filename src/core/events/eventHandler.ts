import { Client } from "discord.js";
import { createMessageCreateHandler } from "./messageCreate.js";
import { createMessageUpdateHandler } from "./messageUpdate.js";
import { createMessageDeleteHandler } from "./messageDelete.js";
import type { IChatLogRepository } from "../repositories/chatLogRepository.js";
import type { IMessageMirrorRepository } from "../repositories/messageMirrorRepository.js";

/**
 * イベントハンドラ登録
 * 
 * Discord クライアントにすべてのイベントハンドラを登録する。
 */
export function registerEventHandlers(
    client: Client,
    chatLogRepository: IChatLogRepository,
    messageMirrorRepository: IMessageMirrorRepository
): void {
    // messageCreate: 新規メッセージの翻訳・ミラー
    const messageCreateHandler = createMessageCreateHandler(
        client,
        chatLogRepository,
        messageMirrorRepository
    );
    client.on("messageCreate", messageCreateHandler);

    // messageUpdate: メッセージ編集の同期
    const messageUpdateHandler = createMessageUpdateHandler(
        client,
        messageMirrorRepository
    );
    client.on("messageUpdate", messageUpdateHandler);

    // messageDelete: メッセージ削除の同期
    const messageDeleteHandler = createMessageDeleteHandler(
        client,
        messageMirrorRepository
    );
    client.on("messageDelete", messageDeleteHandler);

    console.log("[EventHandler] All event handlers registered");
}
