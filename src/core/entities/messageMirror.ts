/**
 * メッセージミラー（翻訳元と翻訳先の紐付け）エンティティ
 * 
 * 編集・削除の同期に使用する。
 */
export interface MessageMirror {
    /** データベース ID */
    id?: number;

    /** 元メッセージの Discord ID */
    originalMessageId: string;

    /** ミラー先メッセージの Discord ID */
    mirroredMessageId: string;

    /** 元チャンネル ID */
    originalChannelId: string;

    /** ミラー先チャンネル ID */
    mirroredChannelId: string;

    /** 使用した Webhook の ID */
    webhookId: string;

    /** 作成日時 */
    createdAt?: Date;
}
