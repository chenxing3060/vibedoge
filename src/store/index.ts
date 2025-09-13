import { create } from 'zustand';
import { User, Product, LotteryActivity, MarketOverview } from '../types';
import { mcpService, MCPUser, getMCPUserId, restoreMCPUser } from '../services/mcpService';

// 数据库用户信息
interface DatabaseUser {
  id: string;
  mcp_user_id: string;
  username: string;
  email: string;
  avatar_url: string;
  created_at: string;
  updated_at: string;
}

// 用户状态
interface UserState {
  user: User | null;
  databaseUser: DatabaseUser | null;
  mcpUser: MCPUser | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  isRegistered: boolean; // 是否已在数据库中注册
  remainingDraws: number; // 剩余抽奖次数
  initializeMCPUser: () => Promise<void>;
  registerUser: () => Promise<{ success: boolean; error?: string }>;
  login: (user: User) => void;
  logout: () => void;
  updateUserActivity: () => void;
  useDraw: () => boolean; // 使用一次抽奖机会
  getRemainingDraws: () => number; // 获取剩余抽奖次数
}

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  databaseUser: null,
  mcpUser: null,
  isAuthenticated: false,
  isInitialized: false,
  isRegistered: false,
  remainingDraws: 999999, // 默认无限抽奖模式
  
  // 初始化MCP用户
  initializeMCPUser: async () => {
    try {
      // 首先尝试恢复现有用户
      let mcpUser = restoreMCPUser();
      
      if (!mcpUser) {
        // 如果没有现有用户，生成新的
        mcpUser = await getMCPUserId();
      }
      
      // 创建对应的User对象
      const user: User = {
        id: mcpUser.id,
        username: `User_${mcpUser.id.split('_').pop()}`,
        email: `${mcpUser.id}@mcp.local`,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${mcpUser.id}`,
        createdAt: mcpUser.createdAt,
        updatedAt: mcpUser.lastActiveAt
      };
      
      set({ 
        mcpUser, 
        user, 
        isAuthenticated: true, 
        isInitialized: true,
        isRegistered: mcpUser.isRegistered,
        remainingDraws: mcpUser.remainingDraws
      });
      
      // 如果用户已注册，从后端同步最新的剩余抽奖次数（无限模式）
      if (mcpUser.isRegistered) {
        try {
          const response = await fetch(`/api/lottery/user-info/${mcpUser.id}`);
          const result = await response.json();
          if (result.success) {
            // 无限抽奖模式，设置大数值
            mcpService.setRemainingDraws(999999);
            set({ remainingDraws: 999999 });
          }
        } catch (error) {
          console.warn('Failed to sync remaining draws from backend:', error);
          // 即使同步失败也设置为无限模式
          mcpService.setRemainingDraws(999999);
          set({ remainingDraws: 999999 });
        }
      } else {
        // 未注册用户也设置为无限模式
        mcpService.setRemainingDraws(999999);
        set({ remainingDraws: 999999 });
      }
      
      console.log('MCP User initialized:', mcpUser.id);
    } catch (error) {
      console.error('Failed to initialize MCP user:', error);
      set({ isInitialized: true });
    }
  },
  
  // 注册用户到数据库
  registerUser: async () => {
    try {
      const { mcpUser } = get();
      if (!mcpUser) {
        return { success: false, error: 'MCP用户未初始化' };
      }
      
      const response = await fetch('/api/lottery/generate-user-id', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          userId: mcpUser.id 
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        const databaseUser: DatabaseUser = {
          id: result.data.databaseUserId,
          mcp_user_id: result.data.userId,
          username: result.data.username,
          email: `${result.data.userId}@mcp.local`,
          avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${result.data.userId}`,
          created_at: result.data.createdAt,
          updated_at: result.data.createdAt
        };
        
        // 注册成功，使用后端返回的抽奖次数（现在为无限模式）
        mcpService.registerSuccess(999999); // 设置为无限抽奖
        
        set({ 
          databaseUser, 
          isRegistered: true,
          remainingDraws: 999999, // 无限抽奖模式
          user: {
            ...get().user!,
            id: result.data.userId,
            username: result.data.username,
            avatar: databaseUser.avatar_url
          }
        });
        
        return { success: true };
      } else {
        return { success: false, error: result.message };
      }
    } catch (error) {
      console.error('Error registering user:', error);
      return { success: false, error: '网络错误，请稍后重试' };
    }
  },
  
  login: (user) => set({ user, isAuthenticated: true }),
  
  logout: () => {
    mcpService.clearSession();
    set({ 
      user: null, 
      databaseUser: null, 
      mcpUser: null, 
      isAuthenticated: false,
      isRegistered: false,
      remainingDraws: 0
    });
  },

  // 清除会话并重新开始
  clearSession: () => {
    mcpService.clearSession();
    set({ 
      user: null, 
      databaseUser: null, 
      mcpUser: null, 
      isAuthenticated: false,
      isRegistered: false,
      remainingDraws: 0,
      isInitialized: false
    });
  },
  
  // 更新用户活跃状态
  updateUserActivity: () => {
    const { mcpUser } = get();
    if (mcpUser) {
      mcpService.heartbeat();
    }
  },

  // 使用一次抽奖机会
  useDraw: () => {
    const success = mcpService.useDraw();
    if (success) {
      const remainingDraws = mcpService.getRemainingDraws();
      set({ remainingDraws });
    }
    return success;
  },

  // 获取剩余抽奖次数
  getRemainingDraws: () => {
    return mcpService.getRemainingDraws();
  },

  // 设置剩余抽奖次数（从后端同步）
  setRemainingDraws: (count: number) => {
    mcpService.setRemainingDraws(count);
    set({ remainingDraws: count });
  }
}));

