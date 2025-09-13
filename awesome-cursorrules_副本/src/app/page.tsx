'use client';

import Link from 'next/link';
import { Search, Code, Star, ArrowRight, TrendingUp, Users, BookOpen, Eye, Download, Github, Twitter, Linkedin } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function Home() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [categories, setCategories] = useState([]);
    const [popularRules, setPopularRules] = useState([]);
    
    // 获取数据
    useEffect(() => {
        const loadData = async () => {
            try {
                const [categoriesRes, rulesRes] = await Promise.all([
                    fetch('/api/categories'),
                    fetch('/api/rules/popular?limit=6')
                ]);
                
                if (categoriesRes.ok && rulesRes.ok) {
                    const categoriesData = await categoriesRes.json();
                    const rulesData = await rulesRes.json();
                    setCategories(categoriesData);
                    setPopularRules(rulesData);
                }
            } catch (error) {
                console.error('Failed to load data:', error);
            }
        };
        loadData();
    }, []);
    
    const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && searchQuery.trim()) {
            router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
        }
    };
    
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            {/* 导航栏 */}
            <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-2">
                            <Code className="h-8 w-8 text-blue-600" />
                            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">VibeDoge Rules</span>
                        </div>
                        <div className="hidden md:flex items-center space-x-6">
                            <Link href="/" className="text-blue-600 font-semibold">
                                首页
                            </Link>
                            <Link href="/categories" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                                分类浏览
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* 英雄区块 */}
            <section className="bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 text-white py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8">
                        全球 <span className="bg-gradient-to-r from-blue-200 to-purple-200 bg-clip-text text-transparent">Cursor Rules</span> 知识库
                    </h1>
                    <p className="text-xl md:text-2xl text-blue-100 mb-12 max-w-4xl mx-auto leading-relaxed">
                        发现并便用最佳的 Cursor Rules 提示词，提升你的编程效率和代码质量
                    </p>
                    <div className="relative max-w-2xl mx-auto mb-10">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-6 w-6" />
                        <input
                            type="text"
                            placeholder="搜索 Rules..."
                            className="w-full pl-12 pr-4 py-5 text-lg rounded-2xl border-0 text-gray-900 placeholder-gray-500 focus:ring-4 focus:ring-blue-300 shadow-2xl backdrop-blur-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={handleSearch}
                        />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-6 justify-center">
                        <Link
                            href="/categories"
                            className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-10 py-4 rounded-2xl font-semibold transition-all duration-300 shadow-xl border border-white/20 hover:scale-105"
                        >
                            浏览分类
                        </Link>
                        <Link
                            href="/search"
                            className="bg-white hover:bg-gray-50 text-blue-600 px-10 py-4 rounded-2xl font-semibold transition-all duration-300 shadow-xl hover:scale-105"
                        >
                            高级搜索
                        </Link>
                    </div>
                </div>
            </section>

            {/* 分类展示 */}
            <section className="py-20 bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
                            热门分类
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                            探索不同编程领域的 Cursor Rules，找到最适合你项目的提示词
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {categories.map((category) => (
                            <Link
                                key={category.id}
                                href={`/categories/${category.slug}`}
                                className="group bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-200 hover:border-blue-300 transform hover:-translate-y-2"
                            >
                                <div className="flex items-center mb-6">
                                    <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center group-hover:from-blue-200 group-hover:to-purple-200 transition-all duration-300 shadow-lg">
                                        <Code className="h-8 w-8 text-blue-600" />
                                    </div>
                                    <div className="ml-6 flex-1">
                                        <h3 className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                            {category.name}
                                        </h3>
                                        <p className="text-sm text-gray-500 font-medium">
                                            {category.rule_count} 个规则
                                        </p>
                                    </div>
                                </div>
                                <p className="text-gray-600 group-hover:text-gray-700 transition-colors leading-relaxed">
                                    {category.description}
                                </p>
                            </Link>
                        ))}
                    </div>
                    <div className="text-center mt-16">
                        <Link
                            href="/categories"
                            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-xl hover:scale-105"
                        >
                            查看所有分类
                            <ArrowRight className="ml-3 h-6 w-6" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* 热门规则 */}
            <section className="py-20 bg-gradient-to-br from-purple-50/30 via-white to-blue-50/30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-6">
                            热门规则
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                            社区最受欢迎的 Cursor Rules，经过实践验证的高质量提示词
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {popularRules.map((rule) => (
                            <Link
                                key={rule.id}
                                href={`/rules/${rule.slug}`}
                                className="group bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-200 hover:border-purple-300 transform hover:-translate-y-2"
                            >
                                <div className="flex items-start justify-between mb-6">
                                    <div className="flex-1">
                                        <h3 className="text-2xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors mb-2 line-clamp-2">
                                            {rule.title}
                                        </h3>
                                        <span className="inline-block px-3 py-1 bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 text-sm font-semibold rounded-full border border-purple-200">
                                            {rule.category_name}
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-1 text-sm text-gray-500 ml-4">
                                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                        <span className="font-medium">{rule.rating}</span>
                                    </div>
                                </div>
                                <p className="text-gray-600 group-hover:text-gray-700 transition-colors mb-6 line-clamp-3 leading-relaxed">
                                    {rule.description}
                                </p>
                                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                    <div className="flex items-center space-x-6">
                                        <div className="flex items-center text-blue-500">
                                            <Eye className="h-4 w-4 mr-2" />
                                            <span className="font-medium">{rule.views}</span>
                                        </div>
                                        <div className="flex items-center text-green-500">
                                            <Download className="h-4 w-4 mr-2" />
                                            <span className="font-medium">{rule.downloads}</span>
                                        </div>
                                    </div>
                                    <span className="text-gray-500 font-medium">
                                        {new Date(rule.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                    <div className="text-center mt-16">
                        <Link
                            href="/search"
                            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-xl hover:scale-105"
                        >
                            查看更多规则
                            <ArrowRight className="ml-3 h-6 w-6" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* 页脚 */}
            <footer className="bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
                        <div className="col-span-1 md:col-span-2">
                            <div className="flex items-center space-x-3 mb-6">
                                <Code className="h-10 w-10 text-blue-400" />
                                <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">VibeDoge Rules</span>
                            </div>
                            <p className="text-gray-300 mb-6 max-w-md text-lg leading-relaxed">
                                全球最大的 Cursor Rules 知识库，帮助开发者提升编程效率和代码质量。
                            </p>
                            <div className="flex space-x-6">
                                <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors transform hover:scale-110">
                                    <Github className="h-7 w-7" />
                                </a>
                                <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors transform hover:scale-110">
                                    <Twitter className="h-7 w-7" />
                                </a>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold mb-6 text-blue-300">快速链接</h3>
                            <ul className="space-y-3">
                                <li><Link href="/" className="text-gray-300 hover:text-white transition-colors text-lg">首页</Link></li>
                                <li><Link href="/categories" className="text-gray-300 hover:text-white transition-colors text-lg">分类浏览</Link></li>
                                <li><Link href="/search" className="text-gray-300 hover:text-white transition-colors text-lg">搜索</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold mb-6 text-purple-300">关于</h3>
                            <ul className="space-y-3">
                                <li><a href="#" className="text-gray-300 hover:text-white transition-colors text-lg">关于我们</a></li>
                                <li><a href="#" className="text-gray-300 hover:text-white transition-colors text-lg">联系我们</a></li>
                                <li><a href="#" className="text-gray-300 hover:text-white transition-colors text-lg">隐私政策</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-gray-700/50 mt-12 pt-8 text-center">
                        <p className="text-gray-400 text-lg">
                            &copy; 2024 VibeDoge Rules. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
