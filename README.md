# NOVA for Jellyfin

NOVA is a responsive, browser-based Jellyfin client with a cinematic home screen, library browsing, search, favorites, title details, direct video playback, and music streaming. It is a static website: no NOVA account, backend, build step, or third-party media service is required.

NOVA is Jellyfin-only. Its discovery and playback patterns may feel familiar to users of streaming services, but NOVA does not access Netflix accounts, catalogs, or streams.

## Run it

Serve this directory from a web server and open its URL in a modern browser. For local development, any static-file server is suitable.

### GitHub Pages

The repository's GitHub Actions workflow publishes the app files from this `jellyfin-client/` directory to GitHub Pages whenever changes are pushed to `main`. In the repository settings, choose **Pages → Build and deployment → Source → GitHub Actions**. After the first successful workflow run, open the Pages URL shown in the deployment job (typically `https://<owner>.github.io/<repository>/`).

The static assets use relative paths and work when served at a project subpath. The workflow runs a dependency-free asset/feature smoke check before publishing. No Jellyfin server address, username, password, or token is needed in GitHub Actions.

Open **Connect server**, enter the Jellyfin base URL (for example `https://media.example.com`), and sign in with a Jellyfin account. The server must be reachable by the browser and allow this website's origin in its CORS configuration. A browser page served over HTTPS cannot connect to a Jellyfin server over plain HTTP because browsers block mixed content.

## Features

- Discover, movie, series, music, favorites, and continue-watching views backed by the Jellyfin API.
- Search the connected user's library and view title details, with season selection and playable episode lists for series.
- Add and remove favorites using the Jellyfin user API.
- Direct playback in the browser's native video player, with Jellyfin playback progress reporting.
- Browse and search music artists, albums, tracks, genres, playlists, and favorite tracks; filter by genre/year and sort by name, artist, album, or year.
- Play an artist, album, or track; manage an in-memory queue with play-next, reordering, removal, shuffle, repeat, seek, and volume controls.
- Create, rename, and add/remove tracks from Jellyfin music playlists, subject to the connected account's permissions. NOVA does not offer playlist deletion: no playlist-specific delete operation was verified in Jellyfin's API, and generic item deletion could affect library media.
- Artwork fetched with the Jellyfin authorization header and held as temporary browser object URLs.
- Session-only sign-in by default; **Remember this device** opts into storing the Jellyfin access token in browser local storage. The password is not stored.
- A clearly labeled preview before sign-in; preview titles are not presented as server content.

## Production notes

NOVA runs entirely in the browser and sends requests directly to the configured Jellyfin server. Configure Jellyfin's CORS allowlist for the deployed NOVA origin. Native browser media elements cannot attach the Jellyfin authorization header, so direct video and audio stream URLs use Jellyfin's `api_key` query parameter and a `no-referrer` policy. NOVA does not proxy media; the user's Jellyfin server remains responsible for authorization and streaming. Use HTTPS for NOVA and Jellyfin in production. Audio format support depends on the browser and the server's available media sources. Music favorites, playlists, and their metadata stay on Jellyfin; the active queue is held only in browser memory and cleared on stop/disconnect. Queue and player preferences are not persisted between page loads.

NOVA is an independent community client and is not affiliated with the Jellyfin project.
