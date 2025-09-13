import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Gift, 
  Trophy,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Zap,
  Database,
  BarChart3,
  Dog,
  Shield,
  Play,
  ChevronDown,
  ChevronUp,
  Info,
  Users,
  Target,
  Star,
  Clock,
  Award,
  HelpCircle
} from 'lucide-react';
import { useLotteryStore, useUserStore } from '../store';
import { Link } from 'react-router-dom';
import Carousel from '../components/ui/Carousel';

// VibeDoge奖品列表 - 按稀有度分组
const PRIZE_CATEGORIES = {
  common: {
    title: '普通奖品',
    description: '45% 概率获得',
    color: 'from-blue-500 to-blue-600',
    bgColor: 'from-blue-50 to-blue-100',
    borderColor: 'border-blue-400',
    icon: '🐕',
    prizes: [
      {
        name: 'VibeDoge 1个月会员',
        description: '体验VibeDoge基础功能',
        value: '1个月',
        icon: '🐕',
        benefits: ['基础功能', '社区访问', '学习资源']
      },
      {
        name: 'VibeDoge 学习资料包',
        description: '精选编程学习资源合集',
        value: '学习资料',
        icon: '📚',
        benefits: ['视频教程', '代码示例', '实战项目']
      },
      {
        name: '代码模板库访问',
        description: '高级代码模板库使用权',
        value: '1个月',
        icon: '📝',
        benefits: ['模板下载', '自定义修改', '社区分享']
      },
      {
        name: '开发者工具包',
        description: '开发者必备工具集合',
        value: '基础版',
        icon: '🛠️',
        benefits: ['开发工具', '调试插件', '效率提升']
      }
    ]
  },
  rare: {
    title: '稀有奖品',
    description: '30% 概率获得',
    color: 'from-purple-500 to-purple-600',
    bgColor: 'from-purple-50 to-purple-100',
    borderColor: 'border-purple-400',
    icon: '🌟',
    prizes: [
      {
        name: 'VibeDoge 6个月会员',
        description: '解锁高级功能和优先支持',
        value: '6个月',
        icon: '🌟',
        benefits: ['高级功能', '优先支持', '专属内容', 'VIP社群']
      },
      {
        name: '代码审查券',
        description: '专业工程师代码审查服务',
        value: '1次',
        icon: '🔍',
        benefits: ['深度分析', '优化建议', '最佳实践']
      },
      {
        name: '技术咨询服务',
        description: '一对一技术咨询指导',
        value: '30分钟',
        icon: '💡',
        benefits: ['问题诊断', '方案设计', '实施指导']
      },
      {
        name: '开源项目贡献指导',
        description: '专业开源项目贡献指导',
        value: '1个项目',
        icon: '🌐',
        benefits: ['贡献指导', '社区建设', '技术提升']
      }
    ]
  },
  epic: {
    title: '史诗奖品',
    description: '20% 概率获得',
    color: 'from-yellow-500 to-orange-500',
    bgColor: 'from-yellow-50 to-orange-50',
    borderColor: 'border-yellow-400',
    icon: '👑',
    prizes: [
      {
        name: 'VibeDoge 年度会员',
        description: '全年VIP专享特权',
        value: '12个月',
        icon: '👑',
        benefits: ['所有功能', 'VIP支持', '线下活动', '专属顾问']
      },
      {
        name: '项目架构设计',
        description: '专业项目架构设计服务',
        value: '1个项目',
        icon: '🏗️',
        benefits: ['架构设计', '技术选型', '性能优化', '安全方案']
      },
      {
        name: '技术导师计划',
        description: '一对一技术导师指导',
        value: '3个月',
        icon: '🎓',
        benefits: ['定期指导', '职业规划', '技能提升', '项目实战']
      },
      {
        name: '技术演讲培训',
        description: '专业演讲技能培训',
        value: '1次',
        icon: '🎤',
        benefits: ['演讲技巧', '表达训练', '自信提升']
      }
    ]
  },
  legendary: {
    title: '传说奖品',
    description: '5% 概率获得',
    color: 'from-pink-500 to-violet-500',
    bgColor: 'from-pink-50 to-violet-50',
    borderColor: 'border-pink-400',
    icon: '💎',
    prizes: [
      {
        name: 'VibeDoge 终身会员',
        description: '永久尊享所有功能',
        value: '终身',
        icon: '💎',
        benefits: ['终身权限', '专属顾问', '股权奖励', '优先体验新功能']
      },
      {
        name: 'AI训练模型访问',
        description: '高级AI模型无限使用权',
        value: 'unlimited',
        icon: '🤖',
        benefits: ['无限使用', '模型定制', 'API访问', '技术支持']
      },
      {
        name: '创业技术顾问',
        description: '专属创业技术顾问服务',
        value: '6个月',
        icon: '🚀',
        benefits: ['技术战略', '团队建设', '融资指导', '资源对接']
      },
      {
        name: '技术合伙人机会',
        description: '优质项目技术合伙人面试机会',
        value: '面试机会',
        icon: '🤝',
        benefits: ['项目合作', '股权机会', '人脉拓展', '职业发展']
      }
    ]
  }
};

