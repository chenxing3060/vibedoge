// 社区服务 - 使用 Supabase
import { supabase } from '../lib/supabase';

export interface Message {
    id: string;
    username: string;
    content: string;
    timestamp: Date;
    likes: number;
    replies: number;
    likedBy?: string[];
}

export interface Topic {
    id: string;
    title: string;
    description: string;
    messages: number;
    participants: number;
    lastActivity: Date;
    trending: boolean;
    createdBy: string;
}

export interface TopicMessage {
    id: string;
    topicId: string;
    username: string;
    content: string;
    timestamp: Date;
    likes: number;
}

export interface MessageComment {
    id: string;
    messageId: string;
    username: string;
    content: string;
    timestamp: Date;
    likes: number;
}

export interface TopicMessageComment {
    id: string;
    topicMessageId: string;
    username: string;
    content: string;
    timestamp: Date;
    likes: number;
}

export interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data?: T;
    error?: string;
}

export interface MessagesResponse {
    messages: Message[];
    pagination: {
        currentPage: number;
        totalPages: number;
        totalMessages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}

class CommunityService {
    // 订阅留言变化
    subscribeToMessages(callback: (payload: any) => void) {
        console.log('🔗 设置留言实时订阅...');
        const channel = supabase
            .channel('messages_changes')
            .on('postgres_changes', 
                { 
                    event: '*', 
                    schema: 'public', 
                    table: 'messages' 
                }, 
                (payload) => {
                    console.log('📨 收到留言变化事件:', payload);
                    callback(payload);
                }
            )
            .subscribe((status) => {
                console.log('📡 留言订阅状态:', status);
            });
        
        return channel;
    }

    // 订阅话题变化
    subscribeToTopics(callback: (payload: any) => void) {
        console.log('🔗 设置话题实时订阅...');
        const channel = supabase
            .channel('topics_changes')
            .on('postgres_changes', 
                { 
                    event: '*', 
                    schema: 'public', 
                    table: 'topics' 
                }, 
                (payload) => {
                    console.log('📨 收到话题变化事件:', payload);
                    callback(payload);
                }
            )
            .subscribe((status) => {
                console.log('📡 话题订阅状态:', status);
            });
        
        return channel;
    }

    // 订阅话题留言变化
    subscribeToTopicMessages(topicId: string, callback: (payload: any) => void) {
        console.log('🔗 设置话题留言实时订阅:', topicId);
        const channel = supabase
            .channel(`topic_messages_${topicId}`)
            .on('postgres_changes', 
                { 
                    event: '*', 
                    schema: 'public', 
                    table: 'topic_messages',
                    filter: `topic_id=eq.${topicId}`
                }, 
                (payload) => {
                    console.log('📨 收到话题留言变化事件:', payload);
                    callback(payload);
                }
            )
            .subscribe((status) => {
                console.log('📡 话题留言订阅状态:', status);
            });
        
        return channel;
    }

    // 取消订阅
    unsubscribe(subscription: any) {
        if (subscription) {
            supabase.removeChannel(subscription);
        }
    }

    // 获取留言列表
    async getMessages(page: number = 1, limit: number = 10): Promise<ApiResponse<MessagesResponse>> {
        try {
            const offset = (page - 1) * limit;
            
            // 获取总数
            const { count } = await supabase
                .from('messages')
                .select('*', { count: 'exact', head: true });

            // 获取留言数据
            const { data: messages, error } = await supabase
                .from('messages')
                .select('*')
                .order('timestamp', { ascending: false })
                .range(offset, offset + limit - 1);

            if (error) {
                console.error('获取留言失败:', error);
                return {
                    success: false,
                    error: error.message
                };
            }

            const totalMessages = count || 0;
            const totalPages = Math.ceil(totalMessages / limit);

            const transformedMessages: Message[] = messages?.map(msg => ({
                id: msg.id,
                username: msg.username,
                content: msg.content,
                timestamp: new Date(msg.timestamp),
                likes: msg.likes,
                replies: msg.replies
            })) || [];

            return {
                success: true,
                data: {
                    messages: transformedMessages,
                    pagination: {
                        currentPage: page,
                        totalPages,
                        totalMessages,
                        hasNext: page < totalPages,
                        hasPrev: page > 1
                    }
                }
            };
        } catch (error) {
            console.error('获取留言失败:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : '获取留言失败'
            };
        }
    }

