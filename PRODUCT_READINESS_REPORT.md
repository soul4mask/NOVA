# NOVA product and GitHub Pages readiness review

**Review date:** 2026-11-17  
**Product direction:** Netflix-inspired discovery and playback for **Movies and Series**; Feishin-inspired music-library management and playback for **Music**. Both experiences use only the user's connected Jellyfin server.

**Decision:** **Approval pending release verification.** Source-level changes now include GitHub Pages deployment, accessibility and pagination fixes, and the expanded Jellyfin Music experience: genres, music-specific search/sorting/filtering, favorites, playlist create/rename/add/remove, queue editing, and player modes. Playlist deletion is withheld because a safe playlist-specific operation was not verified. The Pages workflow has not yet run against the public repository, and real Jellyfin streaming and playlist permissions still need server-backed verification.

## Executive assessment

NOVA already has a meaningful functional base: it connects directly to a user-provided Jellyfin server, browses and searches the signed-in user's video library, shows details and episodes, supports favorites, and plays media in a native video player. The Music destination now includes artist/album/track/genre/playlist browsing, favorites, library filters, playlist management, and a persistent player with an editable in-memory queue. Its disconnected preview is clearly labeled, and its static-file architecture is compatible with GitHub Pages in principle. See the [README feature list](./README.md#L11) and the [main app implementation](./app.js).

The product references describe UX patterns, not service integrations: “Netflix-inspired” applies to Movies and Series discovery/playback from the user's Jellyfin library; “Feishin-inspired” applies to browsing, organizing, and playing the user's Jellyfin music. NOVA must not access or imply access to Netflix accounts/catalogs/streams or Feishin services/catalogs. Keep both experiences grounded in Jellyfin APIs and the connected user's own media.

## Findings and recommended changes

The findings table below captures the original review baseline. Implementation status and outstanding release verification are recorded after the ticket.

