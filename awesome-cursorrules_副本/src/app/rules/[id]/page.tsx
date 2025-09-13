import Link from 'next/link';
import { ArrowLeft, Eye, Calendar, Star, Copy, Download, Share2, Tag } from 'lucide-react';
import { dbQueries } from '@/lib/database';
import { notFound } from 'next/navigation';
import RuleDetailClient from '@/components/RuleDetailClient';

interface RulePageProps {
    params: {
        id: string;
    };
}

export default function RulePage({ params }: RulePageProps) {
    const ruleId = parseInt(params.id);
    
    if (isNaN(ruleId)) {
        notFound();
    }

    const rule = dbQueries.getRuleById(ruleId.toString());
    
    if (!rule) {
        notFound();
    }

    // 增加浏览量
    dbQueries.incrementViews(ruleId.toString());

    // 获取相关规则
    const relatedRules = dbQueries.getRules({ categoryId: rule.category_id, limit: 3 });

    // 获取分类信息
    const categories = dbQueries.getCategories();
    const category = categories.find(cat => cat.id === rule.category_id);
    const parentCategory = category?.parent_id 
        ? categories.find(cat => cat.id === category.parent_id)
        : null;

    // 面包屑导航
    const breadcrumbs = [
        { name: '首页', href: '/' },
        { name: '分类浏览', href: '/categories' },
        ...(parentCategory ? [{ name: parentCategory.name, href: `/categories/${parentCategory.slug}` }] : []),
        { name: category?.name || '', href: `/categories/${category?.slug}` },
        { name: rule.title, href: `/rules/${rule.id}` }
    ];

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
                            <Link href="/categories" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                                分类浏览
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* 面包屑导航 */}
            <div className="bg-white/60 backdrop-blur-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <nav className="flex" aria-label="Breadcrumb">
                        <ol className="flex items-center space-x-2">
                            {breadcrumbs.map((item, index) => (
                                <li key={item.href} className="flex items-center">
                                    {index > 0 && (
                                        <span className="mx-2 text-gray-400">/</span>
                                    )}
                                    {index === breadcrumbs.length - 1 ? (
                                        <span className="text-gray-900 font-semibold truncate">
                                            {item.name}
                                        </span>
                                    ) : (
                                        <Link
                                            href={item.href}
                                            className="text-blue-600 hover:text-blue-800 transition-colors truncate font-medium"
                                        >
                                            {item.name}
                                        </Link>
                                    )}
                                </li>
                            ))}
                        </ol>
                    </nav>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* 主内容区 */}
                    <div className="lg:col-span-3">
                        {/* 规则标题和元信息 */}
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 shadow-lg p-8 mb-8">
                            <div className="flex items-start justify-between mb-6">
                                <div className="flex-1">
                                    <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4">
                                        {rule.title}
                                    </h1>
                                    {rule.description && (
                                        <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                                            {rule.description}
                                        </p>
                                    )}
                                </div>
                                <div className="flex items-center text-yellow-500 ml-4">
                                    <Star className="h-7 w-7 fill-current drop-shadow-sm" />
                                </div>
                            </div>

                            {/* 元信息 */}
                            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 mb-6">
                                <div className="flex items-center bg-gray-50 px-3 py-2 rounded-lg">
                                    <Eye className="h-4 w-4 mr-2 text-blue-500" />
                                    <span className="font-medium">{rule.views || 0} 次查看</span>
                                </div>
                                <div className="flex items-center bg-gray-50 px-3 py-2 rounded-lg">
                                    <Calendar className="h-4 w-4 mr-2 text-green-500" />
                                    <span className="font-medium">{new Date(rule.created_at).toLocaleDateString('zh-CN')}</span>
                                </div>
                                {category && (
                                    <Link
                                        href={`/categories/${category.slug}`}
                                        className="flex items-center bg-gradient-to-r from-blue-50 to-purple-50 px-3 py-2 rounded-lg hover:from-blue-100 hover:to-purple-100 transition-all duration-200 group"
                                    >
                                        <span className="mr-2 text-lg">{category.icon}</span>
                                        <span className="font-medium text-gray-700 group-hover:text-blue-600">{category.name}</span>
                                    </Link>
                                )}
                            </div>

                            {/* 标签 */}
                            {rule.tags && rule.tags.length > 0 && (
                                <div className="flex flex-wrap gap-3 mb-6">
                                    {rule.tags.map((tag, index) => (
                                        <span
                                            key={index}
                                            className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-200 shadow-sm"
                                        >
                                            <Tag className="h-3 w-3 mr-2" />
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* 操作按钮 */}
                            <div className="flex flex-wrap gap-4">
                                <button className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                                    <Copy className="h-4 w-4 mr-2" />
                                    复制规则
                                </button>
                                <button className="flex items-center px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm hover:shadow-md">
                                    <Download className="h-4 w-4 mr-2" />
                                    下载
                                </button>
                                <button className="flex items-center px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm hover:shadow-md">
                                    <Share2 className="h-4 w-4 mr-2" />
                                    分享
                                </button>
                            </div>
                        </div>

                        {/* 规则内容 */}
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 shadow-lg p-8">
                            <RuleDetailClient content={rule.content} />
                        </div>
                    </div>

                    {/* 侧边栏 */}
                    <div className="lg:col-span-1">
                        {/* 相关规则 */}
                        {relatedRules.length > 0 && (
                            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 shadow-lg p-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                                    <span className="w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full mr-3"></span>
                                    相关规则
                                </h3>
                                <div className="space-y-4">
                                    {relatedRules.map((relatedRule) => (
                                        <Link
                                            key={relatedRule.id}
                                            href={`/rules/${relatedRule.id}`}
                                            className="block group"
                                        >
                                            <div className="p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all duration-200 bg-gradient-to-r from-gray-50 to-blue-50 group-hover:from-blue-50 group-hover:to-purple-50">
                                                <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 mb-2 line-clamp-2 transition-colors">
                                                    {relatedRule.title}
                                                </h4>
                                                <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                                                    {relatedRule.description || '暂无描述'}
                                                </p>
                                                <div className="flex items-center text-xs text-gray-500">
                                                    <Eye className="h-3 w-3 mr-1 text-blue-500" />
                                                    <span className="font-medium">{relatedRule.views || 0} 次查看</span>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}