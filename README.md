# SJY 财务制度知识库

## 项目说明

这是一个基于 AI 的财务制度知识库问答系统，包含前端界面和后端 Agent。

## 功能

- ✅ 用户登录认证
- ✅ 知识库智能问答
- ✅ 文档来源追溯
- ✅ 聊天历史记录

## 技术架构

### 前端
- HTML + CSS + JavaScript（原生）
- GitHub Pages 托管
- 响应式设计

### 后端
- Node.js + Express
- JWT 认证
- 知识库搜索
- OpenClaw AI 集成

## 快速开始

### 1. 启动后端 Agent

```bash
cd agent
node server.js
```

服务器将在 `http://localhost:3000` 启动。

### 2. 打开前端

用浏览器打开 `login.html`

### 3. 登录

- 用户名：`admin`
- 密码：`admin123`

### 4. 开始提问

例如：
- "北京出差住宿费标准是多少？"
- "差旅费报销需要什么材料？"
- "采购管理办法有哪些规定？"

## 目录结构

```
SJY/
├── login.html         # 登录页面
├── chat.html          # 聊天页面
├── config.js          # API 配置
└── README.md          # 本文件
```

## 部署

### GitHub Pages

1. 推送代码到 GitHub
2. 在仓库设置中启用 GitHub Pages
3. 选择分支：`main`
4. 访问：`https://你的用户名.github.io/SJY/login.html`

### 内网穿透（Cloudflare Tunnel）

```bash
# 安装
brew install cloudflared

# 启动
cloudflared tunnel --url http://localhost:3000
```

获得公网 URL 后，修改 `config.js` 中的 `apiUrl`。

## 默认账号

- 用户名：`admin`
- 密码：`admin123`

## 知识库

位置：`/Users/macpony/shared/program/SJY-Analysis/knowledge/财务制度/`

包含 27 个财务制度文档：
- 国内差旅费管理办法
- 资产管理办法
- 招标采购管理办法
- 货币资金管理办法
- 等等...

## 开发计划

- [x] 后端 Agent 开发
- [x] 前端页面开发
- [ ] 本地测试
- [ ] 内网穿透
- [ ] 部署上线
- [ ] 接入真实 AI（OpenClaw）

## 许可证

MIT
