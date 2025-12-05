-- チャットログテーブル
CREATE TABLE IF NOT EXISTS chat_logs (
    id SERIAL PRIMARY KEY,
    discord_user_id VARCHAR(255) NOT NULL,
    discord_username VARCHAR(255) NOT NULL,
    channel_type VARCHAR(10) NOT NULL CHECK (channel_type IN ('JP', 'EN')),
    original_message TEXT NOT NULL,
    translated_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- インデックス
CREATE INDEX idx_chat_logs_created_at ON chat_logs(created_at);
CREATE INDEX idx_chat_logs_channel_type ON chat_logs(channel_type);
CREATE INDEX idx_chat_logs_discord_user_id ON chat_logs(discord_user_id);
