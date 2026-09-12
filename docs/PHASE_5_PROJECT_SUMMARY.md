# HiRotoli Project Summary — End of Phase 5

> **Analysis Date:** 2026-09-08
> **Git State:** `main` branch, commit `36e356a` ("feat: completed till phase 5")
> **Scope:** Current implementation only. No planned/desired features are documented as existing.

---

# 1. Project Overview

## What HiRotoli Currently Does

HiRotoli is a live social chat web application where users can join public channels based on language, age group, region, and general topics. Guests can read public channel messages in real-time, while authenticated users can send messages, manage profiles, and view other users' profiles.

The name "HiiToli" appears in the login panel branding (`src/features/auth/login-panel.tsx`).

## Current Frontend Technology

- **Framework:** Next.js v16.2.6 (App Router)
- **Language:** TypeScript v5.9.3 (strict mode, target ES2017)
- **UI Library:** React v19.2.3
- **Styling:** Tailwind CSS v4.1.18 via `@tailwindcss/postcss`
- **State Management:** Redux Toolkit + React Redux with RTK Query
- **Realtime:** Socket.IO Client v4.8.1 (installed and partially wired)
- **3D Rendering:** Three.js v0.185.1, @react-three/fiber, @react-three/drei
- **Icons:** Lucide React v0.555.0
- **UI Components:** shadcn/ui (new-york style) with Radix UI primitives

## Current Backend Technology

The frontend communicates with a backend at `NEXT_PUBLIC_API_BASE_URL` (default `http://localhost:3000`). Based on documentation, the backend is designed to be:

- **Framework:** NestJS with TypeScript
- **Auth:** Facebook OAuth 2.0 (server-side flow)
- **API Style:** RESTful HTTP + WebSocket (Socket.IO)
- **Realtime Server:** Separate realtime app at `NEXT_PUBLIC_REALTIME_URL` (default `http://localhost:3001`)

**Note:** The backend implementation is not in this repository. This document describes the backend based on what the frontend expects and the API contract docs.

## Database

- **Primary:** PostgreSQL (designed per docs, not in this repo)
- **Purpose:** Permanent storage for users, profiles, channels, messages, connections, reports, blocks

## Redis

- **Purpose (designed):** Socket.IO pub/sub adapter, presence tracking, online counts, rate limiting, queues
- **Note:** Redis usage is described in backend docs; the frontend does not directly interact with Redis

## Authentication

- **Method:** Facebook OAuth 2.0 only
- **Flow:** Backend redirects to Facebook, Facebook callbacks to backend, backend creates session
- **Token Strategy:** Short-lived JWT access token + refresh token stored as httpOnly cookie
- **Frontend Storage:** Access token held in memory (`src/lib/auth-token.ts`), refresh token in httpOnly cookie

## Realtime Technology

- **Protocol:** Socket.IO (namespace `/channels`)
- **Client:** `socket.io-client` v4.8.1
- **Connection:** WebSocket with polling fallback
- **Auth:** Bearer token passed via `auth` option and `Authorization` header

## Important Libraries

