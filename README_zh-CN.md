# News Feed App (简易资讯移动端)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
![Status](https://img.shields.io/badge/Status-Deployed-success)

> [English](./README.md) | **中文**

> **项目名称**：news-feed-app  
> **开发人员**：郝乾程  
> **项目周期**：2025.11.15 - 2025.12.10  
> **代码仓库**：[https://github.com/Qiancheng-Hao/news-feed-app](https://github.com/Qiancheng-Hao/news-feed-app)  
> **演示地址**：[https://newsfeedapp.me](https://newsfeedapp.me)

<img src="./client/src/assets/imgs/qrCode.png" width="150" alt="QR Code">

## 1. 项目简介

本项目旨在构建一个简易的移动端资讯产品，核心功能涵盖用户账户体系、短图文内容的发布与编辑、以及基于时间流的信息展示。

项目后端采用 Node.js (Express) 开发，前端采用 React + Vite 框架。特色功能包括：

- **📱 移动端优先**：流畅的信息流体验与响应式布局。
- **📝 富文本编辑**：基于 Tiptap 的移动端适配编辑器，支持图片上传与代码高亮。
- **🤖 AI 赋能**：结合火山引擎 AI 能力，实现发布内容的多模态（文本+图片）自动标签识别与智能推荐。
- **🛡️ 安全机制**：集成了滑块验证码与邮箱验证码双重验证。
- **☁️ 云端存储**：基于火山引擎 TOS 的图片直传服务。

## 2. 🚀 快速开始 (Getting Started)

按照以下步骤在本地运行项目。

### 2.1 环境要求
- Node.js (v18+)
- MySQL (v8.0+)
- npm 或 yarn

### 2.2 安装依赖

1.  **克隆仓库**
    ```bash
    git clone https://github.com/Qiancheng-Hao/news-feed-app.git
    cd news-feed-app
    ```

2.  **安装依赖**
    ```bash
    # 安装服务端依赖
    cd server
    npm install

    # 安装客户端依赖
    cd ../client
    npm install
    ```

### 2.3 环境配置 (.env)

在 `server/` 目录下创建一个 `.env` 文件，并填入以下配置：

```env
# --- 基础配置 ---
PORT=3000

# --- 数据库配置 (MySQL) ---
DB_HOST=localhost
DB_USER=root
DB_PASS=your_password
DB_NAME=news_feed_db
DB_PORT=3306

# --- 安全配置 ---
JWT_SECRET=your_jwt_secret_key

# --- 对象存储 (火山引擎 TOS) ---
TOS_ACCESS_KEY=your_ak
TOS_SECRET_KEY=your_sk
TOS_REGION=your_region
TOS_ENDPOINT=your_endpoint
TOS_BUCKET=your_bucket_name

# --- AI 能力 (火山引擎 Ark / OpenAI SDK) ---
VOLC_ARK_API_KEY=your_api_key
VOLC_ARK_MODEL=your_model_id

# --- 邮件服务 (Resend) ---
RESEND_API_KEY=your_resend_key
```

### 2.4 启动项目

1.  **初始化数据库**
    *   确保 MySQL 服务已启动，并创建好名为 `news_feed_db` 的数据库（表结构会在项目启动时自动同步）。

2.  **运行服务**

    ```bash
    # 终端 1: 启动后端服务 (http://localhost:3000)
    cd server
    npm run dev

    # 终端 2: 启动前端服务 (http://localhost:5173)
    cd client
    npm run dev
    ```

## 3. 技术选型

### 3.1 前端技术栈

- **框架**：React 18 + Vite
- **UI组件库**：Ant Design Mobile + Arco Design
- **路由管理**：React Router v6
- **状态管理**：Zustand
- **网络请求**：Axios
- **富文本编辑器**：Tiptap (Headless Editor) + Lowlight (代码高亮)

### 3.2 后端技术栈

- **运行环境**：Node.js
- **Web框架**：Express
- **数据库**：MySQL
- **ORM框架**：Sequelize
- **鉴权方案**：JWT + BCrypt
- **文件存储**：火山引擎 TOS (Volcengine TOS SDK)
- **AI 能力**：OpenAI SDK (配置为火山引擎 Ark 接口，支持 Doubao 等模型)
- **邮件服务**：Resend API

## 4. 数据库设计

### 4.1 Users（用户表）

| 字段名     | 类型      | 描述               |
| :--------- | :-------- | :----------------- |
| id         | UUID      | 主键               |
| username   | VARCHAR   | 用户名             |
| email      | VARCHAR   | 邮箱               |
| password   | VARCHAR   | 密码（BCrypt加密） |
| avatar     | VARCHAR   | 头像URL            |
| created_at | TIMESTAMP | 注册时间           |

### 4.2 Posts（内容表）

| 字段名     | 类型      | 描述                   |
| :--------- | :-------- | :--------------------- |
| id         | UUID      | 主键                   |
| user_id    | UUID      | 外键，关联User         |
| content    | TEXT      | 富文本HTML内容         |
| images     | JSON      | 图片URL数组            |
| tags       | JSON      | AI识别的标签           |
| topics     | JSON      | AI生成的相关话题       |
| status     | ENUM      | 状态 (published/draft) |
| created_at | TIMESTAMP | 发布时间               |
| updated_at | TIMESTAMP | 更新时间               |

## 5. 接口设计

### 5.1 用户与鉴权模块 (`/api/auth`)

- `POST /send-code` : 发送邮箱验证码 (支持 type: 'register' | 'login' | 'update_password')
- `POST /register` : 用户注册 (需校验验证码)
- `POST /login` : 用户登录 (支持 type: 'password' | 'email_code')
- `GET /me` : 获取当前登录用户信息 (需 Token)
- `PUT /update` : 更新用户信息 (支持修改用户名、头像、密码)
- `POST /check-email` : 检查邮箱是否已存在

### 5.2 内容/发布模块 (`/api/posts`)

- `POST /` : 发布内容 (支持 status: 'published' | 'draft'，触发 AI 标签识别)
- `GET /` : 获取已发布内容列表 (支持分页 page, pageSize)
- `GET /draft` : 获取当前用户的最新草稿
- `GET /:id` : 获取内容详情
- `PUT /:id` : 修改内容 (支持更新状态、内容、图片)
- `DELETE /:id` : 删除内容

### 5.3 文件上传模块 (`/api/upload`)

- `GET /presign` : 获取 TOS 预签名上传地址 (前端直传模式)
- `DELETE /` : 删除云端文件 (需提供文件 URL)

## 6. 核心功能实现方案

### 6.1 前端架构与路由

- **目录结构**: 使用 `src/pages` 管理页面，`src/components` 管理组件。
- **路由规划**：
    - `/login`: 登录页 (支持密码/验证码切换)
    - `/register`: 注册页
    - `/`: 信息流首页 (Feed)
    - `/publish`: 发布/编辑页
    - `/profile`: 个人中心

### 6.2 登录注册与安全

- **双重验证**：注册与敏感操作引入**滑块验证码 (Slider Captcha)**，防止机器脚本。
- **鉴权流程**：用户输入 -> 后端校验 -> 生成 JWT -> 前端存入 LocalStorage。
- **拦截器**：Axios Request Interceptor 自动添加 `Authorization: Bearer <token>`，Response Interceptor 处理 401 跳转。

### 6.3 短图文编辑器 (Tiptap)

- **实现**：使用 `Tiptap` 无头编辑器，自定义 Toolbar 适配移动端操作（加粗、标题、列表、引用等）。
- **代码高亮**：集成 `lowlight` 实现代码块语法高亮。
- **自动保存**：
    - 前端监听内容变化 (Debounce)，将草稿存入 LocalStorage。
    - 页面初始化时检查本地是否有未提交草稿并回显。

### 6.4 AI 能力接入 (多模态)

- **标签与话题生成**：
    - 用户发布 -> 后端接收 (文本 + 图片URL) -> 调用火山引擎 Ark 接口 (适配 OpenAI SDK)。
    - Prompt: "根据用户提供的文本和图片内容，提取 10 到 15 个中文关键词标签..." 以及 "生成 3 到 5 个中文话题标签..."
    - 结果分别存入数据库 `tags` 和 `topics` 字段。
- **智能推荐**：
    - 详情页接口 `/posts/:id` 被调用时，后端根据当前文章 tags，查询匹配相同标签的其他文章返回。

## 7. 部署与开发计划

### 7.1 部署架构

- **代码托管**：GitHub
- **前端部署**：Vercel
- **后端部署**：Railway
- **CI/CD**: Vercel & Railway 自动触发构建与部署

### 7.2 开发排期回顾 (11.19-12.10)

- **第一阶段：基础架构 (11.19 - 11.22)**
    - [x] 项目初始化
    - [x] 数据库设计与 User 表
    - [x] JWT 登录/注册接口，滑块验证码组件
    - [x] 火山引擎 TOS 图片上传跑通

- **第二阶段：核心业务 (11.23 - 11.28)**
    - [x] 前端 Feed 流 UI
    - [x] Tiptap 编辑器集成与移动端适配
    - [x] 发布功能闭环 (图片+文字)

- **第三阶段：AI 与 挑战项 (11.29 - 12.05)**
    - [x] 后端接入火山引擎 Ark 模型 (自动打标签)
    - [x] 断网检测与自动草稿同步 (本地+云端)
    - [x] 详情页相关推荐逻辑

- **第四阶段：验收与交付 (12.06 - 12.10)**
    - [x] 全链路测试与 Bug 修复
    - [x] 线上环境部署
    - [x] 最终文档与演示