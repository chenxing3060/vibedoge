# MCP 服务评论功能使用指南

## 概述

MCP 服务现已支持完整的评论功能，包括：
- 对留言发送评论
- 对话题留言发送评论
- 点赞评论
- 获取评论列表

## 数据库设置

首先需要在 Supabase 中执行评论表的创建脚本：

```sql
-- 执行 database/comments-schema.sql 中的所有 SQL 语句
```

## 功能列表

### 1. 留言评论功能

#### 发送留言评论
```typescript
// 对某条留言发送评论
const commentResponse = await mcpService.postMessageComment(
  "message_id_123", 
  "这是一条很有见地的留言！"
);

if (commentResponse.success) {
  console.log('评论发送成功:', commentResponse.data);
}
```

#### 获取留言评论列表
```typescript
// 获取某条留言的所有评论
const commentsResponse = await mcpService.getMessageComments(
  "message_id_123", 
  1, // 页码
  10 // 每页数量
);

if (commentsResponse.success) {
  const { comments, pagination } = commentsResponse.data;
  console.log(`获取到 ${comments.length} 条评论`);
  comments.forEach(comment => {
    console.log(`${comment.username}: ${comment.content}`);
  });
}
```

#### 点赞留言评论
```typescript
// 点赞某条留言评论
const likeResponse = await mcpService.likeMessageComment("comment_id_456");

if (likeResponse.success) {
  const { likes, hasLiked } = likeResponse.data;
  console.log(`评论现在有 ${likes} 个赞，当前用户${hasLiked ? '已' : '未'}点赞`);
}
```

### 2. 话题留言评论功能

#### 发送话题留言评论
```typescript
// 对话题中的某条留言发送评论
const topicCommentResponse = await mcpService.postTopicMessageComment(
  "topic_message_id_789", 
  "我同意你的观点！"
);

if (topicCommentResponse.success) {
  console.log('话题留言评论发送成功:', topicCommentResponse.data);
}
```

#### 获取话题留言评论列表
```typescript
// 获取话题留言的所有评论
const topicCommentsResponse = await mcpService.getTopicMessageComments(
  "topic_message_id_789", 
  1, // 页码
  10 // 每页数量
);

if (topicCommentsResponse.success) {
  const { comments, pagination } = topicCommentsResponse.data;
  console.log(`获取到 ${comments.length} 条话题留言评论`);
}
```

#### 点赞话题留言评论
```typescript
// 点赞话题留言评论
const topicLikeResponse = await mcpService.likeTopicMessageComment("topic_comment_id_101");

if (topicLikeResponse.success) {
  const { likes, hasLiked } = topicLikeResponse.data;
  console.log(`话题留言评论现在有 ${likes} 个赞`);
}
```

## 完整使用示例

```typescript
import { mcpService } from './services/mcpService';

async function demonstrateCommentFeatures() {
  // 1. 创建或恢复用户
  let user = mcpService.restoreFromStorage();
  if (!user) {
    user = await mcpService.createUser();
    console.log('创建新用户:', user.username);
  }

  // 2. 发送一条留言
  const messageResponse = await mcpService.postMessage("这是一条测试留言");
  if (!messageResponse.success) return;
  
  const messageId = messageResponse.data.id;

  // 3. 对留言发送评论
  const commentResponse = await mcpService.postMessageComment(
    messageId, 
    "这是对留言的评论"
  );
  
  if (commentResponse.success) {
    const commentId = commentResponse.data.id;
    
    // 4. 点赞评论
    await mcpService.likeMessageComment(commentId);
    
    // 5. 获取评论列表
    const commentsListResponse = await mcpService.getMessageComments(messageId);
    console.log('评论列表:', commentsListResponse.data?.comments);
  }

  // 6. 创建话题并演示话题评论功能
  const topicResponse = await mcpService.createTopic(
    "测试话题", 
    "这是一个测试话题"
  );
  
  if (topicResponse.success) {
    const topicId = topicResponse.data.id;
    
    // 7. 在话题中发送留言
    const topicMessageResponse = await mcpService.postTopicMessage(
      topicId, 
      "这是话题中的留言"
    );
    
    if (topicMessageResponse.success) {
      const topicMessageId = topicMessageResponse.data.id;
      
      // 8. 对话题留言发送评论
      const topicCommentResponse = await mcpService.postTopicMessageComment(
        topicMessageId, 
        "这是对话题留言的评论"
      );
      
      if (topicCommentResponse.success) {
        // 9. 点赞话题留言评论
        await mcpService.likeTopicMessageComment(topicCommentResponse.data.id);
        
        // 10. 获取话题留言评论列表
        const topicCommentsListResponse = await mcpService.getTopicMessageComments(topicMessageId);
        console.log('话题留言评论列表:', topicCommentsListResponse.data?.comments);
      }
    }
  }

  // 11. 查看用户统计
  const stats = mcpService.getUserStats();
  console.log('用户统计:', stats);
}

// 运行演示
demonstrateCommentFeatures().catch(console.error);
```

## 数据结构

### MessageComment
```typescript
interface MessageComment {
  id: string;           // 评论ID
  messageId: string;    // 所属留言ID
  username: string;     // 评论者用户名
  content: string;      // 评论内容
  timestamp: Date;      // 评论时间
  likes: number;        // 点赞数
}
```

### TopicMessageComment
```typescript
interface TopicMessageComment {
  id: string;              // 评论ID
  topicMessageId: string;  // 所属话题留言ID
  username: string;        // 评论者用户名
  content: string;         // 评论内容
  timestamp: Date;         // 评论时间
  likes: number;           // 点赞数
}
```

## 注意事项

1. **用户验证**: 所有评论操作都需要先创建或恢复 MCP 用户
2. **统计更新**: 发送评论会自动更新用户的留言统计数量
3. **活跃时间**: 所有操作都会自动更新用户的最后活跃时间
4. **错误处理**: 所有方法都返回 `ApiResponse` 格式，包含成功状态和错误信息
5. **分页支持**: 评论列表支持分页，默认每页10条
6. **点赞去重**: 同一用户对同一评论只能点赞一次，再次点击会取消点赞
7. **自动计数**: 留言的回复数会通过数据库触发器自动更新

## 实时更新

如需实时更新评论，可以在 `communityService` 中添加对应的订阅方法：

```typescript
// 订阅留言评论变化
subscribeToMessageComments(messageId: string, callback: (payload: any) => void) {
  // 实现实时订阅逻辑
}

// 订阅话题留言评论变化  
subscribeToTopicMessageComments(topicMessageId: string, callback: (payload: any) => void) {
  // 实现实时订阅逻辑
}
```

现在 MCP 服务具备了完整的评论功能，可以支持多层级的社区交互！🎉