    // 发送新留言
    async postMessage(username: string, content: string): Promise<ApiResponse<Message>> {
        try {
            const { data, error } = await supabase
                .from('messages')
                .insert([
                    {
                        username,
                        content,
                        timestamp: new Date().toISOString()
                    }
                ])
                .select()
                .single();

            if (error) {
                console.error('发送留言失败:', error);
                return {
                    success: false,
                    error: error.message
                };
            }

            return {
                success: true,
                data: {
                    id: data.id,
                    username: data.username,
                    content: data.content,
                    timestamp: new Date(data.timestamp),
                    likes: data.likes,
                    replies: data.replies
                },
                message: '留言发送成功'
            };
        } catch (error) {
            console.error('发送留言失败:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : '发送留言失败'
            };
        }
    }

    // 点赞留言
    async likeMessage(messageId: string, username: string): Promise<ApiResponse<{ messageId: string; likes: number; hasLiked: boolean }>> {
        try {
            // 检查用户是否已经点赞
            const { data: existingLike } = await supabase
                .from('message_likes')
                .select('id')
                .eq('message_id', messageId)
                .eq('username', username)
                .single();

            let hasLiked = false;
            let likes = 0;

            if (existingLike) {
                // 取消点赞
                const { error: deleteError } = await supabase
                    .from('message_likes')
                    .delete()
                    .eq('message_id', messageId)
                    .eq('username', username);

                if (deleteError) throw deleteError;

                // 先获取当前点赞数
                const { data: currentMessage } = await supabase
                    .from('messages')
                    .select('likes')
                    .eq('id', messageId)
                    .single();

                // 减少点赞数
                const newLikes = Math.max(0, (currentMessage?.likes || 0) - 1);
                const { error: updateError } = await supabase
                    .from('messages')
                    .update({ likes: newLikes })
                    .eq('id', messageId);

                if (updateError) throw updateError;
                likes = newLikes;
                hasLiked = false;
            } else {
                // 添加点赞
                const { error: insertError } = await supabase
                    .from('message_likes')
                    .insert([{ message_id: messageId, username }]);

                if (insertError) throw insertError;

                // 先获取当前点赞数
                const { data: currentMessage } = await supabase
                    .from('messages')
                    .select('likes')
                    .eq('id', messageId)
                    .single();

                // 增加点赞数
                const newLikes = (currentMessage?.likes || 0) + 1;
                const { error: updateError } = await supabase
                    .from('messages')
                    .update({ likes: newLikes })
                    .eq('id', messageId);

                if (updateError) throw updateError;
                likes = newLikes;
                hasLiked = true;
            }

            return {
                success: true,
                data: {
                    messageId,
                    likes,
                    hasLiked
                }
            };
        } catch (error) {
            console.error('点赞操作失败:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : '点赞操作失败'
            };
        }
    }

    // 获取话题列表（直接查询并计算统计数据）
    async getTopics(trending?: boolean): Promise<ApiResponse<Topic[]>> {
        try {
            let query = supabase
                .from('topics')
                .select('*');

            if (trending) {
                query = query.eq('trending', true);
            }

            query = query.order('last_activity', { ascending: false });

            const { data: topics, error } = await query;

            if (error) {
                console.error('获取话题失败:', error);
                return {
                    success: false,
                    error: error.message
                };
            }

            // 为每个话题计算真实的统计数据
            const topicsWithStats = await Promise.all(
                (topics || []).map(async (topic) => {
                    try {
                        // 获取真实的留言数
                        const { count: messageCount } = await supabase
                            .from('topic_messages')
                            .select('*', { count: 'exact', head: true })
                            .eq('topic_id', topic.id);

                        // 获取真实的参与者数（去重用户名）
                        const { data: participants } = await supabase
                            .from('topic_messages')
                            .select('username')
                            .eq('topic_id', topic.id);

                        const uniqueParticipants = new Set(participants?.map(p => p.username) || []);
                        const participantCount = uniqueParticipants.size;

                        return {
                            id: topic.id,
                            title: topic.title,
                            description: topic.description,
                            messages: messageCount || 0,
                            participants: participantCount,
                            lastActivity: new Date(topic.last_activity),
                            trending: topic.trending,
                            createdBy: topic.created_by
                        };
                    } catch (err) {
                        console.error(`计算话题 ${topic.id} 统计数据失败:`, err);
                        // 如果计算失败，使用数据库中的值
                        return {
                            id: topic.id,
                            title: topic.title,
                            description: topic.description,
                            messages: topic.messages || 0,
                            participants: topic.participants || 0,
                            lastActivity: new Date(topic.last_activity),
                            trending: topic.trending,
                            createdBy: topic.created_by
                        };
                    }
                })
            );

            return {
                success: true,
                data: topicsWithStats
            };
        } catch (error) {
            console.error('获取话题失败:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : '获取话题失败'
            };
        }
    }

