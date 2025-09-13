import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Users, Heart, Send, TrendingUp, Clock, Loader2, AlertCircle, Plus } from 'lucide-react';
import { communityService, Message, Topic } from '../services/communityService';
import TopicDetail from '../components/TopicDetail';
import CreateTopicForm from '../components/CreateTopicForm';
import RealtimeIndicator from '../components/RealtimeIndicator';

const CommunityPage: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [topics, setTopics] = useState<Topic[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [activeTab, setActiveTab] = useState<'messages' | 'topics'>('messages');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentUser] = useState('游客用户'); // 实际项目中应该从用户认证系统获取

    // 话题相关状态
    const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
    const [showCreateTopic, setShowCreateTopic] = useState(false);
    const [isCreatingTopic, setIsCreatingTopic] = useState(false);

    // 实时更新状态
    const [isRealtimeConnected, setIsRealtimeConnected] = useState(false);
    const [lastUpdate, setLastUpdate] = useState<Date | undefined>();

    // 加载留言数据
    const loadMessages = async () => {
        console.log('开始加载留言数据...');
        setLoading(true);
        setError(null);
        try {
            const response = await communityService.getMessages(1, 20);
            console.log('API响应:', response);
            if (response.success && response.data) {
                console.log('设置留言数据:', response.data.messages);
                setMessages(response.data.messages);
            } else {
                console.error('API错误:', response.error);
                setError(response.error || '加载留言失败');
            }
        } catch (err) {
            console.error('网络错误:', err);
            setError('网络连接失败');
        } finally {
            setLoading(false);
        }
    };

    // 加载话题数据
    const loadTopics = async () => {
        try {
            const response = await communityService.getTopics();
            if (response.success && response.data) {
                setTopics(response.data);
            } else {
                setError(response.error || '加载话题失败');
            }
        } catch (err) {
            console.error('加载话题失败:', err);
            setError('网络连接失败');
        }
    };

    // 创建新话题
    const handleCreateTopic = async (title: string, description: string) => {
        setIsCreatingTopic(true);
        try {
            const response = await communityService.createTopic(title, description, currentUser);
            if (response.success && response.data) {
                setTopics([response.data, ...topics]);
                setShowCreateTopic(false);
            } else {
                setError(response.error || '创建话题失败');
            }
        } catch (err) {
            setError('创建失败，请检查网络连接');
        } finally {
            setIsCreatingTopic(false);
        }
    };

    // 选择话题
    const handleTopicClick = (topic: Topic) => {
        setSelectedTopic(topic);
    };

    // 返回话题列表
    const handleBackToTopics = () => {
        setSelectedTopic(null);
        loadTopics(); // 重新加载话题列表以更新数据
    };

    // 发送留言
    const handleSendMessage = async () => {
        if (!newMessage.trim()) return;

        setLoading(true);
        try {
            const response = await communityService.postMessage(currentUser, newMessage.trim());
            if (response.success && response.data) {
                setMessages([response.data, ...messages]);
                setNewMessage('');
            } else {
                setError(response.error || '发送留言失败');
            }
        } catch (err) {
            setError('发送失败，请检查网络连接');
        } finally {
            setLoading(false);
        }
    };

    // 点赞留言
    const handleLikeMessage = async (messageId: string) => {
        try {
            const response = await communityService.likeMessage(messageId, currentUser);
            if (response.success && response.data) {
                setMessages(messages.map(msg =>
                    msg.id === messageId
                        ? { ...msg, likes: response.data!.likes }
                        : msg
                ));
            }
        } catch (err) {
            console.error('点赞失败:', err);
        }
    };

    // 组件挂载时加载数据和设置实时订阅
    useEffect(() => {
        loadMessages();
        loadTopics();

        // 设置实时订阅
        const messagesSubscription = communityService.subscribeToMessages((payload) => {
            console.log('留言实时更新:', payload);
            setLastUpdate(new Date());

            if (payload.eventType === 'INSERT') {
                // 新留言插入
                const newMessage = {
                    id: payload.new.id,
                    username: payload.new.username,
                    content: payload.new.content,
                    timestamp: new Date(payload.new.timestamp),
                    likes: payload.new.likes,
                    replies: payload.new.replies
                };
                setMessages(prev => [newMessage, ...prev]);
            } else if (payload.eventType === 'UPDATE') {
                // 留言更新（如点赞）
                setMessages(prev => prev.map(msg =>
                    msg.id === payload.new.id
                        ? {
                            ...msg,
                            likes: payload.new.likes,
                            replies: payload.new.replies
                        }
                        : msg
                ));
            } else if (payload.eventType === 'DELETE') {
                // 留言删除
                setMessages(prev => prev.filter(msg => msg.id !== payload.old.id));
            }
        });

        const topicsSubscription = communityService.subscribeToTopics((payload) => {
            console.log('话题实时更新:', payload);
            setLastUpdate(new Date());

            if (payload.eventType === 'INSERT') {
                // 新话题插入
                const newTopic = {
                    id: payload.new.id,
                    title: payload.new.title,
                    description: payload.new.description,
                    messages: payload.new.messages || 0,
                    participants: payload.new.participants || 0,
                    lastActivity: new Date(payload.new.last_activity),
                    trending: payload.new.trending,
                    createdBy: payload.new.created_by
                };
                setTopics(prev => [newTopic, ...prev]);
            } else if (payload.eventType === 'UPDATE') {
                // 话题更新
                setTopics(prev => prev.map(topic =>
                    topic.id === payload.new.id
                        ? {
                            ...topic,
                            messages: payload.new.messages || 0,
                            participants: payload.new.participants || 0,
                            lastActivity: new Date(payload.new.last_activity),
                            trending: payload.new.trending
                        }
                        : topic
                ));
            } else if (payload.eventType === 'DELETE') {
                // 话题删除
                setTopics(prev => prev.filter(topic => topic.id !== payload.old.id));
            }
        });

        // 监听连接状态
        setIsRealtimeConnected(true);

        // 清理订阅
        return () => {
            setIsRealtimeConnected(false);
            communityService.unsubscribe(messagesSubscription);
            communityService.unsubscribe(topicsSubscription);
        };
    }, []);

    const formatTime = (date: Date) => {
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / (1000 * 60));

        if (minutes < 1) return '刚刚';
        if (minutes < 60) return `${minutes}分钟前`;
        if (minutes < 1440) return `${Math.floor(minutes / 60)}小时前`;
        return `${Math.floor(minutes / 1440)}天前`;
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {/* 实时状态指示器 */}
            <RealtimeIndicator
                isConnected={isRealtimeConnected}
                lastUpdate={lastUpdate}
            />
            {/* Hero Section */}
            <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-white/30 backdrop-blur-sm"></div>
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-center"
                    >
                        <h1 className="text-4xl md:text-6xl font-bold text-slate-800 mb-6">
                            社区广场
                            <span className="block text-2xl md:text-3xl text-slate-600 mt-2">
                                Community Plaza
                            </span>
                        </h1>
                        <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                            连接全球用户，分享交易心得，共建活跃社区
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Tab Navigation */}
                <div className="flex justify-center mb-8">
                    <div className="bg-white/75 backdrop-blur-md rounded-full p-1 border border-white/90">
                        <button
                            onClick={() => setActiveTab('messages')}
                            className={`px-6 py-3 rounded-full transition-all duration-300 ${activeTab === 'messages'
                                    ? 'bg-blue-600/90 backdrop-blur-sm text-white shadow-lg border border-blue-700/90'
                                    : 'text-slate-700 hover:text-slate-900 hover:bg-white/75'
                                }`}
                        >
                            <MessageSquare className="w-5 h-5 inline-block mr-2" />
                            实时留言
                        </button>
                        <button
                            onClick={() => setActiveTab('topics')}
                            className={`px-6 py-3 rounded-full transition-all duration-300 ${activeTab === 'topics'
                                    ? 'bg-blue-600/90 backdrop-blur-sm text-white shadow-lg border border-blue-700/90'
                                    : 'text-slate-700 hover:text-slate-900 hover:bg-white/75'
                                }`}
                        >
                            <Users className="w-5 h-5 inline-block mr-2" />
                            话题讨论
                        </button>
                    </div>
                </div>

                {/* Messages Tab */}
                {activeTab === 'messages' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="space-y-6"
                    >
                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-50/90 backdrop-blur-md border border-red-200 rounded-2xl p-4 flex items-center gap-3">
                                <AlertCircle className="w-5 h-5 text-red-500" />
                                <span className="text-red-700">{error}</span>
                                <button
                                    onClick={() => setError(null)}
                                    className="ml-auto text-red-500 hover:text-red-700"
                                >
                                    ×
                                </button>
                            </div>
                        )}

                        {/* Message Input */}
                        <div className="bg-white/75 backdrop-blur-md rounded-2xl p-6 border border-white/90">
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <textarea
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="分享你的想法..."
                                        className="w-full bg-white/85 border border-gray-700/80 rounded-xl px-4 py-3 text-slate-800 placeholder-gray-600 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:bg-white/90 backdrop-blur-sm"
                                        rows={3}
                                        disabled={loading}
                                        maxLength={500}
                                    />
                                    <div className="text-right text-sm text-slate-500 mt-1">
                                        {newMessage.length}/500
                                    </div>
                                </div>
                                <button
                                    onClick={handleSendMessage}
                                    disabled={loading || !newMessage.trim()}
                                    className="bg-blue-600/90 backdrop-blur-sm border border-blue-700/90 hover:bg-blue-700/95 disabled:bg-gray-400/90 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl transition-all duration-300 flex items-center gap-2 h-fit shadow-lg"
                                >
                                    {loading ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <Send className="w-5 h-5" />
                                    )}
                                    发送
                                </button>
                            </div>
                        </div>

                        {/* Messages List */}
                        <div className="space-y-4">
                            {loading && messages.length === 0 ? (
                                <div className="flex justify-center py-12">
                                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="text-center py-12 text-slate-500">
                                    暂无留言，快来发表第一条留言吧！
                                </div>
                            ) : (
                                messages.map((message) => (
                                    <motion.div
                                        key={message.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="bg-white/75 backdrop-blur-md rounded-2xl p-6 hover:bg-white/85 transition-all duration-300 border border-white/90"
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 bg-blue-500/20 backdrop-blur-sm border border-blue-200/30 rounded-full flex items-center justify-center text-slate-800 font-bold">
                                                {message.username[0]}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <h3 className="text-slate-800 font-semibold">{message.username}</h3>
                                                    <span className="text-slate-500 text-sm flex items-center gap-1">
                                                        <Clock className="w-4 h-4" />
                                                        {formatTime(message.timestamp)}
                                                    </span>
                                                </div>
                                                <p className="text-slate-600 mb-3">{message.content}</p>
                                                <div className="flex items-center gap-4">
                                                    <button
                                                        onClick={() => handleLikeMessage(message.id)}
                                                        className="flex items-center gap-1 text-slate-500 hover:text-pink-500 transition-colors"
                                                    >
                                                        <Heart className="w-4 h-4" />
                                                        {message.likes}
                                                    </button>
                                                    <button className="flex items-center gap-1 text-slate-500 hover:text-blue-500 transition-colors">
                                                        <MessageSquare className="w-4 h-4" />
                                                        {message.replies}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </motion.div>
                )}

                {/* Topics Tab */}
                {activeTab === 'topics' && (
                    <AnimatePresence mode="wait">
                        {selectedTopic ? (
                            <TopicDetail
                                key="topic-detail"
                                topic={selectedTopic}
                                onBack={handleBackToTopics}
                                currentUser={currentUser}
                            />
                        ) : (
                            <motion.div
                                key="topics-list"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.5 }}
                                className="space-y-6"
                            >
                                {/* 创建话题按钮 */}
                                <div className="flex justify-end">
                                    <button
                                        onClick={() => setShowCreateTopic(true)}
                                        className="bg-blue-600/90 backdrop-blur-sm border border-blue-700/90 hover:bg-blue-700/95 text-white px-6 py-3 rounded-xl transition-all duration-300 flex items-center gap-2 shadow-lg"
                                    >
                                        <Plus className="w-5 h-5" />
                                        创建话题
                                    </button>
                                </div>

                                {/* 话题列表 */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {topics.length === 0 ? (
                                        <div className="col-span-full text-center py-12 text-slate-500">
                                            暂无话题，快来创建第一个话题吧！
                                        </div>
                                    ) : (
                                        topics.map((topic) => (
                                            <motion.div
                                                key={topic.id}
                                                whileHover={{ scale: 1.02 }}
                                                onClick={() => handleTopicClick(topic)}
                                                className="bg-white/75 backdrop-blur-md rounded-2xl p-6 hover:bg-white/85 transition-all duration-300 cursor-pointer border border-white/90"
                                            >
                                                <div className="flex items-start justify-between mb-4">
                                                    <h3 className="text-slate-800 font-bold text-lg">{topic.title}</h3>
                                                    {topic.trending && (
                                                        <div className="bg-orange-500/20 backdrop-blur-sm border border-orange-200/30 text-orange-600 px-2 py-1 rounded-full text-xs flex items-center gap-1">
                                                            <TrendingUp className="w-3 h-3" />
                                                            热门
                                                        </div>
                                                    )}
                                                </div>
                                                <p className="text-slate-600 mb-4 line-clamp-2">{topic.description}</p>
                                                <div className="flex items-center justify-between text-sm text-slate-500">
                                                    <div className="flex items-center gap-4">
                                                        <span className="flex items-center gap-1">
                                                            <MessageSquare className="w-4 h-4" />
                                                            {topic.messages}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Users className="w-4 h-4" />
                                                            {topic.participants}
                                                        </span>
                                                    </div>
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="w-4 h-4" />
                                                        {formatTime(topic.lastActivity)}
                                                    </span>
                                                </div>
                                                <div className="mt-3 text-xs text-slate-400">
                                                    创建者: {topic.createdBy}
                                                </div>
                                            </motion.div>
                                        ))
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                )}

                {/* 创建话题表单弹窗 */}
                <AnimatePresence>
                    {showCreateTopic && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                        >
                            <div className="max-w-2xl w-full">
                                <CreateTopicForm
                                    onSubmit={handleCreateTopic}
                                    onCancel={() => setShowCreateTopic(false)}
                                    isSubmitting={isCreatingTopic}
                                />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default CommunityPage;