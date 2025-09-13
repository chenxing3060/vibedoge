-- 评论功能数据库表结构
-- 在 Supabase SQL Editor 中执行以下语句

-- 1. 留言评论表
CREATE TABLE IF NOT EXISTS message_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
    username VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    likes INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 话题留言评论表
CREATE TABLE IF NOT EXISTS topic_message_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    topic_message_id UUID REFERENCES topic_messages(id) ON DELETE CASCADE,
    username VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    likes INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 留言评论点赞表
CREATE TABLE IF NOT EXISTS message_comment_likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    comment_id UUID REFERENCES message_comments(id) ON DELETE CASCADE,
    username VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(comment_id, username)
);

-- 4. 话题留言评论点赞表
CREATE TABLE IF NOT EXISTS topic_message_comment_likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    comment_id UUID REFERENCES topic_message_comments(id) ON DELETE CASCADE,
    username VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(comment_id, username)
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_message_comments_message_id ON message_comments(message_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_message_comments_username ON message_comments(username);
CREATE INDEX IF NOT EXISTS idx_topic_message_comments_message_id ON topic_message_comments(topic_message_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_topic_message_comments_username ON topic_message_comments(username);
CREATE INDEX IF NOT EXISTS idx_message_comment_likes_comment_id ON message_comment_likes(comment_id);
CREATE INDEX IF NOT EXISTS idx_topic_message_comment_likes_comment_id ON topic_message_comment_likes(comment_id);

-- 为评论表添加更新时间触发器
CREATE TRIGGER update_message_comments_updated_at BEFORE UPDATE ON message_comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_topic_message_comments_updated_at BEFORE UPDATE ON topic_message_comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 启用行级安全策略 (RLS)
ALTER TABLE message_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE topic_message_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_comment_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE topic_message_comment_likes ENABLE ROW LEVEL SECURITY;

-- 创建基本的安全策略（允许所有操作）
CREATE POLICY "Allow all operations on message_comments" ON message_comments FOR ALL USING (true);
CREATE POLICY "Allow all operations on topic_message_comments" ON topic_message_comments FOR ALL USING (true);
CREATE POLICY "Allow all operations on message_comment_likes" ON message_comment_likes FOR ALL USING (true);
CREATE POLICY "Allow all operations on topic_message_comment_likes" ON topic_message_comment_likes FOR ALL USING (true);

-- 创建触发器函数来自动更新留言的回复数
CREATE OR REPLACE FUNCTION update_message_replies_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- 增加回复数
        UPDATE messages 
        SET replies = replies + 1 
        WHERE id = NEW.message_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- 减少回复数
        UPDATE messages 
        SET replies = GREATEST(0, replies - 1) 
        WHERE id = OLD.message_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 创建触发器
CREATE TRIGGER trigger_update_message_replies_count
    AFTER INSERT OR DELETE ON message_comments
    FOR EACH ROW EXECUTE FUNCTION update_message_replies_count();