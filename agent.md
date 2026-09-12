# agent.md — Social Chat Frontend

This file guides AI coding agents working in this repo. Read it before making changes.

## 1. Project overview

React + Vite (SPA) frontend for **Social Chat App V1** — live public channels, Facebook-only auth, profiles/onboarding, connections (placeholder), 1:1 DMs (placeholder).

Product spec: `doc/frontend-chat-app.txt`
Backend contract / scale plan: `doc/backend-chat-app.txt`

Key product rules (V1):
- `/` opens directly into Channels (the product, not a marketing page). Mobile-first.
- Guests: read-only public channels (`GET /channels`, `/channels/default`, `/channels/:slug/messages`). Cannot send messages, view profiles, use connections/DMs. Show `LockedPanel` + "Login with Facebook to chat".
- Logged-in (Facebook OAuth via backend only): channel chat, profiles, connections, DMs.
- No password/email/OTP/Google/Apple login. No posts/feed/reels, replies/threads, likes/reactions, attachments/voice/video, group DMs, user-created channels.
- Message limits: channel 500 chars (enforced in `chat-shell.tsx`), DM 1000 chars (backend). No HTML; strip/escape unsafe content server-side.
- Privacy: never expose Facebook ID/token, email, phone, exact DOB, IP/UA, moderation status. Public profile shows only displayName, username, avatar, bio, ageGroup, region, languages.

## 2. Tech stack

- `vite@^8` + `@vitejs/plugin-react`, `react@^19.2.3`, `react-dom@^19.2.3`, `react-router-dom@^7`, TypeScript `^5.9.3` (`strict`, `target ES2017`, path alias `@/* -> ./src/*`)
- `tailwindcss@^4.1.18` via `@tailwindcss/postcss` (`@import "tailwindcss"` in `src/index.css`), `clsx`, `lucide-react`, shadcn/ui (new-york)
- State/data: `@reduxjs/toolkit` + `react-redux` with **RTK Query** (`src/rtk/*`). `src/store/store.ts` = `baseApi.reducer + ui` slice. `ui-slice.ts` = `isChannelListOpen`, `toastMessage`, `theme` (mode: light/dark/system + accent).
- Realtime: `socket.io-client` wired via `src/lib/realtime.ts` (namespace `/channels`) + `src/features/channels/use-channel-socket.ts`.
- Installed but **not used**: `@tanstack/react-query` (do not add a parallel data layer without reason).
- Lint: `eslint.config.mjs` with `typescript-eslint` + `eslint-plugin-react-hooks` + `eslint-plugin-react-refresh`. Build config: `vite.config.ts` (React plugin, `@` alias, dev server port 3000), `postcss.config.mjs`, `index.html` (metadata + pre-hydration theme init script).

## 3. Commands

```bash
npm install
npm run dev        # Vite dev server at http://localhost:3000
npm run build      # tsc --noEmit && vite build -> dist/
npm run preview    # serve production build locally
npm start          # alias for vite preview
npm run lint       # eslint
npm run typecheck  # tsc --noEmit
```

Copy env before backend work:
```bash
cp .env.example .env.local  # then set URLs (Vite reads .env / .env.local)
```

## 4. Env / config

`src/lib/config.ts` reads (trailing slash stripped):
- `VITE_API_BASE_URL` (default `http://localhost:3000`) — used by `baseApi`, `src/lib/auth-token.ts` (refresh), and the OAuth provider buttons.
- `VITE_REALTIME_URL` (default `http://localhost:3001`) — Socket.IO base URL for `src/lib/realtime.ts` (namespace `/channels`).

`.env` / `.env*.local` are gitignored. Commit only `.env.example`. Never commit secrets.

## 5. Directory map

