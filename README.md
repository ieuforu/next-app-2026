# Next-App 2026 🚀

基于 Next.js 16 (App Router) + React 19 构建的极简全栈模板。追求极致的开发体验 (DX) 与代码质量。

## 🛠️ 技术栈

- **Framework:** Next.js 16 + React 19 (Server Components & Actions)
- **API:** Hono RPC (Type-safe API routes)
- **Database:** MySQL + Drizzle ORM
- **Styling:** Tailwind CSS 4 + shadcn/ui
- **Tooling:** - [Oxc](https://oxc.rs/) (oxlint, oxfmt) - 极速 Lint 与格式化
  - [Husky](https://typicode.github.io/husky/) + [lint-staged](https://github.com/lint-staged/lint-staged) - 提交前的质量门禁
  - [TypeScript](https://www.typescriptlang.org/) - 严格全量类型检查

## 🚀 核心特性

- **Optimistic UI:** 使用 React 19 的 `useOptimistic` 实现零延迟交互。
- **Type-Safe Check:** 统一的 `pnpm check` 命令，涵盖格式、类型与逻辑。
- **Modern Config:** 针对 VS Code/Cursor 优化的 `.settings.json`，解决 App Router 标签混乱问题。
- **Fast Path:** 生产环境自动剔除开发模式专属组件 (`DevBoundary`)。

## 📦 快速开始

### 1. 安装依赖

```bash
pnpm install
```

### 2. 环境配置

配置你的myql_db

```txt
DATABASE_URL="mysql://root:password@localhost:3306/your_db"
```

### 3. 数据库迁移

```bash
pnpm db:push
```

### 4. 启动开发服务器

```bash
pnpm dev
```

## 🛡️ 代码质量流程

在提交代码前，建议运行以下命令：

- 全量检查: pnpm check (运行格式化、类型检查与 Lint)

- 手动修复: pnpm fmt & pnpm lint:fix

> Note: 项目已配置 Git Hooks，git commit 时会自动执行增量检查。

## 📁 目录结构简述

- /app: 路由与页面逻辑

- /components: UI 组件与业务组件

- /db: 数据库 Schema 与客户端实例

- /lib: 通用工具函数

- .github/workflows: CI/CD 自动化流水线
