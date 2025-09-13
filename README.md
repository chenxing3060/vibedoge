# VibeDoge 交易所

> 🚀 基于 React + TypeScript + Vite 构建的现代化数字资产交易平台

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-18+-61DAFB.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0+-646CFF.svg)](https://vitejs.dev/)

## ✨ 项目简介

VibeDoge 是一个创新的数字资产交易平台 Demo，专注于提供流畅的用户体验和强大的交易功能。项目采用现代化的技术栈，确保高性能、可扩展性和用户友好的界面。

### 🎯 核心特性

- 🔐 **安全可靠** - 多重身份验证、KYC认证、冷热钱包分离
- 📊 **实时交易** - 实时行情、K线图表、多种订单类型
- 💰 **资产管理** - 多币种钱包、充值提现、资产统计
- 📱 **响应式设计** - 完美适配桌面端和移动端
- ⚡ **高性能** - Vite 构建、热模块替换、代码分割
- 🌐 **国际化** - 多语言支持

## 🛠️ 技术栈

### 前端技术
- **框架**: React 18+ with TypeScript
- **构建工具**: Vite
- **包管理器**: pnpm
- **状态管理**: Redux Toolkit / Zustand
- **UI组件**: Ant Design / Material-UI
- **样式**: Tailwind CSS
- **图表**: ECharts / TradingView
- **代码质量**: ESLint

### 后端技术
- **运行时**: Node.js 18+
- **框架**: Express.js
- **数据库**: PostgreSQL + Redis
- **身份验证**: JWT + OAuth2.0

### 开发工具
- **容器化**: Docker
- **部署**: Vercel
- **版本控制**: Git

## 🚀 快速开始

### 环境要求

- Node.js 18+
- pnpm (推荐) 或 npm
- Git

### 安装步骤

1. **克隆项目**
   ```bash
   git clone https://github.com/chenxing3060/vibedoge.git
   cd vibedoge
   ```

2. **安装依赖**
   ```bash
   pnpm install
   # 或者使用 npm
   npm install
   ```

3. **启动开发服务器**
   ```bash
   pnpm dev
   # 或者使用 npm
   npm run dev
   ```

4. **访问应用**
   
   打开浏览器访问 [http://localhost:5173](http://localhost:5173)

### 可用脚本

```bash
# 开发模式
pnpm dev

# 构建生产版本
pnpm build

# 预览生产构建
pnpm preview

# 代码检查
pnpm lint

# 运行测试
pnpm test
```

## 📁 项目结构

```
vibedoge/
├── src/
│   ├── components/          # 可复用组件
│   │   ├── common/         # 基础组件
│   │   ├── business/       # 业务组件
│   │   └── layout/         # 布局组件
│   ├── pages/              # 页面组件
│   │   ├── Home/          # 首页
│   │   ├── Trade/         # 交易页面
│   │   ├── Assets/        # 资产管理
│   │   └── Profile/       # 个人中心
│   ├── hooks/              # 自定义 Hooks
│   ├── services/           # API 服务
│   ├── store/              # 状态管理
│   ├── utils/              # 工具函数
│   ├── types/              # TypeScript 类型定义
│   └── i18n/               # 国际化配置
├── api/                    # 后端 API
│   ├── controllers/        # 控制器
│   ├── routes/            # 路由定义
│   └── utils/             # 工具函数
├── public/                 # 静态资源
├── docs/                   # 项目文档
└── ...
```

## 🔧 配置说明

### 环境变量

创建 `.env` 文件并配置以下变量：

```env
# API 配置
VITE_API_BASE_URL=http://localhost:3000/api
VITE_WS_URL=ws://localhost:3000

# 应用配置
VITE_APP_NAME=VibeDoge
VITE_APP_VERSION=1.0.0
```

### Vite 插件

项目支持两种 React 快速刷新插件：

- `@vitejs/plugin-react` - 使用 Babel
- `@vitejs/plugin-react-swc` - 使用 SWC（更快）

## 🌟 核心功能

### 用户系统
- ✅ 用户注册/登录
- ✅ KYC 身份认证
- ✅ 多重身份验证
- ✅ 账户安全设置

### 交易系统
- ✅ 现货交易
- ✅ 多种订单类型（限价单、市价单、止损单）
- ✅ 实时行情数据
- ✅ K线图表分析
- ✅ 交易历史记录

### 资产管理
- ✅ 多币种钱包
- ✅ 充值/提现功能
- ✅ 资产统计分析
- ✅ 交易记录查询

### 市场数据
- ✅ 实时价格更新
- ✅ 深度图展示
- ✅ 技术指标分析
- ✅ 市场情绪分析

## 📚 API 文档

详细的 API 文档请参考：[API 文档](./docs/comprehensive-api-docs.md)

### 主要 API 端点

- `POST /api/v1/user/register` - 用户注册
- `POST /api/v1/user/login` - 用户登录
- `GET /api/v1/market/tickers` - 获取行情数据
- `POST /api/v1/trade/order` - 创建交易订单
- `GET /api/v1/asset/balances` - 获取资产余额

## 🚀 部署

### Vercel 部署

项目已配置 Vercel 部署，推送到 main 分支即可自动部署。

```bash
# 手动部署
npx vercel
```

### Docker 部署

```bash
# 构建镜像
docker build -t vibedoge .

# 运行容器
docker run -p 3000:3000 vibedoge
```

## 🤝 贡献指南

我们欢迎所有形式的贡献！请遵循以下步骤：

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

### 开发规范

- 使用 TypeScript 进行类型安全开发
- 遵循 ESLint 代码规范
- 编写单元测试
- 提交信息遵循 [Conventional Commits](https://conventionalcommits.org/)

## 📄 许可证

本项目基于 MIT 许可证开源 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

感谢所有为这个项目做出贡献的开发者！

## 📞 联系我们

- 项目地址: [https://github.com/chenxing3060/vibedoge](https://github.com/chenxing3060/vibedoge)
- 问题反馈: [Issues](https://github.com/chenxing3060/vibedoge/issues)

---

⭐ 如果这个项目对你有帮助，请给我们一个 Star！