```
src/
  main.tsx                      # entry: BrowserRouter -> AppProviders -> AppRoutes
  index.css                     # tailwind import + theme CSS vars
  router.tsx                    # React Router route table (13 routes + 404)
  pages/                        # thin route components only
    chat-page.tsx               # / -> <ChatShell />
    channel-page.tsx            # /channels/:slug -> useParams -> <ChatShell initialSlug>
    home-page.tsx               # /home -> AppShell + lazy CharacterScene
    thoughts-page.tsx           # /thoughts (coming soon)
    messages-page.tsx           # /messages (coming soon)
    login-page.tsx              # /login -> <LoginPanel />
    auth-callback-success-page.tsx  # /auth/callback/success
    onboarding-page.tsx
    connections-page.tsx        # /connections
    direct-message-page.tsx     # /connections/:conversationId
    profile-page.tsx            # /profile
    user-profile-page.tsx       # /users/:username
    settings-page.tsx           # /settings
    not-found-page.tsx          # catch-all 404
  components/
    providers/app-providers.tsx # Redux <Provider> + ThemeProvider
    providers/theme-provider.tsx# localStorage -> Redux -> server settings theme sync
    layout/app-shell.tsx        # sidebar (desktop) + bottom nav (mobile): Home/Messages/Thoughts/Connections/Settings + Channels
    layout/user-menu.tsx        # avatar dropdown: theme toggle, settings, logout
    auth/provider-login-button.tsx  # full-page redirect to `${apiBaseUrl}/auth/${provider.id}`
    common/locked-panel.tsx     # lock icon + title/message + login button
    common/avatar.tsx           # img or initial fallback
    character/{avatar,character-scene}.tsx  # R3F 3D avatars (GLBs in public/character-scene/)
    theme/{theme-controls,theme-toggle}.tsx
  features/                     # page-level UI; *-api.ts files are re-exports of rtk/*
    auth/{api.ts,login-panel.tsx,auth-callback-success.tsx}
    channels/{api.ts,chat-shell.tsx,channel-list.tsx,use-channel-socket.ts}  # socket lifecycle + events
    connections/connections-page.tsx  # placeholder (search disabled)
    direct-messages/direct-message-page.tsx  # placeholder
    onboarding/onboarding-page.tsx    # username/dob/region/primaryLanguage -> PATCH /profiles/me
    profile/{api.ts,profile-page.tsx,public-profile-page.tsx}
    settings/settings-page.tsx        # theme/accent/visibility -> PATCH /settings, logout
  rtk/
    base-api.ts                 # fetchBaseQuery(baseUrl, credentials:include, JSON headers) + 401 re-auth retry
    auth/auth-api.ts            # GET /auth/me, POST /auth/refresh, POST /auth/logout, useAuthSession()
    channels/channels-api.ts    # GET /channels, /channels/default, /channels/:slug, /:slug/messages?limit=50
    profile/profile-api.ts      # GET /profiles/me, GET /profiles/:username, PATCH /profiles/me
    settings/settings-api.ts    # GET /settings, PATCH /settings
  lib/
    config.ts                   # env -> apiBaseUrl / realtimeUrl
    auth-token.ts               # in-memory access token, expiry, deduped refresh
    realtime.ts                 # createChannelSocket() (Socket.IO /channels namespace)
    theme.ts                    # THEME_STORAGE_KEY, readStoredTheme, applyTheme, accentOptions
    normalizers.ts              # defensive normalizers: snake/camel case + envelope unwrapping
  types/domain.ts               # UserSummary, Channel, ChannelMessage, Connection, Profile, AuthSession
  store/{store.ts,ui-slice.ts}
doc/  # product + backend specs (source of truth for scope)
```

Route params come from `useParams()` from `react-router-dom` inside the page wrapper (see `src/pages/channel-page.tsx`). Keep `src/pages/*` thin — one feature component per route.

## 6. Data layer conventions

- All server state goes through `baseApi` (`credentials: "include"`, httpOnly refresh cookie). The access token lives in module memory only (`src/lib/auth-token.ts`) — never store JWTs in localStorage. On 401, `baseQueryWithReauth` refreshes via `POST /auth/refresh` and retries once.
- `features/*/api.ts` must stay as thin re-exports of `rtk/*` (keeps imports stable: UI imports from `@/features/*/api`).
- Every API response goes through `src/lib/normalizers.ts` (`normalizeUser/Profile/AuthSession/Channels/ChannelMessages`). Backend may return `{data}`, `{channel}`, `{channels|messages|items}` in snake_case or camelCase — handle both, fall back to safe defaults (`"unknown"`, `0`, `[]`). `normalizeChannelMessage` generates `crypto.randomUUID()` if `id` missing.
- Auth: `useAuthSession()` returns `AuthSession | null` (`null` on 401/403, not an error). Gate private pages on `Boolean(authQuery.data)`. While `isLoading`, render loading state; when logged out, render `LockedPanel`.
- Channels: prefer explicit `channelQuery` when `initialSlug` set; else `defaultChannelQuery.data ?? channels.find(isDefault) ?? channels[0]`. Handle `isLoading / isError / empty / notFound` states explicitly (see `chat-shell.tsx`).
- Profiles: `useMyProfile(isLoggedIn)` with `skipToken` gating; fallback to `authQuery.data?.profile`. `usePublicProfile(username, isLoggedIn)` requires login. Updates via `useUpdateMyProfile()` (`PATCH /profiles/me`, invalidates `AuthSession, Profile`).
- Tag types: `AuthSession, Channels, Channel, ChannelMessages, Profile, Settings`. Logout dispatches `baseApi.util.resetApiState()`.