// 市场数据状态
interface MarketState {
  products: Product[];
  marketOverview: MarketOverview | null;
  selectedProduct: Product | null;
  setProducts: (products: Product[]) => void;
  setMarketOverview: (overview: MarketOverview) => void;
  setSelectedProduct: (product: Product | null) => void;
}

export const useMarketStore = create<MarketState>((set) => ({
  products: [],
  marketOverview: null,
  selectedProduct: null,
  setProducts: (products) => set({ products }),
  setMarketOverview: (marketOverview) => set({ marketOverview }),
  setSelectedProduct: (selectedProduct) => set({ selectedProduct }),
}));

// 数据库抽奖记录类型
interface DatabaseLotteryRecord {
  lotteryId: string;
  userId: string;
  createdAt: string;
  status: string;
  prizeName?: string;
  prizeValue?: string;
}

// 抽奖状态
interface LotteryState {
  activities: LotteryActivity[];
  currentActivity: LotteryActivity | null;
  isDrawing: boolean;
  userLotteries: DatabaseLotteryRecord[];
  lotteryStats: {
    total: number;
    active: number;
    completed: number;
  } | null;
  globalStats: {
    totalUsers: number;
    totalLotteries: number;
    activeLotteries: number;
    completedLotteries: number;
  } | null;
  setActivities: (activities: LotteryActivity[]) => void;
  setCurrentActivity: (activity: LotteryActivity | null) => void;
  setIsDrawing: (isDrawing: boolean) => void;
  setUserLotteries: (lotteries: DatabaseLotteryRecord[]) => void;
  setLotteryStats: (stats: LotteryState['lotteryStats']) => void;
  setGlobalStats: (stats: LotteryState['globalStats']) => void;
  loadUserLotteries: (userId: string) => Promise<void>;
  loadUserStats: (userId: string) => Promise<void>;
  loadGlobalStats: () => Promise<void>;
  generateLotteryId: (userId: string) => Promise<{ success: boolean; lotteryId?: string; error?: string }>;
  drawLottery: (lotteryId: string, userId: string) => Promise<{ success: boolean; prize?: any; error?: string }>;
}

