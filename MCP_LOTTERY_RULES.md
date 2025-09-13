# VibeDoge MCP 抽奖服务调用规则

## 概述

VibeDoge MCP (Model Context Protocol) 抽奖服务是一个集成了数据库的抽奖系统，为用户提供免费的抽奖体验。每个MCP用户注册后默认获得3次抽奖机会。

## MCP 调用规则

### 1. 用户身份管理

**用户ID格式**: `mcp_timestamp_randomstring`

- 用户在访问时自动生成或从localStorage恢复
- 无需注册即可获得MCP用户身份
- 格式示例: `mcp_1757749100483_4tsudrnx90t`

### 2. 抽奖次数规则

**默认抽奖次数**: 每个新注册用户获得 **3次** 免费抽奖机会

**计算方式**:
```
剩余抽奖次数 = 3 - 已完成的抽奖次数
```

**重要规则**:
- 只有状态为 `completed` 的抽奖才计入已使用次数
- 状态为 `active` 的抽奖不会减少剩余次数
- 抽奖次数在用户注册时根据数据库记录实时计算

### 3. 数据库表结构

#### users 表
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY,
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
```

#### lottery_records 表
```sql
CREATE TABLE lottery_records (
    id UUID PRIMARY KEY,
    lottery_id VARCHAR(100) UNIQUE NOT NULL,
    user_id UUID REFERENCES users(id),
    mcp_user_id VARCHAR(100) NOT NULL,
    status VARCHAR(20) DEFAULT 'active', -- active, completed
    prize_name TEXT,
    prize_value TEXT,
    prize_description TEXT,
    prize_rarity VARCHAR(20),
    draw_timestamp TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 4. API 端点

#### 用户注册
- **POST** `/api/lottery/generate-user-id`
- **功能**: 注册MCP用户到数据库并返回抽奖次数
- **请求体**: `{ userId?: string }`
- **响应**: 包含 `remainingDraws` 字段，显示实际剩余抽奖次数

#### 用户抽奖信息
- **GET** `/api/lottery/user-info/:userId`
- **功能**: 获取用户抽奖统计信息，包含剩余次数
- **响应**: 
```json
{
  "success": true,
  "data": {
    "userId": "mcp_xxx",
    "lotteryStats": {
      "usedDraws": 1,
      "remainingDraws": 2,
      "maxDraws": 3
    }
  }
}
```

#### 执行抽奖
- **POST** `/api/lottery/draw`
- **功能**: 执行抽奖并返回结果
- **请求体**: `{ lotteryId: string, userId: string }`
- **规则**: 自动检查剩余抽奖次数，不足时拒绝抽奖

### 5. 前端状态管理

#### 用户状态 (useUserStore)
```typescript
interface UserState {
  mcpUser: MCPUser | null;
  isRegistered: boolean;
  remainingDraws: number; // 实时同步的剩余抽奖次数
  // ...
}
```

#### 抽奖状态 (useLotteryStore)
```typescript
interface LotteryState {
  userLotteries: DatabaseLotteryRecord[];
  // ...
}
```

### 6. MCP 服务调用流程

1. **初始化用户**
   ```typescript
   await initializeMCPUser(); // 自动恢复或生成用户
   ```

2. **注册到数据库**
   ```typescript
   const result = await registerUser();
   // remainingDraws 会自动从后端同步
   ```

3. **检查抽奖次数**
   ```typescript
   if (remainingDraws > 0) {
     // 可以抽奖
   }
   ```

4. **执行抽奖**
   ```typescript
   const lotteryResult = await generateLotteryId(userId);
   const drawResult = await drawLottery(lotteryResult.lotteryId, userId);
   // 剩余次数自动更新
   ```

5. **同步数据**
   ```typescript
   const userInfo = await getUserLotteryInfo(userId);
   // 手动同步剩余次数
   setRemainingDraws(userInfo.lotteryStats.remainingDraws);
   ```

### 7. 奖品系统

**奖品稀有度分布**:
- 普通奖品 (45%): 1个月会员、学习资料包等
- 稀有奖品 (30%): 3-6个月会员、代码审查服务等  
- 史诗奖品 (20%): 年度会员、项目架构设计等
- 传说奖品 (5%): 终身会员、AI模型访问等

### 8. 错误处理

**常见错误及解决方案**:

1. **剩余抽奖次数为0**
   - 原因: 已完成3次抽奖
   - 解决: 提示用户邀请朋友获得更多机会

2. **用户未注册**
   - 原因: MCP用户未在数据库中注册
   - 解决: 调用 `registerUser()` 注册

3. **数据库连接失败**
   - 原因: Supabase连接问题
   - 解决: 检查环境变量和网络连接

### 9. 重要注意事项

1. **数据一致性**: 抽奖次数始终以后端数据库为准
2. **实时同步**: 每次抽奖后自动同步剩余次数
3. **状态管理**: 前端状态与后端数据保持同步
4. **用户体验**: 提供清晰的用户引导和错误提示

### 10. 故障排除

**如果显示"剩余抽奖次数：0"**:

1. 检查用户是否已注册: `isRegistered` 状态
2. 点击"重新同步抽奖次数"按钮
3. 清除浏览器缓存，重新初始化用户
4. 检查数据库中 `lottery_records` 表的数据

**调试步骤**:
```javascript
// 1. 检查MCP用户状态
console.log('MCP User:', useUserStore.getState().mcpUser);

// 2. 检查注册状态
console.log('Is Registered:', useUserStore.getState().isRegistered);

// 3. 检查剩余次数
console.log('Remaining Draws:', useUserStore.getState().remainingDraws);

// 4. 检查抽奖记录
console.log('User Lotteries:', useLotteryStore.getState().userLotteries);
```

## 总结

VibeDoge MCP抽奖服务通过严格的次数控制和实时数据同步，确保每个用户都能公平地获得3次免费抽奖机会。系统采用数据库持久化存储，保证数据的一致性和可靠性。