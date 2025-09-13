-- VibeDoge 抽奖系统数据库表结构修复
-- 修复表名不匹配的问题：数据库服务中使用lottery_records，但SQL文件中定义的是lotteries

-- 1. 如果lotteries表存在且lottery_records不存在，重命名表
DO $$
BEGIN
    -- 检查lotteries表是否存在
    IF EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'lotteries'
    ) AND NOT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'lottery_records'
    ) THEN
        -- 重命名lotteries表为lottery_records
        EXECUTE 'ALTER TABLE lotteries RENAME TO lottery_records';
        RAISE NOTICE 'Renamed lotteries table to lottery_records';
    END IF;

    -- 如果两个表都不存在，创建lottery_records表
    IF NOT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'lottery_records'
    ) THEN
        -- 创建抽奖记录表
        CREATE TABLE lottery_records (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            lottery_id VARCHAR(100) UNIQUE NOT NULL,
            user_id UUID REFERENCES users(id) ON DELETE CASCADE,
            mcp_user_id VARCHAR(100) NOT NULL,
            status VARCHAR(20) DEFAULT 'active', -- active, completed, expired
            prize_name TEXT,
            prize_value TEXT,
            prize_description TEXT,
            prize_rarity VARCHAR(20),
            draw_timestamp TIMESTAMPTZ,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );
        
        -- 创建索引
        CREATE INDEX idx_lottery_records_lottery_id ON lottery_records(lottery_id);
        CREATE INDEX idx_lottery_records_user_id ON lottery_records(user_id);
        CREATE INDEX idx_lottery_records_mcp_user_id ON lottery_records(mcp_user_id);
        CREATE INDEX idx_lottery_records_status ON lottery_records(status);
        CREATE INDEX idx_lottery_records_created_at ON lottery_records(created_at DESC);
        
        -- 添加更新时间触发器
        CREATE TRIGGER update_lottery_records_updated_at 
            BEFORE UPDATE ON lottery_records
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
            
        RAISE NOTICE 'Created lottery_records table';
    END IF;
END
$$;

-- 2. 确保users表存在（如果不存在则创建）
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    mcp_user_id VARCHAR(100) UNIQUE NOT NULL,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    avatar_url TEXT,
    total_draws INTEGER DEFAULT 0,
    total_wins INTEGER DEFAULT 0,
    membership_level VARCHAR(20) DEFAULT 'basic',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建用户相关索引
CREATE INDEX IF NOT EXISTS idx_users_mcp_user_id ON users(mcp_user_id);

-- 添加用户表更新时间触发器
CREATE TRIGGER IF NOT EXISTS update_users_updated_at 
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 3. 创建更新时间触发器函数（如果不存在）
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 4. 创建视图用于统计用户抽奖次数
CREATE OR REPLACE VIEW user_lottery_stats AS
SELECT 
    u.id,
    u.mcp_user_id,
    u.username,
    COUNT(lr.id) as total_draws,
    COUNT(CASE WHEN lr.status = 'completed' AND lr.prize_name IS NOT NULL THEN 1 END) as total_wins,
    COALESCE(SUM(CASE WHEN lr.status = 'completed' THEN 1 ELSE 0 END), 0) as completed_draws,
    -- 计算剩余抽奖次数：默认3次减去已完成次数
    GREATEST(0, 3 - COALESCE(SUM(CASE WHEN lr.status = 'completed' THEN 1 ELSE 0 END), 0)) as remaining_draws,
    MAX(lr.draw_timestamp) as last_draw_at
FROM users u
LEFT JOIN lottery_records lr ON u.id = lr.user_id
GROUP BY u.id, u.mcp_user_id, u.username;

-- 5. 创建全局统计视图
CREATE OR REPLACE VIEW lottery_global_stats AS
SELECT 
    COUNT(DISTINCT u.id) as total_users,
    COUNT(lr.id) as total_lotteries,
    COUNT(CASE WHEN lr.status = 'active' THEN 1 END) as active_lotteries,
    COUNT(CASE WHEN lr.status = 'completed' THEN 1 END) as completed_lotteries,
    COUNT(DISTINCT CASE WHEN lr.created_at >= NOW() - INTERVAL '1 day' THEN u.id END) as today_active_users,
    COUNT(CASE WHEN lr.created_at >= NOW() - INTERVAL '1 day' THEN 1 END) as today_lotteries,
    COUNT(CASE WHEN lr.created_at >= NOW() - INTERVAL '1 day' AND lr.status = 'completed' THEN 1 END) as today_wins
FROM users u
LEFT JOIN lottery_records lr ON u.id = lr.user_id;

-- 6. 启用行级安全策略
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE lottery_records ENABLE ROW LEVEL SECURITY;

-- 7. 创建基本的安全策略（允许所有操作）
CREATE POLICY IF NOT EXISTS "Allow all operations on users" ON users FOR ALL USING (true);
CREATE POLICY IF NOT EXISTS "Allow all operations on lottery_records" ON lottery_records FOR ALL USING (true);

-- 8. 添加MCP调用规则说明注释
COMMENT ON TABLE lottery_records IS 'MCP抽奖记录表 - 每个用户默认有3次抽奖机会，完成后根据completed状态计算剩余次数';
COMMENT ON TABLE users IS 'MCP用户表 - 存储通过MCP协议注册的用户信息';

-- 修复完成提示
SELECT 'Database schema fix completed successfully! lottery_records table is now available.' as message;