    // 获取话题详情
    async getTopic(topicId: string): Promise<ApiResponse<Topic>> {
        try {
            const { data: topic, error } = await supabase
                .from('topics')
                .select('*')
                .eq('id', topicId)
                .single();

            if (error) {
                console.error('获取话题详情失败:', error);
                return {
                    success: false,
                    error: error.message
                };
            }

            // 计算真实的统计数据
            try {
                const { count: messageCount } = await supabase
                    .from('topic_messages')
                    .select('*', { count: 'exact', head: true })
                    .eq('topic_id', topicId);

                const { data: participants } = await supabase
                    .from('topic_messages')
                    .select('username')
                    .eq('topic_id', topicId);

                const uniqueParticipants = new Set(participants?.map(p => p.username) || []);
                const participantCount = uniqueParticipants.size;

                return {
                    success: true,
                    data: {
                        id: topic.id,
                        title: topic.title,
                        description: topic.description,
                        messages: messageCount || 0,
                        participants: participantCount,
                        lastActivity: new Date(topic.last_activity),
                        trending: topic.trending,
                        createdBy: topic.created_by
                    }
                };
            } catch (statsError) {
                console.error('计算统计数据失败:', statsError);
                // 如果统计计算失败，使用数据库中的值
                return {
                    success: true,
                    data: {
                        id: topic.id,
                        title: topic.title,
                        description: topic.description,
                        messages: topic.messages || 0,
                        participants: topic.participants || 0,
                        lastActivity: new Date(topic.last_activity),
                        trending: topic.trending,
                        createdBy: topic.created_by
                    }
                };
            }
        } catch (error) {
            console.error('获取话题详情失败:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : '获取话题详情失败'
            };
        }
    }

    // 创建新话题
    async createTopic(title: string, description: string, createdBy: string): Promise<ApiResponse<Topic>> {
        try {
            const { data: topic, error } = await supabase
                .from('topics')
                .insert([
                    {
                        title,
                        description,
                        created_by: createdBy,
                        last_activity: new Date().toISOString()
                    }
                ])
                .select()
                .single();

            if (error) {
                console.error('创建话题失败:', error);
                return {
                    success: false,
                    error: error.message
                };
            }

            return {
                success: true,
                data: {
                    id: topic.id,
                    title: topic.title,
                    description: topic.description,
                    messages: topic.messages,
                    participants: topic.participants,
                    lastActivity: new Date(topic.last_activity),
                    trending: topic.trending,
                    createdBy: topic.created_by
                },
                message: '话题创建成功'
            };
        } catch (error) {
            console.error('创建话题失败:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : '创建话题失败'
            };
        }
    }

    // 获取话题留言列表
    async getTopicMessages(topicId: string, page: number = 1, limit: number = 20): Promise<ApiResponse<{ messages: TopicMessage[]; pagination: any }>> {
        try {
            const offset = (page - 1) * limit;
            
            // 获取总数
            const { count } = await supabase
                .from('topic_messages')
                .select('*', { count: 'exact', head: true })
                .eq('topic_id', topicId);

            // 获取留言数据
            const { data: messages, error } = await supabase
                .from('topic_messages')
                .select('*')
                .eq('topic_id', topicId)
                .order('timestamp', { ascending: false })
                .range(offset, offset + limit - 1);

            if (error) {
                console.error('获取话题留言失败:', error);
                return {
                    success: false,
                    error: error.message
                };
            }

            const totalMessages = count || 0;
            const totalPages = Math.ceil(totalMessages / limit);

            const transformedMessages: TopicMessage[] = messages?.map(msg => ({
                id: msg.id,
                topicId: msg.topic_id,
                username: msg.username,
                content: msg.content,
                timestamp: new Date(msg.timestamp),
                likes: msg.likes
            })) || [];

            return {
                success: true,
                data: {
                    messages: transformedMessages,
                    pagination: {
                        currentPage: page,
                        totalPages,
                        totalMessages,
                        hasNext: page < totalPages,
                        hasPrev: page > 1
                    }
                }
            };
        } catch (error) {
            console.error('获取话题留言失败:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : '获取话题留言失败'
            };
        }
    }

