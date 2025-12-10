import type { MessageMirror } from "../entities/messageMirror.js";

/**
 * メッセージミラーリポジトリインターフェース
 * 
 * 翻訳元と翻訳先メッセージの紐付けを管理する。
 * 編集・削除の同期に使用。
 */
export interface IMessageMirrorRepository {
    /**
     * ミラー関係を保存
     * @param mirror ミラー情報
     * @returns 保存されたミラー情報（ID付き）
     */
    save(mirror: MessageMirror): Promise<MessageMirror>;

    /**
     * 元メッセージ ID からミラー関係を検索
     * @param originalMessageId 元メッセージの Discord ID
     * @returns ミラー情報、見つからない場合は null
     */
    findByOriginalMessageId(originalMessageId: string): Promise<MessageMirror | null>;

    /**
     * ミラー先メッセージ ID からミラー関係を検索
     * @param mirroredMessageId ミラー先メッセージの Discord ID
     * @returns ミラー情報、見つからない場合は null
     */
    findByMirroredMessageId(mirroredMessageId: string): Promise<MessageMirror | null>;

    /**
     * 元メッセージ ID でミラー関係を削除
     * @param originalMessageId 元メッセージの Discord ID
     */
    deleteByOriginalMessageId(originalMessageId: string): Promise<void>;

    /**
     * ミラー先メッセージ ID でミラー関係を削除
     * @param mirroredMessageId ミラー先メッセージの Discord ID
     */
    deleteByMirroredMessageId(mirroredMessageId: string): Promise<void>;
}