| Library | Version | Purpose |
|---------|---------|---------|
| next | ^16.2.6 | Framework |
| react | ^19.2.3 | UI |
| @reduxjs/toolkit | ^2.11.1 | State management + RTK Query |
| react-redux | ^9.3.0 | React bindings |
| socket.io-client | ^4.8.1 | WebSocket realtime |
| three | ^0.185.1 | 3D rendering |
| @react-three/fiber | ^9.7.0 | React Three.js renderer |
| @react-three/drei | ^10.7.8 | Three.js helpers |
| tailwindcss | ^4.1.18 | CSS framework |
| clsx | ^2.1.1 | Class utilities |
| lucide-react | ^0.555.0 | Icons |
| @radix-ui/* | various | UI primitives |

## Current Development Structure

- **Single repository:** Frontend only (Next.js)
- **Not included:** Backend API app, realtime app, worker app (separate repos/services)
- **Environment:** `.env.local` for configuration (gitignored)
- **Commands:** `npm run dev`, `npm run build`, `npm run lint`

---

# 2. Current Repository Structure

```
src/
  app/                          # Next.js App Router — thin route wrappers
    page.tsx                    # / -> <ChatShell />
    layout.tsx                  # Root layout with providers
    globals.css                 # Tailwind + CSS variables
    login/page.tsx              # /login
    auth/callback/success/page.tsx
    onboarding/page.tsx
    connections/page.tsx
    connections/[conversationId]/page.tsx  # Empty (deleted in working tree)
    profile/page.tsx
    users/[username]/page.tsx    # Empty (deleted in working tree)
    settings/page.tsx
  components/
    providers/
      app-providers.tsx         # Redux Provider + ThemeProvider
      theme-provider.tsx        # Theme application logic
    layout/
      app-shell.tsx             # Sidebar (desktop) + bottom nav (mobile)
      user-menu.tsx             # User dropdown menu (NEW, untracked)
    auth/
      provider-login-button.tsx # OAuth provider button
    common/
      avatar.tsx                # User avatar component
      locked-panel.tsx          # Login-required placeholder
    character/
      character-scene.tsx       # 3D avatar scene (Three.js)
    profile/
      showcase-avatar.tsx       # Profile display avatar
      profile-stats-card.tsx    # Stats display card
    theme/
      theme-toggle.tsx          # Light/dark toggle
      theme-controls.tsx        # Theme settings UI
    ui/                         # shadcn/ui components (15 files)
  features/
    auth/
      api.ts                    # Re-exports from rtk/auth
      login-panel.tsx           # Login page UI
      auth-callback-success.tsx # Post-login handler
    channels/
      api.ts                    # Re-exports from rtk/channels
      chat-shell.tsx            # Main chat UI
      use-channel-socket.ts     # Socket.IO hook
    connections/
      connections-page.tsx      # Placeholder (search disabled)
    direct-messages/
      direct-message-page.tsx   # Placeholder with skeletons
    onboarding/
      onboarding-page.tsx       # Profile completion form
    profile/
      api.ts                    # Re-exports from rtk/profile
      profile-page.tsx          # Own profile (3D showcase)
      public-profile-page.tsx   # Public profile view
    settings/
      settings-page.tsx         # Logout + theme settings
  rtk/
    base-api.ts                 # RTK Query base with auth refresh
    auth/auth-api.ts            # Auth endpoints
    channels/channels-api.ts    # Channel endpoints
    profile/profile-api.ts      # Profile endpoints
  lib/
    config.ts                   # Environment config
    normalizers.ts              # Defensive response normalizers
    realtime.ts                 # Socket.IO factory
    auth-token.ts               # Token management
    theme.ts                    # Theme types and storage
    channel-colors.ts           # Channel type colors
    utils.ts                    # Utility functions
  store/
    store.ts                    # Redux store
    ui-slice.ts                 # UI state (channel list, toast, theme)
  types/
    domain.ts                   # All domain types
doc/
  frontend-chat-app.txt         # Frontend product spec
  backend-chat-app.txt          # Backend technical spec
public/
  character-scene/
    male.glb                    # 3D male avatar
    female.glb                  # 3D female avatar
```

---

# 3. Authentication

## Signup

- **Not implemented as a separate flow.** Users are created on first Facebook login.
- When a user logs in via Facebook for the first time, the backend creates a user record, auth identity, and initial profile.

## Login

**Frontend Flow:**
1. User clicks "Continue with Facebook" button (`src/components/auth/provider-login-button.tsx`)
2. Frontend redirects to `${apiBaseUrl}/auth/facebook`
3. Backend redirects to Facebook OAuth
4. User authorizes on Facebook
5. Facebook redirects to backend callback
6. Backend creates/finds user, creates session
7. Backend redirects to `/auth/callback/success`
8. Frontend loads session via `refreshSession()` mutation
9. If profile is incomplete (`!profile.isComplete`), redirect to `/onboarding`
10. Otherwise, redirect to `/`

**Key Files:**
- `src/features/auth/login-panel.tsx` - Login UI
- `src/features/auth/auth-callback-success.tsx` - Post-login handler
- `src/components/auth/provider-login-button.tsx` - OAuth button

## Logout

**Frontend Flow:**
1. User clicks logout (settings page or user menu)
2. Frontend calls `POST /auth/logout`
3. Frontend clears in-memory access token via `setAccessToken(null)`
4. Frontend dispatches `baseApi.util.resetApiState()` to clear RTK Query cache
5. User redirected to `/`

**Key Files:**
- `src/features/settings/settings-page.tsx` - Settings with logout
- `src/components/layout/user-menu.tsx` - User menu with logout
- `src/rtk/auth/auth-api.ts` - `logout` mutation

## Sessions/Tokens/Cookies

**Token Strategy:**
- **Access Token:** Short-lived JWT, held in memory (`accessToken` variable in `src/lib/auth-token.ts`)
- **Refresh Token:** Stored as httpOnly secure cookie (set by backend)
- **Token Refresh:** Frontend calls `POST /auth/refresh` with credentials (cookies) to get new access token

**Token Management (`src/lib/auth-token.ts`):**
- `accessToken` stored in module-level variable (not localStorage)
- Token expiry decoded from JWT payload
- 30-second skew before actual expiry triggers refresh
- Fallback TTL: 14 minutes if JWT has no `exp` claim
- `ensureFreshAccessToken()` - returns valid token or refreshes
- Deduplicated refresh requests (single refreshPromise)

## Authenticated User

- Determined by `useAuthSession()` returning non-null `AuthSession`
- `AuthSession` contains `user: UserSummary` and optional `profile: Profile`
- `UserSummary`: id, username, displayName, avatarUrl, role, status

## Guest User

- Determined by `useAuthSession()` returning `null` (401/403 from `/auth/me`)
- Guests can read public channels but cannot send messages
- Guest-gated actions show `LockedPanel` with login prompt

## Protected Routes

**Frontend Protection:**
- No middleware-based route protection
- Each protected page checks `Boolean(authQuery.data)`
- If not logged in, renders `LockedPanel` component
- Protected pages: profile, connections, DMs, onboarding, settings

**Backend Protection (per docs):**
- `GET /auth/me` returns 401/403 for unauthenticated users
- Protected endpoints require valid session/token

## Backend Authentication

**Database Tables (per docs):**
- `users` - id, status, role, timestamps
- `auth_identities` - provider (facebook), provider_user_id, provider metadata
- `sessions` - user_id, refresh_token_hash, ip, user_agent, expires_at

**Auth Endpoints:**
- `GET /auth/facebook` - Start OAuth flow
- `GET /auth/facebook/callback` - Facebook callback
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Invalidate session
- `GET /auth/me` - Get current user

## Frontend Authentication State

- `useAuthSession()` hook from `src/rtk/auth/auth-api.ts`
- Uses `useAuthSessionQuery()` which calls `GET /auth/me`
- Returns `null` on 401/403 (not an error)
- Returns `AuthSession` object on success
- Tag: `AuthSession` (used for cache invalidation)

---

# 4. Guest Experience

## What a Guest Can Do

1. **Open the website** - Lands on `/` which shows the default channel chat
2. **View channel list** - See all public channels
3. **Open public channels** - Navigate to any channel via `/channels/:slug`
4. **Read public messages** - View message history (HTTP-fetched)
5. **Receive live messages** - Real-time messages via Socket.IO (read-only)
6. **See login prompts** - "Login with Facebook to chat" near message input
7. **Navigate to login** - Click login button to go to `/login`

## What a Guest Cannot Do

1. **Send messages** - Input disabled, shows login CTA
2. **View profiles** - Redirected to `LockedPanel`
3. **Access connections** - Redirected to `LockedPanel`
4. **Send connection requests** - Not available
5. **Use private chat** - Not available
6. **Edit profile** - Not available
7. **Access settings** - Redirected to `LockedPanel`

## Guest Socket Behavior

- Socket connects without auth token
- Can receive `channel:message:new` events
- Cannot emit `channel:message:send` (enforced server-side)

---

# 5. Authenticated User Experience

## What an Authenticated User Can Do

1. **Send messages** - In public channels (500 char limit)
2. **Switch channels** - Navigate between public channels
3. **View profiles** - See public profile details of other users
4. **Edit own profile** - Update display name, username, bio, region, languages, gender, character customization
5. **View own profile** - 3D character showcase
6. **Customize character** - Gender, skin color, hair color, outfit color
7. **Receive real-time messages** - Via Socket.IO
8. **See online counts** - Channel presence updates
9. **View connections page** - Placeholder with skeleton UI
10. **View DM page** - Placeholder with skeleton UI
11. **Logout** - End session
12. **Change theme** - Light/dark/system mode, accent colors

## What an Authenticated User Cannot Do

1. **Create channels** - Admin-only (not implemented)
2. **Send DMs** - Placeholder page only
3. **Send connection requests** - Placeholder page only
4. **View exact DOB** - Only age group shown publicly
5. **Access admin features** - Not implemented

---

# 6. Public Chat

## Public Rooms

- Channels are system/admin-created (users cannot create channels in V1)
- Channel types: `language`, `age`, `region`, `general`
- Channel fields: id, name, slug, type, visibility, is_default, is_active, sort_order

## Room Creation/Configuration

- **Not available to users.** Admin-only (not implemented in frontend).

## Joining Rooms

**Frontend Flow:**
1. User clicks channel in list or navigates to `/channels/:slug`
2. `ChatShell` component loads with `initialSlug` prop
3. Channel data fetched via `useChannel(slug)` or `useDefaultChannel()`
4. Message history fetched via `useChannelMessages(slug)`
5. Socket joins `channel:{channelId}` room via `useChannelSocket` hook

**Socket Join (`src/features/channels/use-channel-socket.ts`):**
```typescript
socket.emit("channel:join", { channelId });
```

## Leaving Rooms

**Socket Leave:**
```typescript
socket.emit("channel:leave", { channelId: previous });
```
- Triggered when switching channels or unmounting

## Sending Messages

**Frontend Flow:**
1. User types message (max 500 chars enforced)
2. Click send or press enter
3. `handleSend()` called
4. Validates: logged in, message valid (1-500 chars)
5. Emits `channel:message:send` with `{ channelId, body }`
6. Waits for acknowledgment (`SendAck`)
7. On success: clears input
8. On error: restores input, shows error

**Socket Event:**
```typescript
socket.emit("channel:message:send", { channelId, body }, (ack: SendAck) => {...});
```

## Receiving Messages

**Socket Handler:**
```typescript
socket.on("channel:message:new", (payload: ChannelMessagePayload) => {
  handlersRef.current.onMessage?.(normalizeChannelMessage(payload));
});
```

- New messages appended to `messageState.live` array
- Auto-scrolls to bottom if user is near bottom

## Message Persistence

- Messages stored in PostgreSQL (per backend docs)
- Frontend fetches history via HTTP on channel load
- Real-time messages come via WebSocket
- Both sources merged in `visibleMessages` array

## Message History

- **Endpoint:** `GET /channels/:slug/messages?limit=50`
- Fetched on channel load
- Default 50 messages per page

## Pagination

**Implementation:**
- Cursor-based pagination
- `pageInfo: { hasMore: boolean, nextCursor: string | null }`
- "Load older messages" button when `nextCursor` exists
- Uses `useLazyChannelMessagesQuery` for manual fetching

## Online Users

**Presence Tracking:**
- Socket event: `channel:presence:update` with `{ channelId, online }`
- Updates `channelMeta.online` state
- Falls back to `activeChannel.onlineCount` from HTTP data

**Display:**
```tsx
<p>{onlineCount.toLocaleString()} online</p>
```

## Presence

- Server tracks user presence via Redis (per docs)
- Frontend receives updates via `channel:presence:update` events
- Guest presence not tracked (read-only)

## WebSocket Events

### Client Emits
| Event | Payload | Purpose |
|-------|---------|---------|
| `channel:join` | `{ channelId }` | Join a channel room |
| `channel:leave` | `{ channelId }` | Leave a channel room |
| `channel:message:send` | `{ channelId, body }` | Send a message |

### Server Emits
| Event | Payload | Purpose |
|-------|---------|---------|
| `channel:message:new` | `ChannelMessagePayload` | New message broadcast |
| `channel:presence:update` | `{ channelId, online }` | Online count update |
| `channel:error` | `{ code, message }` | Channel-level error |
| `auth:error` | `{ code, message }` | Authentication error |
| `user:banned` | - | User banned notification |
| `user:muted` | - | User muted notification |

## Socket.IO Rooms

- **Room naming:** `channel:{channelId}` (per docs)
- Frontend joins on channel selection
- Frontend leaves on channel switch/disconnect

## Authentication for Sockets

**Connection Auth:**
```typescript
const token = await ensureFreshAccessToken();
io(`${config.realtimeUrl}/channels`, {
  auth: token ? { token } : undefined,
  extraHeaders: token ? { Authorization: `Bearer ${token }` } : undefined,
});
```

**Token Refresh on Auth Error:**
```typescript
socket.on("auth:error", async (payload) => {
  socket.disconnect();
  const freshToken = await ensureFreshAccessToken();
  if (freshToken && socket) {
    socket.auth = { token: freshToken };
    socket.connect();
  }
});
```

---

# 7. User Profiles

## Fields

**Profile Type (`src/types/domain.ts`):**
```typescript
type Profile = UserSummary & {
  bio?: string;
  dob?: string;
  ageGroup?: string;
  region?: string;
  city?: string;
  gender?: string;
  characterConfig?: CharacterConfig;
  primaryLanguage?: string;
  languages: string[];
  isComplete: boolean;
};
```

**CharacterConfig:**
```typescript
type CharacterConfig = {
  gender: "male" | "female";
  skinColor?: string;
  hairColor?: string;
  outfitColor?: string;
};
```

## Viewing Profiles

**Own Profile (`/profile`):**
- Full 3D character scene background
- Stats cards (age group, location, languages, bio)
- Edit profile button opens right-side sheet
- Logout button in edit sheet

**Public Profile (`/users/:username`):**
- Same 3D character scene
- Stats cards
- "Connect" and "Message" buttons (placeholder, no action)
- Requires login (shows `LockedPanel` for guests)

## Editing Profiles

**Access:**
- Click "Edit Profile" or palette icon on profile page
- Opens right-side `Sheet` component

**Editable Fields:**
- Display name
- Username
- Gender (select: male/female)
- Skin color (color picker)
- Hair color (color picker)
- Outfit color (color picker)
- Date of birth (date input)
- Region (select: continents)
- City (select: predefined cities)
- Primary language (select)
- Languages (comma-separated text input)
- Bio (textarea)

**Save Flow:**
1. Form state managed locally
2. On save, calls `updateProfile.mutateAsync()`
3. PATCH `/profiles/me` with form data
4. Languages split on commas, trimmed
5. On success: closes sheet, invalidates cache
6. On error: shows error message

## Authorization

- **View own profile:** Requires login
- **View public profile:** Requires login (`usePublicProfile` uses `skipToken` when not logged in)
- **Edit profile:** Only own profile, requires login

## Avatar Implementation

**3D Avatar (`src/components/character/character-scene.tsx`):**
- Uses Three.js via @react-three/fiber
- Loads GLB models: `male.glb`, `female.glb`
- Ready Player Me avatars (MIT licensed)
- Customizable: skin color, hair color, outfit color
- Rendered on pedestal with glowing ring
- Contact shadows, fog, sparkle particles
- OrbitControls for rotation/zoom

**2D Avatar (`src/components/common/avatar.tsx`):**
- Standard img with initial fallback
- Used in chat messages

**Showcase Avatar (`src/components/profile/showcase-avatar.tsx`):**
- Square with brand border
- Used in profile headers

## Validation

**Onboarding:**
- Username: minimum 3 characters
- DOB: required (date input)
- Region: required
- Primary language: required

**Profile Edit:**
- No frontend validation beyond trimming
- Backend validates and returns errors

---

# 8. Toli

## Implemented

The term "Toli" appears in the product name "HiiToli" (login panel branding). There is no separate "Toli" feature or component in the codebase.

## Partially Implemented

None.

## Planned/Not Implemented

None documented as "Toli" specifically.

---

# 9. Frontend Architecture

## Routing

**Next.js App Router:**
- All routes in `src/app/`
- Route params are `Promise<{...}>` (Next.js 16 convention)

**Defined Routes:**
| Route | File | Purpose |
|-------|------|---------|
| `/` | `src/app/page.tsx` | Default channel chat |
| `/channels/:slug` | `src/app/channels/[slug]/page.tsx` | Specific channel (DELETED in working tree) |
| `/login` | `src/app/login/page.tsx` | Login page |
| `/auth/callback/success` | `src/app/auth/callback/success/page.tsx` | Post-login handler |
| `/onboarding` | `src/app/onboarding/page.tsx` | Profile completion |
| `/connections` | `src/app/connections/page.tsx` | Connections (placeholder) |
| `/connections/:conversationId` | `src/app/connections/[conversationId]/page.tsx` | DM chat (DELETED in working tree) |
| `/profile` | `src/app/profile/page.tsx` | Own profile |
| `/users/:username` | `src/app/users/[username]/page.tsx` | Public profile (DELETED in working tree) |
| `/settings` | `src/app/settings/page.tsx` | Settings |

**Note:** Three route files are deleted in the working tree but exist in git history.

## Layouts

**Root Layout (`src/app/layout.tsx`):**
- HTML wrapper with theme init script (prevents flash)
- Wraps children in `AppProviders`

**AppShell (`src/components/layout/app-shell.tsx`):**
- Desktop: left sidebar (20px wide icons)
- Mobile: bottom navigation (4 tabs + theme toggle)
- Main content area with responsive padding

## Components

**Provider Components:**
- `AppProviders` - Redux Provider + ThemeProvider
- `ThemeProvider` - Applies theme from Redux state

**Layout Components:**
- `AppShell` - Main navigation shell
- `UserMenu` - User dropdown (avatar, theme toggle, logout)

**Feature Components:**
- `ChatShell` - Main chat interface
- `LoginPanel` - Login page
- `OnboardingPage` - Profile completion
- `ProfilePage` - Own profile with 3D scene
- `PublicProfilePage` - Public profile view
- `ConnectionsPage` - Placeholder
- `DirectMessagePage` - Placeholder
- `SettingsPage` - Settings

**UI Components (`src/components/ui/`):**
- 15 shadcn/ui components: avatar, badge, button, dialog, dropdown-menu, input, label, select, separator, sheet, skeleton, switch, tabs, textarea, tooltip

## State Management

**Redux Store (`src/store/store.ts`):**
```typescript
reducer: {
  [baseApi.reducerPath]: baseApi.reducer,  // RTK Query
  ui: uiReducer,                            // UI state
}
```

**UI Slice (`src/store/ui-slice.ts`):**
- `isChannelListOpen: boolean`
- `toastMessage: string | null`
- `theme: ThemeState` (mode, accent)

**RTK Query:**
- `baseApi` with `fetchBaseQuery`
- Credentials: "include" (sends cookies)
- Auto-refresh on 401
- Tag types: AuthSession, Channels, Channel, ChannelMessages, Profile

## API Integration

**Base Query with Reauth (`src/rtk/base-api.ts`):**
1. If no token, call `ensureFreshAccessToken()`
2. Execute request
3. On 401, refresh token and retry
4. If refresh fails, clear token

**API Endpoints:**
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/auth/me` | Get current user |
| POST | `/auth/refresh` | Refresh access token |
| POST | `/auth/logout` | Logout |
| GET | `/auth/providers` | Get auth providers |
| GET | `/channels` | List channels |
| GET | `/channels/default` | Get default channel |
| GET | `/channels/:slug` | Get channel by slug |
| GET | `/channels/:slug/messages` | Get message history |
| GET | `/profiles/me` | Get own profile |
| PATCH | `/profiles/me` | Update own profile |
| GET | `/profiles/:username` | Get public profile |

## WebSocket Integration

**Socket Factory (`src/lib/realtime.ts`):**
- Creates Socket.IO connection
- Namespace: `/channels`
- Transports: websocket, polling
- Auto-reconnect with exponential backoff
- Auth token in connection options

**useChannelSocket Hook (`src/features/channels/use-channel-socket.ts`):**
- Manages socket lifecycle
- Handles channel join/leave
- Provides `sendMessage` function
- Tracks status, online count, errors
- Handles auth errors with token refresh

## shadcn/ui Usage

**Style:** new-york
**Base Color:** neutral
**CSS Variables:** enabled

**Components Used:**
- Avatar, Badge, Button, Dialog, DropdownMenu, Input, Label, Select, Separator, Sheet, Skeleton, Switch, Tabs, Textarea, Tooltip

## Styling

**Approach:**
- Tailwind CSS v4 with `@import "tailwindcss"`
- CSS custom properties for theming
- Semantic color tokens: `bg-surface`, `text-ink`, `border-line`, etc.
- `clsx` for conditional classes
- `tailwind-merge` for class merging

**Theme System:**
- Light/dark mode via `.dark` class
- Accent colors via `data-accent` attribute
- 5 accent options: rose, violet, blue, emerald, amber
- Theme stored in localStorage

**Custom CSS:**
- Focus rings: `outline: 3px solid var(--ring)`
- Scrollbar styling
- Showcase scene gradients
- Animation keyframes (stat-fade-in, pulse-glow, float)

## Forms

**Onboarding Form:**
- Username (text input)
- DOB (date input)
- Region (text input)
- Primary language (select)

**Profile Edit Form:**
- Display name, username (text inputs)
- Gender (select)
- Skin, hair, outfit (color pickers)
- DOB (date input)
- Region, city (selects)
- Primary language (select)
- Languages (text input, comma-separated)
- Bio (textarea)

## Validation

**Frontend:**
- Onboarding: username >= 3 chars, dob/region/language required
- Message: 1-500 chars
- Profile: trim inputs, split languages on commas

**Backend:** (per docs)
- All inputs validated server-side
- Error codes returned for client display

## Loading/Error/Empty States

**Loading States:**
- Skeleton components for channels, messages, profiles
- Spinner for login page
- "Loading..." text states

**Error States:**
- API error banners in chat
- Error messages in forms
- Socket error display (rate limit, banned, muted, etc.)

**Empty States:**
- "No channels yet"
- "No messages yet"
- "No pending requests"
- "No search results"

---

# 10. Backend Architecture

**Note:** The backend is not in this repository. This section describes the expected backend based on frontend code and documentation.

## Modules (per docs)

**API App:**
- AuthModule
- UsersModule
- ProfilesModule
- ChannelsModule
- ConnectionsModule
- DirectMessagesModule
- ReportsModule
- BlocksModule
- ModerationModule
- AdminModule
- UploadsModule

**Realtime App:**
- RealtimeAuthModule
- ChannelGatewayModule
- DirectMessageGatewayModule
- PresenceModule
- RealtimeRateLimitModule

**Worker App:**
- ModerationWorkerModule
- NotificationWorkerModule
- CleanupWorkerModule
- ImageWorkerModule

## Controllers

Not implemented in this repo. Expected per docs:
- AuthController
- ProfilesController
- ChannelsController
- ConnectionsController
- DirectMessagesController
- ReportsController
- BlocksController
- AdminController

## Services

Not implemented in this repo. Expected per docs:
- AuthService
- ProfileService
- ChannelService
- ConnectionService
- DirectMessageService
- ReportService
- BlockService
- ModerationService

## Repositories

Not implemented in this repo. Expected per docs:
- UserRepository
- ProfileRepository
- ChannelRepository
- ChannelMessageRepository
- ConnectionRepository
- ConversationRepository
- DirectMessageRepository
- ReportRepository
- BlockRepository

## Guards

Not implemented in this repo. Expected per docs:
- AuthGuard (validates JWT/session)
- RolesGuard (admin/moderator checks)
- SocketAuthGuard (WebSocket authentication)

## Validation

Not implemented in this repo. Expected per docs:
- DTO validation with class-validator
- Message length limits
- Input sanitization

## Database Access

Not implemented in this repo. Expected per docs:
- PostgreSQL via TypeORM or Prisma
- Migrations for schema changes

## Authentication

Not implemented in this repo. Expected per docs:
- Facebook OAuth via Passport.js
- JWT access tokens
- Refresh tokens as httpOnly cookies
- Session storage in PostgreSQL

## WebSocket Gateways

Not implemented in this repo. Expected per docs:
- ChannelGateway (namespace `/channels`)
- DirectMessageGateway (namespace `/dm`)
- Presence tracking
- Rate limiting

## Redis

Not implemented in this repo. Expected per docs:
- Socket.IO Redis adapter
- Presence keys: `presence:user:{userId}`
- Rate limiting
- Queue backend (BullMQ)

## Queues/Workers

Not implemented in this repo. Expected per docs:
- BullMQ for job queues
- Moderation jobs
- Notification jobs
- Cleanup jobs
- Image processing jobs

---

# 11. Database

**Note:** The database is not in this repository. This section describes the expected schema based on documentation.

## Users Table

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  status TEXT NOT NULL,  -- active, muted, banned, deleted
  role TEXT NOT NULL DEFAULT 'user',  -- user, moderator, admin
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL,
  last_login_at TIMESTAMPTZ
);
```

## Auth Identities Table

```sql
CREATE TABLE auth_identities (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  provider TEXT NOT NULL,  -- facebook
  provider_user_id TEXT NOT NULL,
  provider_email TEXT,
  provider_display_name TEXT,
  provider_avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL,
  UNIQUE (provider, provider_user_id)
);
```

## Sessions Table

```sql
CREATE TABLE sessions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  refresh_token_hash TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL
);
```

## Profiles Table

```sql
CREATE TABLE profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id),
  username TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  dob DATE,
  age_group TEXT,
  gender TEXT,
  region TEXT,
  city TEXT,
  primary_language TEXT,
  languages TEXT[],
  is_complete BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);
```

**Indexes:**
- Unique: `username`
- Index: `display_name`
- Index: `region`
- Index: `age_group`
- GIN index: `languages`

## Channels Table

```sql
CREATE TABLE channels (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL,  -- language, age, region, general
  visibility TEXT NOT NULL DEFAULT 'public',
  is_default BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);
```

## Channel Messages Table

```sql
CREATE TABLE channel_messages (
  id UUID PRIMARY KEY,
  channel_id UUID REFERENCES channels(id),
  sender_id UUID REFERENCES users(id),
  body TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',  -- active, deleted, hidden, flagged
  created_at TIMESTAMPTZ NOT NULL,
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES users(id)
);
```

**Indexes:**
- Index: `(channel_id, created_at DESC)`
- Index: `sender_id`
- Index: `created_at`

## Connections Table

```sql
CREATE TABLE connections (
  id UUID PRIMARY KEY,
  requester_id UUID REFERENCES users(id),
  receiver_id UUID REFERENCES users(id),
  status TEXT NOT NULL,  -- pending, accepted, rejected, cancelled, blocked
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL,
  UNIQUE (requester_id, receiver_id)
);
```

## Conversations Table

```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY,
  type TEXT NOT NULL DEFAULT 'direct',
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);
```

## Conversation Members Table

```sql
CREATE TABLE conversation_members (
  conversation_id UUID REFERENCES conversations(id),
  user_id UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (conversation_id, user_id)
);
```

## Direct Messages Table

```sql
CREATE TABLE direct_messages (
  id UUID PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id),
  sender_id UUID REFERENCES users(id),
  body TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL,
  deleted_at TIMESTAMPTZ
);
```

## Reports Table

```sql
CREATE TABLE reports (
  id UUID PRIMARY KEY,
  reporter_id UUID REFERENCES users(id),
  target_user_id UUID REFERENCES users(id),
  target_channel_message_id UUID REFERENCES channel_messages(id),
  target_direct_message_id UUID REFERENCES direct_messages(id),
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL,
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMPTZ
);
```

## Blocks Table

```sql
CREATE TABLE blocks (
  id UUID PRIMARY KEY,
  blocker_id UUID REFERENCES users(id),
  blocked_user_id UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL,
  UNIQUE (blocker_id, blocked_user_id)
);
```

## Moderation Actions Table

```sql
CREATE TABLE moderation_actions (
  id UUID PRIMARY KEY,
  admin_id UUID REFERENCES users(id),
  target_user_id UUID REFERENCES users(id),
  target_message_id UUID,
  action TEXT NOT NULL,
  reason TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL
);
```

## Banned Words Table

```sql
CREATE TABLE banned_words (
  id UUID PRIMARY KEY,
  word TEXT UNIQUE NOT NULL,
  severity TEXT NOT NULL DEFAULT 'medium',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL
);
```

---

# 12. Redis and Realtime

## Current Redis Usage

**Frontend:** The frontend does not directly interact with Redis.

**Expected Backend Redis Usage (per docs):**

### Socket.IO Adapter
- Redis adapter for multi-instance Socket.IO broadcasting
- Enables horizontal scaling of realtime servers

### Presence Tracking
- `presence:user:{userId}` - User online state
- `presence:channel:{channelId}` - Channel members
- `socket:user:{userId}` - Active socket IDs

### Rate Limiting
- Per-user message rate limits
- Per-channel burst limits
- Login abuse protection (per IP)

### Queues
- BullMQ for background jobs
- Moderation, notification, cleanup queues

### Short-lived Cache
- Session caching
- Frequently accessed data

## Realtime Implementation (Frontend)

**Socket Connection (`src/lib/realtime.ts`):**
```typescript
io(`${config.realtimeUrl}/channels`, {
  autoConnect: true,
  transports: ["websocket", "polling"],
  auth: token ? { token } : undefined,
  extraHeaders: token ? { Authorization: `Bearer ${token}` } : undefined,
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
});
```

**Connection States:**
- `idle` - Not yet connected
- `connecting` - Connection in progress
- `connected` - Active connection
- `reconnecting` - Attempting to reconnect
- `disconnected` - Connection lost

---

# 13. API

## Auth Endpoints

| Method | Route | Purpose | Auth Required |
|--------|-------|---------|---------------|
| GET | `/auth/me` | Get current user session | No (returns null if unauthenticated) |
| POST | `/auth/refresh` | Refresh access token | No (uses cookie) |
| POST | `/auth/logout` | Invalidate session | Yes |
| GET | `/auth/providers` | Get available auth providers | No |
| GET | `/auth/facebook` | Start Facebook OAuth | No (redirect) |

## Channel Endpoints

| Method | Route | Purpose | Auth Required |
|--------|-------|---------|---------------|
| GET | `/channels` | List all public channels | No |
| GET | `/channels/default` | Get default channel | No |
| GET | `/channels/:slug` | Get channel by slug | No |
| GET | `/channels/:slug/messages?limit=50` | Get message history | No |

## Profile Endpoints

| Method | Route | Purpose | Auth Required |
|--------|-------|---------|---------------|
| GET | `/profiles/me` | Get own profile | Yes |
| PATCH | `/profiles/me` | Update own profile | Yes |
| GET | `/profiles/:username` | Get public profile | Yes |

## Not Yet Implemented (Placeholders)

| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/connections` | List connections |
| GET | `/connections/requests/received` | Pending received requests |
| GET | `/connections/requests/sent` | Pending sent requests |
| POST | `/connections/requests` | Send connection request |
| POST | `/connections/requests/:id/accept` | Accept request |
| POST | `/connections/requests/:id/reject` | Reject request |
| GET | `/users/search` | Search users |
| GET | `/dm/conversations` | List DM conversations |
| GET | `/dm/conversations/:id/messages` | Get DM history |
| POST | `/reports` | Create report |
| POST | `/blocks` | Block user |
| DELETE | `/blocks/:id` | Unblock user |

---

# 14. WebSocket

## Channel Events

### Client → Server

| Event | Payload | Purpose | Auth Required |
|-------|---------|---------|---------------|
| `channel:join` | `{ channelId: string }` | Join channel room | No (guests can join) |
| `channel:leave` | `{ channelId: string }` | Leave channel room | No |
| `channel:message:send` | `{ channelId: string, body: string }` | Send message | Yes |

### Server → Client

| Event | Payload | Purpose | Room Behavior |
|-------|---------|---------|---------------|
| `channel:message:new` | `ChannelMessagePayload` | New message | Broadcast to `channel:{channelId}` |
| `channel:presence:update` | `{ channelId, online }` | Online count | Broadcast to channel room |
| `channel:error` | `{ code, message }` | Channel error | Sent to specific client |
| `auth:error` | `{ code, message }` | Auth error | Triggers token refresh |
| `user:banned` | - | User banned | Sent to banned user |
| `user:muted` | - | User muted | Sent to muted user |

## Direct Message Events (Not Implemented)

### Client → Server
| Event | Payload | Purpose |
|-------|---------|---------|
| `dm:join` | `{ conversationId }` | Join DM room |
| `dm:leave` | `{ conversationId }` | Leave DM room |
| `dm:message:send` | `{ conversationId, body }` | Send DM |

### Server → Client
| Event | Payload | Purpose |
|-------|---------|---------|
| `dm:message:new` | Message payload | New DM |
| `dm:error` | Error payload | DM error |

## Connection Events (Not Implemented)

### Server → Client
| Event | Payload | Purpose |
|-------|---------|---------|
| `connection:request:new` | Request data | New request received |
| `connection:request:accepted` | Request data | Request accepted |
| `connection:request:rejected` | Request data | Request rejected |

## Socket.IO Rooms

| Room | Purpose |
|------|---------|
| `channel:{channelId}` | Channel message broadcast |
| `dm:{conversationId}` | DM broadcast (not implemented) |
| `user:{userId}` | User-specific events (not implemented) |

---

# 15. Current UI

## Login Page (`/login`)

**Components:**
- Full-screen brand gradient background
- Decorative blur circles
- "HiiToli" branding with tagline
- Feature list (Live public channels, Build meaningful connections, Real-time private chat)
- Theme toggle button
- "Browse Channels" button
- Login form with provider buttons

**Provider Buttons:**
- Dynamically loaded from `/auth/providers`
- Currently shows Facebook button
- Redirects to `${apiBaseUrl}/auth/${providerId}`

## Signup

**Not a separate page.** Signup happens automatically on first Facebook login.

## Onboarding Page (`/onboarding`)

**Access:** After first login if profile is incomplete

**Form Fields:**
- Username (text input, min 3 chars)
- Date of birth (date input, required)
- Region (text input, required)
- Preferred language (select: English, Hindi, Tamil, Telugu, Bengali, Marathi)

**Validation:**
- All fields required
- Username >= 3 characters

**Flow:**
1. Submit calls PATCH `/profiles/me`
2. Redirects to `/profile` on success
3. Shows error on failure

## Home Page (`/`)

**Component:** `ChatShell`

**Layout (Desktop):**
- Left: Channel list sidebar (280px)
- Center: Chat area
- Right: Session info panel (300px, xl screens only)

**Layout (Mobile):**
- Full screen chat
- Bottom sheet for channel list
- Bottom navigation bar

**Chat Area:**
- Header: Channel name, online count, Live badge
- Message list (scrollable)
- Composer: Text input + send button

## Chat Page

**Same as home page.** Chat is the default view.

**Message Display:**
- Avatar (ShowcaseAvatar)
- Display name (links to profile)
- Role badge (if not "user")
- Timestamp
- Message body

**Composer States:**
- Guest: Login CTA banner
- Logged in: Text input + send button
- Disabled states: banned, muted, disconnected

## Profile Page (`/profile`)

**Layout:**
- Full-screen 3D character scene (background)
- Gradient overlays for readability
- Header: Avatar, display name, username, role badge
- Edit Profile button
- Stats cards (right side on desktop, horizontal scroll on mobile)

**Stats Cards:**
- Age Group
- Location (City, Region)
- Languages
- Bio

**Edit Sheet (right side):**
- Display name, username
- Gender (select)
- Skin, hair, outfit colors (color pickers)
- DOB (date)
- Region, city (selects)
- Primary language (select)
- Languages (text input)
- Bio (textarea)
- Save/Cancel buttons
- Logout button

## Settings Page (`/settings`)

**Layout:**
- Settings card with sections
- Theme controls (mode, accent color)
- Account section
- Logout button

**Theme Controls:**
- Mode: Light, Dark, System
- Accent: Rose, Violet, Blue, Emerald, Amber

## Navigation

**Desktop Sidebar:**
- Logo button (links to /)
- Channels button
- Connections button
- Profile button
- User menu (avatar dropdown)

**Mobile Bottom Nav:**
- Channels
- Connections
- Profile
- Theme toggle

## Other Existing Pages

### Auth Callback Success (`/auth/callback/success`)
- Loading state after Facebook login
- Shows "Login complete" message
- Redirects to onboarding or home

### Connections Page (`/connections`)
- Placeholder with tabs: Connections, Requests, Search
- Skeleton loading states
- Empty states
- Search input (disabled functionality)

### Direct Messages Page (`/connections/:conversationId`)
- Placeholder with skeleton UI
- Empty page file (deleted in working tree)

### Public Profile Page (`/users/:username`)
- Same layout as profile page
- 3D character scene
- Stats cards
- "Connect" and "Message" buttons (no action)
- Empty page file (deleted in working tree)

---

# 16. Current User Flows

## Guest → Public Chat

1. User opens `/`
2. `ChatShell` renders
3. `useAuthSession()` returns `null` (guest)
4. `useChannels()` fetches channel list
5. `useDefaultChannel()` or first channel selected
6. `useChannelMessages(slug)` fetches message history
7. `useChannelSocket(channelId)` connects to socket
8. Guest can read messages and receive live updates
9. Message input shows "Login to chat" CTA
10. Clicking input or "Login" button redirects to `/login`

## Signup → Profile → Chat

1. User clicks "Continue with Facebook" on `/login`
2. Redirects to backend `/auth/facebook`
3. Backend redirects to Facebook
4. User authorizes on Facebook
5. Facebook redirects to backend callback
6. Backend creates user, auth identity, profile
7. Backend redirects to `/auth/callback/success`
8. Frontend calls `refreshSession()` to get tokens
9. `useAuthSession()` returns session with incomplete profile
10. Redirects to `/onboarding`
11. User completes: username, DOB, region, language
12. `PATCH /profiles/me` saves profile
13. Redirects to `/profile`
14. User can now send messages

## Login → Authenticated Experience

1. User clicks "Continue with Facebook" on `/login`
2. OAuth flow (same as signup)
3. Backend finds existing user
4. Backend redirects to `/auth/callback/success`
5. Frontend loads session
6. If profile complete, redirects to `/`
7. User can now send messages, view profiles, edit profile

## Logout Flow

1. User clicks logout (settings or user menu)
2. `POST /auth/logout` called
3. Access token cleared from memory
4. RTK Query cache reset
5. Redirect to `/`

---

# 17. Current Security

## Authentication

- **Facebook OAuth:** Server-side flow, frontend never sees Facebook tokens
- **Access Token:** Short-lived JWT, held in memory (not localStorage)
- **Refresh Token:** httpOnly secure cookie
- **Token Refresh:** Automatic on 401, with deduplication

## Authorization

- **Frontend:** Each protected page checks auth state
- **Backend (expected):** Guards on every endpoint
- **Socket:** Token validated on connection

## Validation

- **Frontend:** Message length (500 chars), onboarding required fields
- **Backend (expected):** DTO validation, input sanitization

## Rate Limiting

- **Frontend:** Displays rate limit errors from server
- **Backend (expected):** Redis-based rate limits per user/channel

## CORS

- **Frontend:** `credentials: "include"` for same-origin requests
- **Backend (expected):** CORS allowlist configured

## Cookies/Tokens

- **Refresh Token:** httpOnly, secure cookie
- **Access Token:** In-memory variable (XSS-safe)
- **No localStorage** for sensitive tokens

## Input Sanitization

- **Frontend:** Defensive normalizers handle various response shapes
- **Backend (expected):** HTML stripping, content sanitization

## WebSocket Security

- Token passed in connection options
- Token refresh on `auth:error`
- Server validates socket session (expected)

---

# 18. Current Testing

## Unit Tests

**Status:** Not implemented

No test files found in the project (excluding node_modules).

## Integration Tests

**Status:** Not implemented

## E2E Tests

**Status:** Not implemented

## Manual Testing

Per documentation, the following should be tested:
- Guest channel viewing
- Facebook login flow
- Profile completion
- Message sending
- Profile editing
- Theme switching

## Current Test Coverage

**0%** - No tests exist in this project.

---

# 19. Known Bugs / Technical Debt

## Confirmed Bugs

1. **Deleted Route Files:** Three route files are deleted in the working tree:
   - `src/app/channels/[slug]/page.tsx`
   - `src/app/connections/[conversationId]/page.tsx`
   - `src/app/users/[username]/page.tsx`
   - These routes will 404 until restored or recreated

2. **Empty Route Files:** Some route files exist but are empty (0 bytes)

## Technical Debt

1. **No Tests:** Zero test coverage
2. **Placeholder Pages:** Connections and DM pages show skeleton/empty states
3. **No Error Boundary:** No React error boundaries implemented
4. **Socket Reconnection:** Channel join may fail if socket not connected
5. **Message Deduplication:** Basic ID-based dedup, may miss edge cases

## Incomplete Implementation

1. **Connections:** UI exists but no backend integration
2. **Direct Messages:** UI placeholder only
3. **User Search:** Input exists but disabled
4. **Reports/Blocks:** Not implemented
5. **Admin Features:** Not implemented
6. **Connection Actions:** "Connect" and "Message" buttons on public profile have no handlers

## Unclear/Unknown Areas

1. **Backend Status:** Backend implementation not in this repo
2. **Redis Configuration:** Not visible from frontend
3. **Database Migrations:** Not in this repo
4. **Load Testing:** Per docs, should be done before launch
5. **Monitoring:** Not implemented in frontend

---

# 20. Phase 5 Completion Status

| Area | Status | Evidence |
|------|--------|----------|
| Authentication | **Complete** | Facebook OAuth flow, token management, session handling, login/logout/onboarding all implemented |
| Guest experience | **Complete** | Guests can view channels, read messages, receive live updates |
| Public chat | **Partial** | Message history via HTTP, real-time via Socket.IO, but message sending depends on backend |
| Profiles | **Complete** | View, edit, 3D character customization, public profiles all implemented |
| Realtime | **Partial** | Socket.IO client wired, events handled, but depends on backend realtime server |
| Database | **Unknown** | Not in this repository |
| Security | **Partial** | Frontend security measures in place, backend security unknown |
| Testing | **Not implemented** | No tests exist |
| Toli | **N/A** | "Toli" is part of product name "HiiToli", not a separate feature |

---

# 21. Important Files

## Core Configuration

| File | Purpose |
|------|---------|
| `package.json` | Dependencies and scripts |
| `tsconfig.json` | TypeScript configuration (strict mode) |
| `next.config.ts` | Next.js configuration |
| `components.json` | shadcn/ui configuration |
| `.env.example` | Environment variable template |

## Entry Points

| File | Purpose |
|------|---------|
| `src/app/layout.tsx` | Root layout with providers |
| `src/app/page.tsx` | Home page (renders ChatShell) |
| `src/components/providers/app-providers.tsx` | Redux + Theme providers |

## Authentication

| File | Purpose |
|------|---------|
| `src/lib/auth-token.ts` | Token management (in-memory access token, refresh logic) |
| `src/rtk/auth/auth-api.ts` | Auth API endpoints (me, refresh, logout) |
| `src/features/auth/login-panel.tsx` | Login page UI |
| `src/features/auth/auth-callback-success.tsx` | Post-login handler |
| `src/components/auth/provider-login-button.tsx` | OAuth provider button |

## Channels/Chat

| File | Purpose |
|------|---------|
| `src/features/channels/chat-shell.tsx` | Main chat UI (3-column layout, message list, composer) |
| `src/features/channels/use-channel-socket.ts` | Socket.IO hook for realtime |
| `src/rtk/channels/channels-api.ts` | Channel API endpoints |
| `src/lib/realtime.ts` | Socket.IO factory |

## Profile

| File | Purpose |
|------|---------|
| `src/features/profile/profile-page.tsx` | Own profile with 3D scene |
| `src/features/profile/public-profile-page.tsx` | Public profile view |
| `src/rtk/profile/profile-api.ts` | Profile API endpoints |
| `src/components/character/character-scene.tsx` | 3D avatar scene |

## State Management

| File | Purpose |
|------|---------|
| `src/rtk/base-api.ts` | RTK Query base with auth refresh |
| `src/store/store.ts` | Redux store configuration |
| `src/store/ui-slice.ts` | UI state (channel list, toast, theme) |

## Utilities

| File | Purpose |
|------|---------|
| `src/lib/config.ts` | Environment configuration |
| `src/lib/normalizers.ts` | Defensive response normalizers |
| `src/lib/theme.ts` | Theme types and storage |
| `src/lib/channel-colors.ts` | Channel type color mapping |

## Types

| File | Purpose |
|------|---------|
| `src/types/domain.ts` | All domain types (UserSummary, Channel, Profile, etc.) |

---

# 22. Current Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
│                     (Next.js App)                            │
│                                                              │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐        │
│  │  Auth   │  │ Channels│  │ Profile │  │  UI     │        │
│  │ Module  │  │ Module  │  │ Module  │  │Components│       │
│  └────┬────┘  └────┬────┘  └────┬────┘  └─────────┘        │
│       │            │            │                            │
│  ┌────┴────────────┴────────────┴────┐                      │
│  │           RTK Query               │                      │
│  │    (State Management + Cache)     │                      │
│  └────┬──────────────────────────────┘                      │
│       │                                                      │
│  ┌────┴────┐  ┌─────────────┐                               │
│  │  HTTP   │  │  WebSocket  │                               │
│  │ Client  │  │ (Socket.IO) │                               │
│  └────┬────┘  └──────┬──────┘                               │
└───────┼───────────────┼──────────────────────────────────────┘
        │               │
        ▼               ▼
┌───────────────┐  ┌──────────────────────────────────────────┐
│  API SERVER   │  │         REALTIME SERVER                   │
│  (NestJS)     │  │         (Socket.IO)                       │
│               │  │                                          │
│  REST Endpoints│  │  /channels namespace                    │
│  - /auth/*    │  │  - channel:join/leave                    │
│  - /channels/*│  │  - channel:message:send/new             │
│  - /profiles/*│  │  - channel:presence:update               │
│  - /connections│  │  - auth:error, user:banned/muted         │
└───────┬───────┘  └──────────────┬───────────────────────────┘
        │                         │
        ▼                         ▼
┌───────────────┐  ┌──────────────────────────────────────────┐
│  PostgreSQL   │  │              REDIS                        │
│               │  │                                          │
│  - users      │  │  - Socket.IO adapter                     │
│  - profiles   │  │  - Presence tracking                     │
│  - channels   │  │  - Rate limiting                         │
│  - messages   │  │  - Queues (BullMQ)                       │
│  - connections│  │                                          │
│  - sessions   │  │                                          │
└───────────────┘  └──────────────────────────────────────────┘
```

---

# 23. Current State vs Planned Architecture

## CURRENTLY IMPLEMENTED

### Frontend
- Next.js App Router application
- Redux Toolkit with RTK Query for state management
- Facebook OAuth login flow (frontend portion)
- Token-based authentication (access token in memory, refresh in httpOnly cookie)
- Guest read-only channel viewing
- Real-time message receiving via Socket.IO
- Message history via HTTP
- Profile viewing and editing
- 3D character customization (Three.js)
- Theme system (light/dark/system + accent colors)
- Responsive layout (sidebar desktop, bottom nav mobile)
- Onboarding flow for profile completion
- Settings page with logout

### Backend (Expected, per docs)
- Not in this repository
- API contract defined in documentation
- Database schema defined in documentation

## PLANNED / DESIRED

### Phase 6: Connections (Not Implemented)
- Connection request system
- Accept/reject/cancel requests
- User search
- Block functionality

### Phase 7: Direct Messages (Not Implemented)
- DM conversation view
- Real-time DM messaging
- DM history

### Phase 8: Moderation (Not Implemented)
- Report user/message
- Block user
- Admin mute/ban
- Banned words

### Phase 9: Production Readiness (Not Implemented)
- Unit tests
- Integration tests
- Load testing
- Monitoring/observability
- Deployment pipeline

### Other Planned Features
- Admin panel
- User search
- Connection management UI
- Report/block UI

---

# 24. Final Summary

At the end of Phase 5, HiRotoli is a functional frontend for a live social chat application with the following capabilities:

**What exists:**
- A complete Next.js frontend with authentication, real-time chat UI, and profile management
- Facebook OAuth integration (frontend flow)
- Token-based session management with automatic refresh
- Guest access to public channels (read-only)
- Real-time message receiving via Socket.IO
- Message history via HTTP with cursor pagination
- Full profile system with 3D character customization
- Responsive design with mobile-first approach
- Theme system with light/dark modes and accent colors

**What's missing:**
- Backend implementation (not in this repository)
- Message sending (depends on backend realtime server)
- Connections feature (UI placeholder only)
- Direct messages (UI placeholder only)
- User search (disabled)
- Moderation features (reports, blocks, admin)
- Any tests
- Error boundaries
- Production monitoring

**Current state:** The frontend is feature-complete for Phase 5 (Realtime Channel Chat) from a UI perspective, with Socket.IO client wired and ready for backend integration. The application can render channels, display messages, handle authentication, and manage profiles. The remaining work is primarily backend integration and Phase 6+ features.
