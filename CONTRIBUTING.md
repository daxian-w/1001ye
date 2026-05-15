# Contributing

Thank you for considering a contribution to 1001 Leaf.

## Before You Start

For larger changes, please open an issue first so the scope can be discussed. For small bug fixes, documentation updates, or clear improvements, feel free to open a pull request directly.

## Local Development

Recommended environment:

- Node.js 18+
- npm 9+

Install dependencies:

```bash
npm install
```

Start H5 development:

```bash
npm run dev:h5
```

Build H5:

```bash
npm run build:h5
```

The full product flow needs a compatible backend API. The default local proxy target is `http://localhost:3001`.

## Branch Names

Suggested branch names:

- `feat/xxx`
- `fix/xxx`
- `docs/xxx`
- `refactor/xxx`
- `chore/xxx`

Examples:

```text
feat/publish-form-validation
fix/login-callback-redirect
docs/readme-open-source
```

## Commit Messages

Use clear, traceable commit messages. A conventional format is recommended:

```text
type(scope): summary
```

Examples:

```text
feat(publish): add image upload validation
fix(auth): handle missing callback code
docs(readme): clarify backend dependency
```

## Pull Requests

Please include:

- What changed and why
- How you tested it
- Screenshots or screen recordings for UI changes
- Related issues, if any
- Known risks or follow-up work

## Code Guidelines

- Keep changes focused.
- Follow the existing directory structure and naming style.
- Put API calls in `src/services`.
- Put shared helpers in `src/utils`.
- Do not commit `node_modules`, build output, logs, or local environment files.
- Do not commit real secrets, tokens, app secrets, or production account details.

## Manual Verification

Until automated tests are expanded, please verify at least:

- The app starts locally.
- H5 build succeeds.
- Relevant pages still render.
- Affected workflows still behave as expected.

Pay extra attention to:

- Login and callback handling
- Publishing flow
- Image upload
- Page navigation
- Session expiration

## Security

Please do not publicly disclose sensitive security details in an issue. If you find a vulnerability, contact the maintainers privately until a security policy is added.
