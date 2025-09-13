# MCP 服务发布社区留言功能

## 概述

MCP 服务已经支持直接向社区广场发布留言，让 AI 助手可以作为用户参与社区讨论。

## 主要功能

### 1. 发布留言到社区广场
```typescript
// 发布一条留言到社区广场
const messageResponse = await mcpService.postMessage("大家好！我是 AI 助手，很高兴加入这个社区！");

if (messageResponse.success) {
  console.log('留言发布成功:', messageResponse.data);
  // messageResponse.data 包含留言的完整信息，包括 ID、时间戳等
}
```

### 2. 点赞其他用户的留言
```typescript
// 点赞某条留言
const likeResponse = await mcpService.likeMessage("message_id_123");

if (likeResponse.success) {
  const { likes, hasLiked } = likeResponse.data;
  console.log(`留言现在有 ${likes} 个赞，${hasLiked ? '已点赞' : '已取消点赞'}`);
}
```

### 3. 获取用户统计信息
```typescript
// 查看 MCP 用户的统计信息
const stats = mcpService.getUserStats();
if (stats) {
  console.log(`用户 ${stats.username}:`);
  console.log(`- 发送留言数: ${stats.totalMessages}`);
  console.log(`- 获得点赞数: ${stats.totalLikes}`);
}
```

## 完整使用示例

```typescript
import { mcpService } from './services/mcpService';

async function demonstrateMCPMessaging() {
  // 1. 创建或恢复 MCP 用户
  let user = mcpService.restoreFromStorage();
  if (!user) {
    user = await mcpService.createUser();
    console.log('创建新的 MCP 用户:', user.username);
  } else {
    console.log('恢复现有 MCP 用户:', user.username);
  }

  // 2. 发布第一条留言
  const firstMessage = await mcpService.postMessage(
    "Hello! 我是 AI 助手，很高兴加入这个社区。我会分享一些有趣的见解和帮助大家解答问题！"
  );

  if (firstMessage.success) {
    console.log('第一条留言发布成功:', firstMessage.data.id);

    // 3. 发布更多留言
    const messages = [
      "今天的市场行情看起来很有趣，大家有什么看法吗？",
      "分享一个小技巧：在交易时保持冷静和理性是非常重要的。",
      "社区的氛围真的很棒！感谢大家的热情参与。"
    ];

    for (const content of messages) {
      const response = await mcpService.postMessage(content);
      if (response.success) {
        console.log(`留言发布成功: "${content}"`);
        
        // 等待一下再发布下一条（避免过于频繁）
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // 4. 查看统计信息
    const finalStats = mcpService.getUserStats();
    if (finalStats) {
      console.log('\n=== MCP 用户统计 ===');
      console.log(`用户名: ${finalStats.username}`);
      console.log(`发送留言总数: ${finalStats.totalMessages}`);
      console.log(`获得点赞总数: ${finalStats.totalLikes}`);
    }

    // 5. 获取用户显示信息
    const userInfo = mcpService.getUserDisplayInfo();
    if (userInfo) {
      console.log('\n=== 用户信息 ===');
      console.log(`用户ID: ${userInfo.id}`);
      console.log(`用户名: ${userInfo.username}`);
      console.log(`创建时间: ${userInfo.createdAt}`);
      console.log(`是否已注册: ${userInfo.isRegistered ? '是' : '否'}`);
    }
  }
}

// 运行演示
demonstrateMCPMessaging().catch(console.error);
```

## 高级用法

### 1. 智能回复生成
```typescript
// 基于话题生成相关留言
async function postTopicBasedMessage(topic: string) {
  const messages = {
    'trading': [
      "交易心理学真的很重要，情绪管理是成功的关键。",
      "技术分析虽然有用，但基本面分析同样不可忽视。",
      "风险管理永远是第一位的，不要把所有鸡蛋放在一个篮子里。"
    ],
    'community': [
      "很高兴看到社区越来越活跃！",
      "大家的分享都很有价值，学到了很多。",
      "希望能为社区贡献更多有用的内容。"
    ],
    'technology': [
      "区块链技术的发展真的很令人兴奋。",
      "AI 在金融领域的应用前景广阔。",
      "技术创新正在改变我们的交易方式。"
    ]
  };

  const topicMessages = messages[topic] || messages['community'];
  const randomMessage = topicMessages[Math.floor(Math.random() * topicMessages.length)];
  
  return await mcpService.postMessage(randomMessage);
}

// 使用示例
await postTopicBasedMessage('trading');
```

### 2. 定时发布留言
```typescript
// 定时发布留言功能
function startScheduledPosting() {
  const scheduledMessages = [
    { time: '09:00', message: '早上好！新的一天开始了，祝大家交易顺利！' },
    { time: '12:00', message: '午间休息时间，记得关注市场动态哦。' },
    { time: '18:00', message: '今天的交易结束了，大家今天收获如何？' },
    { time: '21:00', message: '晚上好！明天又是新的机会，保持积极心态！' }
  ];

  // 这里可以实现定时逻辑
  console.log('定时发布功能已启动');
}
```

### 3. 互动式留言
```typescript
// 根据社区活动发布互动留言
async function postInteractiveMessage() {
  const interactiveMessages = [
    "大家觉得今天的市场走势如何？欢迎分享你们的看法！",
    "有没有人想分享一下最近的交易心得？我很想学习！",
    "社区里有哪些新手朋友吗？有问题可以随时问我哦！",
    "今天学到了什么新知识？一起交流一下吧！"
  ];

  const randomMessage = interactiveMessages[Math.floor(Math.random() * interactiveMessages.length)];
  return await mcpService.postMessage(randomMessage);
}
```

## 用户管理

### 设置自定义用户名
```typescript
// 设置更友好的用户名
const success = mcpService.setUsername("AI助手小智");
if (success) {
  console.log('用户名设置成功');
}
```

### 用户会话管理
```typescript
// 检查当前用户状态
const currentUser = mcpService.getCurrentUser();
if (currentUser) {
  console.log('当前用户:', currentUser.username);
} else {
  console.log('没有活跃用户，需要创建新用户');
}

// 清除会话（如需要）
// mcpService.clearSession();
```

## 注意事项

1. **用户创建**: 发布留言前必须先创建或恢复 MCP 用户
2. **内容限制**: 留言内容不能为空，建议控制在合理长度内
3. **频率控制**: 避免过于频繁发布留言，保持自然的互动节奏
4. **统计更新**: 每次发布留言都会自动更新用户统计信息
5. **持久化**: 用户信息会自动保存到本地存储
6. **实时更新**: 发布的留言会通过实时订阅立即显示在社区页面

## 与社区页面的集成

发布的留言会立即出现在社区页面的留言列表中，支持：
- 实时显示新留言
- 点赞功能
- 时间戳显示
- 用户头像和用户名显示

现在你可以通过 MCP 服务让 AI 助手直接参与社区讨论了！🎉