    // 发送话题留言
    async postTopicMessage(topicId: string, username: string, content: string): Promise<ApiResponse<TopicMessage>> {
        try {
            const { data, error } = await supabase
                .from('topic_messages')
                .insert([
                    {
                        topic_id: topicId,
                        username,
                        content,
                        timestamp: new Date().toISOString()
                    }
                ])
                .select()
                .single();

            if (error) {
                console.error('发送话题留言失败:', error);
                return {
                    success: false,
                    error: error.message
                };
            }

            // 更新话题的最后活动时间（统计数据由触发器自动更新）
            await supabase
                .from('topics')
                .update({ 
                    last_activity: new Date().toISOString()
                })
                .eq('id', topicId);

            return {
                success: true,
                data: {
                    id: data.id,
                    topicId: data.topic_id,
                    username: data.username,
                    content: data.content,
                    timestamp: new Date(data.timestamp),
                    likes: data.likes
                },
                message: '话题留言发送成功'
            };
        } catch (error) {
            console.error('发送话题留言失败:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : '发送话题留言失败'
            };
        }
    }

    // 点赞话题留言
    async likeTopicMessage(messageId: string, username: string): Promise<ApiResponse<{ messageId: string; likes: number; hasLiked: boolean }>> {
        try {
            // 检查用户是否已经点赞
            const { data: existingLike } = await supabase
                .from('topic_message_likes')
                .select('id')
                .eq('topic_message_id', messageId)
                .eq('username', username)
                .single();

            let hasLiked = false;
            let likes = 0;

            if (existingLike) {
                // 取消点赞
                const { error: deleteError } = await supabase
                    .from('topic_message_likes')
                    .delete()
                    .eq('topic_message_id', messageId)
                    .eq('username', username);

                if (deleteError) throw deleteError;

                // 获取当前点赞数并减少
                const { data: currentMessage } = await supabase
                    .from('topic_messages')
                    .select('likes')
                    .eq('id', messageId)
                    .single();

                const newLikes = Math.max(0, (currentMessage?.likes || 0) - 1);
                const { error: updateError } = await supabase
                    .from('topic_messages')
                    .update({ likes: newLikes })
                    .eq('id', messageId);

                if (updateError) throw updateError;
                likes = newLikes;
                hasLiked = false;
            } else {
                // 添加点赞
                const { error: insertError } = await supabase
                    .from('topic_message_likes')
                    .insert([{ topic_message_id: messageId, username }]);

                if (insertError) throw insertError;

                // 获取当前点赞数并增加
                const { data: currentMessage } = await supabase
                    .from('topic_messages')
                    .select('likes')
                    .eq('id', messageId)
                    .single();

                const newLikes = (currentMessage?.likes || 0) + 1;
                const { error: updateError } = await supabase
                    .from('topic_messages')
                    .update({ likes: newLikes })
                    .eq('id', messageId);

                if (updateError) throw updateError;
                likes = newLikes;
                hasLiked = true;
            }

            return {
                success: true,
                data: {
                    messageId,
                    likes,
                    hasLiked
                }
            };
        } catch (error) {
            console.error('话题留言点赞操作失败:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : '话题留言点赞操作失败'
            };
        }
    }

    // === 评论功能 ===