// 奖品轮播组件
const PrizeCarousel: React.FC<{ category: keyof typeof PRIZE_CATEGORIES }> = ({ category }) => {
  const categoryData = PRIZE_CATEGORIES[category];

  return (
    <div className={`p-6 rounded-xl border-2 ${categoryData.borderColor} bg-gradient-to-br ${categoryData.bgColor}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="text-3xl">{categoryData.icon}</div>
          <div>
            <h4 className="text-lg font-bold bg-gradient-to-r bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(to right, ${categoryData.color.split(' ')[0].replace('from-', '#')}, ${categoryData.color.split(' ')[1].replace('to-', '#')})` }}>
              {categoryData.title}
            </h4>
            <p className="text-sm text-gray-600">{categoryData.description}</p>
          </div>
        </div>
        <div className="text-xs font-medium px-3 py-1 rounded-full bg-white/60">
          {categoryData.prizes.length} 个奖品
        </div>
      </div>

      <Carousel
        autoPlay={false}
        showDots={true}
        showArrows={true}
        className="h-64"
      >
        {categoryData.prizes.map((prize, index) => (
          <div key={index} className="h-full flex flex-col justify-between">
            <div className="flex items-start space-x-4">
              <div className="text-5xl">{prize.icon}</div>
              <div className="flex-1">
                <h5 className="text-lg font-semibold text-gray-900 mb-2">{prize.name}</h5>
                <p className="text-sm text-gray-600 mb-3">{prize.description}</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {prize.benefits.map((benefit, idx) => (
                    <span key={idx} className="text-xs bg-white/80 px-3 py-1 rounded-full text-gray-700 font-medium">
                      {benefit}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-900 bg-white/60 px-3 py-1 rounded-lg">
                    {prize.value}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </Carousel>
    </div>
  );
};

const LotteryDetailPage: React.FC = () => {
  const {
    userLotteries,
    globalStats,
    drawLottery,
    generateLotteryId,
    loadUserLotteries: getUserLotteries,
    loadUserLotteryInfo: getUserLotteryInfo,
    loadGlobalStats: getGlobalStats
  } = useLotteryStore();

  const { mcpUser, initializeMCPUser, registerUser, remainingDraws, useDraw, setRemainingDraws, clearSession } = useUserStore();

  const [loading, setLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [drawResult, setDrawResult] = useState<any>(null);
  const [isGeneratingLottery, setIsGeneratingLottery] = useState(false);

  // MCP用户状态
  const isMcpUser = !!mcpUser;

  useEffect(() => {
    // 初始化MCP用户
    if (!isMcpUser) {
      initializeMCPUser();
    }
  }, [isMcpUser, initializeMCPUser]);

  useEffect(() => {
    if (isMcpUser) {
      loadUserData();
    }
  }, [isMcpUser]);

  const loadUserData = async () => {
    if (!mcpUser?.id) return;

    try {
      await Promise.all([
        getUserLotteries(mcpUser.id),
        getGlobalStats()
      ]);
      
      // 加载用户抽奖信息以同步剩余抽奖次数
      const lotteryInfo = await getUserLotteryInfo(mcpUser.id);
      if (lotteryInfo) {
        const { remainingDraws } = lotteryInfo.lotteryStats;
        // 更新用户store中的剩余抽奖次数
        useUserStore.getState().setRemainingDraws(remainingDraws);
      }
    } catch (error) {
      console.error('加载用户数据失败:', error);
    }
  };

  const handleRegisterMCPUser = async () => {
    setLoading(true);
    try {
      const result = await registerUser();
      if (result.success) {
        await loadUserData();
      }
    } catch (error) {
      console.error('注册失败:', error);
      alert('注册失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleDrawLottery = async () => {
    if (!mcpUser?.isRegistered) {
      alert('请先注册以获得抽奖机会');
      return;
    }

    // 无限抽奖模式 - 不需要检查剩余次数
    setLoading(true);
    setIsGeneratingLottery(true);
    try {
      // 生成抽奖ID
      const lotteryResult = await generateLotteryId(mcpUser.id);
      if (!lotteryResult.success || !lotteryResult.lotteryId) {
        alert(lotteryResult.error || '生成抽奖ID失败');
        return;
      }

      // 无限抽奖模式 - 直接执行抽奖，不需要使用抽奖机会
      const result = await drawLottery(lotteryResult.lotteryId, mcpUser.id);
      if (result.success && result.prize) {
        setDrawResult({
          prize: result.prize,
          drawTime: new Date().toISOString()
        });
        setShowResult(true);
        await loadUserData();

        // 5秒后自动关闭结果
        setTimeout(() => {
          setShowResult(false);
          setDrawResult(null);
        }, 5000);
      }
    } catch (error) {
      console.error('抽奖失败:', error);
      alert('抽奖失败，请稍后重试');
    } finally {
      setLoading(false);
      setIsGeneratingLottery(false);
    }
  };

  const completedLotteries = userLotteries.filter(lottery => lottery.status === 'completed');

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-amber-50">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-md border-b border-purple-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link to="/" className="flex items-center text-purple-600 hover:text-purple-800 transition-colors group">
                <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                返回首页
              </Link>
              <div className="h-6 w-px bg-purple-200"></div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <Dog className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Vibe 抽奖中心
                  </h1>
                  <p className="text-xs text-purple-500">MCP 专享体验</p>
                </div>
              </div>
            </div>

            {isMcpUser && (
              <div className="flex items-center space-x-2 bg-gradient-to-r from-purple-100 to-pink-100 px-4 py-2 rounded-full border border-purple-300">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-purple-700">MCP用户</span>
                <span className="text-xs text-purple-500 font-mono">{mcpUser.id.slice(-8)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-600 via-pink-600 to-amber-600 rounded-3xl p-8 mb-8 text-white shadow-2xl relative overflow-hidden"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-20 h-20 bg-white rounded-full"></div>
            <div className="absolute top-32 right-20 w-16 h-16 bg-white rounded-full"></div>
            <div className="absolute bottom-10 left-1/3 w-12 h-12 bg-white rounded-full"></div>
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mr-3">
                    <Zap className="h-6 w-6 text-yellow-300" />
                  </div>
                  <span className="bg-white/20 text-white px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">
                    限时专享
                  </span>
                </div>
                <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-white to-yellow-200 bg-clip-text text-transparent">
                  Vibe 抽奖体验
                </h2>
                <p className="text-lg text-purple-100 mb-6 max-w-2xl">
                  作为 Model Context Protocol 用户，您拥有专属的免费抽奖特权，赢取丰富的 Vibe 生态奖励
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-xl">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-300 mr-2" />
                      <span className="text-sm font-medium text-white">完全免费</span>
                    </div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-300 mr-2" />
                      <span className="text-sm font-medium text-white">即时开奖</span>
                    </div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-300 mr-2" />
                      <span className="text-sm font-medium text-white">真实有效</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="hidden lg:block">
                <motion.div 
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="text-8xl"
                >
                  🎁
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          {/* Left Panel - User Info & Actions */}
          <div className="xl:col-span-4 space-y-6">
            {/* User Status Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl shadow-lg border border-purple-100 overflow-hidden"
            >
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4">
                <h3 className="text-lg font-semibold text-white flex items-center">
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center mr-2">
                    <Database className="h-4 w-4 text-white" />
                  </div>
                  用户中心
                </h3>
              </div>
              
              <div className="p-6">
                {!isMcpUser ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <AlertCircle className="h-8 w-8 text-purple-400" />
                    </div>
                    <p className="text-gray-600 mb-4">您还不是 MCP 用户</p>
                    <div className="space-y-3">
                      <button
                        onClick={handleRegisterMCPUser}
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 disabled:opacity-50 shadow-lg hover:shadow-xl"
                      >
                        {loading ? '注册中...' : '注册 MCP 用户'}
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('确定要清除所有数据并重新开始吗？')) {
                            clearSession();
                            setTimeout(() => initializeMCPUser(), 100);
                          }
                        }}
                        className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm py-2 px-4 rounded-lg transition-colors"
                      >
                        🔄 重置用户数据
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </div>
                        <span className="text-green-800 font-medium">注册状态</span>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        mcpUser.isRegistered 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {mcpUser.isRegistered ? '已注册' : '未注册'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <Gift className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <span className="text-blue-800 font-medium block">剩余次数</span>
                          <span className="text-xs text-blue-600">可抽奖机会</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">∞</div>
                        <div className="text-xs text-blue-500">无限次</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                        <div className="text-xs text-purple-600 mb-1">总抽奖</div>
                        <div className="text-lg font-bold text-purple-700">{userLotteries.length}</div>
                      </div>
                      <div className="p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200">
                        <div className="text-xs text-amber-600 mb-1">获奖次数</div>
                        <div className="text-lg font-bold text-amber-700">{completedLotteries.length}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Lottery Action Card */}
            {isMcpUser && (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl shadow-lg border border-purple-100 overflow-hidden"
              >
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-4">
                  <h3 className="text-lg font-semibold text-white flex items-center">
                    <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center mr-2">
                      <Play className="h-4 w-4 text-white" />
                    </div>
                    抽奖中心
                  </h3>
                </div>
                
                <div className="p-6">
                  {!mcpUser.isRegistered ? (
                    <button
                      onClick={handleRegisterMCPUser}
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      {loading ? (
                        <RefreshCw className="h-5 w-5 animate-spin" />
                      ) : (
                        <>
                          <Gift className="h-5 w-5" />
                          <span>注册获得 3 次抽奖机会</span>
                        </>
                      )}
                    </button>
                  ) : remainingDraws >= 999999 ? (
                    <div className="space-y-4">
                      <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
                        <div className="text-3xl font-bold text-blue-600 mb-2">∞</div>
                        <div className="text-sm text-blue-700 font-medium mb-1">无限抽奖机会</div>
                        <div className="text-xs text-blue-600">Vibe Coding MCP无限抽奖模式</div>
                        <div className="flex justify-center mt-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mx-1"></div>
                          <div className="w-2 h-2 bg-blue-500 rounded-full mx-1"></div>
                          <div className="w-2 h-2 bg-blue-500 rounded-full mx-1"></div>
                        </div>
                      </div>

                      <button
                        onClick={handleDrawLottery}
                        disabled={loading || isGeneratingLottery}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:scale-105"
                      >
                        {loading || isGeneratingLottery ? (
                          <RefreshCw className="h-5 w-5 animate-spin" />
                        ) : (
                          <>
                            <Zap className="h-5 w-5" />
                            <span>立即抽奖</span>
                          </>
                        )}
                      </button>
                    </div>
                  ) : remainingDraws > 0 ? (
                    <div className="space-y-4">
                      <div className="text-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
                        <div className="text-3xl font-bold text-green-600 mb-2">{remainingDraws}</div>
                        <div className="text-sm text-green-700 font-medium mb-1">剩余抽奖机会</div>
                        <div className="text-xs text-green-600">每次抽奖消耗 1 次机会</div>
                        <div className="flex justify-center mt-2">
                          {Array.from({ length: Math.min(remainingDraws, 5) }).map((_, i) => (
                            <div key={i} className="w-2 h-2 bg-green-500 rounded-full mx-1"></div>
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={handleDrawLottery}
                        disabled={loading || isGeneratingLottery}
                        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:scale-105"
                      >
                        {loading || isGeneratingLottery ? (
                          <RefreshCw className="h-5 w-5 animate-spin" />
                        ) : (
                          <>
                            <Zap className="h-5 w-5" />
                            <span>立即抽奖</span>
                          </>
                        )}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
                        <div className="text-3xl font-bold text-blue-600 mb-2">∞</div>
                        <div className="text-sm text-blue-700 font-medium mb-1">无限抽奖机会</div>
                        <div className="text-xs text-blue-600">Vibe Coding MCP无限抽奖模式</div>
                        <div className="flex justify-center mt-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mx-1"></div>
                          <div className="w-2 h-2 bg-blue-500 rounded-full mx-1"></div>
                          <div className="w-2 h-2 bg-blue-500 rounded-full mx-1"></div>
                        </div>
                      </div>

                      <button
                        onClick={handleDrawLottery}
                        disabled={loading || isGeneratingLottery}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:scale-105"
                      >
                        {loading || isGeneratingLottery ? (
                          <RefreshCw className="h-5 w-5 animate-spin" />
                        ) : (
                          <>
                            <Zap className="h-5 w-5" />
                            <span>立即抽奖</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>

          {/* Center Panel - Prize Display */}
          <div className="xl:col-span-5">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-lg border border-purple-100 h-full overflow-hidden"
            >
              <div className="bg-gradient-to-r from-amber-600 to-orange-600 p-4">
                <h3 className="text-xl font-bold text-white flex items-center">
                  <div className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center mr-3">
                    <Trophy className="h-5 w-5 text-white" />
                  </div>
                  Vibe 专享奖品
                </h3>
              </div>

              <div className="p-6 space-y-6 max-h-[800px] overflow-y-auto">
                <PrizeCarousel category="common" />
                <PrizeCarousel category="rare" />
                <PrizeCarousel category="epic" />
                <PrizeCarousel category="legendary" />
              </div>
            </motion.div>
          </div>

          {/* Right Panel - Stats & Records */}
          <div className="xl:col-span-3 space-y-6">
            {/* Global Stats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl shadow-lg border border-purple-100 overflow-hidden"
            >
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4">
                <h3 className="text-lg font-semibold text-white flex items-center">
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center mr-2">
                    <BarChart3 className="h-4 w-4 text-white" />
                  </div>
                  数据统计
                </h3>
              </div>

              <div className="p-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                    <div className="text-xl font-bold text-blue-600">{globalStats?.totalUsers || 0}</div>
                    <div className="text-xs text-blue-700 font-medium">参与用户</div>
                  </div>
                  <div className="text-center p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
                    <div className="text-xl font-bold text-green-600">{globalStats?.totalLotteries || 0}</div>
                    <div className="text-xs text-green-700 font-medium">总抽奖次数</div>
                  </div>
                  <div className="text-center p-3 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl border border-yellow-200">
                    <div className="text-xl font-bold text-yellow-600">{globalStats?.activeLotteries || 0}</div>
                    <div className="text-xs text-yellow-700 font-medium">待抽奖</div>
                  </div>
                  <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                    <div className="text-xl font-bold text-purple-600">{globalStats?.completedLotteries || 0}</div>
                    <div className="text-xs text-purple-700 font-medium">已完成</div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Lottery Records */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-lg border border-purple-100 overflow-hidden"
            >
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4">
                <h3 className="text-lg font-semibold text-white flex items-center">
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center mr-2">
                    <Database className="h-4 w-4 text-white" />
                  </div>
                  我的记录
                </h3>
              </div>
              
              <div className="p-4">
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {userLotteries.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Gift className="h-6 w-6 text-gray-400" />
                      </div>
                      <p className="text-gray-600">暂无抽奖记录</p>
                      <p className="text-sm text-gray-500">参与抽奖后记录会显示在这里</p>
                    </div>
                  ) : (
                    userLotteries.map((record, index) => (
                      <div key={index} className="p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-mono text-gray-600 bg-white px-2 py-1 rounded">
                            {record.lotteryId.slice(-8)}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            record.status === 'active'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-green-100 text-green-700'
                          }`}>
                            {record.status === 'active' ? '待抽奖' : '已完成'}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 mb-2">
                          {new Date(record.createdAt).toLocaleString()}
                        </div>
                        {record.prizeName && (
                          <div className="text-sm text-green-600 font-medium bg-green-50 px-2 py-1 rounded">
                            🎁 {record.prizeName}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* MCP 抽奖规则说明 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="xl:col-span-12"
      >
        <div className="bg-white rounded-2xl shadow-lg border border-blue-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4">
            <h3 className="text-xl font-bold text-white flex items-center">
              <div className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center mr-3">
                <HelpCircle className="h-5 w-5 text-white" />
              </div>
              Vibe Coding MCP 抽奖服务使用规则
            </h3>
          </div>
          
          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* 左侧：基本规则 */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Info className="h-5 w-5 text-blue-600 mr-2" />
                  基本规则
                </h4>
                
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Users className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">用户身份</p>
                      <p className="text-xs text-gray-600">系统自动生成MCP用户ID，无需注册即可开始抽奖</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Target className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">抽奖模式</p>
                      <p className="text-xs text-gray-600">当前为<strong className="text-purple-600">无限抽奖模式</strong>，可无限制参与抽奖</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Star className="h-4 w-4 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">奖品丰富</p>
                      <p className="text-xs text-gray-600">包含会员、学习资料、技术服务等多种VibeDoge生态奖品</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* 右侧：技术说明 */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Database className="h-5 w-5 text-purple-600 mr-2" />
                  技术架构
                </h4>
                
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Clock className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">MCP协议</p>
                      <p className="text-xs text-gray-600">基于Model Context Protocol构建的现代化抽奖服务</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Award className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">数据持久化</p>
                      <p className="text-xs text-gray-600">使用Supabase数据库确保抽奖记录安全可靠</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Zap className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">实时同步</p>
                      <p className="text-xs text-gray-600">抽奖结果实时保存，支持历史记录查询</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* 底部提示 */}
            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <HelpCircle className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">提示</p>
                  <p className="text-xs text-gray-600">本系统为Vibe Coding专属抽奖服务，所有奖品均为虚拟数字产品，请在抽奖前仔细阅读奖品说明。</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 抽奖结果弹窗 */}
      <AnimatePresence>
        {showResult && drawResult && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowResult(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-2xl p-8 max-w-md w-full text-center"
              onClick={e => e.stopPropagation()}
            >
              <div className="text-6xl mb-4">{drawResult.prize.icon}</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">🎉 恭喜中奖！</h2>
              <div className={`text-lg font-semibold mb-2 bg-gradient-to-r ${drawResult.prize.color} bg-clip-text text-transparent`}>
                {drawResult.prize.name}
              </div>
              <p className="text-gray-600 mb-4">{drawResult.prize.description}</p>
              <div className="text-sm text-gray-500 mb-6">
                抽奖时间: {new Date(drawResult.drawTime).toLocaleString()}
              </div>
              <button
                onClick={() => setShowResult(false)}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200"
              >
                确定
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LotteryDetailPage;