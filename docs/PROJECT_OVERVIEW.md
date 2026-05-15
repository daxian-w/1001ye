# 1001 Leaf Project Overview

1001 Leaf is a H5-first plant exchange community front-end. It is designed for people who want to share idle plants, browse nearby exchange posts, publish plant care stories, and keep a lightweight community record around plant growth.

## Product Positioning

The project is not a generic marketplace UI. Its tone is closer to a neighborhood community: warm, practical, and trust-oriented. The core idea is to make plant sharing feel less like a transaction and more like a careful handoff.

## Core User Flows

1. Browse active plant exchange posts on the home page.
2. Search by plant name, species, or city.
3. Open a plant detail page and review availability, location, and exchange notes.
4. Publish a plant or community diary after logging in.
5. View personal session and exchange-related information from the Mine page.

## Current Features

- H5-first uni-app front-end
- Plant list, search, and detail views
- Community diary list
- Publish entry for plants and diary stories
- Login page, callback bridge, guest login, and development login support
- API service layer with token refresh handling
- Shared formatting, navigation, session, and view-model helpers
- H5 build output for static hosting

## Architecture

```text
src/
  pages/          Route pages and product screens
  services/       Backend API wrappers
  store/          Pinia session state
  utils/          Shared helpers
  static/         Tab bar and static UI assets
docs/
  assets/         Screenshots and repository media
```

## Backend Contract

The repository is currently front-end only. A compatible backend should provide the following API groups:

- `/api/plants`
- `/api/diaries`
- `/api/upload`
- `/api/auth/*`
- `/api/users/*`
- `/api/exchanges/*`

For local development, the Vite dev server proxies `/api` and `/uploads` to `http://localhost:3001`.

## Screenshots

![Project preview](./assets/2home-desktop.PNG)

## Open Source Readiness

The repository includes:

- MIT license
- README
- Contribution guide
- Roadmap
- Security policy
- GitHub issue templates
- Pull request template
- Safe environment variable examples
- `.gitignore` for dependencies, build output, logs, and local secrets

## Suggested Next Steps

- Add a mock API or demo backend so contributors can explore flows without a private service.
- Add ESLint, formatting, and CI checks.
- Add screenshots with real demo data once a public demo API exists.
- Verify mini program and app targets beyond H5.