| Priority | Finding | Evidence | Recommendation / acceptance criteria |
|---|---|---|---|
| **P0 — Release blocker** | **GitHub Pages release is not documented or automated.** The README only says to deploy to a generic static host; the project contains only the HTML, CSS, JS, and README, with no Pages workflow or release verification. | [README run instructions](./README.md#L5); project files [index.html](./index.html), [app.js](./app.js), [styles.css](./styles.css), [README.md](./README.md) | Add a GitHub Actions Pages workflow that publishes the four required files and uses the supported Pages artifact/deploy flow. Document the one-time repository Pages setup and the deployed URL. Verify both a repository/project Pages path (`/<repo>/`) and the intended deployment layout, since project Pages commonly serves below the domain root. The deployed page must load CSS/JS and preview art without 404s; no Jellyfin credentials or server secrets belong in the workflow. |
| **P0 — Product scope blocker** | **The two product references need distinct, testable boundaries.** Netflix-inspired patterns are for Movies/Series; Feishin-inspired patterns are for Music. Neither reference means integration with the third-party service or access to its catalog. | [README scope and features](./README.md#L3); [main app implementation](./app.js) | Specify a Jellyfin-only feature contract with separate Movies/Series and Music experiences. Keep movie/series discovery (continue watching, shelves, details, My List, search, playback) separate from the music library (artists, albums, tracks, playlists, music favorites, queue and player controls). Mark advanced features such as lyrics, radio, and synchronized listening as out of scope until separately approved. Add acceptance tests per surface; do not promise Netflix/Feishin content, accounts, or access. |
| **P1 — High** | **Library and search results silently stop at fixed limits.** Browse requests cap at 100 items and search at 60, without pagination or a visible “more results” state; larger libraries appear incomplete. | [browse request limit](./app.js#L381); [search request limit](./app.js#L409) | Implement Jellyfin paging using server-provided counts/continuation, or explicitly label and expose a bounded result set with a reliable “Load more” control. Verify that a library/search with more than one page can reach all results and that loading/error states remain usable. |
| **P1 — High** | **Tablet navigation can lose its accessible names.** At widths 561–800px, CSS hides each navigation text span while the buttons have no `aria-label`; icons alone are not reliable names for assistive technology. | [navigation buttons](./index.html#L40); [tablet label hiding](./styles.css#L228); [mobile label restoration](./styles.css#L237) | Give each icon-only nav button a stable accessible name (and current-page state such as `aria-current`/`aria-pressed`), then test at desktop, tablet, and mobile widths with keyboard and a screen reader/accessibility tree. Audit visible keyboard focus for all custom buttons and interactive cards. |
| **P1 — High** | **Sign-in requests have no explicit timeout or cancellation.** The general API wrapper times out after 20 seconds, but the initial authentication `fetch` does not use that wrapper or an abort signal. A stalled server can leave the user waiting indefinitely. | [API timeout](./app.js#L144); [authentication request](./app.js#L695) | Apply a bounded timeout to authentication, restore the submit state on timeout, and show a useful retryable message. Test timeout, unreachable server, bad credentials, CORS denial, and successful sign-in. |
| **P1 — High** | **There is no automated release smoke test.** No test or build configuration is present in the project; the app is static, so basic browser/deployment regressions are currently easy to ship. | Project file inventory; [static run instructions](./README.md#L7) | Add a lightweight Pages check that verifies the published entry point and referenced assets load. Add focused browser smoke coverage for disconnected preview, connect-modal validation, search state, browse empty/error state, and responsive navigation. Keep Jellyfin-dependent end-to-end checks optional or use a controlled test server. |
| **P2 — Polish** | **The intended display fonts are referenced but not loaded.** `Manrope` and `DM Sans` appear in CSS fallbacks, but the HTML has no font resource link and the stylesheet has no import. | [font declarations](./styles.css#L14); [document head](./index.html#L4) | Either bundle/load appropriately licensed fonts with a system fallback, or adjust the design to intentionally use the available fallback. Avoid making a public release depend on an undocumented third-party font host. |
| **P2 — Trust and onboarding** | **Connection requirements are documented, but the setup journey relies on the user already understanding CORS, HTTPS, and server reachability.** | [README connection notes](./README.md#L7); [production notes](./README.md#L21) | Keep the concise production guidance and surface a contextual help link beside the server address/error. Explain that NOVA talks directly to the chosen Jellyfin server and that the server administrator may need to allow the Pages origin in CORS. Test the deployed HTTPS origin against a correctly configured Jellyfin server. |

## GitHub Pages readiness

- **Static-host compatible:** yes. There is no build step or backend requirement, and the HTML references `./styles.css` and `./app.js`, which are suitable for a root or subpath deployment when the files are published together.
- **Publishing pipeline:** configured in the repository; a successful public deployment has not yet been verified. Select GitHub Actions as the Pages source in repository settings.
- **Jellyfin connectivity:** conditional on a reachable Jellyfin server, a compatible CORS allowlist, and HTTPS-compatible server configuration. GitHub Pages cannot proxy or fix a user's Jellyfin network setup.
- **Credentials:** the README correctly says sign-in is session-only by default and that opting into “Remember this device” stores the access token in browser local storage. It also documents Jellyfin's playback `api_key` URL requirement and `no-referrer` behavior. Keep those disclosures visible and avoid presenting browser storage as equivalent to server-side secure storage. See [production notes](./README.md#L21).
- **Branding:** the README identifies NOVA as an independent community client and says it is not affiliated with Jellyfin. Preserve that disclosure. Treat “Netflix-inspired” and “Feishin-inspired” as internal UX references unless legal/product review approves external wording; do not imply affiliation or access to either service's catalog.

## Release verification checklist

- [x] Define NOVA as Jellyfin-only; Netflix-inspired UX is for Movies/Series and Feishin-inspired UX is for Music, not third-party content integration.
- [x] Add a GitHub Pages Actions deployment workflow and Pages setup instructions.
- [x] Add accessible navigation names/current-page state, a bounded sign-in request, and CORS/HTTPS connection help.
- [x] Add pagination for movie, series, search, music catalog, and music collection results.
- [x] Implement the Jellyfin-backed music-library contract below, including genres, music filters/search, favorites, playlist create/rename/add/remove, queue editing, and player modes. Playlist deletion is withheld until a safe API operation is verified.
- [x] Update the feature and production notes in the README.
- [ ] Enable GitHub Pages with **GitHub Actions** in repository settings, run the workflow, and verify the deployed URL and all assets at the project subpath.
- [ ] Test authentication and video/audio playback against a real Jellyfin server, including at least one browser/device audio format.

## Feature ticket: Feishin-inspired Jellyfin Music library

**Ticket:** NOVA-MUSIC-01  
**Priority:** P1 — Product feature  
**Title:** Browse, organize, and stream my Jellyfin Music library in NOVA
**Implementation status:** Core client-side scope implemented: artists, albums, tracks, genres, music search, genre/year filtering, sorting, pagination, metadata fallbacks, artist/album/track playback, persistent player controls, editable queue, music favorites, and Jellyfin playlist create/rename/add/remove. Playlist deletion is intentionally not exposed because a playlist-specific delete operation was not verified; NOVA does not use a generic item-delete endpoint that could affect library media. Real-server behavior remains unverified.

**User story**  
As a NOVA user connected to Jellyfin, I want a dedicated music-library experience to browse artists, albums, tracks, and playlists, organize favorites and playback queues, and listen continuously while navigating NOVA.

**Scope**

- Keep Music as a first-class, separate destination from the Netflix-inspired Movies/Series experience.
- Provide music-library views for artists, albums, tracks/songs, genres when Jellyfin metadata supports them, and playlists.
- Provide music-specific search and sorting/filtering for common library fields (name, artist, album, genre, year); retain pagination and useful empty/loading/error states.
- Present available artwork and key metadata (artist, album, track number, duration, year, genre) with usable fallbacks when metadata/art is missing.
- Support opening an artist/album, playing an album or track, and queue actions including play next, add to queue, reorder, and remove. Keep the queue available across NOVA route changes.
- Provide a persistent audio player with play/pause, previous/next, seek, volume, shuffle, repeat modes, current-track metadata, progress, and a visible/editable queue.
- Support Jellyfin-backed music favorites and playlist workflows: view playlists, create a playlist, add/remove tracks, and rename playlists where the Jellyfin API and user permissions allow it. Surface permission errors without implying success. Expose deletion only if a safe, supported playlist-specific operation is available; do not use generic media deletion.
- Stream only from the user's configured Jellyfin server. Do not add a third-party catalog, service account, proxy, or unauthorized content source.
- Treat lyrics, radio/station generation, synchronized lyrics, cross-device sync, and offline downloads as **out of scope for this ticket** unless product approves a separate follow-up.

**Acceptance criteria**

1. A connected user can independently navigate Music and browse artists, albums, tracks, genres (when available), and playlists; music results do not leak into Movies/Series views.
2. The user can search and page through the music library, sort/filter by supported metadata, open artist and album views, and see clear fallbacks for missing metadata/artwork.
3. The user can play a track, album, or artist selection. Queue actions add/remove/reorder tracks and play-next behaves predictably without losing the queue on route changes.
4. The player reflects actual media state: play/pause icon and accessible label update on media events; elapsed/duration and seek position update during playback; seek, volume, previous/next, shuffle, and repeat controls work.
5. Users can view and update music favorites and create/manage Jellyfin playlists to the extent allowed by the server API and their permissions. Failed updates show an error and do not leave success-shaped UI state.
6. Stopping music or disconnecting stops playback and clears the current session's queue; no auth token, playlist contents, or queue is persisted unless separately approved.
7. Empty library, unavailable track, unsupported format, permission denial, server failure, and CORS errors produce understandable retryable states without breaking other NOVA features.
8. Music views, library actions, and player controls are keyboard-accessible and usable at desktop/tablet/mobile sizes, with accessible names and state announcements.
9. All requests and streams use the connected Jellyfin server/session. Production documentation explains HTTPS, CORS, direct media requests, and browser format limitations; no password is persisted.
10. Tests cover music routes, pagination/search, queue operations, player state/time/seek synchronization, playlist/favorite success and failure, and responsive controls. Include real-server smoke verification before release.

**Implementation notes**

- Reuse the existing Jellyfin API/session and artwork helpers; confirm each music endpoint and request shape against supported Jellyfin API behavior instead of assuming video endpoints can serve music workflows.
- Keep player state separate from catalog rendering so route changes don't reset playback. Use explicit queue and playback state transitions; synchronize controls from media events.
- Check current-user permissions for playlist/favorite operations and handle partial failures explicitly.
- Favor accessible standard controls and responsive layout; music listening is a core workflow, not a reduced video-only afterthought.
- Update product/README documentation and Pages smoke coverage as each capability ships. GitHub Pages hosts the client only; Jellyfin remains responsible for authorization, library APIs, and audio delivery.

## Review validation and limits

The disconnected preview opens from the local static files. Jellyfin's current server source was checked for the music genre, playlist create/update/add/item-list, and user-favorite request shapes used by the implementation. The dependency-free static smoke checks and workspace diagnostics pass. No live Jellyfin server or configured GitHub Pages deployment was available, so music API behavior across supported server versions, user permission outcomes, actual audio formats, authentication/CORS against a real server, and the deployed URL remain unverified. Complete a real-server music/video smoke test and run the Pages workflow before granting final launch approval.
