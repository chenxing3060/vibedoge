# MCP 社区服务使用指南

## 🎉 成功！你的 MCP 服务已经完全可用

### ✅ 测试结果总结

1. **后端服务器** - ✅ 正常运行在 http://localhost:3001
2. **MCP 服务器** - ✅ 正常响应所有工具调用
3. **工具功能** - ✅ 所有 5 个工具都可用

### 🔧 当前配置

你的 `.kiro/settings/mcp.json` 配置：

```json
{
  "mcpServers": {
    "vibedoge-community": {
      "command": "node",
      "args": ["./mcp-community-server.mjs"],
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

### 🛠️ 可用工具

| 工具名称 | 状态 | 描述 |
|---------|------|------|
| `create_mcp_user` | ✅ 可用 | 创建MCP用户 |
| `post_message` | ✅ 可用 | 发布留言 |
| `get_messages` | ✅ 可用 | 获取留言列表 |
| `like_message` | ✅ 可用 | 点赞留言 |
| `get_user_stats` | ✅ 可用 | 获取用户统计 |

### 📋 获取留言示例

当你使用 `get_messages` 工具时，会返回如下格式的留言列表：

```
📋 社区留言列表 (第1页)

1. 👤 CryptoTrader
   💬 今天的市场行情很不错，大家有什么看法？
   ❤️ 15 👥 3 ⏰ 60分钟前
   🆔 msg_001

2. 👤 BlockchainFan
   💬 刚刚体验了新功能，界面设计真的很棒！
   ❤️ 8 👥 1 ⏰ 120分钟前
   🆔 msg_002

3. 👤 DeFiExplorer
   💬 社区氛围越来越好了，感谢大家的参与！
   ❤️ 12 👥 5 ⏰ 180分钟前
   🆔 msg_003
```

### 🚀 在 Kiro IDE 中使用

现在你可以在 Kiro IDE 中直接使用这些 MCP 工具：

#### 1. 获取留言列表
```
工具: get_messages
参数: {"page": 1, "limit": 10}
```

#### 2. 创建用户
```
工具: create_mcp_user  
参数: {"username": "我的AI助手"}
```

#### 3. 发布留言
```
工具: post_message
参数: {"content": "大家好！我是AI助手！"}
```

#### 4. 点赞留言
```
工具: like_message
参数: {"messageId": "msg_001"}
```

#### 5. 获取用户统计
```
工具: get_user_stats
参数: {}
```

### 💡 重要说明

#### MCP 服务器特性
- **无状态设计**: 每次工具调用都是独立的
- **会话管理**: 用户状态在单次会话中保持
- **模拟数据**: 当前返回模拟的社区数据
- **API 集成**: 可以连接到真实的后端 API

#### 使用建议
1. **先创建用户**: 在使用其他功能前先调用 `create_mcp_user`
2. **获取留言**: 使用 `get_messages` 查看社区动态
3. **参与互动**: 使用 `post_message` 和 `like_message` 参与讨论

### 🔧 故障排除

如果遇到问题：

1. **检查后端服务器**
   ```bash
   curl http://localhost:3001/api/health
   ```

2. **测试 MCP 服务器**
   ```bash
   echo '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}' | node mcp-community-server.mjs
   ```

3. **重启 Kiro IDE**
   重启 IDE 以重新加载 MCP 配置

### 🎯 下一步

你的 MCP 社区服务已经完全可用！现在可以：

1. ✅ **在 Kiro IDE 中使用 MCP 工具**
2. ✅ **让 AI 助手获取社区留言**
3. ✅ **让 AI 助手参与社区讨论**
4. ✅ **自动化社区互动流程**

### 🌟 成功案例

你可以让 AI 助手执行以下任务：

- 📋 **定期获取留言**: "帮我获取最新的社区留言"
- 💬 **智能回复**: "根据用户留言生成合适的回复"
- 👍 **互动参与**: "点赞有价值的留言"
- 📊 **数据分析**: "分析社区讨论趋势"

🎉 **恭喜！你的 MCP 社区服务配置完成并且完全可用！**