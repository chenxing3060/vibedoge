import fs from 'fs';
import path from 'path';
import { dbQueries } from './database';

interface RuleData {
    title: string;
    content: string;
    category: string;
    tags: string[];
    fileName: string;
}

// 从文件名推断分类
function inferCategoryFromFileName(fileName: string): string {
    const name = fileName.toLowerCase().replace(/\.mdc?$/, '');
    
    // 映射规则
    const categoryMap: Record<string, string> = {
        'react': 'react',
        'vue': 'vue',
        'nextjs': 'nextjs',
        'typescript': 'typescript',
        'tailwind': 'tailwind',
        'svelte': 'svelte',
        'python': 'python',
        'fastapi': 'fastapi',
        'nodejs': 'nodejs',
        'node-express': 'nodejs',
        'cpp': 'general',
        'rust': 'general',
        'database': 'database',
        'clean-code': 'general',
        'codequality': 'general',
        'gitflow': 'general',
        'medusa': 'general',
        'nativescript': 'mobile',
        'beefreeSDK': 'general'
    };

    return categoryMap[name] || 'general';
}

// 从内容推断标签
function inferTagsFromContent(content: string, fileName: string): string[] {
    const tags: Set<string> = new Set();
    const lowerContent = content.toLowerCase();
    const lowerFileName = fileName.toLowerCase();

    // 技术栈标签映射
    const techTags = {
        'typescript': ['TypeScript'],
        'javascript': ['JavaScript'],
        'react': ['React'],
        'vue': ['Vue'],
        'python': ['Python'],
        'node': ['Node.js'],
        'fastapi': ['FastAPI'],
        'nextjs': ['Next.js'],
        'tailwind': ['Tailwind'],
        'svelte': ['Svelte'],
        'css': ['CSS'],
        'html': ['HTML']
    };

    // 从文件名推断
    Object.entries(techTags).forEach(([key, tagList]) => {
        if (lowerFileName.includes(key)) {
            tagList.forEach(tag => tags.add(tag));
        }
    });

    // 从内容推断
    Object.entries(techTags).forEach(([key, tagList]) => {
        if (lowerContent.includes(key)) {
            tagList.forEach(tag => tags.add(tag));
        }
    });

    return Array.from(tags);
}

// 读取单个规则文件
function readRuleFile(filePath: string): RuleData | null {
    try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const fileName = path.basename(filePath);
        
        // 提取标题（第一行或从文件名生成）
        const lines = content.split('\n');
        let title = fileName.replace(/\.mdc?$/, '').replace(/-/g, ' ');
        
        // 如果第一行是标题格式，使用它
        const firstLine = lines[0]?.trim();
        if (firstLine && (firstLine.startsWith('#') || firstLine.length < 100)) {
            title = firstLine.replace(/^#+\s*/, '').trim() || title;
        }

        // 格式化标题
        title = title.split(' ').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        ).join(' ');

        const category = inferCategoryFromFileName(fileName);
        const tags = inferTagsFromContent(content, fileName);

        return {
            title,
            content,
            category,
            tags,
            fileName
        };
    } catch (error) {
        console.error(`Error reading file ${filePath}:`, error);
        return null;
    }
}

// 读取目录中的所有规则文件
function readRulesFromDirectory(dirPath: string): RuleData[] {
    const rules: RuleData[] = [];
    
    try {
        const items = fs.readdirSync(dirPath);
        
        for (const item of items) {
            const itemPath = path.join(dirPath, item);
            const stat = fs.statSync(itemPath);
            
            if (stat.isFile() && /\.(md|mdc)$/i.test(item)) {
                const rule = readRuleFile(itemPath);
                if (rule) {
                    rules.push(rule);
                }
            } else if (stat.isDirectory()) {
                // 递归读取子目录
                const subRules = readRulesFromDirectory(itemPath);
                rules.push(...subRules);
            }
        }
    } catch (error) {
        console.error(`Error reading directory ${dirPath}:`, error);
    }
    
    return rules;
}

// 导入规则到数据库
export async function importRulesToDatabase() {
    console.log('开始导入规则数据...');
    
    const projectRoot = process.cwd();
    const rulesNewPath = path.join(projectRoot, 'rules-new');
    const rulesPath = path.join(projectRoot, 'rules');
    
    let allRules: RuleData[] = [];
    
    // 读取 rules-new 目录
    if (fs.existsSync(rulesNewPath)) {
        console.log('读取 rules-new 目录...');
        const rulesNewData = readRulesFromDirectory(rulesNewPath);
        allRules.push(...rulesNewData);
        console.log(`从 rules-new 读取到 ${rulesNewData.length} 个规则`);
    }
    
    // 读取 rules 目录
    if (fs.existsSync(rulesPath)) {
        console.log('读取 rules 目录...');
        const rulesData = readRulesFromDirectory(rulesPath);
        allRules.push(...rulesData);
        console.log(`从 rules 读取到 ${rulesData.length} 个规则`);
    }
    
    console.log(`总共读取到 ${allRules.length} 个规则`);
    
    // 获取所有分类
    const categories = dbQueries.getCategories();
    const categoryMap = new Map(categories.map(cat => [cat.slug, cat.id]));
    
    let importedCount = 0;
    let skippedCount = 0;
    
    for (const rule of allRules) {
        try {
            // 获取分类ID
            const categoryId = categoryMap.get(rule.category);
            if (!categoryId) {
                console.warn(`未找到分类: ${rule.category}，跳过规则: ${rule.title}`);
                skippedCount++;
                continue;
            }
            
            // 插入规则
            const result = dbQueries.insertRule({
                title: rule.title,
                content: rule.content,
                categoryId: categoryId
            });
            
            if (result.changes > 0) {
                importedCount++;
                console.log(`导入规则: ${rule.title}`);
            } else {
                skippedCount++;
            }
        } catch (error) {
            console.error(`导入规则失败: ${rule.title}`, error);
            skippedCount++;
        }
    }
    
    console.log(`导入完成: 成功 ${importedCount} 个，跳过 ${skippedCount} 个`);
    return { imported: importedCount, skipped: skippedCount };
}

// 如果直接运行此脚本
if (require.main === module) {
    importRulesToDatabase().then(() => {
        console.log('数据导入完成');
        process.exit(0);
    }).catch(error => {
        console.error('数据导入失败:', error);
        process.exit(1);
    });
}