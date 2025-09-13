import Link from 'next/link';
import { Search, Filter, Grid, List } from 'lucide-react';
import { dbQueries } from '@/lib/database';

export default function CategoriesPage() {
    const categories = dbQueries.getCategories();
    const parentCategories = categories.filter(cat => !cat.parent_id);
    const childCategories = categories.filter(cat => cat.parent_id);
    
    // 按父分类组织子分类
    const categoriesWithChildren = parentCategories.map(parent => ({
        ...parent,
        children: childCategories.filter(child => child.parent_id === parent.id)
    }));

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            {/* 导航栏 */}
            <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link href="/" className="flex items-center space-x-2">
                            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">VibeDoge Rules</span>
                        </Link>
                        <div className="flex items-center space-x-6">
                            <Link href="/" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                                首页
                            </Link>
                            <Link href="/categories" className="text-blue-600 font-semibold">
                                分类浏览
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* 页面标题和搜索 */}
            <div className="bg-white/60 backdrop-blur-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
                        分类浏览
                    </h1>
                    <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                        按技术栈和用途浏览所有 Cursor Rules
                    </p>
                    
                    {/* 搜索和筛选 */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 h-5 w-5" />
                            <input
                                type="text"
                                placeholder="搜索分类或规则..."
                                className="w-full pl-10 pr-4 py-3 border border-blue-200 rounded-xl bg-white/80 backdrop-blur-sm text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all"
                            />
                        </div>
                        <div className="flex gap-3">
                            <button className="flex items-center px-6 py-3 border border-blue-200 rounded-xl bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-blue-50 hover:border-blue-300 transition-all shadow-sm">
                                <Filter className="h-5 w-5 mr-2 text-blue-500" />
                                筛选
                            </button>
                            <button className="flex items-center px-4 py-3 border border-blue-200 rounded-xl bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-blue-50 hover:border-blue-300 transition-all shadow-sm">
                                <Grid className="h-5 w-5 text-blue-500" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* 分类网格 */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="space-y-12">
                    {categoriesWithChildren.map((category) => (
                        <div key={category.id} className="">
                            {/* 主分类标题 */}
                            <div className="flex items-center mb-8 p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-100">
                                <div className="text-4xl mr-6 drop-shadow-sm">{category.icon}</div>
                                <div className="flex-1">
                                    <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                                        {category.name}
                                    </h2>
                                    <p className="text-gray-600 text-lg leading-relaxed">
                                        {category.description}
                                    </p>
                                </div>
                                <div className="ml-auto">
                                    <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 border border-blue-200">
                                        {category.rule_count} 个规则
                                    </span>
                                </div>
                            </div>

                            {/* 子分类网格 */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {/* 主分类卡片 */}
                                <Link
                                    href={`/categories/${category.slug}`}
                                    className="group p-6 bg-gradient-to-br from-white to-blue-50 rounded-2xl border border-blue-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                                >
                                    <div className="text-center">
                                        <div className="text-5xl mb-4 drop-shadow-sm">{category.icon}</div>
                                        <h3 className="font-bold text-gray-900 group-hover:text-blue-600 mb-3 text-lg">
                                            所有 {category.name}
                                        </h3>
                                        <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                                            查看所有 {category.name} 相关规则
                                        </p>
                                        <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-700 border border-blue-200">
                                            {category.rule_count} 个规则
                                        </div>
                                    </div>
                                </Link>

                                {/* 子分类卡片 */}
                                {category.children.map((child) => (
                                    <Link
                                        key={child.id}
                                        href={`/categories/${child.slug}`}
                                        className="group p-6 bg-gradient-to-br from-white to-purple-50 rounded-2xl border border-purple-200 hover:border-purple-300 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                                    >
                                        <div className="text-center">
                                            <div className="text-5xl mb-4 drop-shadow-sm">{child.icon}</div>
                                            <h3 className="font-bold text-gray-900 group-hover:text-purple-600 mb-3 text-lg">
                                                {child.name}
                                            </h3>
                                            <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                                                {child.description}
                                            </p>
                                            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-purple-100 text-purple-700 border border-purple-200">
                                                {child.rule_count} 个规则
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}