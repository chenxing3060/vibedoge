import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbPath = path.join(process.cwd(), 'data', 'vibedoge.db');

// 确保数据目录存在
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(dbPath);

// 启用外键约束
db.pragma('foreign_keys = ON');

// 创建表结构
function initDatabase() {
    // 删除现有表（如果存在）
    db.exec(`
        DROP TABLE IF EXISTS rule_tags;
        DROP TABLE IF EXISTS rules;
        DROP TABLE IF EXISTS tags;
        DROP TABLE IF EXISTS categories;
    `);
    
    // 分类表
    db.exec(`
        CREATE TABLE categories (
            id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
            name TEXT NOT NULL,
            slug TEXT UNIQUE NOT NULL,
            description TEXT,
            icon TEXT,
            parent_id TEXT,
            rule_count INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (parent_id) REFERENCES categories(id)
        )
    `);

    // 规则表
    db.exec(`
        CREATE TABLE rules (
            id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            description TEXT,
            category_id TEXT NOT NULL,
            author_id TEXT,
            status TEXT DEFAULT 'pending',
            views INTEGER DEFAULT 0,
            likes INTEGER DEFAULT 0,
            downloads INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (category_id) REFERENCES categories(id)
        )
    `);

    // 标签表
    db.exec(`
        CREATE TABLE tags (
            id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
            name TEXT UNIQUE NOT NULL,
            color TEXT DEFAULT '#3b82f6',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // 规则标签关联表
    db.exec(`
        CREATE TABLE rule_tags (
            rule_id TEXT,
            tag_id TEXT,
            PRIMARY KEY (rule_id, tag_id),
            FOREIGN KEY (rule_id) REFERENCES rules(id) ON DELETE CASCADE,
            FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
        )
    `);

    // 创建索引
    db.exec(`
        CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
        CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);
        CREATE INDEX IF NOT EXISTS idx_rules_category_id ON rules(category_id);
        CREATE INDEX IF NOT EXISTS idx_rules_status ON rules(status);
        CREATE INDEX IF NOT EXISTS idx_rules_created_at ON rules(created_at DESC);
        CREATE INDEX IF NOT EXISTS idx_rules_views ON rules(views DESC);
        CREATE INDEX IF NOT EXISTS idx_rules_likes ON rules(likes DESC);
    `);

    // 初始化分类数据
    const categoryStmt = db.prepare(`
        INSERT OR IGNORE INTO categories (name, slug, description, icon) 
        VALUES (?, ?, ?, ?)
    `);

    const categories = [
        ['Frontend', 'frontend', '前端开发相关技术规则', '🎨'],
        ['Backend', 'backend', '后端开发相关技术规则', '⚙️'],
        ['Mobile', 'mobile', '移动端开发相关技术规则', '📱'],
        ['DevOps', 'devops', 'DevOps和部署相关规则', '🚀'],
        ['Database', 'database', '数据库相关技术规则', '🗄️'],
        ['General', 'general', '通用开发规则和最佳实践', '📋']
    ];

    categories.forEach(category => {
        categoryStmt.run(...category);
    });

    // 初始化子分类
    const frontendId = db.prepare('SELECT id FROM categories WHERE slug = ?').get('frontend')?.id;
    const backendId = db.prepare('SELECT id FROM categories WHERE slug = ?').get('backend')?.id;
    const mobileId = db.prepare('SELECT id FROM categories WHERE slug = ?').get('mobile')?.id;

    if (frontendId) {
        const subCategories = [
            ['React', 'react', 'React框架开发规则', '⚛️', frontendId],
            ['Vue', 'vue', 'Vue框架开发规则', '💚', frontendId],
            ['Next.js', 'nextjs', 'Next.js框架开发规则', '▲', frontendId],
            ['TypeScript', 'typescript', 'TypeScript开发规则', '🔷', frontendId],
            ['Tailwind CSS', 'tailwind', 'Tailwind CSS样式规则', '🎨', frontendId],
            ['Svelte', 'svelte', 'Svelte框架开发规则', '🧡', frontendId]
        ];

        const subCategoryStmt = db.prepare(`
            INSERT OR IGNORE INTO categories (name, slug, description, icon, parent_id) 
            VALUES (?, ?, ?, ?, ?)
        `);

        subCategories.forEach(subCategory => {
            subCategoryStmt.run(...subCategory);
        });
    }

    if (backendId) {
        const backendSubCategories = [
            ['Node.js', 'nodejs', 'Node.js后端开发规则', '💚', backendId],
            ['Python', 'python', 'Python开发规则', '🐍', backendId],
            ['FastAPI', 'fastapi', 'FastAPI框架开发规则', '⚡', backendId],
            ['Go', 'go', 'Go语言开发规则', '🐹', backendId]
        ];

        const subCategoryStmt = db.prepare(`
            INSERT OR IGNORE INTO categories (name, slug, description, icon, parent_id) 
            VALUES (?, ?, ?, ?, ?)
        `);

        backendSubCategories.forEach(subCategory => {
            subCategoryStmt.run(...subCategory);
        });
    }

    // 初始化标签数据
    const tagStmt = db.prepare(`
        INSERT OR IGNORE INTO tags (name, color) 
        VALUES (?, ?)
    `);

    const tags = [
        ['TypeScript', '#3178c6'],
        ['JavaScript', '#f7df1e'],
        ['React', '#61dafb'],
        ['Vue', '#4fc08d'],
        ['Python', '#3776ab'],
        ['Node.js', '#339933'],
        ['CSS', '#1572b6'],
        ['HTML', '#e34f26'],
        ['FastAPI', '#009688'],
        ['Next.js', '#000000'],
        ['Tailwind', '#06b6d4'],
        ['Svelte', '#ff3e00']
    ];

    tags.forEach(tag => {
        tagStmt.run(...tag);
    });

    // 初始化示例规则数据
    const reactId = db.prepare('SELECT id FROM categories WHERE slug = ?').get('react')?.id;
    const vueId = db.prepare('SELECT id FROM categories WHERE slug = ?').get('vue')?.id;
    const nodejsId = db.prepare('SELECT id FROM categories WHERE slug = ?').get('nodejs')?.id;
    const pythonId = db.prepare('SELECT id FROM categories WHERE slug = ?').get('python')?.id;
    const typescriptId = db.prepare('SELECT id FROM categories WHERE slug = ?').get('typescript')?.id;

    const ruleStmt = db.prepare(`
        INSERT OR IGNORE INTO rules (title, content, description, category_id, status, views, likes, downloads) 
        VALUES (?, ?, ?, ?, 'approved', ?, ?, ?)
    `);

    const sampleRules = [
        [
            'React 组件开发最佳实践',
            `# React 组件开发规则\n\n## 组件命名\n- 使用 PascalCase 命名组件\n- 组件文件名与组件名保持一致\n\n## 组件结构\n- 保持组件单一职责\n- 使用函数组件和 Hooks\n- 避免过深的组件嵌套\n\n## 性能优化\n- 使用 React.memo 优化渲染\n- 合理使用 useMemo 和 useCallback\n- 避免在 render 中创建对象和函数`,
            'React 组件开发的最佳实践和规范，包括命名、结构和性能优化',
            reactId,
            156,
            89,
            234
        ],
        [
            'Vue 3 Composition API 使用指南',
            `# Vue 3 Composition API 规则\n\n## setup 函数\n- 使用 setup 语法糖简化代码\n- 合理组织响应式数据\n\n## 响应式系统\n- 使用 ref 和 reactive\n- 理解 toRefs 的使用场景\n\n## 生命周期\n- 使用组合式 API 的生命周期钩子\n- onMounted, onUpdated, onUnmounted`,
            'Vue 3 Composition API 的使用规范和最佳实践',
            vueId,
            98,
            67,
            145
        ],
        [
            'Node.js 后端开发规范',
            `# Node.js 后端开发规则\n\n## 项目结构\n- 使用 MVC 架构模式\n- 分离路由、控制器和服务层\n\n## 错误处理\n- 统一错误处理中间件\n- 使用适当的 HTTP 状态码\n\n## 安全性\n- 输入验证和清理\n- 使用 HTTPS\n- 实现适当的认证和授权`,
            'Node.js 后端开发的规范和安全最佳实践',
            nodejsId,
            203,
            134,
            189
        ],
        [
            'Python 代码风格指南',
            `# Python 代码风格规则\n\n## PEP 8 规范\n- 使用 4 个空格缩进\n- 行长度不超过 79 字符\n- 函数和类之间空两行\n\n## 命名规范\n- 变量和函数使用 snake_case\n- 类名使用 PascalCase\n- 常量使用 UPPER_CASE\n\n## 文档字符串\n- 为所有公共函数编写 docstring\n- 使用 Google 或 NumPy 风格`,
            'Python 代码风格和规范指南，遵循 PEP 8 标准',
            pythonId,
            167,
            92,
            156
        ],
        [
            'TypeScript 类型定义最佳实践',
            `# TypeScript 类型规则\n\n## 类型定义\n- 优先使用 interface 而非 type\n- 使用泛型提高代码复用性\n\n## 严格模式\n- 启用 strict 模式\n- 避免使用 any 类型\n\n## 工具类型\n- 熟练使用 Partial, Required, Pick, Omit\n- 自定义工具类型提高开发效率`,
            'TypeScript 类型系统的使用规范和最佳实践',
            typescriptId,
            189,
            112,
            201
        ],
        [
            'Next.js 全栈开发指南',
            `# Next.js 开发规则\n\n## 页面路由\n- 使用文件系统路由\n- 合理使用动态路由\n\n## 数据获取\n- getStaticProps 用于静态生成\n- getServerSideProps 用于服务端渲染\n- SWR 用于客户端数据获取\n\n## 性能优化\n- 图片优化使用 next/image\n- 代码分割和懒加载`,
            'Next.js 全栈开发的规范和性能优化技巧',
            reactId,
            145,
            78,
            167
        ]
    ];

    sampleRules.forEach(rule => {
        if (rule[3]) { // 只有当 category_id 存在时才插入
            ruleStmt.run(...rule);
        }
    });
}

