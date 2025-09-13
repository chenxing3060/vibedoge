'use client';

import { useState } from 'react';
import { Copy, Check, Download, Heart, Share2 } from 'lucide-react';

interface RuleDetailClientProps {
    content: string;
    title: string;
    id: number;
}

export default function RuleDetailClient({ content, title, id }: RuleDetailClientProps) {
    const [copied, setCopied] = useState(false);
    const [liked, setLiked] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(content);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const handleDownload = () => {
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${title.replace(/[^a-zA-Z0-9]/g, '_')}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: title,
                    text: `Check out this Cursor Rule: ${title}`,
                    url: window.location.href,
                });
            } catch (err) {
                console.error('Error sharing:', err);
            }
        } else {
            // Fallback: copy URL to clipboard
            try {
                await navigator.clipboard.writeText(window.location.href);
                alert('链接已复制到剪贴板');
            } catch (err) {
                console.error('Failed to copy URL:', err);
            }
        }
    };

    const handleLike = () => {
        setLiked(!liked);
        // TODO: 实现点赞功能的后端调用
    };

    return (
        <div className="space-y-6">
            {/* 操作按钮 */}
            <div className="flex flex-wrap gap-3">
                <button
                    onClick={handleCopy}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copied ? '已复制' : '复制规则'}
                </button>
                
                <button
                    onClick={handleDownload}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                    <Download className="h-4 w-4" />
                    下载
                </button>
                
                <button
                    onClick={handleLike}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                        liked 
                            ? 'bg-red-600 text-white hover:bg-red-700' 
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                >
                    <Heart className={`h-4 w-4 ${liked ? 'fill-current' : ''}`} />
                    {liked ? '已收藏' : '收藏'}
                </button>
                
                <button
                    onClick={handleShare}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                    <Share2 className="h-4 w-4" />
                    分享
                </button>
            </div>

            {/* 规则内容 */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                <pre className="whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-200 font-mono leading-relaxed overflow-x-auto">
                    {content}
                </pre>
            </div>
        </div>
    );
}