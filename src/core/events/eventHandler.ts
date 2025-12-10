import { Client } from "discord.js";
import { createMessageCreateHandler } from "./messageCreate.js";
import { createMessageUpdateHandler } from "./messageUpdate.js";
import { createMessageDeleteHandler } from "./messageDelete.js";
import { createReactionAddHandler } from "./reactionAdd.js";
import { createReactionRemoveHandler } from "./reactionRemove.js";
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

    // messageReactionAdd: リアクション追加の同期
    const reactionAddHandler = createReactionAddHandler(
        client,
        messageMirrorRepository
    );
    client.on("messageReactionAdd", reactionAddHandler);

    // messageReactionRemove: リアクション削除の同期
    const reactionRemoveHandler = createReactionRemoveHandler(
        client,
        messageMirrorRepository
    );
    client.on("messageReactionRemove", reactionRemoveHandler);

    console.log("[EventHandler] All event handlers registered");
}

