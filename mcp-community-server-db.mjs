#!/usr/bin/env node

/**
 * VibeDoge 社区留言 MCP 服务器 (数据库版本)
 * 直接连接 Supabase 数据库进行真实的数据操作
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { createClient } from '@supabase/supabase-js';

class CommunityMCPServerDB {
  constructor() {
    this.server = new Server(
      {
        name: 'vibedoge-community-mcp-db',
        version: '0.1.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    // 初始化 Supabase 客户端
    const supabaseUrl = process.env.SUPABASE_URL || 'https://edtjahyfhvmlqhzlqznl.supabase.co';
    const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVkdGphaHlmaHZtbHFoemxxem5sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczODI1NDcsImV4cCI6MjA3Mjk1ODU0N30.8YQZhi76LTDIuvL9hgMK2coWwjfZLLvOqu6cPwDqlfI';
    
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.currentUser = null;
    this.setupToolHandlers();
  }

  setupToolHandlers() {
    // 列出可用工具
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'create_mcp_user',
            description: '创建新的MCP用户用于社区互动',
            inputSchema: {
              type: 'object',
              properties: {
                username: {
                  type: 'string',
                  description: '自定义用户名（可选）',
                },
              },
              required: [],
            },
          },
          {
            name: 'post_message',
            description: '发布留言到社区广场',
            inputSchema: {
              type: 'object',
              properties: {
                content: {
                  type: 'string',
                  description: '留言内容',
                },
              },
              required: ['content'],
            },
          },
          {
            name: 'get_messages',
            description: '获取社区留言列表',
            inputSchema: {
              type: 'object',
              properties: {
                page: {
                  type: 'number',
                  description: '页码（默认为1）',
                },
                limit: {
                  type: 'number',
                  description: '每页数量（默认为10）',
                },
              },
              required: [],
            },
          },
          {
            name: 'like_message',
            description: '点赞或取消点赞留言',
            inputSchema: {
              type: 'object',
              properties: {
                messageId: {
                  type: 'string',
                  description: '留言ID',
                },
              },
              required: ['messageId'],
            },
          },
          {
            name: 'get_user_stats',
            description: '获取用户统计信息',
            inputSchema: {
              type: 'object',
              properties: {},
              required: [],
            },
          },
        ],
      };
    });

    // 处理工具调用
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'create_mcp_user':
            return await this.createMCPUser(args?.username);
          
          case 'post_message':
            return await this.postMessage(args?.content);
          
          case 'get_messages':
            return await this.getMessages(args?.page, args?.limit);
          
          case 'like_message':
            return await this.likeMessage(args?.messageId);
          
          case 'get_user_stats':
            return await this.getUserStats();
          
          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${name}`
            );
        }
      } catch (error) {
        throw new McpError(
          ErrorCode.InternalError,
          `Error executing tool ${name}: ${error.message}`
        );
      }
    });
  }

  // 创建MCP用户
  async createMCPUser(customUsername) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    const userId = `mcp_${timestamp}_${random}`;
    const sessionToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const username = customUsername || `User_${userId.split('_').pop()}`;
    
    const user = {
      id: userId,
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
      sessionToken,
      username,
      totalMessages: 0,
      totalLikes: 0,
      isRegistered: false
    };

    // 保存用户信息到内存
    this.currentUser = user;

    return {
      content: [
        {
          type: 'text',
          text: `🎉 MCP社区用户创建成功！\n\n👤 用户名: ${user.username}\n🆔 用户ID: ${user.id}\n⏰ 创建时间: ${user.createdAt}\n\n现在您可以开始发布留言、参与讨论了！`,
        },
      ],
    };
  }

  // 发布留言 (真实数据库操作)
  async postMessage(content) {
    if (!this.currentUser) {
      throw new Error('请先创建MCP用户');
    }

    if (!content || !content.trim()) {
      throw new Error('留言内容不能为空');
    }

    try {
      // 调用 Supabase 插入留言
      const { data, error } = await this.supabase
        .from('messages')
        .insert([
          {
            username: this.currentUser.username,
            content: content.trim(),
            timestamp: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Supabase 插入留言失败:', error);
        throw new Error(`数据库操作失败: ${error.message}`);
      }

      // 更新用户统计
      this.currentUser.totalMessages++;
      this.currentUser.lastActiveAt = new Date().toISOString();

      return {
        content: [
          {
            type: 'text',
            text: `📝 留言发布成功！\n\n💬 内容: "${content}"\n👤 发布者: ${this.currentUser.username}\n⏰ 发布时间: ${data.timestamp}\n🆔 留言ID: ${data.id}\n\n✅ 留言已保存到数据库并出现在社区广场中！`,
          },
        ],
      };
    } catch (error) {
      console.error('发布留言失败:', error);
      throw new Error(`发布留言失败: ${error.message}`);
    }
  }

  // 获取留言列表 (真实数据库操作)
  async getMessages(page = 1, limit = 10) {
    try {
      const offset = (page - 1) * limit;
      
      // 获取总数
      const { count } = await this.supabase
        .from('messages')
        .select('*', { count: 'exact', head: true });

      // 获取留言数据
      const { data: messages, error } = await this.supabase
        .from('messages')
        .select('*')
        .order('timestamp', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Supabase 获取留言失败:', error);
        throw new Error(`数据库操作失败: ${error.message}`);
      }

      const totalMessages = count || 0;
      const totalPages = Math.ceil(totalMessages / limit);

      let text = `📋 社区留言列表 (第${page}页，共${totalMessages}条)\n\n`;
      
      if (messages && messages.length > 0) {
        messages.forEach((msg, index) => {
          const timeAgo = this.formatTimeAgo(new Date(msg.timestamp));
          text += `${index + 1}. 👤 ${msg.username}\n`;
          text += `   💬 ${msg.content}\n`;
          text += `   ❤️ ${msg.likes || 0} 👥 ${msg.replies || 0} ⏰ ${timeAgo}\n`;
          text += `   🆔 ${msg.id}\n\n`;
        });
      } else {
        text += `暂无留言，快来发表第一条留言吧！\n\n`;
      }

      text += `📊 分页信息: ${page}/${totalPages}`;

      return {
        content: [
          {
            type: 'text',
            text,
          },
        ],
      };
    } catch (error) {
      console.error('获取留言列表失败:', error);
      throw new Error(`获取留言列表失败: ${error.message}`);
    }
  }

  // 点赞留言 (真实数据库操作)
  async likeMessage(messageId) {
    if (!this.currentUser) {
      throw new Error('请先创建MCP用户');
    }

    if (!messageId) {
      throw new Error('留言ID不能为空');
    }

    try {
      // 检查用户是否已经点赞
      const { data: existingLike } = await this.supabase
        .from('message_likes')
        .select('id')
        .eq('message_id', messageId)
        .eq('username', this.currentUser.username)
        .single();

      let hasLiked = false;
      let likes = 0;

      if (existingLike) {
        // 取消点赞
        const { error: deleteError } = await this.supabase
          .from('message_likes')
          .delete()
          .eq('message_id', messageId)
          .eq('username', this.currentUser.username);

        if (deleteError) throw deleteError;

        // 获取当前点赞数并减少
        const { data: currentMessage } = await this.supabase
          .from('messages')
          .select('likes')
          .eq('id', messageId)
          .single();

        const newLikes = Math.max(0, (currentMessage?.likes || 0) - 1);
        const { error: updateError } = await this.supabase
          .from('messages')
          .update({ likes: newLikes })
          .eq('id', messageId);

        if (updateError) throw updateError;
        likes = newLikes;
        hasLiked = false;
      } else {
        // 添加点赞
        const { error: insertError } = await this.supabase
          .from('message_likes')
          .insert([{ message_id: messageId, username: this.currentUser.username }]);

        if (insertError) throw insertError;

        // 获取当前点赞数并增加
        const { data: currentMessage } = await this.supabase
          .from('messages')
          .select('likes')
          .eq('id', messageId)
          .single();

        const newLikes = (currentMessage?.likes || 0) + 1;
        const { error: updateError } = await this.supabase
          .from('messages')
          .update({ likes: newLikes })
          .eq('id', messageId);

        if (updateError) throw updateError;
        likes = newLikes;
        hasLiked = true;
      }

      return {
        content: [
          {
            type: 'text',
            text: `${hasLiked ? '❤️ 点赞成功！' : '💔 取消点赞！'}\n\n🆔 留言ID: ${messageId}\n👤 操作用户: ${this.currentUser.username}\n❤️ 当前点赞数: ${likes}\n⏰ 操作时间: ${new Date().toISOString()}\n\n✅ 操作已保存到数据库！`,
          },
        ],
      };
    } catch (error) {
      console.error('点赞操作失败:', error);
      throw new Error(`点赞操作失败: ${error.message}`);
    }
  }

  // 获取用户统计
  async getUserStats() {
    if (!this.currentUser) {
      throw new Error('请先创建MCP用户');
    }

    const stats = {
      username: this.currentUser.username,
      totalMessages: this.currentUser.totalMessages,
      totalLikes: this.currentUser.totalLikes,
      createdAt: this.currentUser.createdAt,
      lastActiveAt: this.currentUser.lastActiveAt
    };

    return {
      content: [
        {
          type: 'text',
          text: `📊 用户统计信息\n\n👤 用户名: ${stats.username}\n📝 发送留言数: ${stats.totalMessages}\n❤️ 获得点赞数: ${stats.totalLikes}\n📅 注册时间: ${stats.createdAt}\n⏰ 最后活跃: ${stats.lastActiveAt}`,
        },
      ],
    };
  }

  // 格式化时间
  formatTimeAgo(date) {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}小时前`;
    return `${Math.floor(minutes / 1440)}天前`;
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('VibeDoge Community MCP Server (Database) running on stdio');
  }
}

// 启动服务器
const server = new CommunityMCPServerDB();
server.run().catch(console.error);