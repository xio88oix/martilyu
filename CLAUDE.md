# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start development server at http://localhost:3000
npm run build     # Build for production (static export to dist/)
npm run start     # Start production server
npm run lint      # Run ESLint
```

## Architecture

This is a **Next.js 14 App Router** project with a static export configuration.

**Key config** (`next.config.js`):
- `output: 'export'` — builds to static files in `dist/`
- `basePath: '/next'` — all routes are prefixed with `/next`
- `trailingSlash: true`
- `reactStrictMode: false`
- Styled Components compiler enabled
- SCSS uses `sass-embedded`

**Path alias**: `@/*` maps to `./src/*`

**State management**: Redux Toolkit + redux-persist (`react-redux`)

**UI components**: MUI Material + MUI Joy + MUI X (DataGrid, DatePickers), Base UI

**Styling**: Tailwind CSS v4 + SCSS + Emotion (used by MUI)

**HTTP**: Axios

**Fonts**: Oswald and Source Sans Pro via fontsource packages

Since `output: 'export'` is set, Next.js server-side features (API routes, server actions, dynamic routes without `generateStaticParams`) are not available.