export const useLotteryStore = create<LotteryState>((set, get) => ({
  activities: [],
  currentActivity: null,
  isDrawing: false,
  userLotteries: [],
  lotteryStats: null,
  globalStats: null,
  
  setActivities: (activities) => set({ activities }),
  setCurrentActivity: (currentActivity) => set({ currentActivity }),
  setIsDrawing: (isDrawing) => set({ isDrawing }),
  setUserLotteries: (userLotteries) => set({ userLotteries }),
  setLotteryStats: (lotteryStats) => set({ lotteryStats }),
  setGlobalStats: (globalStats) => set({ globalStats }),
  
  // 加载用户抽奖记录
  loadUserLotteries: async (userId: string) => {
    try {
      const response = await fetch(`/api/lottery/user-lotteries/${userId}`);
      const result = await response.json();
      
      if (result.success) {
        set({ userLotteries: result.data.lotteries });
      } else {
        console.error('Failed to load user lotteries:', result.message);
      }
    } catch (error) {
      console.error('Error loading user lotteries:', error);
    }
  },
  
  // 加载用户统计
  loadUserStats: async (userId: string) => {
    try {
      const response = await fetch(`/api/lottery/user-stats/${userId}`);
      const result = await response.json();
      
      if (result.success) {
        set({ lotteryStats: result.data.stats });
      } else {
        console.error('Failed to load user stats:', result.message);
      }
    } catch (error) {
      console.error('Error loading user stats:', error);
    }
  },

  // 加载用户抽奖信息（包含剩余次数）
  loadUserLotteryInfo: async (userId: string) => {
    try {
      const response = await fetch(`/api/lottery/user-info/${userId}`);
      const result = await response.json();
      
      if (result.success) {
        const { remainingDraws } = result.data.lotteryStats;
        // 这里我们不能直接更新其他store，需要在组件中处理
        return result.data;
      } else {
        console.error('Failed to load user lottery info:', result.message);
        return null;
      }
    } catch (error) {
      console.error('Error loading user lottery info:', error);
      return null;
    }
  },
  
  // 加载全局统计
  loadGlobalStats: async () => {
    try {
      const response = await fetch('/api/lottery/global-stats');
      const result = await response.json();
      
      if (result.success) {
        set({ globalStats: result.data });
      } else {
        console.error('Failed to load global stats:', result.message);
      }
    } catch (error) {
      console.error('Error loading global stats:', error);
    }
  },
  
  // 生成抽奖ID
  generateLotteryId: async (userId: string) => {
    try {
      const response = await fetch('/api/lottery/generate-lottery-id', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      const result = await response.json();
      
      if (result.success) {
        // 重新加载用户抽奖记录
        await get().loadUserLotteries(userId);
        return { success: true, lotteryId: result.data.lotteryId };
      } else {
        return { success: false, error: result.message };
      }
    } catch (error) {
      console.error('Error generating lottery ID:', error);
      return { success: false, error: '网络错误，请稍后重试' };
    }
  },
  
  // 执行抽奖
  drawLottery: async (lotteryId: string, userId: string) => {
    try {
      set({ isDrawing: true });
      
      const response = await fetch('/api/lottery/draw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ lotteryId, userId }),
      });

      const result = await response.json();
      
      if (result.success) {
        // 重新加载用户抽奖记录和统计
        await get().loadUserLotteries(userId);
        await get().loadUserStats(userId);
        await get().loadGlobalStats();
        
        // 更新剩余抽奖次数
        if (result.data.lotteryStats) {
          const { remainingDraws } = result.data.lotteryStats;
          const userStore = useUserStore.getState();
          userStore.setRemainingDraws(remainingDraws);
        }
        
        set({ isDrawing: false });
        return { success: true, prize: result.data.prize };
      } else {
        set({ isDrawing: false });
        return { success: false, error: result.message };
      }
    } catch (error) {
      console.error('Error drawing lottery:', error);
      set({ isDrawing: false });
      return { success: false, error: '网络错误，请稍后重试' };
    }
  }
}));

// UI状态
interface UIState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  setSidebarOpen: (open: boolean) => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: false,
  theme: 'light',
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  setTheme: (theme) => set({ theme }),
}));

// 留言板状态 - 使用社区API
import { communityService } from '../services/communityService';

interface MessageBoardMessage {
  id: string;
  userId: string;
  username: string;
  avatar: string;
  content: string;
  timestamp: string;
  likes: number;
  isLiked: boolean;
}

interface MessageBoardState {
  messages: MessageBoardMessage[];
  isLoading: boolean;
  newMessageCount: number;
  addMessage: (content: string, user: User) => Promise<void>;
  likeMessage: (messageId: string, user: User) => Promise<void>;
  loadMessages: () => Promise<void>;
  clearNewMessageCount: () => void;
}

export const useMessageBoardStore = create<MessageBoardState>((set) => ({
  messages: [],
  isLoading: false,
  newMessageCount: 0,
  
  addMessage: async (content: string, user: User) => {
    try {
      const response = await communityService.postMessage(user.username, content);
      if (response.success && response.data) {
        const newMessage: MessageBoardMessage = {
          id: response.data.id,
          userId: user.id,
          username: response.data.username,
          avatar: user.avatar,
          content: response.data.content,
          timestamp: response.data.timestamp.toISOString(),
          likes: response.data.likes,
          isLiked: false
        };
        
        set((state) => ({
          messages: [newMessage, ...state.messages].slice(0, 100),
          newMessageCount: state.newMessageCount + 1
        }));
      }
    } catch (error) {
      console.error('发送留言失败:', error);
    }
  },
  
  likeMessage: async (messageId: string, user: User) => {
    try {
      const response = await communityService.likeMessage(messageId, user.username);
      if (response.success && response.data) {
        set((state) => ({
          messages: state.messages.map(msg => 
            msg.id === messageId 
              ? { 
                  ...msg, 
                  likes: response.data!.likes,
                  isLiked: response.data!.hasLiked
                }
              : msg
          )
        }));
      }
    } catch (error) {
      console.error('点赞失败:', error);
    }
  },
  
  loadMessages: async () => {
    set({ isLoading: true });
    try {
      const response = await communityService.getMessages(1, 20);
      if (response.success && response.data) {
        const messages: MessageBoardMessage[] = response.data.messages.map(msg => ({
          id: msg.id,
          userId: msg.id, // 使用消息ID作为用户ID的占位符
          username: msg.username,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.username}`,
          content: msg.content,
          timestamp: msg.timestamp.toISOString(),
          likes: msg.likes,
          isLiked: false // 默认未点赞，实际应该检查用户是否已点赞
        }));
        
        set({ messages, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('加载留言失败:', error);
      set({ isLoading: false });
    }
  },
  
  clearNewMessageCount: () => set({ newMessageCount: 0 })
}));