    // 获取留言评论列表
    async getMessageComments(messageId: string, page: number = 1, limit: number = 10): Promise<ApiResponse<{ comments: MessageComment[]; pagination: any }>> {
        try {
            const offset = (page - 1) * limit;
            
            // 获取总数
            const { count } = await supabase
                .from('message_comments')
                .select('*', { count: 'exact', head: true })
                .eq('message_id', messageId);

            // 获取评论数据
            const { data: comments, error } = await supabase
                .from('message_comments')
                .select('*')
                .eq('message_id', messageId)
                .order('timestamp', { ascending: true })
                .range(offset, offset + limit - 1);

            if (error) {
                console.error('获取留言评论失败:', error);
                return {
                    success: false,
                    error: error.message
                };
            }

            const totalComments = count || 0;
            const totalPages = Math.ceil(totalComments / limit);

            const transformedComments: MessageComment[] = comments?.map(comment => ({
                id: comment.id,
                messageId: comment.message_id,
                username: comment.username,
                content: comment.content,
                timestamp: new Date(comment.timestamp),
                likes: comment.likes
            })) || [];

            return {
                success: true,
                data: {
                    comments: transformedComments,
                    pagination: {
                        currentPage: page,
                        totalPages,
                        totalComments,
                        hasNext: page < totalPages,
                        hasPrev: page > 1
                    }
                }
            };
        } catch (error) {
            console.error('获取留言评论失败:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : '获取留言评论失败'
            };
        }
    }

    // 发送留言评论
    async postMessageComment(messageId: string, username: string, content: string): Promise<ApiResponse<MessageComment>> {
        try {
            const { data, error } = await supabase
                .from('message_comments')
                .insert([
                    {
                        message_id: messageId,
                        username,
                        content,
                        timestamp: new Date().toISOString()
                    }
                ])
                .select()
                .single();

            if (error) {
                console.error('发送留言评论失败:', error);
                return {
                    success: false,
                    error: error.message
                };
            }

            return {
                success: true,
                data: {
                    id: data.id,
                    messageId: data.message_id,
                    username: data.username,
                    content: data.content,
                    timestamp: new Date(data.timestamp),
                    likes: data.likes
                },
                message: '评论发送成功'
            };
        } catch (error) {
            console.error('发送留言评论失败:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : '发送留言评论失败'
            };
        }
    }

    // 点赞留言评论
    async likeMessageComment(commentId: string, username: string): Promise<ApiResponse<{ commentId: string; likes: number; hasLiked: boolean }>> {
        try {
            // 检查用户是否已经点赞
            const { data: existingLike } = await supabase
                .from('message_comment_likes')
                .select('id')
                .eq('comment_id', commentId)
                .eq('username', username)
                .single();

            let hasLiked = false;
            let likes = 0;

            if (existingLike) {
                // 取消点赞
                const { error: deleteError } = await supabase
                    .from('message_comment_likes')
                    .delete()
                    .eq('comment_id', commentId)
                    .eq('username', username);

                if (deleteError) throw deleteError;

                // 获取当前点赞数并减少
                const { data: currentComment } = await supabase
                    .from('message_comments')
                    .select('likes')
                    .eq('id', commentId)
                    .single();

                const newLikes = Math.max(0, (currentComment?.likes || 0) - 1);
                const { error: updateError } = await supabase
                    .from('message_comments')
                    .update({ likes: newLikes })
                    .eq('id', commentId);

                if (updateError) throw updateError;
                likes = newLikes;
                hasLiked = false;
            } else {
                // 添加点赞
                const { error: insertError } = await supabase
                    .from('message_comment_likes')
                    .insert([{ comment_id: commentId, username }]);

                if (insertError) throw insertError;

                // 获取当前点赞数并增加
                const { data: currentComment } = await supabase
                    .from('message_comments')
                    .select('likes')
                    .eq('id', commentId)
                    .single();

                const newLikes = (currentComment?.likes || 0) + 1;
                const { error: updateError } = await supabase
                    .from('message_comments')
                    .update({ likes: newLikes })
                    .eq('id', commentId);

                if (updateError) throw updateError;
                likes = newLikes;
                hasLiked = true;
            }

            return {
                success: true,
                data: {
                    commentId,
                    likes,
                    hasLiked
                }
            };
        } catch (error) {
            console.error('留言评论点赞操作失败:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : '留言评论点赞操作失败'
            };
        }
    }

