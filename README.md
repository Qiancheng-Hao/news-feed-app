# News Feed App

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
![Status](https://img.shields.io/badge/Status-Deployed-success)

> **English** | [中文](./README_zh-CN.md)

> **Project Name**: news-feed-app  
> **Developer**: HAO Qiancheng
> **Duration**: 2025.11.15 - 2025.12.10  
> **Repository**: [https://github.com/Qiancheng-Hao/news-feed-app](https://github.com/Qiancheng-Hao/news-feed-app)  
> **Live Demo**: [https://newsfeedapp.me](https://newsfeedapp.me)

<img src="./client/src/assets/imgs/qrCode.png" width="150" alt="QR Code">

## 1. Project Overview

This project aims to build a lightweight mobile news feed application. Core features include a user account system, rich-text content publishing and editing, and a time-based information feed.

The backend is built with Node.js (Express), and the frontend uses React + Vite. Key features include:

- **📱 Mobile-First**: Smooth scrolling feed and responsive layout.
- **📝 Rich Text Editor**: Tiptap-based editor optimized for mobile, supporting image uploads and code highlighting.
- **🤖 AI Powered**: Integrated with Volcengine AI to automatically extract tags and generate topics for multi-modal content (text + images).
- **🛡️ Security**: Dual verification with Slider Captcha and Email Verification codes.
- **☁️ Cloud Storage**: Direct-to-cloud image uploading via Volcengine TOS.

## 2. 🚀 Getting Started

Follow these steps to run the project locally.

### 2.1 Prerequisites
- Node.js (v18+)
- MySQL (v8.0+)
- npm or yarn

### 2.2 Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/Qiancheng-Hao/news-feed-app.git
    cd news-feed-app
    ```

2.  **Install Dependencies**
    ```bash
    # Install Server dependencies
    cd server
    npm install

    # Install Client dependencies
    cd ../client
    npm install
    ```

### 2.3 Environment Configuration (.env)

Create a `.env` file in the `server/` directory and add the following configuration:

```env
# --- Basic Config ---
PORT=3000

# --- Database Config (MySQL) ---
DB_HOST=localhost
DB_USER=root
DB_PASS=your_password
DB_NAME=news_feed_db
DB_PORT=3306

# --- Security ---
JWT_SECRET=your_jwt_secret_key

# --- Object Storage (Volcengine TOS) ---
TOS_ACCESS_KEY=your_ak
TOS_SECRET_KEY=your_sk
TOS_REGION=your_region
TOS_ENDPOINT=your_endpoint
TOS_BUCKET=your_bucket_name

# --- AI Capabilities (Volcengine Ark / OpenAI SDK) ---
VOLC_ARK_API_KEY=your_api_key
VOLC_ARK_MODEL=your_model_id

# --- Email Service (Resend) ---
RESEND_API_KEY=your_resend_key
```

### 2.4 Running the App

1.  **Initialize Database**
    *   Ensure MySQL is running and create a database named `news_feed_db`. The tables will be automatically synchronized when the server starts.

2.  **Start Services**

    ```bash
    # Terminal 1: Start Backend (http://localhost:3000)
    cd server
    npm run dev

    # Terminal 2: Start Frontend (http://localhost:5173)
    cd client
    npm run dev
    ```

## 3. Tech Stack

### 3.1 Frontend

- **Framework**: React 18 + Vite
- **UI Library**: Ant Design Mobile + Arco Design
- **Routing**: React Router v6
- **State Management**: Zustand
- **Network**: Axios
- **Editor**: Tiptap (Headless Editor) + Lowlight (Syntax Highlighting)

### 3.2 Backend

- **Runtime**: Node.js
- **Web Framework**: Express
- **Database**: MySQL
- **ORM**: Sequelize
- **Auth**: JWT + BCrypt
- **Storage**: Volcengine TOS (Volcengine TOS SDK)
- **AI**: OpenAI SDK (Configured for Volcengine Ark, supporting Doubao models)
- **Email**: Resend API

## 4. Database Design

### 4.1 Users

| Field      | Type      | Description               |
| :--------- | :-------- | :------------------------ |
| id         | UUID      | Primary Key               |
| username   | VARCHAR   | Username                  |
| email      | VARCHAR   | Email                     |
| password   | VARCHAR   | Password (BCrypt Encrypted)|
| avatar     | VARCHAR   | Avatar URL                |
| created_at | TIMESTAMP | Registration Time         |

### 4.2 Posts

| Field      | Type      | Description                   |
| :--------- | :-------- | :---------------------------- |
| id         | UUID      | Primary Key                   |
| user_id    | UUID      | Foreign Key (User)            |
| content    | TEXT      | Rich Text HTML                |
| images     | JSON      | Array of Image URLs           |
| tags       | JSON      | AI Extracted Tags             |
| topics     | JSON      | AI Generated Topics           |
| status     | ENUM      | Status (published/draft)      |
| created_at | TIMESTAMP | Publish Time                  |
| updated_at | TIMESTAMP | Update Time                   |

## 5. API Design

### 5.1 Auth Module (`/api/auth`)

- `POST /send-code` : Send email verification code (supports type: 'register' | 'login' | 'update_password')
- `POST /register` : User registration (requires verification code)
- `POST /login` : User login (supports type: 'password' | 'email_code')
- `GET /me` : Get current user info (requires Token)
- `PUT /update` : Update user info (username, avatar, password)
- `POST /check-email` : Check if email exists

### 5.2 Posts Module (`/api/posts`)

- `POST /` : Create post (supports status: 'published' | 'draft', triggers AI tagging)
- `GET /` : Get published posts list (supports pagination)
- `GET /draft` : Get current user's latest draft
- `GET /:id` : Get post details
- `PUT /:id` : Update post (status, content, images)
- `DELETE /:id` : Delete post

### 5.3 Upload Module (`/api/upload`)

- `GET /presign` : Get TOS pre-signed upload URL (Frontend direct upload)
- `DELETE /` : Delete cloud file

## 6. Core Implementation

### 6.1 Frontend Architecture

- **Structure**: `src/pages` for views, `src/components` for reusable UI.
- **Routes**:
    - `/login`: Login (Password/Code)
    - `/register`: Registration
    - `/`: Home Feed
    - `/publish`: Create/Edit Post
    - `/profile`: User Profile

### 6.2 Security

- **Dual Verification**: **Slider Captcha** is required for registration and sensitive actions to prevent bots.
- **Auth Flow**: User Input -> Backend Verify -> Generate JWT -> Frontend LocalStorage.
- **Interceptors**: Axios Request Interceptor adds `Authorization: Bearer <token>`, Response Interceptor handles 401 redirects.

### 6.3 Rich Text Editor (Tiptap)

- **Implementation**: Tiptap headless editor with a custom Toolbar adapted for mobile (Bold, Header, List, Quote, etc.).
- **Highlighting**: Integrated `lowlight` for code block syntax highlighting.
- **Auto-Save**:
    - Frontend listens for content changes (Debounce) and saves drafts to LocalStorage.
    - Restores unsubmitted drafts on page load.

### 6.4 AI Integration (Multi-modal)

- **Tags & Topics**:
    - User Publish -> Backend receives (Text + Image URLs) -> Calls Volcengine Ark API (OpenAI SDK).
    - Prompt: "Extract 10-15 Chinese keywords..." and "Generate 3-5 Chinese topic tags..." based on content.
    - Results saved to `tags` and `topics` fields.
- **Smart Recommendations**:
    - When `/posts/:id` is called, backend queries other posts matching the current post's tags.

## 7. Deployment & Roadmap

### 7.1 Architecture

- **Code**: GitHub
- **Frontend**: Vercel
- **Backend**: Railway
- **CI/CD**: Automated build & deploy via Vercel & Railway

### 7.2 Development Timeline (Nov 19 - Dec 10)

- **Phase 1: Infrastructure (Nov 19 - Nov 22)**
    - [x] Project Init
    - [x] DB Design & User Table
    - [x] JWT Auth & Slider Captcha
    - [x] Volcengine TOS Upload

- **Phase 2: Core Business (Nov 23 - Nov 28)**
    - [x] Frontend Feed UI
    - [x] Tiptap Editor & Mobile Adaptation
    - [x] Publishing Flow (Image + Text)

- **Phase 3: AI & Challenges (Nov 29 - Dec 05)**
    - [x] Backend AI Integration (Auto Tagging)
    - [x] Offline Detection & Auto Draft Sync
    - [x] Detail Page Recommendations

- **Phase 4: Delivery (Dec 06 - Dec 10)**
    - [x] Full Testing & Bug Fixes
    - [x] Production Deployment
    - [x] Final Documentation
