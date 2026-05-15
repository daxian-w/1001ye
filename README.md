# 1001 Leaf

1001 Leaf is a plant exchange community front-end built with `uni-app`, Vue 3, Pinia, Vite, and Sass.

The project focuses on a lightweight community experience for browsing shared plants, publishing exchange posts, keeping plant diaries, and managing a user session across H5-first multi-platform clients.

## Status

This repository is currently prepared as an open-source front-end project. It depends on a compatible backend API for the full product flow.

## Preview

![Project preview](./docs/assets/2home-desktop.PNG)

Implemented client-side areas include:

- Plant listing, search, and detail pages
- Plant publishing and image upload flow
- Community diary list and publishing entry
- Login, callback handling, guest login, and development login support
- User profile / "Mine" page
- API service layer, session utilities, and H5 callback bridge
- H5 development and production builds

## Tech Stack

- `uni-app`
- `Vue 3`
- `Pinia`
- `Vite`
- `Sass`

## Project Structure

```text
src/
  pages/          Application pages
  services/       API request wrappers
  store/          Pinia stores
  utils/          Session, navigation, formatting, and view-model helpers
  static/         Static assets
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Install

```bash
npm install
```

### Configure Environment

Create a local `.env` file from `.env.example`:

```bash
cp .env.example .env
```

Important variables:

| Variable | Description |
| --- | --- |
| `VITE_API_BASE_URL` | Backend API origin. Use `http://localhost:3001` for the default local setup. |
| `VITE_WECHAT_OPEN_APP_ID` | WeChat Open Platform website application AppID, if WeChat login is enabled. |

Do not commit real secrets, production callback URLs, private tokens, or account credentials.

### Run H5 Development

```bash
npm run dev:h5
```

Default local URL:

```text
http://localhost:8080
```

### Build H5

```bash
npm run build:h5
```

Build output:

```text
dist/build/h5
```

### Other Targets

```bash
npm run dev:mp-weixin
npm run build:mp-weixin
npm run dev:app
npm run build:app
```

The WeChat mini program and app targets are present in scripts, but H5 is the primary verified target at this stage.

## Backend Dependency

This repository does not include the backend service. A compatible backend should provide at least:

- `/api/plants`
- `/api/diaries`
- `/api/upload`
- `/api/auth/*`
- `/api/users/*`
- `/api/exchanges/*`

In local H5 development, Vite proxies `/api` and `/uploads` to `http://localhost:3001`.

## Deployment

For same-origin deployment, serve the H5 build output from `/` and proxy `/api` and `/uploads` to the backend service.

See [nginx.zhiwu2.conf.example](./nginx.zhiwu2.conf.example) for an Nginx example.

## Roadmap

See [ROADMAP.md](./ROADMAP.md).

## Project Overview

See [docs/PROJECT_OVERVIEW.md](./docs/PROJECT_OVERVIEW.md) for a fuller product and engineering summary.

## Contributing

Contributions are welcome. Please read [CONTRIBUTING.md](./CONTRIBUTING.md) before opening a pull request.

## License

This project is licensed under the [MIT License](./LICENSE).
