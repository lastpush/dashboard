# LastPush

面向开发者的域名与前端部署平台原型。当前实现以 UI/交互演示为主，包含登录、域名管理、站点部署、计费等核心流程的前端页面与模拟数据。

## 目录结构

```
.
├─components/
│  ├─Layout.tsx
│  └─ui/
│     └─Common.tsx
├─pages/
│  ├─Home.tsx
│  ├─Login.tsx
│  ├─Dashboard.tsx
│  ├─DomainManager.tsx
│  ├─SiteManager.tsx
│  └─Billing.tsx
├─App.tsx
├─index.tsx
├─index.html
├─types.ts
├─vite.config.ts
├─metadata.json
├─package.json
├─pnpm-lock.yaml
├─tsconfig.json
├─.env.local
├─.gitignore
└─node_modules/ (本地依赖)
```

## 程序结构

- 入口
  - `index.html`：引入 Tailwind CDN、字体与 importmap；包含 Buffer/Process 的浏览器兼容设置。
  - `index.tsx`：挂载 React 根节点并渲染 `App`。
- 路由与应用壳
  - `App.tsx`：使用 `HashRouter` 组织路由；`ProtectedRoute` 对需要登录的页面进行保护。
  - 内置 `AuthContext`：基于 localStorage 的简单登录态管理（模拟）。
- 布局
  - `components/Layout.tsx`：区分公共页与后台页布局，含侧边栏、顶栏、移动端菜单。
- 页面模块
  - `pages/Home.tsx`：域名搜索与结果列表（模拟查询/价格）。
  - `pages/Login.tsx`：邮箱与钱包登录流程（RainbowKit/Wagmi），含 onboarding 步骤。
  - `pages/Dashboard.tsx`：概览指标、部署活跃度图表、最近事件列表。
  - `pages/DomainManager.tsx`：域名列表/详情、DNS 记录增删改（模拟发布）。
  - `pages/SiteManager.tsx`：新建站点部署流程（模拟构建日志）、站点列表与详情。
  - `pages/Billing.tsx`：余额、用量、充值与账单（模拟）。
- 基础组件
  - `components/ui/Common.tsx`：Button/Input/Card/Badge 等基础 UI 组件。
- 类型定义
  - `types.ts`：域名、DNS 记录、站点、部署、订单等类型与枚举。

## 功能概览

- 域名搜索与购买入口：搜索结果与价格展示，点击购买跳转登录。
- 登录流程：支持邮箱魔法链接（模拟）与钱包登录（RainbowKit/Wagmi）。
- 控制台概览：站点/域名/余额指标与部署活跃度图表（Recharts）。
- 域名管理：列表、详情、DNS 记录编辑与发布（模拟）。
- 站点部署：上传包模拟部署日志，部署历史与域名绑定展示。
- 计费与用量：余额、充值、用量条与交易记录（模拟）。

## 技术栈

- React 19 + TypeScript
- Vite
- React Router
- Tailwind CSS（CDN 注入）
- RainbowKit + Wagmi
- TanStack Query
- Recharts
- Lucide Icons

## 本地运行

**Prerequisites:** Node.js

1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local)
3. Run the app:
   `npm run dev`

## 配置说明

- `vite.config.ts` 中读取 `GEMINI_API_KEY` 并注入到 `process.env`，当前前端未直接使用，可作为后续 API 集成预留。
- `App.tsx` 内置 RainbowKit `projectId` 作为钱包登录演示用途。
