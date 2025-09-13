'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Search, Filter, Grid, List, Star, Eye, Calendar, Tag, X } from 'lucide-react';

export default function SearchPage() {
    const searchParams = useSearchParams();
    const initialQuery = searchParams.get('q') || '';
    const initialCategory = searchParams.get('category') || '';
    
    const [query, setQuery] = useState(initialQuery);
    const [selectedCategory, setSelectedCategory] = useState(initialCategory);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [sortBy, setSortBy] = useState('relevance');
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    
    // 获取分类数据
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch('/api/categories');
                if (response.ok) {
                    const data = await response.json();
                    setCategories(data);
                }
            } catch (error) {
                console.error('Failed to fetch categories:', error);
            }
        };
        
        fetchCategories();
    }, []);
    
    // 搜索结果
    useEffect(() => {
        const fetchSearchResults = async () => {
            if (!query.trim()) {
                setSearchResults([]);
                return;
            }
            
            setLoading(true);
            try {
                const categoryId = selectedCategory 
                    ? categories.find(cat => cat.slug === selectedCategory)?.id
                    : undefined;
                
                const params = new URLSearchParams({
                    q: query,
                    limit: '50'
                });
                
                if (categoryId) {
                    params.set('category_id', categoryId.toString());
                }
                
                const response = await fetch(`/api/search?${params.toString()}`);
                if (response.ok) {
                    const data = await response.json();
                    setSearchResults(data);
                }
            } catch (error) {
                console.error('Failed to fetch search results:', error);
            } finally {
                setLoading(false);
            }
        };
        
        fetchSearchResults();
    }, [query, selectedCategory, categories]);
    
    // 获取搜索建议
    useEffect(() => {
        const fetchSuggestions = async () => {
            if (query.trim().length > 1) {
                try {
                    const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(query)}&limit=5`);
                    if (response.ok) {
                        const data = await response.json();
                        setSuggestions(data);
                    }
                } catch (error) {
                    console.error('Failed to fetch suggestions:', error);
                }
            } else {
                setSuggestions([]);
            }
        };
        
        fetchSuggestions();
    }, [query]);
    
    // 处理搜索
    const handleSearch = (searchQuery: string) => {
        setQuery(searchQuery);
        setShowSuggestions(false);
        // 更新URL
        const params = new URLSearchParams();
        if (searchQuery) params.set('q', searchQuery);
        if (selectedCategory) params.set('category', selectedCategory);
        window.history.pushState({}, '', `/search?${params.toString()}`);
    };
    
    // 清除筛选
    const clearFilters = () => {
        setSelectedCategory('');
        const params = new URLSearchParams();
        if (query) params.set('q', query);
        window.history.pushState({}, '', `/search?${params.toString()}`);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* 导航栏 */}
            <nav className="bg-white border-b border-gray-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link href="/" className="flex items-center space-x-2">
                            <span className="text-xl font-bold text-blue-600">Cursor Rules 知识库</span>
                        </Link>
                        <div className="flex items-center space-x-6">
                            <Link href="/" className="text-gray-700 hover:text-blue-600 transition-colors">
                                首页
                            </Link>
                            <Link href="/categories" className="text-gray-700 hover:text-blue-600 transition-colors">
                                分类浏览
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* 搜索区域 */}
            <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <h1 className="text-3xl md:text-4xl font-bold mb-6">
                        搜索规则
                    </h1>
                    
                    {/* 搜索框 */}
                    <div className="relative mb-6">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-6 w-6" />
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => {
                                    setQuery(e.target.value);
                                    setShowSuggestions(true);
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleSearch(query);
                                    }
                                }}
                                onFocus={() => setShowSuggestions(true)}
                                placeholder="搜索 Cursor Rules..."
                                className="w-full pl-12 pr-4 py-4 text-lg border-0 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:ring-4 focus:ring-blue-300 shadow-lg"
                            />
                        </div>
                        
                        {/* 搜索建议 */}
                        {showSuggestions && suggestions.length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-10">
                                {suggestions.map((suggestion, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleSearch(suggestion.suggestion)}
                                        className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center transition-colors"
                                    >
                                        <Search className="h-4 w-4 mr-3 text-gray-400" />
                                        <span className="text-gray-900">{suggestion.suggestion}</span>
                                        <span className="ml-auto text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                            {suggestion.type === 'rule' ? '规则' : '分类'}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    
                    {/* 筛选器 */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900"
                            >
                                <option value="">所有分类</option>
                                {categories.filter(cat => !cat.parent_id).map(category => (
                                    <optgroup key={category.id} label={category.name}>
                                        <option value={category.slug}>{category.name}</option>
                                        {categories
                                            .filter(child => child.parent_id === category.id)
                                            .map(child => (
                                                <option key={child.id} value={child.slug}>
                                                    　{child.name}
                                                </option>
                                            ))
                                        }
                                    </optgroup>
                                ))}
                            </select>
                        </div>
                        <div className="flex gap-2">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="relevance">相关性</option>
                                <option value="views">最多查看</option>
                                <option value="newest">最新</option>
                            </select>
                            <button
                                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                                className="flex items-center px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                {viewMode === 'grid' ? <List className="h-5 w-5" /> : <Grid className="h-5 w-5" />}
                                <span className="ml-2">
                                    {viewMode === 'grid' ? '列表视图' : '网格视图'}
                                </span>
                            </button>
                        </div>
                    </div>
                    
                    {/* 活动筛选器 */}
                    {selectedCategory && (
                        <div className="flex items-center gap-2 mt-4">
                            <span className="text-sm text-gray-500">筛选器:</span>
                            <div className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                                <span>{categories.find(cat => cat.slug === selectedCategory)?.name}</span>
                                <button
                                    onClick={() => setSelectedCategory('')}
                                    className="ml-1 hover:bg-blue-200 rounded-full p-1"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </div>
                            <button
                                onClick={clearFilters}
                                className="text-sm text-blue-600 hover:underline"
                            >
                                清除所有筛选器
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* 搜索结果 */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="ml-3 text-gray-600">搜索中...</span>
                    </div>
                ) : query && (
                    <div className="mb-6">
                        <p className="text-gray-600 dark:text-gray-300">
                            找到 <span className="font-semibold">{searchResults.length}</span> 个结果
                            {query && (
                                <span> 关于 "<span className="font-semibold">{query}</span>"</span>
                            )}
                        </p>
                    </div>
                )}
                
                {!loading && !query ? (
                    <div className="text-center py-12">
                        <Search className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-4 text-lg font-medium text-gray-900">开始搜索</h3>
                        <p className="mt-2 text-gray-500">
                            输入关键词搜索 Cursor Rules
                        </p>
                    </div>
                ) : !loading && searchResults.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">😔</div>
                        <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                            未找到结果
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-4">
                            尝试使用不同的关键词或清除筛选器
                        </p>
                        <button
                            onClick={clearFilters}
                            className="text-blue-600 dark:text-blue-400 hover:underline"
                        >
                            清除筛选器
                        </button>
                    </div>
                ) : (
                    <div className={viewMode === 'grid' 
                        ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        : "space-y-4"
                    }>
                        {searchResults.map((rule) => (
                            <Link
                                key={rule.id}
                                href={`/rules/${rule.slug}`}
                                className={`group bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-200 ${
                                    viewMode === 'grid' ? 'p-6' : 'p-4 flex items-center space-x-4'
                                }`}
                            >
                                {viewMode === 'grid' ? (
                                    <>
                                        <div className="flex items-start justify-between mb-3">
                                            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                                {rule.name}
                                            </h3>
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                {rule.category}
                                            </span>
                                        </div>
                                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                            {rule.description}
                                        </p>
                                        <div className="flex items-center justify-between text-sm text-gray-500">
                                            <div className="flex items-center gap-4">
                                                <span className="flex items-center">
                                                    <Eye className="h-4 w-4 mr-1" />
                                                    {rule.views || 0}
                                                </span>
                                                <span className="flex items-center">
                                                    <Star className="h-4 w-4 mr-1" />
                                                    {rule.stars || 0}
                                                </span>
                                            </div>
                                            <span className="text-blue-600 font-medium">{rule.author}</span>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-2">
                                                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                                    {rule.name}
                                                </h3>
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    {rule.category}
                                                </span>
                                            </div>
                                            <p className="text-gray-600 text-sm mb-2">
                                                {rule.description}
                                            </p>
                                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                                <span className="flex items-center">
                                                    <Eye className="h-4 w-4 mr-1" />
                                                    {rule.views || 0}
                                                </span>
                                                <span className="flex items-center">
                                                    <Star className="h-4 w-4 mr-1" />
                                                    {rule.stars || 0}
                                                </span>
                                                <span className="text-blue-600 font-medium">{rule.author}</span>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}