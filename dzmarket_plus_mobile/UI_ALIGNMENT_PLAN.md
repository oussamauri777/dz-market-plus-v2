# DzMarket+ Mobile — Full UI Alignment Walkthrough

## Objective
Make the Flutter mobile app visually and functionally identical to the Next.js web app.

---

## Progress Status

| Phase | Description | Status | Notes |
|---|---|---|---|
| 1 | Theme & Design Tokens | ✅ Done | Colors, radius, shadows added to `app_theme.dart` |
| 2 | Shared Widgets | ✅ Done | 11 widgets created in `lib/shared/widgets/` |
| 3 | Home Screen | ✅ Done | Rewritten with hero, categories, trending, recommended |
| 4 | Search Screen | ✅ Done | Rewritten with filters, sort, grid results |
| 5 | Ad Detail Screen | ✅ Done | Rewritten with gallery, seller card, reviews, safety tips |
| 6 | Create Ad Screen | ✅ Done | Rewritten with web-mobile layout (card, header strip, 2-col photos, submit) |
| 7 | Messages Screen | ✅ Done | WhatsApp-style chat with bubbles, receipts, input bar |
| 8 | Profile Screen | ✅ Done | Gradient header, stats, tabs (ads/settings), logout |
| 9 | Seller Profile Screen | ✅ Done | Stats bar, tabs, rating breakdown, review submission |
| 10 | Auth Screens | ✅ Done | Login + Register (two-step, password hints) |
| 11 | Additional Features | ✅ Done | i18n (fr/ar JSON, LocaleProvider, language picker, pass across 12+ screens); infinite scroll (home + search); notifications screen + route; favorites pull-to-refresh + delete dialog; ForgotPassword/ResetPassword screens + real API; RTL support (auto-flip + timeago); real email verification (sendCode + verifyEmail) |
| 12 | API Alignment | ✅ Done | JWT Bearer auth, models, new endpoints, provider updates |
| 13 | Assets & Branding | ✅ Done | Logo SVGs (yellow D badge), chat dot pattern, empty illustration; declared in pubspec |
| 1.4 | Dark Mode Fix | ✅ Done | Replaced Colors.white with theme tokens across all screens; migrated withOpacity→withValues; removed scaffold backgroundColor overrides |
| 14 | Messaging | ✅ Done | ChatProvider init at startup, Pusher real-time, unread badge on nav tab, conversation list, WhatsApp-style chat room with send/image/read receipts |
| 15 | Overflow Fixes | ✅ Done | Bottom nav (ad_card, main_scaffold), profile tab bar, app_section_header, ad_detail user name/DetailRow/review section, withOpacity→withValues |
| 16 | Infinite Scroll | ✅ Done | Home (loadMoreAds) + Search (page-based) via ScrollController at 400px threshold |
| 17 | Notifications Screen | ✅ Done | NotificationsScreen with mock data + unread indicators + GoRoute + bell icon in home AppBar |
| 18 | Favorites Enhancements | ✅ Done | RefreshIndicator (syncFavoritesFromApi) + delete-all confirmation dialog |
| 19 | Forgot/Reset Password | ✅ Done | ForgotPasswordScreen + ResetPasswordScreen with real API endpoints + routes |
| 20 | RTL Support | ✅ Done | Framework auto-flips for Arabic via GlobalWidgetsLocalizations; timeago ArMessages/FrMessages set dynamically |
| 21 | Email Verification | ✅ Done | Register screen uses real sendVerificationCode + verifyEmail APIs |
| 22 | AppTheme Const Audit | ✅ Done | 233/234 refs migrated to Theme.of(context).colorScheme.onSurface / dividerColor / scaffoldBackgroundColor; 1 remaining in static initializer |
| 23 | i18n Gap Fill | ✅ Done | Added keys: Notifications, Conditions, Categories, Profile section titles/review strings; updated main_scaffold nav labels, notifications_screen, profile_screen |
| 24 | Mobile JWT Auth (Backend) | ✅ Done | Added `getUserIdFromRequest()` fallback to all chat API endpoints |
| 25 | Navigator Fix | ✅ Done | Removed `/messages/:id` route; `push`→`go` with query params to avoid shell route key conflict |
| 26 | Logout Cleanup | ✅ Done | `ChatProvider.reset()` clears conversations/Pusher on logout |
| 27 | Pusher Real-Time Fix | ✅ Done | `onAuthorizer` callback for native Android auth; `useTLS: true`; message deduplication |
| 28 | Seller Profile Infinite Scroll | ✅ Done | Replaced single `FutureBuilder` fetch with paginated `ScrollController` + page tracking |
| 29 | Configurable API Host | ✅ Done | `AppConfig.setApiHost()` + `--dart-define=API_HOST` for mobile; `localhost` default (ADB reverse) |