## 7. UI conventions

- Pages live in `src/pages/*` and render one feature component each. Navigation uses `react-router-dom` (`Link`, `useNavigate`, `useLocation`); the only `window.location` navigation is the OAuth provider redirect in `provider-login-button.tsx`.
- Always wrap pages in `<AppShell>`. Use `LockedPanel` for guest-gated pages (profile, connections, DMs, onboarding, settings).
- Styling: Tailwind utility classes + semantic theme tokens (`bg-surface`, `text-ink`, `border-line`, `bg-brand-soft`, etc. — see `src/index.css`). Focus rings defined globally in `src/index.css`. Icons from `lucide-react` with `aria-hidden`; icon-only buttons need `aria-label`.
- Auth callback (`auth-callback-success.tsx`): on session load, `navigate("/onboarding", { replace: true })` if `profile && !profile.isComplete`, else `navigate("/", { replace: true })`.
- Onboarding validation: username ≥3 chars, dob/region/language required. Profile edit: trim inputs, split `languages` on commas.
- Chat composer: guests see a login CTA; logged-in users send via Socket.IO (`channel:message:send` with ack) when socket status is `connected`, not banned/muted, and `message.trim().length in 1..500`. Rate-limit/muted/banned/offline states render inline banners.

## 8. Backend endpoints (implemented vs TODO)

Implemented (RTK Query):
`GET /auth/me`, `POST /auth/refresh`, `POST /auth/logout`, `GET /channels`, `GET /channels/default`, `GET /channels/:slug`, `GET /channels/:slug/messages?limit=50`, `GET /profiles/me`, `PATCH /profiles/me`, `GET /profiles/:username`, `GET /settings`, `PATCH /settings`, OAuth start `${apiBaseUrl}/auth/{provider}`.

Not yet implemented (placeholders in UI — do not fake):
connections CRUD/search (`GET /connections`, `/requests/*`, `GET /users/search`), DM history (`GET /dm/conversations*`), reports/blocks (`POST /reports`, `/blocks`), admin APIs, Socket.IO DM/connection events (`dm:*`, `connection:request:*`). Channel socket events (`channel:join/leave`, `channel:message:send/new`, `channel:presence:update`, `channel:error`, `auth:error`, `user:muted/banned`) are already handled client-side in `use-channel-socket.ts`.

## 9. Agent guidelines

When adding a feature:
1. Check `doc/frontend-chat-app.txt` + `doc/backend-chat-app.txt` for scope/route/event names first.
2. Add endpoint in `src/rtk/<domain>/*-api.ts` with normalizer + tags; re-export from `src/features/<domain>/api.ts`; consume via generated hooks in the feature component. Use `skipToken` for gated queries.
3. Keep `src/types/domain.ts` as the only domain-type source. Extend normalizers defensively (both casings, envelope keys).
4. Preserve guest/logged-in split: read-only for guests, `LockedPanel` for restricted routes. Never render private fields (email, DOB, Facebook IDs).
5. Keep changes mobile-first and accessible (labels, focus states, empty/loading/error states for every query).
6. Do not introduce a second HTTP client, auth storage, or CSS framework. Do not hardcode the default channel — use `/channels/default` with first-active fallback.
7. Keep new routes as thin `src/pages/*` wrappers registered in `src/router.tsx`; use `useParams` for dynamic segments and `react-router-dom` navigation hooks only.
8. Run `npm run typecheck`, `npm run lint`, and `npm run build` before finishing; fix type errors (strict mode).

Common next tasks: extend the wired Socket.IO client (`src/lib/realtime.ts` + `use-channel-socket.ts`) for DM/connection namespaces and presence, implement connections + user search, DM conversation view, report/block UI.
