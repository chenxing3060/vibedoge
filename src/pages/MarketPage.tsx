import React, { useState, useEffect } from 'react';
import { BookOpen, Search, Code, FileText, Users, TrendingUp } from 'lucide-react';
import { Rule, RuleCategory, getAllRules, getRulesByCategory, searchRules, getRulesStats } from '../services/rulesService';

const MarketPage: React.FC = () => {
    const [rules, setRules] = useState<Rule[]>([]);
    const [categories, setCategories] = useState<RuleCategory[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRule, setSelectedRule] = useState<Rule | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [stats, setStats] = useState({ totalRules: 0, totalCategories: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [allRules, ruleCategories, rulesStats] = await Promise.all([
                getAllRules(),
                getRulesByCategory(),
                getRulesStats(),
            ]);
            setRules(allRules);
            setCategories(ruleCategories);
            setStats(rulesStats);
        } catch (error) {
            console.error('Error loading rules:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (query: string) => {
        setSearchQuery(query);
        if (query.trim()) {
            const searchResults = await searchRules(query);
            setRules(searchResults);
        } else {
            const allRules = await getAllRules();
            setRules(allRules);
        }
    };

    const handleCategoryFilter = (categoryName: string) => {
        setSelectedCategory(categoryName);
        if (categoryName === 'all') {
            getAllRules().then(setRules);
        } else {
            const category = categories.find(cat => cat.name === categoryName);
            if (category) {
                setRules(category.rules);
            }
        }
    };

    const filteredRules = selectedCategory === 'all' ? rules : 
        rules.filter(rule => rule.category === selectedCategory);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* 页面标题 */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        <BookOpen className="inline-block h-10 w-10 mr-3 text-blue-600" />
                        编程规则知识库
                    </h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        收集整理的编程最佳实践和代码规范，助力高质量代码开发
                    </p>
                </div>

                {/* 统计信息卡片 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">总规则数</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.totalRules}</p>
                            </div>
                            <FileText className="h-8 w-8 text-green-600" />
                        </div>
                    </div>

                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">分类数量</p>
                                <p className="text-2xl font-bold text-blue-600">{stats.totalCategories}</p>
                            </div>
                            <Code className="h-8 w-8 text-blue-600" />
                        </div>
                    </div>

                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">技术栈</p>
                                <p className="text-2xl font-bold text-gray-900">18+</p>
                            </div>
                            <TrendingUp className="h-8 w-8 text-purple-600" />
                        </div>
                    </div>
                </div>

                {/* 搜索栏 */}
                <div className="mb-8">
                    <div className="max-w-2xl mx-auto">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="搜索编程规则..."
                                value={searchQuery}
                                onChange={(e) => handleSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
                            />
                        </div>
                    </div>
                </div>

                {/* 分类筛选 */}
                <div className="mb-8">
                    <div className="flex flex-wrap justify-center gap-2">
                        <button
                            onClick={() => handleCategoryFilter('all')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                selectedCategory === 'all'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white/80 text-gray-700 hover:bg-blue-50'
                            }`}
                        >
                            全部
                        </button>
                        {categories.map((category) => (
                            <button
                                key={category.name}
                                onClick={() => handleCategoryFilter(category.name)}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                    selectedCategory === category.name
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-white/80 text-gray-700 hover:bg-blue-50'
                                }`}
                            >
                                {category.name} ({category.count})
                            </button>
                        ))}
                    </div>
                </div>

                {/* 规则列表 */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <p className="mt-2 text-gray-600">加载中...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                        {filteredRules.map((rule) => (
                            <div
                                key={rule.id}
                                className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-shadow cursor-pointer"
                                onClick={() => setSelectedRule(rule)}
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <h3 className="text-lg font-semibold text-gray-900">{rule.title}</h3>
                                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                                        {rule.category}
                                    </span>
                                </div>
                                <p className="text-gray-600 text-sm mb-4 line-clamp-3">{rule.description}</p>
                                {rule.globs && (
                                    <div className="text-xs text-gray-500 bg-gray-100 rounded px-2 py-1">
                                        适用: {rule.globs}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* 规则详情模态框 */}
                {selectedRule && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-xl max-w-4xl max-h-[80vh] overflow-hidden">
                            <div className="p-6 border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900">{selectedRule.title}</h2>
                                        <p className="text-gray-600 mt-1">{selectedRule.description}</p>
                                    </div>
                                    <button
                                        onClick={() => setSelectedRule(null)}
                                        className="text-gray-400 hover:text-gray-600 text-2xl"
                                    >
                                        ×
                                    </button>
                                </div>
                            </div>
                            <div className="p-6 overflow-y-auto max-h-[60vh]">
                                <div className="prose max-w-none">
                                    <pre className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">
                                        {selectedRule.content}
                                    </pre>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 功能说明 */}
                <div className="mt-12 text-center">
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 shadow-lg border border-white/20">
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">知识库功能</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
                            <div className="text-center">
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                                    <Search className="h-6 w-6 text-blue-600" />
                                </div>
                                <h4 className="font-semibold text-gray-900 mb-2">智能搜索</h4>
                                <p className="text-sm text-gray-600">快速查找所需的编程规则</p>
                            </div>
                            <div className="text-center">
                                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                                    <Code className="h-6 w-6 text-green-600" />
                                </div>
                                <h4 className="font-semibold text-gray-900 mb-2">分类管理</h4>
                                <p className="text-sm text-gray-600">按技术栈分类整理规则</p>
                            </div>
                            <div className="text-center">
                                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                                    <FileText className="h-6 w-6 text-purple-600" />
                                </div>
                                <h4 className="font-semibold text-gray-900 mb-2">详细文档</h4>
                                <p className="text-sm text-gray-600">完整的最佳实践指南</p>
                            </div>
                            <div className="text-center">
                                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                                    <Users className="h-6 w-6 text-orange-600" />
                                </div>
                                <h4 className="font-semibold text-gray-900 mb-2">团队协作</h4>
                                <p className="text-sm text-gray-600">统一的代码规范标准</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MarketPage;