---

## Phase 1: Theme & Design Tokens

### 1.1 Color Palette — `app_theme.dart`
✅ Done. Added yellow, blue, orange, green, red, chat beige, gradient colors as `static Color` constants.

### 1.2 Typography
✅ Done. Flutter uses Inter (close enough to web's Geist). Added w800/w900 font weights.

### 1.3 Border Radius & Shadows
✅ Done. Added `radiusXs` through `radiusFull`, shadow definitions (`shadowSm` through `shadowXl`).

### 1.4 Dark Mode Fix
✅ Done.
- Replaced `Colors.white` → `Theme.of(context).cardColor` / `colorScheme.surface` across all screens and shared widgets
- Migrated all `withOpacity()` → `withValues(alpha:)` (7 files)
- Removed `backgroundColor: AppTheme.backgroundColor` from 10 Scaffolds (now uses theme `scaffoldBackgroundColor`)
- Shimmer dark mode: made `baseColor`/`highlightColor` theme-aware
- Migrated 233/234 `AppTheme.textColor`/`borderColor`/`textMutedColor`/`backgroundColor` refs → `Theme.of(context).colorScheme.onSurface` / `dividerColor` / `scaffoldBackgroundColor`

---

## Phase 2: Shared Widgets

✅ All completed — see `lib/shared/widgets/`:
- `AppTextField`, `AppDropdown`, `AppButton`, `AppBadge`, `AppChip`, `AppSectionHeader`
- `EmptyState`, `StatusBanner`, `ReviewCard`, `ShimmerGrid`, `ConfirmationDialog`

---

## Phase 3: Home Screen — `home_screen.dart`

✅ Done. Brand logo in AppBar, hero with gradient + search bar + wilaya dropdown + quick chips, categories in 5-column grid, trending horizontal carousel, recommended 2-column grid, loading/error states using shared widgets, pull-to-refresh.

---

## Phase 4: Search Screen — `search_screen.dart`

✅ Done. Styled AppBar search, sort bar with result count and AI badge, filter drawer as modal bottom sheet (category, wilaya, price range slider), results grid with sort/filter/empty/loading states.

---

## Phase 5: Ad Detail Screen — `ad_detail_screen.dart`

✅ Done. SliverAppBar with image gallery + thumbnail strip + overlay buttons, info cards for details/description/location/seller/reviews, seller card with verified badge + rating + stats, orange safety tips card, review dialog with star picker, bottom CTA bar with AppButton, Google Maps deep link on location card.

---

## Phase 6: Create Ad Screen — `create_ad_screen.dart`

✅ Done — optimized to match web mobile layout exactly:
- White card with `rounded-3xl` + `shadow-xl` on `#F9FAFB` background
- Primary gradient header strip with `UploadCloud` icon + "Déposer une annonce" + subtitle
- Photos in **2-column grid** (web's `grid-cols-2`) with dashed upload squares, "Principale" badge
- Divider between photos and form (`border-t border-gray-100`)
- Mobile-first single-column field order: Title → Category → Subcategory → Wilaya → Commune → Condition → Price → Description
- Description as 6-row textarea matching web
- Location in gray-50 card wrapper with info text + coordinates display
- Submit button: full-width, `rounded-xl`, `shadow-lg`, `cloud_upload` icon, loading shows "Publication en cours..."

---

## Phase 7: Messages Screen — `messages_screen.dart`

✅ Done. Conversation list with search, avatar, unread badge, ad badge; chat room with WhatsApp-style beige background (`#EFEAE2`), sent/received bubbles with time + read receipts (double check), image sending with fullscreen preview, pill-shaped input bar with attach icon + circular send button.

---

## Phase 8: Profile Screen — `profile_screen.dart`

✅ Done. Gradient header band, avatar with camera overlay, stats row, "Mes annonces" tab with grid/empty state, "Paramètres" tab with grouped settings cards, logout button.

---

## Phase 9: Seller Profile Screen — `seller_profile_screen.dart`

✅ Done. Gradient header, stats bar, verified badges, tab bar with ads/reviews, `RatingBreakdown` widget, review submission bottom sheet, bottom CTA bar.

---

## Phase 10: Auth Screens

### Login — `login_screen.dart`
✅ Done. Card with branded logo, `AppTextField`/`AppButton` usage, error banner, password visibility toggle, Google OAuth button, forgot password link, register link.

### Register — `register_screen.dart`
✅ Done. Two-step flow (details + email verification), password strength hints, shared widget usage.

### New Screens Created
| Screen | Description | Status |
|---|---|---|
| `ForgotPasswordScreen` | Email input → success message (matching web modal) | ✅ Done |
| `ResetPasswordScreen` | Token + new password + confirm (if reset via email link) | ✅ Done |

---

## Phase 11: Additional Features (Web Parity)

### 11.1 Favorites — `favorites_screen.dart`
✅ Done.
- Sync favorites with backend API via `syncFavoritesFromApi()`
- `RefreshIndicator` for pull-to-refresh
- "Tout supprimer" shows `AlertDialog` confirmation

### 11.2 Notifications
✅ Done.
- Created `NotificationsScreen` with mock data + unread indicators
- Bell icon in home AppBar navigates to `/notifications`
- GoRoute added for `/notifications`

### 11.3 Language Switcher — i18n
✅ Done.
- Added `flutter_localizations` and `intl` packages
- Created `assets/translations/fr.json` and `ar.json` with 100+ keys each
- Implemented `AppLocalizations` class and `LocaleProvider`
- Added language picker dialog in Profile settings screen
- RTL support: framework auto-flips for Arabic; timeago `ArMessages`/`FrMessages` set dynamically
- `AppLocalizationsX` extension moved to `app_localizations.dart` for import accessibility
- i18n pass completed across all 12+ screens (login, register, home, search, messages, profile, favorites, notifications, forgot/reset, ad detail, create ad, seller profile)

### 11.4 Pull-to-Refresh
✅ Done on Favorites screen.
Other screens (Home, Search, Messages, Profile, Seller Profile) use existing provider state management — `RefreshIndicator` can be added per-screen as needed.

### 11.5 Pagination / Infinite Scroll
✅ Done on Home + Search.
- Home: `ScrollController` → `AdProvider.loadMoreAds()`, 400px threshold, removed 6-item cap on recommended grid
- Search: `ScrollController` + page tracking → `searchAds(page: N)`, `CustomScrollView` + `SliverGrid` for loading indicator
- Profile + Seller ads: pending

---

## Phase 12: Backend & API Alignment

### 12.1 Auth Flow
✅ Done.
- Replaced all `x-user-id` headers with `Authorization: Bearer <token>` across `api_service.dart` and `chat_provider.dart` (9 locations)
- Added `_authHeaders()` helper method
- Token refresh and session persistence were already in place

### 12.2 API Endpoints
✅ Done. All endpoints implemented in `api_service.dart`:
| Endpoint | Flutter Status |
|---|---|
| `GET /api/favorites` | ✅ `getFavorites()` |
| `POST /api/favorites` | ✅ `toggleFavorite(adId)` |
| `GET /api/favorites/ids` | ✅ `getFavoriteIds()` |
| `POST /api/auth/send-code` | ✅ `sendVerificationCode(email)` |
| `POST /api/auth/verify-code` | ✅ `verifyCode(email, code)` |
| `POST /api/auth/forgot-password` | ✅ `forgotPassword(email)` |
| `PUT /api/users/profile` | ✅ `updateProfile(...)` |
| `PUT /api/users/password` | ✅ `changePassword(...)` |
| `DELETE /api/messages/:id` | ✅ `deleteMessage(messageId)` |

### 12.3 Data Models
✅ Done. Created/updated:
- `models/user.dart` — `UserModel` + `UserBadges` matching web's `User.ts`
- `models/review.dart` — `Review` model with buyer/seller/ad population
- `models/conversation.dart` — Extracted from inline `ChatProvider`
- `models/message.dart` — Extracted with `read`, `fileUrl`, `fileName` fields
- `models/ad.dart` — Added `commune`, `embedding` fields, smarter mapping

### 12.4 Provider Updates
✅ Done.
- `AuthProvider` — Replaced `AuthUser` → `UserModel`, added profile/password/email verification methods
- `AdProvider` — Favorites API sync with local fallback, pagination support
- `ChatProvider` — Uses new model files, Bearer auth, `deleteMessage()`, `totalUnreadCount`

---

## Phase 13: Assets & Branding

✅ Done.
- Added `assets/images/logo.svg` (yellow D badge), `logo_white.svg`, `chat_dots.svg`, `empty_illustration.svg`
- `pubspec.yaml` already had `assets/images/` declared

---

## Phase 24: Mobile JWT Auth — Backend Chat Endpoints

### 24.1 Problem
The Next.js `/api/conversations`, `/api/conversations/[id]`, `/api/messages/mark-read`, and `/api/messages/unread-count` endpoints used `getServerSession(authOptions)` (cookie-based Next-Auth) exclusively. The Flutter mobile app authenticates via `Authorization: Bearer <JWT>` header — cookies are not sent by the mobile HTTP client. This caused all chat API calls from the phone to return 401.

### 24.2 Fix
Added a `getUserIdFromRequest(req)` fallback to every chat-related API route:
- Parses `Authorization: Bearer <token>` header
- Verifies the JWT using the same `NEXTAUTH_SECRET`
- Extracts `userId` from the token payload
- Falls back to `getServerSession()` for web clients

### 24.3 Files Modified
| File | Change |
|---|---|
| `app/api/conversations/route.ts` | Added `getUserIdFromRequest()` fallback to GET + POST |
| `app/api/conversations/[id]/route.ts` | Added `getUserIdFromRequest()` fallback |
| `app/api/messages/mark-read/route.ts` | Added `getUserIdFromRequest()` fallback |
| `app/api/messages/unread-count/route.ts` | Added `getUserIdFromRequest()` fallback |

### 24.4 Verification
- `curl.exe` with valid JWT → `200 OK` with conversation data
- `curl.exe` without token → `401 Unauthorized`

---

## Phase 25: Navigator Fix — Shell Route Key Conflict

### 25.1 Problem
The `/messages/:id` route used a path parameter inside a `ShellRoute`. When navigating from `AdDetailScreen` (root navigator) to the messages screen (shell navigator) via `context.push('/messages/$id')`, Flutter threw:
```
'package:flutter/src/widgets/navigator.dart': Failed assertion: line 4049: '!keyReservation.contains(key)': is not true.
```

The root cause was the `keyReservation` assertion in Flutter's navigator — `push` from a different navigator (root → shell) conflicts with the shell's route key reservation.

### 25.2 Fix
- Removed the `/messages/:id` path-parameter route entirely
- Changed the `/messages` route to accept `?partner` and `?conversationId` as query parameters
- Replaced all `context.push('/messages/...')` calls with `context.go('/messages?partner=...&conversationId=...')`
- Wrapped `Navigator.pop()` in try/catch to prevent crashes on key-not-found

### 25.3 Files Modified
| File | Change |
|---|---|
| `lib/core/router/app_router.dart` | Removed `/messages/:id` route; `/messages` now reads query params |
| `lib/features/ads/ad_detail_screen.dart` | Changed `push` → `go` with query params |

---

## Phase 26: Logout Cleanup — Clear Conversations on Disconnect

### 26.1 Problem
When the user tapped "Logout" in Profile → Settings, `AuthProvider.logout()` cleared the token and user but left `ChatProvider._conversations` and `_messages` intact. If a guest (or a different user) navigated to the Messages tab, they'd briefly see the previous user's conversations until `fetchConversations()` failed due to missing auth.

### 26.2 Fix
- Added `ChatProvider.reset()` method:
  - Clears `_conversations` and `_messages`
  - Resets `_activeConversationId` to `null`
  - Sets `_pusherConnected = false`
  - Disconnects the Pusher WebSocket
  - Calls `notifyListeners()` — UI immediately shows empty state
- Called `chat.reset()` from `MainScaffold.build()` when `auth.currentUser` becomes `null`

### 26.3 Files Modified
| File | Change |
|---|---|
| `lib/core/providers/chat_provider.dart` | Added `reset()` method (lines 244-253) |
| `lib/shared/widgets/main_scaffold.dart` | Calls `chat.reset()` on logout (line 50) |

---

## Phase 27: Pusher Real-Time Fix — `onAuthorizer` for Android

### 27.1 Problem
The `PusherChannelsFlutter.init()` call passed `authEndpoint` and `authParams` — these parameters are documented as `// pusher-js only` in the package source (`pusher_channels_flutter.dart:101-104`). On Android (native), the `pusher-websocket-java` library ignores them entirely, so subscribing to `private-{conversationId}` channels was never authenticated. Result:
- WebSocket connected but private channel subscriptions failed
- `_onPusherEvent` never fired
- No real-time message delivery — users had to pull-to-refresh

Additionally, `useTLS` was not set (defaulted to `ws://` instead of `wss://`).

### 27.2 Fix
- Added `useTLS: true` for secure WebSocket (`wss://`)
- Added `onAuthorizer` callback that makes a form-encoded HTTP POST to `/api/pusher/auth` with the JWT in the `Authorization` header — this is the only auth mechanism that works on native Android
- Added `onError` / `onConnectionStateChange` callbacks for debug visibility
- Added message deduplication in `_onPusherEvent` — checks `m.id == message.id` before appending (prevents duplicates when both optimistic add and Pusher event fire)

### 27.3 Files Modified
| File | Change |
|---|---|
| `lib/core/providers/chat_provider.dart` | Rewrote `init()`: added `useTLS`, `onAuthorizer`, `onError`, `onConnectionStateChange`; added dedup to `_onPusherEvent` |

### 27.4 How `onAuthorizer` Works
```
Pusher native library          Flutter onAuthorizer          Next.js backend
needs channel auth ──────►  POST /api/pusher/auth     ──────►  verify JWT
                            socket_id + channel_name  ◄──────  return auth sig
                            form-encoded body                 { auth: "..." }
                      ◄────  return parsed JSON
                      ──────►  channel subscription granted
```

---

## Phase 28: Seller Profile Infinite Scroll — Paginated Ads Grid

### 28.1 Problem
`SellerProfileScreen` fetched all seller ads in a single `ApiService.getAdsBySeller(widget.userId)` call (no pagination). The ads were displayed in a plain `FutureBuilder` with a simple `GridView.builder` — no `ScrollController`, no load-more mechanism. Sellers with many ads would see a slow initial load and no way to progressively load more.

### 28.2 Fix
Replaced the single `FutureBuilder<List<Ad>>` fetch with state-based pagination — matching the same pattern already used by `ProfileScreen` for "Mes annonces":
- Added `_sellerAdsScrollCtrl` with listener that triggers `_loadMoreSellerAds()` at 400px threshold
- Added `_sellerAds`, `_sellerAdsPage`, `_hasMoreSellerAds`, `_isLoadingSellerAds`, `_isLoadingMoreSellerAds` state fields
- `_loadData()` resets pagination and fetches page 1
- `_fetchSellerAds()` appends results and checks `ads.length >= 20` for `_hasMoreSellerAds`
- `_buildAdsTab()` applies ScrollController to GridView and shows a loading indicator as the last item when loading more
- Removes the nested `FutureBuilder<List<Ad>>` wrapper around the entire `Scaffold` (now reads `_sellerAds` directly from state)

### 28.3 Files Modified
| File | Change |
|---|---|
| `lib/features/profile/seller_profile_screen.dart` | Replaced `_adsFuture` (Future) with `_sellerAds` (state list) + `_sellerAdsScrollCtrl` + pagination methods |

### 28.4 Verification
- `ApiService.getAdsBySeller()` already accepts `page` and `limit` params
- Pattern matches `ProfileScreen`'s existing `loadMoreMyAds` / `_myAdsScrollCtrl`
- Loading indicator appears at grid bottom during page fetch
- Pull-to-refresh resets pagination to page 1

---

## Phase 29: Configurable API Host

### 29.1 Problem
`AppConfig.baseUrl` hardcoded `192.168.100.44:3000` for mobile — breaks when the dev machine's LAN IP changes (DHCP), or when running on a different network.

### 29.2 Solution
Made the API host configurable at three levels:

1. **`AppConfig.setApiHost(host)`** — programmatic override at runtime
2. **`--dart-define=API_HOST=192.168.x.x:3000`** — passed via `flutter run` / `flutter build`
3. **Default `localhost:3000`** — works for web directly, and for mobile via `adb reverse tcp:3000 tcp:3000`

### 29.3 How to Run

**With ADB reverse (recommended for physical device):**
```powershell
adb reverse tcp:3000 tcp:3000
flutter run -d CPH2411
```

**With custom LAN IP (alternative, no ADB required):**
```powershell
flutter run -d CPH2411 --dart-define=API_HOST=192.168.100.44:3000
```

### 29.4 Files Modified
| File | Change |
|---|---|
| `lib/core/config/app_config.dart` | Added `_customApiHost` + `setApiHost()`; defaults to `localhost:3000` for both web and mobile |
| `lib/main.dart` | Reads `API_HOST` from `--dart-define` and calls `AppConfig.setApiHost()` |

---

## Files Reference

| File | Description |
|---|---|
| `lib/core/theme/app_theme.dart` | Color tokens, shadows, radius constants, light/dark themes |
| `lib/shared/widgets/` | All shared widgets (11 files) |
| `lib/core/models/` | Ad, User, Review, Conversation, Message models |
| `lib/core/providers/` | AuthProvider, AdProvider, ChatProvider |
| `lib/core/services/api_service.dart` | All API endpoints with JWT Bearer auth |
| `lib/features/home/home_screen.dart` | Home page |
| `lib/features/search/search_screen.dart` | Search + filters |
| `lib/features/ads/ad_detail_screen.dart` | Ad detail |
| `lib/features/ads/create_ad_screen.dart` | Create ad form |
| `lib/features/messages/messages_screen.dart` | Chat |
| `lib/features/profile/profile_screen.dart` | User profile |
| `lib/features/profile/seller_profile_screen.dart` | Seller profile |
| `lib/features/auth/login_screen.dart` | Login |
| `lib/features/auth/register_screen.dart` | Register |
| `lib/core/config/app_config.dart` | Backend URL, Pusher keys, Google OAuth client ID |

---

## Execution Order (Recommended)

| Step | Phase | Effort | Status |
|---|---|---|---|---|
| 1 | Phase 1 — Theme tokens & shadows | Small | ✅ |
| 2 | Phase 2 — Shared widgets | Medium | ✅ |
| 3 | Phase 3 — Home screen | Medium | ✅ |
| 4 | Phase 4 — Search screen | Medium | ✅ |
| 5 | Phase 5 — Ad detail screen | Large | ✅ |
| 6 | Phase 6 — Create ad screen | Medium | ✅ |
| 7 | Phase 7 — Messages screen | Large | ✅ |
| 8 | Phase 8 — Profile screen | Medium | ✅ |
| 9 | Phase 9 — Seller profile | Small | ✅ |
| 10 | Phase 10 — Auth screens | Medium | ✅ |
| 11 | Phase 12 — API alignment | Medium | ✅ |
| 12 | Phase 11 — i18n | Medium | ✅ |
| 13 | Phase 14 — Messaging (real-time, badge, init) | Medium | ✅ |
| 14 | Phase 15 — Overflow fixes (nav, cards, detail) | Small | ✅ |
| 15 | Phase 1.4 — Dark mode fix | Small | ✅ |
| 16 | Phase 13 — Assets | Small | ✅ |
| 17 | Phase 11 — Remaining features (infinite scroll, notifications, favorites, forgot/reset, RTL, email verification) | Large | ✅ |
| 18 | Phase 1.4 — AppTheme consts migration (234 refs) | Large | ✅ |
| 19 | Phase 11 — i18n gap fill (missing keys) | Small | ✅ |
| 20 | Phase 24 — Mobile JWT auth (backend chat endpoints) | Medium | ✅ |
| 21 | Phase 25 — Navigator fix (shell route key conflict) | Medium | ✅ |
| 22 | Phase 26 — Logout cleanup (clear conversations on disconnect) | Small | ✅ |
| 23 | Phase 27 — Pusher real-time fix (onAuthorizer for Android) | Medium | ✅ |
| 24 | Phase 28 — Seller Profile infinite scroll | Medium | ✅ |
| 25 | Phase 29 — Configurable API host | Small | ✅ |

---

## Next Steps (Resume Here)

1. **Profile Seller ads pagination — revisit:** The infinite scroll currently uses the `_sellerAds` list declared in the screen state. Future pages append to this list. Consider moving pagination to `AdProvider` if the pattern needs to be reused elsewhere
2. **Remaining hardcoded strings:** ~50+ French strings still hardcoded across 16 files (condition labels, stat labels, fallback strings — lower priority UI polish)
3. **AppTheme unused extension:** `ThemeColorsX` extension on `BuildContext` in `app_theme.dart` provides `colorScheme`, `dividerColor`, `scaffoldBackgroundColor` getters — can be used in future theme work
4. **Pusher event handlers — missing events:** `_onPusherEvent` still ignores `'message_deleted'` and `'messages_read'` events (backend triggers both). Add handlers for full real-time parity
5. **Optimistic message sending:** `sendMessage()` relies entirely on Pusher round-trip — add optimistic local insert with temporary ID, then reconcile via the POST response or Pusher event
