// 模拟规则数据，实际项目中应该从API获取
const mockRules: Rule[] = [
    {
        id: 'react',
        title: 'React 最佳实践',
        description: 'React 组件开发的最佳实践和代码规范',
        category: 'React',
        content: `# React 最佳实践

## 1. 组件结构
- 使用函数组件和 Hooks
- 保持组件单一职责
- 合理拆分组件

## 2. 状态管理
- 使用 useState 管理本地状态
- 使用 useEffect 处理副作用
- 避免不必要的重渲染

## 3. 性能优化
- 使用 React.memo 优化组件
- 使用 useMemo 和 useCallback
- 避免在渲染中创建对象`,
        globs: '**/*.{tsx,jsx}',
        author: 'React Team',
        tags: ['react', 'frontend', 'javascript']
    },
    {
        id: 'typescript',
        title: 'TypeScript 编码规范',
        description: 'TypeScript 类型系统和编码最佳实践',
        category: 'TypeScript',
        content: `# TypeScript 编码规范

## 1. 类型定义
- 优先使用 interface 而不是 type
- 使用明确的类型注解
- 避免使用 any 类型

## 2. 命名规范
- 使用 PascalCase 命名接口和类型
- 使用 camelCase 命名变量和函数
- 使用 UPPER_CASE 命名常量

## 3. 代码组织
- 将类型定义放在单独的文件中
- 使用命名空间组织相关类型
- 合理使用泛型`,
        globs: '**/*.{ts,tsx}',
        author: 'TypeScript Team',
        tags: ['typescript', 'types', 'javascript']
    },
    {
        id: 'nextjs',
        title: 'Next.js 开发指南',
        description: 'Next.js 应用开发的最佳实践',
        category: 'Next.js',
        content: `# Next.js 开发指南

## 1. 项目结构
- 使用 app 目录结构
- 合理组织页面和组件
- 使用 public 目录存放静态资源

## 2. 路由系统
- 使用文件系统路由
- 实现动态路由
- 使用中间件处理请求

## 3. 性能优化
- 使用 Image 组件优化图片
- 实现代码分割
- 使用 SSR 和 SSG`,
        globs: '**/*.{js,jsx,ts,tsx}',
        author: 'Vercel Team',
        tags: ['nextjs', 'react', 'ssr']
    },
    {
        id: 'clean-code',
        title: '代码整洁之道',
        description: '编写可读、可维护代码的原则和实践',
        category: 'Clean Code',
        content: `# 代码整洁之道

## 1. 命名规范
- 使用有意义的名称
- 避免误导性名称
- 使用可搜索的名称

## 2. 函数设计
- 函数应该短小
- 函数只做一件事
- 使用描述性名称

## 3. 注释规范
- 代码即文档
- 避免冗余注释
- 解释为什么而不是做什么`,
        globs: '**/*',
        author: 'Robert C. Martin',
        tags: ['clean-code', 'best-practices', 'maintainability']
    },
    {
        id: 'tailwind',
        title: 'Tailwind CSS 使用指南',
        description: 'Tailwind CSS 实用工具类的最佳实践',
        category: 'CSS',
        content: `# Tailwind CSS 使用指南

## 1. 工具类组合
- 使用语义化的类名组合
- 避免过长的类名列表
- 使用 @apply 指令提取重复样式

## 2. 响应式设计
- 移动优先的设计理念
- 使用断点前缀
- 合理使用容器查询

## 3. 自定义配置
- 扩展默认主题
- 添加自定义工具类
- 使用插件系统`,
        globs: '**/*.{css,html,jsx,tsx,vue}',
        author: 'Tailwind Labs',
        tags: ['tailwind', 'css', 'styling']
    },
    {
        id: 'git',
        title: 'Git 工作流规范',
        description: 'Git 版本控制的最佳实践和工作流程',
        category: 'Git',
        content: `# Git 工作流规范

## 1. 提交规范
- 使用语义化提交信息
- 保持提交原子性
- 编写清晰的提交描述

## 2. 分支策略
- 使用 Git Flow 或 GitHub Flow
- 保护主分支
- 及时删除已合并分支

## 3. 代码审查
- 所有代码都需要审查
- 提供建设性反馈
- 及时响应审查请求`,
        globs: '**/*',
        author: 'Git Community',
        tags: ['git', 'version-control', 'workflow']
    }
];

export interface Rule {
    id: string;
    title: string;
    description: string;
    category: string;
    content: string;
    globs?: string;
    author?: string;
    tags?: string[];
}

export interface RuleCategory {
    name: string;
    count: number;
    rules: Rule[];
}

// 获取所有规则
export async function getAllRules(): Promise<Rule[]> {
    // 模拟异步操作
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockRules;
}

// 根据文件名确定分类
function getCategoryFromFilename(filename: string): string {
    const name = filename.toLowerCase();
    
    if (name.includes('react') || name.includes('vue') || name.includes('svelte')) {
        return '前端框架';
    }
    if (name.includes('typescript') || name.includes('javascript')) {
        return '编程语言';
    }
    if (name.includes('nextjs') || name.includes('fastapi') || name.includes('express')) {
        return '全栈框架';
    }
    if (name.includes('database') || name.includes('sql')) {
        return '数据库';
    }
    if (name.includes('tailwind') || name.includes('css')) {
        return '样式';
    }
    if (name.includes('clean') || name.includes('quality')) {
        return '代码质量';
    }
    if (name.includes('git')) {
        return '版本控制';
    }
    
    return '其他';
}

// 按分类获取规则
export async function getRulesByCategory(): Promise<RuleCategory[]> {
    const rules = await getAllRules();
    const categoryMap = new Map<string, Rule[]>();
    
    rules.forEach(rule => {
        if (!categoryMap.has(rule.category)) {
            categoryMap.set(rule.category, []);
        }
        categoryMap.get(rule.category)!.push(rule);
    });
    
    return Array.from(categoryMap.entries()).map(([name, rules]) => ({
        name,
        count: rules.length,
        rules,
    }));
}

// 搜索规则
export async function searchRules(query: string): Promise<Rule[]> {
    const rules = await getAllRules();
    const lowercaseQuery = query.toLowerCase();
    
    return rules.filter(rule => 
        rule.title.toLowerCase().includes(lowercaseQuery) ||
        rule.description.toLowerCase().includes(lowercaseQuery) ||
        rule.content.toLowerCase().includes(lowercaseQuery) ||
        rule.category.toLowerCase().includes(lowercaseQuery) ||
        (rule.tags && rule.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery)))
    );
}

// 获取规则统计信息
export async function getRulesStats(): Promise<{ totalRules: number; totalCategories: number }> {
    const rules = await getAllRules();
    const categories = await getRulesByCategory();
    
    return {
        totalRules: rules.length,
        totalCategories: categories.length,
    };
}