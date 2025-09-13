# MCP 社区服务网络配置指南

## 概述

本指南介绍如何通过网络访问配置 MCP 社区服务，无需本地 JS/TS 文件。提供多种配置方案，适合不同的使用场景。

## 🚀 快速开始

### 方案一：Python HTTP 服务器（推荐）

#### 1. 安装依赖
```bash
# 安装 Python 依赖
pip install aiohttp

# 或使用 uv（推荐）
pip install uv
uv add aiohttp
```

#### 2. 设置权限
```bash
chmod +x mcp-http-server.py
```

#### 3. 配置 MCP
在 `.kiro/settings/mcp.json` 中添加：

```json
{
  "mcpServers": {
    "vibedoge-community": {
      "command": "python3",
      "args": ["./mcp-http-server.py"],
      "env": {
        "COMMUNITY_API_URL": "http://localhost:3001/api"
      },
      "disabled": false,
      "autoApprove": [
        "create_mcp_user",
        "get_messages",
        "get_user_stats"
      ]
    }
  }
}
```

### 方案二：Bash + Curl 包装器

#### 1. 安装依赖
```bash
# 确保系统有这些工具
sudo apt-get install jq curl openssl  # Ubuntu/Debian
# 或
brew install jq curl openssl          # macOS
```

#### 2. 设置权限
```bash
chmod +x mcp-curl-wrapper.sh
```

#### 3. 配置 MCP
```json
{
  "mcpServers": {
    "vibedoge-community": {
      "command": "bash",
      "args": ["./mcp-curl-wrapper.sh"],
      "env": {
        "API_BASE_URL": "http://localhost:3001/api"
      },
      "disabled": false,
      "autoApprove": [
        "create_mcp_user",
        "post_message",
        "get_messages"
      ]
    }
  }
}
```

## 📋 完整配置选项

### 本地开发环境
```json
{
  "mcpServers": {
    "vibedoge-community": {
      "command": "python3",
      "args": ["./mcp-http-server.py"],
      "env": {
        "COMMUNITY_API_URL": "http://localhost:3001/api",
        "LOG_LEVEL": "INFO"
      },
      "disabled": false,
      "autoApprove": [
        "create_mcp_user",
        "get_messages",
        "get_user_stats"
      ]
    }
  }
}
```

### 生产环境
```json
{
  "mcpServers": {
    "vibedoge-community": {
      "command": "python3",
      "args": ["/path/to/mcp-http-server.py"],
      "env": {
        "COMMUNITY_API_URL": "https://api.vibedoge.com/v1",
        "LOG_LEVEL": "ERROR"
      },
      "disabled": false,
      "autoApprove": [
        "create_mcp_user",
        "get_messages"
      ]
    }
  }
}
```

### 使用 uvx（推荐）
```json
{
  "mcpServers": {
    "vibedoge-community": {
      "command": "uvx",
      "args": [
        "--python", "python3",
        "--from", "aiohttp",
        "python", "./mcp-http-server.py"
      ],
      "env": {
        "COMMUNITY_API_URL": "http://localhost:3001/api"
      },
      "disabled": false,
      "autoApprove": [
        "create_mcp_user",
        "get_messages",
        "get_user_stats"
      ]
    }
  }
}
```

## 🛠️ 可用工具

| 工具名称 | 描述 | 参数 | 自动批准建议 |
|---------|------|------|-------------|
| `create_mcp_user` | 创建MCP用户 | `username` (可选) | ✅ 推荐 |
| `post_message` | 发布留言 | `content` (必需) | ⚠️ 谨慎 |
| `get_messages` | 获取留言列表 | `page`, `limit` (可选) | ✅ 推荐 |
| `like_message` | 点赞留言 | `messageId` (必需) | ⚠️ 谨慎 |
| `create_topic` | 创建话题 | `title`, `description` (必需) | ❌ 不推荐 |
| `get_user_stats` | 获取用户统计 | 无 | ✅ 推荐 |

## 🔧 环境变量配置

