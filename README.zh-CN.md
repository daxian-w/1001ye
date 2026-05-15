# 1001 Leaf

[English](./README.md) | [简体中文](./README.zh-CN.md)

1001 Leaf 是一个正在慢慢生长的开源植物交换社区。

它最初来自一个很朴素的愿望：当一盆植物长满了窗台，当一段扦插枝条成功生根，当有人想认真记录一段养护故事时，应该有一个更温暖的地方，让这些连接自然发生。我们希望植物分享不只是一次交易，而更像一次温柔的托付，把绿色、经验和善意交到另一个也愿意认真照顾它的人手里。

当前版本是一个 H5 优先的前端项目，使用 `uni-app`、Vue 3、Pinia、Vite 和 Sass 构建。它支持浏览共享植物、发布交换信息、记录植物日记，并为多平台客户端打下用户会话管理基础。

这个仓库也是一份邀请。如果你喜欢植物，或者对前端开发、产品设计、文档、测试、社区工具感兴趣，都欢迎一起来参与。一个 issue、一个 UI 建议、一次 bug 修复，甚至只是从真实植物爱好者角度提出的一点感受，都可能帮助 1001 Leaf 长成一个更温柔、更有用的小社区。

## 项目状态

这个仓库目前作为开源前端项目发布。完整业务流程依赖兼容的后端 API 服务。

## 预览

![项目预览](./docs/assets/2home-desktop.PNG)

当前已包含的前端能力：

- 植物列表、搜索和详情页
- 植物发布与图片上传流程
- 社区日记列表与发布入口
- 登录、回调处理、游客登录和开发登录支持
- 个人中心页面
- API 服务层、会话工具和 H5 回调桥接
- H5 开发与生产构建

## 技术栈

- `uni-app`
- `Vue 3`
- `Pinia`
- `Vite`
- `Sass`

## 项目结构

```text
src/
  pages/          应用页面
  services/       API 请求封装
  store/          Pinia 状态管理
  utils/          会话、跳转、格式化和视图模型工具
  static/         静态资源
```

## 本地开发

### 环境要求

- Node.js 18+
- npm 9+

### 安装依赖

```bash
npm install
```

### 配置环境变量

复制 `.env.example` 创建本地 `.env`：

```bash
cp .env.example .env
```

重要变量：

| 变量 | 说明 |
| --- | --- |
| `VITE_API_BASE_URL` | 后端 API 地址。本地默认可使用 `http://localhost:3001`。 |
| `VITE_WECHAT_OPEN_APP_ID` | 如启用微信登录，可填写微信开放平台网站应用 AppID。 |

请不要提交真实密钥、生产回调地址、私有 token 或账号凭据。

### 启动 H5 开发环境

```bash
npm run dev:h5
```

默认访问地址：

```text
http://localhost:8080
```

### 构建 H5

```bash
npm run build:h5
```

构建产物目录：

```text
dist/build/h5
```

### 其他平台命令

```bash
npm run dev:mp-weixin
npm run build:mp-weixin
npm run dev:app
npm run build:app
```

目前 H5 是主要验证目标，微信小程序和 App 目标保留在脚本中，后续还需要继续联调和验证。

## 后端依赖

本仓库不包含后端服务。兼容后端至少需要提供：

- `/api/plants`
- `/api/diaries`
- `/api/upload`
- `/api/auth/*`
- `/api/users/*`
- `/api/exchanges/*`

本地 H5 开发时，Vite 会将 `/api` 和 `/uploads` 代理到 `http://localhost:3001`。

## 部署

同域部署时，可以将 H5 构建产物作为 `/` 静态站点，并把 `/api` 和 `/uploads` 反向代理到后端服务。

Nginx 示例见 [nginx.zhiwu2.conf.example](./nginx.zhiwu2.conf.example)。

## 路线图

见 [ROADMAP.md](./ROADMAP.md)。

## 项目说明

更完整的产品与工程说明见 [docs/PROJECT_OVERVIEW.md](./docs/PROJECT_OVERVIEW.md)。

## 参与贡献

欢迎参与贡献。提交 PR 前请先阅读 [CONTRIBUTING.md](./CONTRIBUTING.md)。

## 开源协议

本项目使用 [MIT License](./LICENSE)。
