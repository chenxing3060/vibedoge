# 数据库修复指南

## 🚨 常见问题

### 问题1：`column "created_by" does not exist`
**原因**：`topics` 表缺少 `created_by` 字段

### 问题2：`Could not find the table 'public.topics_with_stats'`
**原因**：代码尝试访问不存在的数据库视图

## ✅ 已自动修复
- 代码已修改为不依赖数据库视图
- 实时计算统计数据，兼容性更好
- 添加了错误处理和回退机制

## 🔧 需要执行的修复 

### 方法一：执行迁移脚本（推荐）

1. 登录 [Supabase Dashboard](https://supabase.com/dashboard)
2. 进入你的项目
3. 点击左侧菜单的 **SQL Editor**
4. 创建新查询
5. 复制并执行 `database/migration-add-topic-features.sql` 中的所有内容

### 方法二：最小修复（如果只缺少字段）

如果只是缺少 `created_by` 字段，执行：
```sql
ALTER TABLE topics ADD COLUMN IF NOT EXISTS created_by VARCHAR(100) NOT NULL DEFAULT '系统管理员';
```

### 方法三：重新创建数据库

如果数据库中没有重要数据：

1. 删除现有表：`messages`, `topics`, `message_likes`
2. 执行完整的 `database/schema.sql`

## 📋 迁移脚本内容

迁移脚本会执行以下操作：

1. ✅ 为 `topics` 表添加 `created_by` 字段
2. ✅ 创建 `topic_messages` 表
3. ✅ 创建 `topic_message_likes` 表
4. ✅ 添加必要的索引
5. ✅ 设置触发器和安全策略
6. ✅ 更新现有数据

## 🎯 验证修复

执行迁移后，你应该能看到：

- `topics` 表有 `created_by` 字段
- 新的 `topic_messages` 表
- 新的 `topic_message_likes` 表

## 🚀 重启项目

修复数据库后：

```bash
pnpm dev:full
```

## 📊 当前系统特性

- ✅ **实时统计**：动态计算留言数和参与者数
- ✅ **错误处理**：优雅处理数据库错误
- ✅ **回退机制**：如果统计计算失败，使用数据库中的值
- ✅ **兼容性**：即使数据库结构不完整也能工作

## 📞 如果还有问题

1. 检查 Supabase 控制台的错误日志
2. 确认所有表都已创建
3. 验证 RLS 策略已启用
4. 检查环境变量配置
5. 查看浏览器控制台的错误信息

现在系统应该可以正常工作了！🎉