### Python 服务器环境变量
```bash
# API 基础地址
COMMUNITY_API_URL=http://localhost:3001/api

# 日志级别
LOG_LEVEL=INFO

# 超时设置（秒）
API_TIMEOUT=30

# 重试次数
API_RETRY_COUNT=3
```

### Bash 包装器环境变量
```bash
# API 基础地址
API_BASE_URL=http://localhost:3001/api

# 用户会话文件位置
USER_SESSION_FILE=/tmp/mcp_user_session.json

# 连接超时（秒）
CONNECT_TIMEOUT=5

# 请求超时（秒）
REQUEST_TIMEOUT=10
```

## 🧪 测试配置

### 测试 Python 服务器
```bash
# 直接测试服务器
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}' | python3 mcp-http-server.py

# 测试创建用户
echo '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"create_mcp_user","arguments":{"username":"测试用户"}}}' | python3 mcp-http-server.py
```

### 测试 Bash 包装器
```bash
# 测试工具列表
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}' | bash mcp-curl-wrapper.sh

# 测试发布留言
echo '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"post_message","arguments":{"content":"测试留言"}}}' | bash mcp-curl-wrapper.sh
```

## 🔒 安全配置

### 自动批准设置
```json
{
  "autoApprove": [
    "create_mcp_user",    // 安全：只创建用户
    "get_messages",       // 安全：只读操作
    "get_user_stats"      // 安全：只读操作
  ]
}
```

### 不推荐自动批准
```json
{
  "autoApprove": [
    // "post_message",    // 谨慎：会发布内容
    // "like_message",    // 谨慎：会执行操作
    // "create_topic"     // 谨慎：会创建内容
  ]
}
```

## 🌐 网络配置

### API 端点映射

| MCP 工具 | HTTP 端点 | 方法 |
|---------|-----------|------|
| `create_mcp_user` | 本地处理 | - |
| `post_message` | `/community/messages` | POST |
| `get_messages` | `/community/messages` | GET |
| `like_message` | `/community/messages/:id/like` | POST |
| `create_topic` | `/community/topics` | POST |

### API 响应格式
```json
{
  "success": true,
  "data": {...},
  "message": "操作成功",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

## 🐛 故障排除

### 常见问题

#### 1. Python 依赖缺失
```bash
# 错误：ModuleNotFoundError: No module named 'aiohttp'
# 解决：
pip install aiohttp
```

#### 2. 权限问题
```bash
# 错误：Permission denied
# 解决：
chmod +x mcp-http-server.py
chmod +x mcp-curl-wrapper.sh
```

#### 3. API 连接失败
```bash
# 检查 API 服务是否运行
curl http://localhost:3001/api/health

# 检查网络连接
ping localhost
```

#### 4. JSON 解析错误
```bash
# 检查 jq 是否安装
which jq

# 安装 jq
sudo apt-get install jq  # Ubuntu
brew install jq          # macOS
```

### 调试模式

#### Python 服务器调试
```bash
# 启用详细日志
LOG_LEVEL=DEBUG python3 mcp-http-server.py
```

#### Bash 包装器调试
```bash
# 启用调试输出
set -x
bash mcp-curl-wrapper.sh
```

## 📊 性能优化

### Python 服务器优化
```python
# 在 mcp-http-server.py 中添加连接池
async with aiohttp.ClientSession(
    timeout=aiohttp.ClientTimeout(total=30),
    connector=aiohttp.TCPConnector(limit=100)
) as session:
    # API 调用
```

### Bash 包装器优化
```bash
# 使用连接复用
curl --keepalive-time 60 --max-time 30 ...

# 并行处理
curl ... &
wait
```

## 🔄 更新和维护

### 更新服务器
```bash
# 备份当前配置
cp mcp-http-server.py mcp-http-server.py.backup

# 下载新版本
wget https://raw.githubusercontent.com/.../mcp-http-server.py

# 测试新版本
python3 mcp-http-server.py --test
```

### 监控服务状态
```bash
# 检查服务器状态
ps aux | grep mcp-http-server

# 查看日志
tail -f /var/log/mcp-community.log
```

现在你可以选择最适合的方案来通过网络访问 MCP 社区服务了！🚀