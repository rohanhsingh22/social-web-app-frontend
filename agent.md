# agent.md — Social Chat Frontend

This file guides AI coding agents working in this repo. Read it before making changes.

## 1. Project overview

Next.js (App Router) frontend for **Social Chat App V1** — live public channels, Facebook-only auth, profiles/onboarding, connections (placeholder), 1:1 DMs (placeholder).

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

- `next@^16.2.6`, `react@^19.2.3`, `react-dom@^19.2.3`, TypeScript `^5.9.3` (`strict`, `target ES2017`, path alias `@/* -> ./src/*`)
- `tailwindcss@^4.1.18` via `@tailwindcss/postcss` (`@import "tailwindcss"` in `src/app/globals.css`), `clsx`, `lucide-react`
- State/data: `@reduxjs/toolkit` + `react-redux` with **RTK Query** (`src/rtk/*`). `src/store/store.ts` = `baseApi.reducer + ui` slice. `ui-slice.ts` = `isChannelListOpen`, `toastMessage`.
- Installed but **not yet wired**: `@tanstack/react-query` (do not add parallel data layer without reason), `socket.io-client` (realtime not implemented — chat history is HTTP-only today).
- Lint: `eslint-config-next` core-web-vitals + typescript. Config: `eslint.config.mjs`, `next.config.ts` (`typedRoutes: false`), `postcss.config.mjs`.

## 3. Commands

```bash
npm install
npm run dev     # local dev
npm run build   # production build (also type-checks)
npm start       # serve built app
npm run lint    # eslint
```

Copy env before backend work:
```bash
cp .env.example .env.local  # then set URLs
```

## 4. Env / config

`src/lib/config.ts` reads (trailing slash stripped):
- `NEXT_PUBLIC_API_BASE_URL` (default `http://localhost:3000`) — used by `baseApi` + `FacebookLoginButton`.
- `NEXT_PUBLIC_REALTIME_URL` (default `http://localhost:3001`) — defined but **unused** (reserved for Socket.IO work).

`.env` / `.env*.local` are gitignored. Commit only `.env.example`. Never commit secrets.

## 5. Directory map

```
src/
  app/                          # Next.js App Router — thin route wrappers only
    page.tsx                    # / -> <ChatShell />
    channels/[slug]/page.tsx    # /channels/:slug -> <ChatShell initialSlug>
    login/page.tsx              # /login -> <LoginPanel />
    auth/callback/success/page.tsx
    onboarding/page.tsx
    connections/page.tsx
    connections/[conversationId]/page.tsx
    profile/page.tsx
    users/[username]/page.tsx
    settings/page.tsx
    layout.tsx                  # <html><body><AppProviders>
    globals.css                 # tailwind + CSS vars (--background, --brand, etc.)
  components/
    providers/app-providers.tsx # "use client", Redux <Provider store>
    layout/app-shell.tsx        # sidebar (desktop) + bottom nav (mobile): Channels/Connections/Profile
    auth/facebook-login-button.tsx  # redirects to `${apiBaseUrl}/auth/facebook`
    common/avatar.tsx           # img or initial fallback, sizes sm/md/lg
    common/locked-panel.tsx     # lock icon + title/message + login button
  features/                     # page-level UI; *-api.ts files are re-exports of rtk/*
    auth/{api.ts,login-panel.tsx,auth-callback-success.tsx}
    channels/{api.ts,chat-shell.tsx}  # ChatShell = 3-col layout, channel list, messages, composer
    connections/connections-page.tsx  # placeholder (search disabled)
    direct-messages/direct-message-page.tsx  # placeholder
    onboarding/onboarding-page.tsx    # username/dob/region/primaryLanguage -> PATCH /profiles/me
    profile/{api.ts,profile-page.tsx,public-profile-page.tsx}
    settings/settings-page.tsx        # logout -> POST /auth/logout
  rtk/
    base-api.ts                 # fetchBaseQuery(baseUrl, credentials:include, JSON headers), tags
    auth/auth-api.ts            # GET /auth/me, POST /auth/refresh, POST /auth/logout
    channels/channels-api.ts    # GET /channels, /channels/default, /channels/:slug, /:slug/messages?limit=50
    profile/profile-api.ts      # GET /profiles/me, GET /profiles/:username, PATCH /profiles/me
  lib/{config.ts,normalizers.ts} # defensive normalizers: snake_case/camelCase, {data,channels,messages,items} unwrapping
  types/domain.ts               # UserSummary, Channel, ChannelMessage, Connection, Profile, AuthSession
  store/{store.ts,ui-slice.ts}
doc/  # product + backend specs (source of truth for scope)
```

Route params in this Next version are `Promise<{...}>` and must be awaited (see `channels/[slug]/page.tsx`).

## 6. Data layer conventions

