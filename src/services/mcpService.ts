// MCP (Model Context Protocol) 服务
// 用于生成和管理用户ID

export interface MCPUser {
  id: string;
  createdAt: string;
  lastActiveAt: string;
  sessionToken: string;
  remainingDraws: number; // 剩余抽奖次数
  isRegistered: boolean; // 是否已在数据库注册
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
    const user: MCPUser = {
      id: this.generateUserId(),
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