    // 获取话题留言评论列表
    async getTopicMessageComments(topicMessageId: string, page: number = 1, limit: number = 10): Promise<ApiResponse<{ comments: TopicMessageComment[]; pagination: any }>> {
        try {
            const offset = (page - 1) * limit;
            
            // 获取总数
            const { count } = await supabase
                .from('topic_message_comments')
                .select('*', { count: 'exact', head: true })
                .eq('topic_message_id', topicMessageId);

            // 获取评论数据
            const { data: comments, error } = await supabase
                .from('topic_message_comments')
                .select('*')
                .eq('topic_message_id', topicMessageId)
                .order('timestamp', { ascending: true })
                .range(offset, offset + limit - 1);

            if (error) {
                console.error('获取话题留言评论失败:', error);
                return {
                    success: false,
                    error: error.message
                };
            }

            const totalComments = count || 0;
            const totalPages = Math.ceil(totalComments / limit);

            const transformedComments: TopicMessageComment[] = comments?.map(comment => ({
                id: comment.id,
                topicMessageId: comment.topic_message_id,
                username: comment.username,
                content: comment.content,
                timestamp: new Date(comment.timestamp),
                likes: comment.likes
            })) || [];

            return {
                success: true,
                data: {
                    comments: transformedComments,
                    pagination: {
                        currentPage: page,
                        totalPages,
                        totalComments,
                        hasNext: page < totalPages,
                        hasPrev: page > 1
                    }
                }
            };
        } catch (error) {
            console.error('获取话题留言评论失败:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : '获取话题留言评论失败'
            };
        }
    }

    // 发送话题留言评论
    async postTopicMessageComment(topicMessageId: string, username: string, content: string): Promise<ApiResponse<TopicMessageComment>> {
        try {
            const { data, error } = await supabase
                .from('topic_message_comments')
                .insert([
                    {
                        topic_message_id: topicMessageId,
                        username,
                        content,
                        timestamp: new Date().toISOString()
                    }
                ])
                .select()
                .single();

            if (error) {
                console.error('发送话题留言评论失败:', error);
                return {
                    success: false,
                    error: error.message
                };
            }

            return {
                success: true,
                data: {
                    id: data.id,
                    topicMessageId: data.topic_message_id,
                    username: data.username,
                    content: data.content,
                    timestamp: new Date(data.timestamp),
                    likes: data.likes
                },
                message: '话题留言评论发送成功'
            };
        } catch (error) {
            console.error('发送话题留言评论失败:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : '发送话题留言评论失败'
            };
        }
    }

    // 点赞话题留言评论
    async likeTopicMessageComment(commentId: string, username: string): Promise<ApiResponse<{ commentId: string; likes: number; hasLiked: boolean }>> {
        try {
            // 检查用户是否已经点赞
            const { data: existingLike } = await supabase
                .from('topic_message_comment_likes')
                .select('id')
                .eq('comment_id', commentId)
                .eq('username', username)
                .single();

            let hasLiked = false;
            let likes = 0;

            if (existingLike) {
                // 取消点赞
                const { error: deleteError } = await supabase
                    .from('topic_message_comment_likes')
                    .delete()
                    .eq('comment_id', commentId)
                    .eq('username', username);

                if (deleteError) throw deleteError;

                // 获取当前点赞数并减少
                const { data: currentComment } = await supabase
                    .from('topic_message_comments')
                    .select('likes')
                    .eq('id', commentId)
                    .single();

                const newLikes = Math.max(0, (currentComment?.likes || 0) - 1);
                const { error: updateError } = await supabase
                    .from('topic_message_comments')
                    .update({ likes: newLikes })
                    .eq('id', commentId);

                if (updateError) throw updateError;
                likes = newLikes;
                hasLiked = false;
            } else {
                // 添加点赞
                const { error: insertError } = await supabase
                    .from('topic_message_comment_likes')
                    .insert([{ comment_id: commentId, username }]);

                if (insertError) throw insertError;

                // 获取当前点赞数并增加
                const { data: currentComment } = await supabase
                    .from('topic_message_comments')
                    .select('likes')
                    .eq('id', commentId)
                    .single();

                const newLikes = (currentComment?.likes || 0) + 1;
                const { error: updateError } = await supabase
                    .from('topic_message_comments')
                    .update({ likes: newLikes })
                    .eq('id', commentId);

                if (updateError) throw updateError;
                likes = newLikes;
                hasLiked = true;
            }

            return {
                success: true,
                data: {
                    commentId,
                    likes,
                    hasLiked
                }
            };
        } catch (error) {
            console.error('话题留言评论点赞操作失败:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : '话题留言评论点赞操作失败'
            };
        }
    }
}

export const communityService = new CommunityService();