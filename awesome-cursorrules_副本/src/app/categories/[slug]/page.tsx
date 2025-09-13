import Link from 'next/link';
import { ArrowLeft, Search, Filter, Grid, List, Star, Eye, Calendar } from 'lucide-react';
import { dbQueries } from '@/lib/database';
import { notFound } from 'next/navigation';

interface CategoryPageProps {
    params: {
        slug: string;
    };
}

export default function CategoryPage({ params }: CategoryPageProps) {
    const category = dbQueries.getCategoryBySlug(params.slug);
    
    if (!category) {
        notFound();
    }

    const rules = dbQueries.getRules({ categoryId: category.id });

    const categories = dbQueries.getCategories();
    const parentCategories = categories.filter(cat => !cat.parent_id);
    const childCategories = categories.filter(cat => cat.parent_id);
    
    // 获取面包屑导航
    const getBreadcrumbs = () => {
        if (category.parent_id) {
            const parent = categories.find(cat => cat.id === category.parent_id);
            return [
                { name: '分类浏览', href: '/categories' },
                { name: parent?.name || '', href: `/categories/${parent?.slug}` },
                { name: category.name, href: `/categories/${category.slug}` }
            ];
        }
        return [
            { name: '分类浏览', href: '/categories' },
            { name: category.name, href: `/categories/${category.slug}` }
        ];
    };

    const breadcrumbs = getBreadcrumbs();

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

            {/* 面包屑导航 */}
            <div className="bg-white/60 backdrop-blur-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <nav className="flex" aria-label="Breadcrumb">
                        <ol className="flex items-center space-x-4">
                            {breadcrumbs.map((breadcrumb, index) => (
                                <li key={breadcrumb.href} className="flex items-center">
                                    {index > 0 && (
                                        <ChevronRight className="h-4 w-4 text-gray-400 mx-2" />
                                    )}
                                    <Link
                                        href={breadcrumb.href}
                                        className={`text-sm transition-colors ${
                                            index === breadcrumbs.length - 1
                                                ? 'text-gray-900 font-semibold'
                                                : 'text-gray-500 hover:text-blue-600 font-medium'
                                        }`}
                                    >
                                        {breadcrumb.name}
                                    </Link>
                                </li>
                            ))}
                        </ol>
                    </nav>
                </div>
            </div>

            {/* 分类标题区域 */}
            <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="flex items-center space-x-6">
                        <div className="text-6xl drop-shadow-sm">{category.icon}</div>
                        <div>
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                {category.name}
                            </h1>
                            <p className="mt-3 text-gray-600 text-lg leading-relaxed">
                                {category.description}
                            </p>
                            <div className="mt-6 flex items-center space-x-4">
                                <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 border border-blue-200">
                                    {rules.length} 个规则
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    {/* 搜索和筛选 */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                            <input
                                type="text"
                                placeholder="搜索规则..."
                                className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl bg-white/80 backdrop-blur-sm text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
                            />
                        </div>
                        <div className="flex gap-2">
                            <select className="px-4 py-3 border border-gray-200 rounded-xl bg-white/80 backdrop-blur-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm">
                                <option>最新发布</option>
                                <option>最受欢迎</option>
                                <option>名称排序</option>
                            </select>
                            <button className="flex items-center px-4 py-3 border border-gray-200 rounded-xl bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-white hover:shadow-md transition-all">
                                <Grid className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* 规则列表 */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {rules.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">📝</div>
                        <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                            暂无规则
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400">
                            该分类下还没有规则，敬请期待
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {rules.map((rule) => (
                            <Link
                                key={rule.id}
                                href={`/rules/${rule.id}`}
                                className="group bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 p-6"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                                        {rule.title}
                                    </h3>
                                    <div className="flex items-center text-yellow-500 ml-2">
                                        <Star className="h-4 w-4 fill-current" />
                                    </div>
                                </div>
                                
                                <p className="text-gray-600 text-sm mb-6 line-clamp-3 leading-relaxed">
                                    {rule.description || '暂无描述'}
                                </p>
                                
                                {/* 标签 */}
                                {rule.tags && rule.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {rule.tags.slice(0, 3).map((tag, index) => (
                                            <span
                                                key={index}
                                                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 border border-blue-200"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                        {rule.tags.length > 3 && (
                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                +{rule.tags.length - 3}
                                            </span>
                                        )}
                                    </div>
                                )}
                                
                                {/* 统计信息 */}
                                <div className="flex items-center justify-between text-sm text-gray-500">
                                    <div className="flex items-center space-x-4">
                                        <div className="flex items-center font-medium">
                                            <Eye className="h-4 w-4 mr-1 text-blue-500" />
                                            {rule.views || 0}
                                        </div>
                                        <div className="flex items-center font-medium">
                                            <Calendar className="h-4 w-4 mr-1 text-green-500" />
                                            {new Date(rule.created_at).toLocaleDateString('zh-CN')}
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}