- All server state goes through `baseApi` (`credentials: "include"`, httpOnly cookie session). Do not store JWT in localStorage.
- `features/*/api.ts` must stay as thin re-exports of `rtk/*` (keeps imports stable: UI imports from `@/features/*/api`).
- Every API response goes through `src/lib/normalizers.ts` (`normalizeUser/Profile/AuthSession/Channels/ChannelMessages`). Backend may return `{data}`, `{channel}`, `{channels|messages|items}` in snake_case or camelCase — handle both, fall back to safe defaults (`"unknown"`, `0`, `[]`). `normalizeChannelMessage` generates `crypto.randomUUID()` if `id` missing.
- Auth: `useAuthSession()` returns `AuthSession | null` (`null` on 401/403, not an error). Gate private pages on `Boolean(authQuery.data)`. While `isLoading`, render loading state; when logged out, render `LockedPanel`.
- Channels: prefer explicit `channelQuery` when `initialSlug` set; else `defaultChannelQuery.data ?? channels.find(isDefault) ?? channels[0]`. Handle `isLoading / isError / empty / notFound` states explicitly (see `chat-shell.tsx`).
- Profiles: `useMyProfile(isLoggedIn)` with `skipToken` gating; fallback to `authQuery.data?.profile`. `usePublicProfile(username, isLoggedIn)` requires login. Updates via `useUpdateMyProfile()` (`PATCH /profiles/me`, invalidates `AuthSession, Profile`).
- Tag types: `AuthSession, Channels, Channel, ChannelMessages, Profile`. Logout dispatches `baseApi.util.resetApiState()`.

## 7. UI conventions

- All interactive pages are `"use client"`. `src/app/*.tsx` stay as server wrappers that render one feature component.
- Always wrap pages in `<AppShell>`. Use `LockedPanel` for guest-gated pages (profile, connections, DMs, onboarding, settings).
- Styling: Tailwind utility classes, slate palette, `rounded-md border border-slate-200 bg-white` cards, `h-11` inputs/buttons, `text-sm leading-6` body. Focus rings defined globally in `globals.css`. Icons from `lucide-react` with `aria-hidden`; icon-only buttons need `aria-label`.
- Auth callback (`auth-callback-success.tsx`): on session load, `router.replace("/onboarding")` if `profile && !profile.isComplete`, else `router.replace("/")`.
- Onboarding validation: username ≥3 chars, dob/region/language required. Profile edit: trim inputs, split `languages` on commas.
- Chat composer today is intentionally disabled: guests see login CTA; logged-in users see "Message sending is unavailable … requires the realtime message endpoint" and disabled send unless `message.trim().length in 1..500`.

## 8. Backend endpoints (implemented vs TODO)

Implemented (RTK Query):
`GET /auth/me`, `POST /auth/refresh`, `POST /auth/logout`, `GET /channels`, `GET /channels/default`, `GET /channels/:slug`, `GET /channels/:slug/messages?limit=50`, `GET /profiles/me`, `PATCH /profiles/me`, `GET /profiles/:username`, OAuth start `${apiBaseUrl}/auth/facebook`.

Not yet implemented (placeholders in UI — do not fake):
connections CRUD/search (`GET /connections`, `/requests/*`, `GET /users/search`), DM history (`GET /dm/conversations*`), reports/blocks (`POST /reports`, `/blocks`), admin APIs, Socket.IO events (`channel:join/leave`, `channel:message:new`, `dm:*`, `connection:request:*`, `auth:error`, `user:muted/banned`, presence).

## 9. Agent guidelines

When adding a feature:
1. Check `doc/frontend-chat-app.txt` + `doc/backend-chat-app.txt` for scope/route/event names first.
2. Add endpoint in `src/rtk/<domain>/*-api.ts` with normalizer + tags; re-export from `src/features/<domain>/api.ts`; consume via generated hooks in the feature component. Use `skipToken` for gated queries.
3. Keep `src/types/domain.ts` as the only domain-type source. Extend normalizers defensively (both casings, envelope keys).
4. Preserve guest/logged-in split: read-only for guests, `LockedPanel` for restricted routes. Never render private fields (email, DOB, Facebook IDs).
5. Keep changes mobile-first and accessible (labels, focus states, empty/loading/error states for every query).
6. Do not introduce a second HTTP client, auth storage, or CSS framework. Do not hardcode the default channel — use `/channels/default` with first-active fallback.
7. Run `npm run lint` and `npm run build` before finishing; fix type errors (strict mode, `noEmit`).

Common next tasks: wire `socket.io-client` to `NEXT_PUBLIC_REALTIME_URL` (join active `channel:{id}` room only, save-then-broadcast semantics, rate-limit/error states), implement connections + user search, DM conversation view, report/block UI.
