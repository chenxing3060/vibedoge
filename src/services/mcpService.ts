// MCP (Model Context Protocol) 服务
// 用于生成和管理用户ID，并提供社区交互功能

import { communityService, Message, Topic, MessageComment, TopicMessageComment, ApiResponse } from './communityService';

export interface MCPUser {
  id: string;
  createdAt: string;
  lastActiveAt: string;
  sessionToken: string;
  remainingDraws: number; // 剩余抽奖次数
  isRegistered: boolean; // 是否已在数据库注册
  username: string; // 用户显示名称
  totalMessages: number; // 发送的留言总数
  totalLikes: number; // 获得的点赞总数
}

class MCPService {
  private storageKey = 'mcp_user_session';
  private currentUser: MCPUser | null = null;

  // 生成唯一的MCP用户ID
  generateUserId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `mcp_${timestamp}_${random}`;
  }

  // 创建新的MCP用户
  async createUser(): Promise<MCPUser> {
    const now = new Date().toISOString();
    const userId = this.generateUserId();
    const user: MCPUser = {
      id: userId,
      createdAt: now,
      lastActiveAt: now,
      sessionToken: this.generateSessionToken(),
      remainingDraws: 999999, // 无限抽奖模式
      isRegistered: false
    };

    this.currentUser = user;
    this.saveToStorage(user);
    return user;
  }

  // 生成会话令牌
  private generateSessionToken(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  // 保存到本地存储
  private saveToStorage(user: MCPUser): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(user));
    } catch (error) {
      console.warn('Failed to save MCP user to localStorage:', error);
    }
  }

  // 从本地存储恢复
  restoreFromStorage(): MCPUser | null {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const user = JSON.parse(stored) as MCPUser;
        this.currentUser = user;
        return user;
      }
    } catch (error) {
      console.warn('Failed to restore MCP user from localStorage:', error);
    }
    return null;
  }

  // 更新用户活跃时间
  heartbeat(): void {
    if (this.currentUser) {
      this.currentUser.lastActiveAt = new Date().toISOString();
      this.saveToStorage(this.currentUser);
    }
  }

  // 清除会话
  clearSession(): void {
    this.currentUser = null;
    try {
      localStorage.removeItem(this.storageKey);
    } catch (error) {
      console.warn('Failed to clear MCP session:', error);
    }
  }

  // 获取当前用户
  getCurrentUser(): MCPUser | null {
    return this.currentUser;
  }

  // 用户注册成功，发放抽奖次数
  registerSuccess(draws: number = 999999): void {
    if (this.currentUser) {
      this.currentUser.remainingDraws = draws;
      this.currentUser.isRegistered = true;
      this.saveToStorage(this.currentUser);
    }
  }

  // 使用一次抽奖机会（无限模式）
  useDraw(): boolean {
    if (this.currentUser) {
      // 无限抽奖模式，不减次数，始终返回true
      // this.currentUser.remainingDraws--; // 注释掉减次数逻辑
      this.saveToStorage(this.currentUser);
      return true;
    }
    return false;
  }

  // 获取剩余抽奖次数
  getRemainingDraws(): number {
    return this.currentUser?.remainingDraws || 0;
  }

  // 设置剩余抽奖次数（从后端同步）
  setRemainingDraws(count: number): void {
    if (this.currentUser) {
      // 无限抽奖模式，始终设置为大量次数
      this.currentUser.remainingDraws = 999999;
      this.saveToStorage(this.currentUser);
    }
  }

  // 检查是否已注册
  isUserRegistered(): boolean {
    return this.currentUser?.isRegistered || false;
  }

  // === 社区交互功能 ===

  // 发送留言
  async postMessage(content: string): Promise<ApiResponse<Message>> {
    if (!this.currentUser) {
      return {
        success: false,
        error: '请先创建用户'
      };
    }

    try {
      const response = await communityService.postMessage(this.currentUser.username, content);
      
      if (response.success) {
        // 更新用户统计
        this.currentUser.totalMessages++;
        this.currentUser.lastActiveAt = new Date().toISOString();
        this.saveToStorage(this.currentUser);
        
        console.log(`📝 MCP用户 ${this.currentUser.username} 发送留言成功`);
      }
      
      return response;
    } catch (error) {
      console.error('MCP发送留言失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '发送留言失败'
      };
    }
  }

  // 点赞留言
  async likeMessage(messageId: string): Promise<ApiResponse<{ messageId: string; likes: number; hasLiked: boolean }>> {
    if (!this.currentUser) {
      return {
        success: false,
        error: '请先创建用户'
      };
    }

    try {
      const response = await communityService.likeMessage(messageId, this.currentUser.username);
      
      if (response.success) {
        // 更新用户活跃时间
        this.currentUser.lastActiveAt = new Date().toISOString();
        this.saveToStorage(this.currentUser);
        
        console.log(`👍 MCP用户 ${this.currentUser.username} 点赞操作成功`);
      }
      
      return response;
    } catch (error) {
      console.error('MCP点赞失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '点赞失败'
      };
    }
  }

  // 创建话题
  async createTopic(title: string, description: string): Promise<ApiResponse<Topic>> {
    if (!this.currentUser) {
      return {
        success: false,
        error: '请先创建用户'
      };
    }

    try {
      const response = await communityService.createTopic(title, description, this.currentUser.username);
      
      if (response.success) {
        // 更新用户活跃时间
        this.currentUser.lastActiveAt = new Date().toISOString();
        this.saveToStorage(this.currentUser);
        
        console.log(`📋 MCP用户 ${this.currentUser.username} 创建话题成功`);
      }
      
      return response;
    } catch (error) {
      console.error('MCP创建话题失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '创建话题失败'
      };
    }
  }

  // 发送话题留言
  async postTopicMessage(topicId: string, content: string): Promise<ApiResponse<any>> {
    if (!this.currentUser) {
      return {
        success: false,
        error: '请先创建用户'
      };
    }

    try {
      const response = await communityService.postTopicMessage(topicId, this.currentUser.username, content);
      
      if (response.success) {
        // 更新用户统计
        this.currentUser.totalMessages++;
        this.currentUser.lastActiveAt = new Date().toISOString();
        this.saveToStorage(this.currentUser);
        
        console.log(`💬 MCP用户 ${this.currentUser.username} 在话题中发送留言成功`);
      }
      
      return response;
    } catch (error) {
      console.error('MCP发送话题留言失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '发送话题留言失败'
      };
    }
  }

  // 点赞话题留言
  async likeTopicMessage(messageId: string): Promise<ApiResponse<{ messageId: string; likes: number; hasLiked: boolean }>> {
    if (!this.currentUser) {
      return {
        success: false,
        error: '请先创建用户'
      };
    }

    try {
      const response = await communityService.likeTopicMessage(messageId, this.currentUser.username);
      
      if (response.success) {
        // 更新用户活跃时间
        this.currentUser.lastActiveAt = new Date().toISOString();
        this.saveToStorage(this.currentUser);
        
        console.log(`👍 MCP用户 ${this.currentUser.username} 点赞话题留言成功`);
      }
      
      return response;
    } catch (error) {
      console.error('MCP点赞话题留言失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '点赞话题留言失败'
      };
    }
  }

  // 获取用户统计信息
  getUserStats(): { totalMessages: number; totalLikes: number; username: string } | null {
    if (!this.currentUser) {
      return null;
    }

    return {
      totalMessages: this.currentUser.totalMessages,
      totalLikes: this.currentUser.totalLikes,
      username: this.currentUser.username
    };
  }

  // 更新用户统计（当收到点赞时调用）
  updateUserStats(additionalLikes: number = 0): void {
    if (this.currentUser) {
      this.currentUser.totalLikes += additionalLikes;
      this.saveToStorage(this.currentUser);
    }
  }

  // 设置用户名
  setUsername(username: string): boolean {
    if (!this.currentUser) {
      return false;
    }

    this.currentUser.username = username;
    this.saveToStorage(this.currentUser);
    return true;
  }

  // 获取用户显示信息
  getUserDisplayInfo(): { id: string; username: string; createdAt: string; isRegistered: boolean } | null {
    if (!this.currentUser) {
      return null;
    }

    return {
      id: this.currentUser.id,
      username: this.currentUser.username,
      createdAt: this.currentUser.createdAt,
      isRegistered: this.currentUser.isRegistered
    };
  }

  // === 评论功能 ===

  // 发送留言评论
  async postMessageComment(messageId: string, content: string): Promise<ApiResponse<MessageComment>> {
    if (!this.currentUser) {
      return {
        success: false,
        error: '请先创建用户'
      };
    }

    try {
      const response = await communityService.postMessageComment(messageId, this.currentUser.username, content);
      
      if (response.success) {
        // 更新用户统计
        this.currentUser.totalMessages++;
        this.currentUser.lastActiveAt = new Date().toISOString();
        this.saveToStorage(this.currentUser);
        
        console.log(`💬 MCP用户 ${this.currentUser.username} 发送留言评论成功`);
      }
      
      return response;
    } catch (error) {
      console.error('MCP发送留言评论失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '发送留言评论失败'
      };
    }
  }

  // 点赞留言评论
  async likeMessageComment(commentId: string): Promise<ApiResponse<{ commentId: string; likes: number; hasLiked: boolean }>> {
    if (!this.currentUser) {
      return {
        success: false,
        error: '请先创建用户'
      };
    }

    try {
      const response = await communityService.likeMessageComment(commentId, this.currentUser.username);
      
      if (response.success) {
        // 更新用户活跃时间
        this.currentUser.lastActiveAt = new Date().toISOString();
        this.saveToStorage(this.currentUser);
        
        console.log(`👍 MCP用户 ${this.currentUser.username} 点赞留言评论操作成功`);
      }
      
      return response;
    } catch (error) {
      console.error('MCP点赞留言评论失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '点赞留言评论失败'
      };
    }
  }

  // 发送话题留言评论
  async postTopicMessageComment(topicMessageId: string, content: string): Promise<ApiResponse<TopicMessageComment>> {
    if (!this.currentUser) {
      return {
        success: false,
        error: '请先创建用户'
      };
    }

    try {
      const response = await communityService.postTopicMessageComment(topicMessageId, this.currentUser.username, content);
      
      if (response.success) {
        // 更新用户统计
        this.currentUser.totalMessages++;
        this.currentUser.lastActiveAt = new Date().toISOString();
        this.saveToStorage(this.currentUser);
        
        console.log(`💬 MCP用户 ${this.currentUser.username} 发送话题留言评论成功`);
      }
      
      return response;
    } catch (error) {
      console.error('MCP发送话题留言评论失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '发送话题留言评论失败'
      };
    }
  }

  // 点赞话题留言评论
  async likeTopicMessageComment(commentId: string): Promise<ApiResponse<{ commentId: string; likes: number; hasLiked: boolean }>> {
    if (!this.currentUser) {
      return {
        success: false,
        error: '请先创建用户'
      };
    }

    try {
      const response = await communityService.likeTopicMessageComment(commentId, this.currentUser.username);
      
      if (response.success) {
        // 更新用户活跃时间
        this.currentUser.lastActiveAt = new Date().toISOString();
        this.saveToStorage(this.currentUser);
        
        console.log(`👍 MCP用户 ${this.currentUser.username} 点赞话题留言评论操作成功`);
      }
      
      return response;
    } catch (error) {
      console.error('MCP点赞话题留言评论失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '点赞话题留言评论失败'
      };
    }
  }

  // 获取留言评论列表
  async getMessageComments(messageId: string, page: number = 1, limit: number = 10): Promise<ApiResponse<{ comments: MessageComment[]; pagination: any }>> {
    try {
      const response = await communityService.getMessageComments(messageId, page, limit);
      
      if (response.success) {
        // 更新用户活跃时间（如果有用户）
        if (this.currentUser) {
          this.currentUser.lastActiveAt = new Date().toISOString();
          this.saveToStorage(this.currentUser);
        }
        
        console.log(`📖 获取留言评论列表成功，共 ${response.data?.comments.length || 0} 条评论`);
      }
      
      return response;
    } catch (error) {
      console.error('MCP获取留言评论失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '获取留言评论失败'
      };
    }
  }

  // 获取话题留言评论列表
  async getTopicMessageComments(topicMessageId: string, page: number = 1, limit: number = 10): Promise<ApiResponse<{ comments: TopicMessageComment[]; pagination: any }>> {
    try {
      const response = await communityService.getTopicMessageComments(topicMessageId, page, limit);
      
      if (response.success) {
        // 更新用户活跃时间（如果有用户）
        if (this.currentUser) {
          this.currentUser.lastActiveAt = new Date().toISOString();
          this.saveToStorage(this.currentUser);
        }
        
        console.log(`📖 获取话题留言评论列表成功，共 ${response.data?.comments.length || 0} 条评论`);
      }
      
      return response;
    } catch (error) {
      console.error('MCP获取话题留言评论失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '获取话题留言评论失败'
      };
    }
  }

  // === 便捷的社区广场留言评论方法 ===

  // 对社区广场的留言发表评论
  async commentOnMessage(messageId: string, commentContent: string): Promise<ApiResponse<MessageComment>> {
    if (!this.currentUser) {
      return {
        success: false,
        error: '请先创建用户'
      };
    }

    if (!commentContent.trim()) {
      return {
        success: false,
        error: '评论内容不能为空'
      };
    }

    try {
      const response = await this.postMessageComment(messageId, commentContent.trim());
      
      if (response.success) {
        console.log(`💬 MCP用户 ${this.currentUser.username} 对留言 ${messageId} 发表评论成功`);
      }
      
      return response;
    } catch (error) {
      console.error('MCP评论留言失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '评论留言失败'
      };
    }
  }

  // 获取社区广场留言的所有评论
  async getCommentsForMessage(messageId: string, page: number = 1): Promise<ApiResponse<{ comments: MessageComment[]; pagination: any }>> {
    try {
      const response = await this.getMessageComments(messageId, page, 20); // 每页20条评论
      
      if (response.success) {
        console.log(`📖 获取留言 ${messageId} 的评论成功，共 ${response.data?.comments.length || 0} 条`);
      }
      
      return response;
    } catch (error) {
      console.error('MCP获取留言评论失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '获取留言评论失败'
      };
    }
  }

  // 点赞社区广场留言的评论
  async likeComment(commentId: string): Promise<ApiResponse<{ commentId: string; likes: number; hasLiked: boolean }>> {
    if (!this.currentUser) {
      return {
        success: false,
        error: '请先创建用户'
      };
    }

    try {
      const response = await this.likeMessageComment(commentId);
      
      if (response.success) {
        console.log(`👍 MCP用户 ${this.currentUser.username} 点赞评论 ${commentId} 成功`);
      }
      
      return response;
    } catch (error) {
      console.error('MCP点赞评论失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '点赞评论失败'
      };
    }
  }

  // === MCP 网络调用接口 - 可直接被外部调用 ===

  // MCP 工具：创建用户
  async mcpCreateUser(customUsername?: string): Promise<{ success: boolean; data?: MCPUser; message?: string; error?: string }> {
    try {
      const user = await this.createUser();
      if (customUsername) {
        this.setUsername(customUsername);
      }
      
      return {
        success: true,
        data: user,
        message: `🎉 MCP用户创建成功！用户名: ${user.username}`
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '创建用户失败'
      };
    }
  }

  // MCP 工具：发布留言
  async mcpPostMessage(content: string): Promise<{ success: boolean; data?: Message; message?: string; error?: string }> {
    if (!content || !content.trim()) {
      return {
        success: false,
        error: '留言内容不能为空'
      };
    }

    try {
      const response = await this.postMessage(content.trim());
      
      if (response.success) {
        return {
          success: true,
          data: response.data,
          message: `📝 留言发布成功！内容: "${content}"`
        };
      } else {
        return {
          success: false,
          error: response.error || '发布留言失败'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '发布留言失败'
      };
    }
  }

  // MCP 工具：获取留言列表
  async mcpGetMessages(page: number = 1, limit: number = 10): Promise<{ success: boolean; data?: any; message?: string; error?: string }> {
    try {
      const response = await communityService.getMessages(page, limit);
      
      if (response.success) {
        return {
          success: true,
          data: response.data,
          message: `📋 获取留言列表成功，共 ${response.data?.messages.length || 0} 条留言`
        };
      } else {
        return {
          success: false,
          error: response.error || '获取留言列表失败'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '获取留言列表失败'
      };
    }
  }

  // MCP 工具：点赞留言
  async mcpLikeMessage(messageId: string): Promise<{ success: boolean; data?: any; message?: string; error?: string }> {
    if (!messageId) {
      return {
        success: false,
        error: '留言ID不能为空'
      };
    }

    try {
      const response = await this.likeMessage(messageId);
      
      if (response.success) {
        const { likes, hasLiked } = response.data!;
        return {
          success: true,
          data: response.data,
          message: `${hasLiked ? '❤️ 点赞成功！' : '💔 取消点赞！'} 当前点赞数: ${likes}`
        };
      } else {
        return {
          success: false,
          error: response.error || '点赞操作失败'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '点赞操作失败'
      };
    }
  }

  // MCP 工具：创建话题
  async mcpCreateTopic(title: string, description: string): Promise<{ success: boolean; data?: Topic; message?: string; error?: string }> {
    if (!title || !title.trim()) {
      return {
        success: false,
        error: '话题标题不能为空'
      };
    }

    if (!description || !description.trim()) {
      return {
        success: false,
        error: '话题描述不能为空'
      };
    }

    try {
      const response = await this.createTopic(title.trim(), description.trim());
      
      if (response.success) {
        return {
          success: true,
          data: response.data,
          message: `📋 话题创建成功！标题: "${title}"`
        };
      } else {
        return {
          success: false,
          error: response.error || '创建话题失败'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '创建话题失败'
      };
    }
  }

  // MCP 工具：获取话题列表
  async mcpGetTopics(trending?: boolean): Promise<{ success: boolean; data?: Topic[]; message?: string; error?: string }> {
    try {
      const response = await communityService.getTopics(trending);
      
      if (response.success) {
        return {
          success: true,
          data: response.data,
          message: `📋 获取${trending ? '热门' : '全部'}话题成功，共 ${response.data?.length || 0} 个话题`
        };
      } else {
        return {
          success: false,
          error: response.error || '获取话题列表失败'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '获取话题列表失败'
      };
    }
  }

  // MCP 工具：在话题中发送留言
  async mcpPostTopicMessage(topicId: string, content: string): Promise<{ success: boolean; data?: any; message?: string; error?: string }> {
    if (!topicId) {
      return {
        success: false,
        error: '话题ID不能为空'
      };
    }

    if (!content || !content.trim()) {
      return {
        success: false,
        error: '留言内容不能为空'
      };
    }

    try {
      const response = await this.postTopicMessage(topicId, content.trim());
      
      if (response.success) {
        return {
          success: true,
          data: response.data,
          message: `💬 话题留言发送成功！内容: "${content}"`
        };
      } else {
        return {
          success: false,
          error: response.error || '发送话题留言失败'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '发送话题留言失败'
      };
    }
  }

  // MCP 工具：获取用户统计
  async mcpGetUserStats(): Promise<{ success: boolean; data?: any; message?: string; error?: string }> {
    try {
      const stats = this.getUserStats();
      const userInfo = this.getUserDisplayInfo();
      
      if (stats && userInfo) {
        const data = {
          ...stats,
          ...userInfo
        };
        
        return {
          success: true,
          data,
          message: `📊 用户统计: ${stats.username} - 留言数: ${stats.totalMessages}, 点赞数: ${stats.totalLikes}`
        };
      } else {
        return {
          success: false,
          error: '请先创建用户'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '获取用户统计失败'
      };
    }
  }

  // MCP 工具：设置用户名
  async mcpSetUsername(username: string): Promise<{ success: boolean; message?: string; error?: string }> {
    if (!username || !username.trim()) {
      return {
        success: false,
        error: '用户名不能为空'
      };
    }

    try {
      const success = this.setUsername(username.trim());
      
      if (success) {
        return {
          success: true,
          message: `👤 用户名设置成功: ${username}`
        };
      } else {
        return {
          success: false,
          error: '请先创建用户'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '设置用户名失败'
      };
    }
  }
}

// 导出单例实例
export const mcpService = new MCPService();

// 便捷函数
export async function getMCPUserId(): Promise<MCPUser> {
  return mcpService.createUser();
}

export function restoreMCPUser(): MCPUser | null {
  return mcpService.restoreFromStorage();
}

export function clearMCPSession(): void {
  mcpService.clearSession();
}