// 数据库查询方法
export const dbQueries = {
    // 获取所有分类
    getCategories: () => {
        return db.prepare(`
            SELECT c.*, 
                   COUNT(r.id) as rule_count,
                   parent.name as parent_name
            FROM categories c
            LEFT JOIN rules r ON c.id = r.category_id AND r.status = 'approved'
            LEFT JOIN categories parent ON c.parent_id = parent.id
            GROUP BY c.id
            ORDER BY c.parent_id IS NULL DESC, c.name
        `).all();
    },

    // 获取分类详情
    getCategoryBySlug: (slug: string) => {
        return db.prepare(`
            SELECT c.*, 
                   COUNT(r.id) as rule_count,
                   parent.name as parent_name
            FROM categories c
            LEFT JOIN rules r ON c.id = r.category_id AND r.status = 'approved'
            LEFT JOIN categories parent ON c.parent_id = parent.id
            WHERE c.slug = ?
            GROUP BY c.id
        `).get(slug);
    },

    // 获取规则列表
    getRules: (params: {
        categoryId?: string;
        search?: string;
        page?: number;
        limit?: number;
    } = {}) => {
        const { categoryId, search, page = 1, limit = 20 } = params;
        const offset = (page - 1) * limit;

        let query = `
            SELECT r.*, c.name as category_name, c.slug as category_slug
            FROM rules r
            JOIN categories c ON r.category_id = c.id
            WHERE r.status = 'approved'
        `;
        const queryParams: any[] = [];

        if (categoryId) {
            query += ' AND r.category_id = ?';
            queryParams.push(categoryId);
        }

        if (search) {
            query += ' AND (r.title LIKE ? OR r.content LIKE ?)';
            queryParams.push(`%${search}%`, `%${search}%`);
        }

        query += ' ORDER BY r.created_at DESC LIMIT ? OFFSET ?';
        queryParams.push(limit, offset);

        return db.prepare(query).all(...queryParams);
    },

    // 获取规则详情
    getRuleById: (id: string) => {
        return db.prepare(`
            SELECT r.*, c.name as category_name, c.slug as category_slug
            FROM rules r
            JOIN categories c ON r.category_id = c.id
            WHERE r.id = ? AND r.status = 'approved'
        `).get(id);
    },

    // 获取热门规则
    getPopularRules: (limit: number = 6) => {
        return db.prepare(`
            SELECT r.*, c.name as category_name, c.slug as category_slug
            FROM rules r
            JOIN categories c ON r.category_id = c.id
            WHERE r.status = 'approved'
            ORDER BY r.views DESC, r.likes DESC
            LIMIT ?
        `).all(limit);
    },

    // 增加浏览次数
    incrementViews: (id: string) => {
        return db.prepare('UPDATE rules SET views = views + 1 WHERE id = ?').run(id);
    },

    // 插入规则
    insertRule: (rule: {
        title: string;
        content: string;
        categoryId: string;
        authorId?: string;
    }) => {
        return db.prepare(`
            INSERT INTO rules (title, content, category_id, author_id)
            VALUES (?, ?, ?, ?)
        `).run(rule.title, rule.content, rule.categoryId, rule.authorId || null);
    },

    searchRules: (query: string, options: { category_id?: string; limit?: number } = {}) => {
        const { category_id, limit = 20 } = options;
        
        let sql = `
            SELECT r.*, c.name as category_name, c.slug as category_slug, c.icon as category_icon
            FROM rules r
            LEFT JOIN categories c ON r.category_id = c.id
            WHERE r.status = 'approved' AND (r.title LIKE ? OR r.description LIKE ? OR r.content LIKE ?)
        `;
        
        const params = [`%${query}%`, `%${query}%`, `%${query}%`];
        
        if (category_id) {
            sql += ` AND r.category_id = ?`;
            params.push(category_id);
        }
        
        sql += ` ORDER BY r.views DESC, r.created_at DESC LIMIT ?`;
        params.push(limit);
        
        const stmt = db.prepare(sql);
        const results = stmt.all(...params);
        
        return results;
    },

    getSearchSuggestions: (query: string, limit: number = 5) => {
        const titleMatches = db.prepare(`
            SELECT DISTINCT title as suggestion, 'rule' as type
            FROM rules 
            WHERE title LIKE ? 
            LIMIT ?
        `).all(`%${query}%`, Math.ceil(limit / 2));
        
        const categoryMatches = db.prepare(`
            SELECT DISTINCT name as suggestion, 'category' as type
            FROM categories 
            WHERE name LIKE ? 
            LIMIT ?
        `).all(`%${query}%`, Math.floor(limit / 2));
        
        return [...titleMatches, ...categoryMatches].slice(0, limit);
    }
};

// 检查数据库是否需要初始化
function checkAndInitDatabase() {
    try {
        // 检查categories表是否存在且有数据
        const result = db.prepare('SELECT COUNT(*) as count FROM categories').get();
        if (!result || result.count === 0) {
            console.log('Initializing database...');
            initDatabase();
        }
    } catch (error) {
        // 如果表不存在，会抛出错误，此时需要初始化
        console.log('Database tables not found, initializing...');
        initDatabase();
    }
}

// 初始化数据库
checkAndInitDatabase();

export default db;