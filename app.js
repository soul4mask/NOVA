"use strict";

const CLIENT_NAME = "NOVA";
const CLIENT_VERSION = "1.0.0";
const DEVICE_ID_KEY = "nova-device-id";
const SESSION_KEY = "nova-session";
const REMEMBERED_KEY = "nova-remembered-session";
const IMAGE_WIDTH = 560;

const state = {
  session: null,
  route: "home",
  searchTimer: null,
  searchSequence: 0,
  homeRequestId: 0,
  browseRequestId: 0,
  detailRequestId: 0,
  episodeRequestId: 0,
  musicRequestId: 0,
  musicFacetRequestId: 0,
  audioRequestId: 0,
  browseOffset: 0,
  searchOffset: 0,
  musicOffset: 0,
  musicMode: "albums",
  musicCollection: null,
  musicSearch: "",
  musicSearchTimer: null,
  musicGenre: "",
  musicYear: "",
  musicSort: "SortName",
  musicGenres: [],
  musicPlaylists: [],
  musicPlaylistOptions: [],
  musicFacetsLoaded: false,
  musicQueue: [],
  musicIndex: -1,
  musicPlayback: null,
  musicExpanded: false,
  musicShuffle: false,
  musicRepeat: "off",
  musicVolume: 1,
  lastProgressUpdate: 0,
  lastMusicProgressUpdate: 0,
  imageUrls: new Map(),
  objectUrls: new Set(),
  currentItem: null,
  currentPlayback: null,
  demo: true
};

const homeView = document.querySelector("#home-view");
const browseView = document.querySelector("#browse-view");
const searchView = document.querySelector("#search-view");
const musicView = document.querySelector("#music-view");
const connectModal = document.querySelector("#connect-modal");
const detailModal = document.querySelector("#detail-modal");
const playerModal = document.querySelector("#player-modal");
const connectForm = document.querySelector("#connect-form");
const connectError = document.querySelector("#connect-error");
const searchInput = document.querySelector("#search-input");
const videoPlayer = document.querySelector("#video-player");
const audioPlayer = document.querySelector("#audio-player");
const audioDock = document.querySelector("#audio-dock");
const audioSeek = document.querySelector("#audio-seek");
const audioVolume = document.querySelector("#audio-volume");
audioPlayer.volume = state.musicVolume;

const demoItems = [
  { Name: "The Last Horizon", Year: 2025, Id: "demo-1", Image: "photo-1446776811953-b23d57bd21aa", Type: "Movie", Tag: "SCI-FI", Description: "On the edge of a known universe, one crew finds a signal that changes everything they thought they knew about home." },
  { Name: "Blue Hour", Year: 2024, Id: "demo-2", Image: "photo-1470770841072-f978cf4d019e", Type: "Movie", Tag: "DRAMA", Description: "A quiet mountain town, a long-overdue return, and the conversations that can only happen before dawn." },
  { Name: "After the Rain", Year: 2025, Id: "demo-3", Image: "photo-1519608487953-e999c86e7455", Type: "Series", Tag: "SERIES", Description: "Every summer brings a new mystery to the coast. This time, the tide is bringing something back." },
  { Name: "Wild Places", Year: 2023, Id: "demo-4", Image: "photo-1472396961693-142e6e269027", Type: "Movie", Tag: "DOCUMENTARY", Description: "A breathtaking journey through the places still wild enough to surprise us." },
  { Name: "The Quiet Between", Year: 2024, Id: "demo-5", Image: "photo-1500530855697-b586d89ba3ee", Type: "Movie", Tag: "ADVENTURE", Description: "Two strangers take the long way home and find more than they set out looking for." },
  { Name: "Northbound", Year: 2025, Id: "demo-6", Image: "photo-1464822759023-fed622ff2c3b", Type: "Series", Tag: "SERIES", Description: "A new station at the edge of the world. The people who keep it running. The season that tests them all." },
  { Name: "Velvet City", Year: 2024, Id: "demo-7", Image: "photo-1519608487953-e999c86e7455", Type: "Movie", Tag: "THRILLER", Description: "One city. One night. A chance meeting that pulls an ordinary life beautifully off course." }
];

function demoArtwork(item, wide = false) {
  const palettes = [
    ["#40545c", "#17232a", "#b4c797"],
    ["#53645d", "#17221c", "#e7bb83"],
    ["#565a77", "#1a1b31", "#d0a6bc"],
    ["#66704e", "#20291b", "#d6c68b"],
    ["#65545a", "#261d24", "#e3ad8b"],
    ["#526375", "#192331", "#b9c9d0"],
    ["#79594c", "#291d1b", "#e6b280"]
  ];
  const index = Math.max(0, demoItems.findIndex((entry) => entry.Id === item.Id));
  const [base, shadow, glow] = palettes[index % palettes.length];
  const title = escapeHtml(item.Name || "NOVA").replace(/&amp;/g, "&amp;");
  const width = wide ? 1200 : 640;
  const height = wide ? 700 : 800;
  const landscape = wide
    ? `<path d="M0 520 230 340l125 92 190-235 220 205 160-153 275 185v266H0Z" fill="${shadow}" opacity=".72"/><path d="m0 585 210-130 200 126 222-197 236 171 170-104 162 89v160H0Z" fill="#111411" opacity=".8"/>`
    : `<path d="M0 520 135 360l91 88 146-224 162 223 106-128v481H0Z" fill="${shadow}" opacity=".8"/><path d="m0 600 123-88 118 99 138-150 104 110 157-133v362H0Z" fill="#111411" opacity=".78"/>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}"><defs><linearGradient id="bg" x2="0" y2="1"><stop stop-color="${base}"/><stop offset="1" stop-color="${shadow}"/></linearGradient><radialGradient id="glow"><stop stop-color="${glow}" stop-opacity=".85"/><stop offset="1" stop-color="${glow}" stop-opacity="0"/></radialGradient><linearGradient id="fade" x2="0" y2="1"><stop offset=".38" stop-color="#10110f" stop-opacity="0"/><stop offset="1" stop-color="#10110f" stop-opacity=".9"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#bg)"/><circle cx="${wide ? 820 : 430}" cy="${wide ? 190 : 250}" r="${wide ? 200 : 150}" fill="url(#glow)"/><circle cx="${wide ? 820 : 430}" cy="${wide ? 190 : 250}" r="${wide ? 49 : 37}" fill="${glow}" opacity=".65"/>${landscape}<path d="M0 0h${width}v${height}H0z" fill="url(#fade)"/><text x="7%" y="${wide ? "84%" : "87%"}" fill="#fff" font-family="Arial,sans-serif" font-size="${wide ? 31 : 26}" font-weight="700" letter-spacing="3" opacity=".82">${title}</text><text x="7%" y="${wide ? "89%" : "91%"}" fill="${glow}" font-family="Arial,sans-serif" font-size="12" letter-spacing="5" opacity=".9">NOVA PREVIEW</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function icon(name, extraClass = "") {
  return `<svg class="icon ${extraClass}" aria-hidden="true"><use href="#i-${name}"></use></svg>`;
}

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}

function getDeviceId() {
  let deviceId = localStorage.getItem(DEVICE_ID_KEY);
  if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
  }
  return deviceId;
}

function normalizeServerUrl(value) {
  let parsed;
  try {
    parsed = new URL(value.trim());
  } catch {
    throw new Error("Enter a valid server address, including http:// or https://.");
  }
  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error("Use an http or https server address.");
  }
  return parsed.href.replace(/\/+$/, "");
}

function loadSavedSession() {
  try {
    const stored = sessionStorage.getItem(SESSION_KEY) || localStorage.getItem(REMEMBERED_KEY);
    if (!stored) return null;
    const session = JSON.parse(stored);
    if (!session.server || !session.accessToken || !session.userId) return null;
    state.demo = false;
    return session;
  } catch (error) {
    console.error("Could not restore the saved Jellyfin session.", error);
    showToast("Your saved session could not be restored. Connect again to continue.", true);
    return null;
  }
}

function saveSession(session, remember) {
  sessionStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(REMEMBERED_KEY);
  const store = remember ? localStorage : sessionStorage;
  store.setItem(remember ? REMEMBERED_KEY : SESSION_KEY, JSON.stringify(session));
}

function clearSession() {
  sessionStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(REMEMBERED_KEY);
  state.session = null;
  state.demo = true;
  state.imageUrls.clear();
  state.musicRequestId += 1;
  state.musicFacetRequestId += 1;
  state.musicGenres = [];
  state.musicPlaylists = [];
  state.musicPlaylistOptions = [];
  state.musicFacetsLoaded = false;
  state.musicCollection = null;
  state.musicItems = [];
  state.musicMode = "albums";
  state.musicSearch = "";
  state.musicGenre = "";
  state.musicYear = "";
  state.musicSort = "SortName";
  state.musicShuffle = false;
  state.musicRepeat = "off";
  state.musicVolume = 1;
  audioPlayer.volume = 1;
  audioVolume.value = "1";
  for (const url of state.objectUrls) URL.revokeObjectURL(url);
  state.objectUrls.clear();
}

function authHeader(token = state.session?.accessToken) {
  const deviceId = getDeviceId();
  const identity = `MediaBrowser Client="${CLIENT_NAME}", Device="Web browser", DeviceId="${deviceId}", Version="${CLIENT_VERSION}"`;
  return token ? `${identity}, Token="${token}"` : identity;
}

async function api(path, options = {}) {
  if (!state.session) throw new Error("Connect to your Jellyfin server first.");
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 20000);
  try {
    const response = await fetch(`${state.session.server}${path}`, {
      ...options,
      signal: options.signal || controller.signal,
      headers: {
        Accept: "application/json",
        Authorization: authHeader(),
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...options.headers
      }
    });
    if (!response.ok) {
      const message = response.status === 401 ? "Your Jellyfin session expired. Connect again." :
        response.status === 403 ? "Jellyfin denied this request. Check your account permissions." :
        `Jellyfin returned ${response.status} ${response.statusText}.`;
      throw new Error(message);
    }
    if (response.status === 204) return null;
    return response.json();
  } catch (error) {
    if (error.name === "AbortError") throw new Error("The server took too long to respond. Check your connection and try again.");
    if (error instanceof TypeError) {
      throw new Error("Could not reach your Jellyfin server. Check the address, server availability, and CORS settings.");
    }
    throw error;
  } finally {
    window.clearTimeout(timeout);
  }
}

function imageEndpoint(item, type = "Primary") {
  if (!item?.Id) return null;
  const tag = type === "Backdrop" ? item.BackdropImageTags?.[0] : item.ImageTags?.Primary;
  if (!tag) return null;
  return `${state.session.server}/Items/${encodeURIComponent(item.Id)}/Images/${type}?maxWidth=${IMAGE_WIDTH}&quality=85`;
}

async function loadImage(item, type = "Primary") {
  const src = imageEndpoint(item, type);
  if (!src) return null;
  if (state.imageUrls.has(src)) return state.imageUrls.get(src);
  const pending = apiImage(src);
  state.imageUrls.set(src, pending);
  try {
    const url = await pending;
    state.imageUrls.set(src, url);
    return url;
  } catch (error) {
    state.imageUrls.delete(src);
    throw error;
  }
}

async function apiImage(url) {
  const response = await fetch(url, {
    headers: { Authorization: authHeader() }
  });
  if (!response.ok) throw new Error(`Jellyfin image request failed (${response.status}).`);
  const objectUrl = URL.createObjectURL(await response.blob());
  state.objectUrls.add(objectUrl);
  return objectUrl;
}

function attachImages(container) {
  for (const image of container.querySelectorAll("img[data-item-id]")) {
    const item = itemCache.get(image.dataset.itemId);
    if (!item) continue;
    loadImage(item, image.dataset.imageType || "Primary").then((url) => {
      if (url && image.isConnected) {
        image.src = url;
        image.classList.add("loaded");
      }
    }).catch((error) => console.warn("Could not load a Jellyfin artwork image.", error));
  }
}

const itemCache = new Map();

function cacheItems(items) {
  for (const item of items || []) {
    if (item?.Id) itemCache.set(item.Id, item);
  }
}

function formatYear(item) {
  return item.ProductionYear ? String(item.ProductionYear) : item.Year ? String(item.Year) : "";
}

function formatDuration(ticks) {
  if (!ticks) return "";
  const minutes = Math.round(ticks / 600000000);
  const hours = Math.floor(minutes / 60);
  return hours ? `${hours}h ${minutes % 60}m` : `${minutes} min`;
}

function mediaType(item) {
  if (item.Type === "Episode") return "EPISODE";
  if (item.Type === "Series") return "SERIES";
  if (item.Type === "Movie") return "MOVIE";
  return item.Type ? item.Type.toUpperCase() : "";
}

function mediaCard(item, options = {}) {
  const id = item.Id || "";
  const demo = item.Id?.startsWith("demo-");
  if (id && !demo) itemCache.set(id, item);
  const title = escapeHtml(item.Name || "Untitled");
  const year = escapeHtml(formatYear(item));
  const type = escapeHtml(item.Tag || mediaType(item));
  const rating = Number(item.CommunityRating);
  const fallbackImage = demo ? demoArtwork(item) : "";
  const image = demo ? `<img class="poster-image" src="${fallbackImage}" alt="" loading="lazy">` :
    `<img class="poster-image" data-item-id="${escapeHtml(id)}" alt="" loading="lazy">`;
  const progress = item.UserData?.PlaybackPositionTicks && item.RunTimeTicks ?
    Math.min(100, Math.round(item.UserData.PlaybackPositionTicks / item.RunTimeTicks * 100)) : 0;
  return `<button class="media-card" type="button" data-action="details" data-id="${escapeHtml(id)}" ${demo ? `data-demo="true"` : ""} aria-label="More about ${title}">
    <div class="poster-wrap ${options.portrait ? "portrait" : ""}">
      ${image}<span class="poster-shade"></span>
      ${type ? `<span class="poster-tag">${type}</span>` : ""}
      <span class="poster-overlay">${icon("play")}</span>
      ${progress ? `<span class="progress-track"><span style="width:${progress}%"></span></span>` : ""}
    </div>
    <p class="poster-title">${title}</p>
    <div class="poster-meta">${year ? `<span>${year}</span>` : ""}${rating ? `<span class="rating">★ ${rating.toFixed(1)}</span>` : ""}${item.RunTimeTicks ? `<span>${escapeHtml(formatDuration(item.RunTimeTicks))}</span>` : ""}</div>
  </button>`;
}

function shelf(title, items, options = {}) {
  if (!items?.length) return "";
  return `<section class="section-block"><div class="section-heading"><div><h2 class="section-title">${escapeHtml(title)}</h2>${options.subtitle ? `<p class="section-subtitle">${escapeHtml(options.subtitle)}</p>` : ""}</div>${options.route ? `<button class="section-action" type="button" data-route="${options.route}">View all ${icon("arrow")}</button>` : ""}</div><div class="card-row">${items.map((item) => mediaCard(item)).join("")}</div></section>`;
}

function disconnectedHome() {
  homeView.innerHTML = `
    <header class="landing-header">
      <a class="landing-brand" href="#" aria-label="NOVA home"><span class="brand-mark">${icon("spark")}</span>NOVA</a>
      <nav class="landing-nav" aria-label="Page navigation">
        <a href="#features">Features</a>
        <a href="#privacy">Your privacy</a>
      </nav>
      <button class="button button-primary landing-connect" type="button" data-action="connect">Connect Jellyfin ${icon("arrow")}</button>
    </header>
    <section class="landing-hero">
      <div class="landing-copy">
        <p class="landing-kicker"><span></span> YOUR MEDIA, YOUR SPACE</p>
        <h1>A more personal<br>way to enjoy<br><em>your library.</em></h1>
        <p class="landing-description">NOVA brings your movies, series, and music together in one thoughtful place — powered by the Jellyfin server you choose.</p>
        <div class="landing-actions">
          <button class="button button-primary" type="button" data-action="connect">Connect your server ${icon("arrow")}</button>
          <a class="landing-text-link" href="#features">Get to know NOVA <span aria-hidden="true">↓</span></a>
        </div>
        <p class="landing-requirement">${icon("server")} You'll need a Jellyfin server to get started.</p>
      </div>
      <div class="landing-art" aria-hidden="true">
        <div class="orbit orbit-one"></div>
        <div class="orbit orbit-two"></div>
        <div class="orbit-core"><span class="orbit-star">${icon("spark")}</span></div>
        <span class="orbit-label orbit-label-top">YOUR COLLECTION</span>
        <span class="orbit-label orbit-label-bottom">RIGHT WHERE IT BELONGS</span>
      </div>
    </section>
    <section class="landing-features" id="features">
      <div class="landing-section-heading">
        <p class="landing-kicker"><span></span> MADE FOR YOUR LIBRARY</p>
        <h2>Everything you love.<br><em>Nothing you don't.</em></h2>
      </div>
      <div class="landing-feature-grid">
        <article class="landing-feature">
          <span class="landing-feature-icon">${icon("film")}</span>
          <h3>Stories, ready when you are.</h3>
          <p>Find your films and series, pick up where you left off, and keep the favorites you want close.</p>
        </article>
        <article class="landing-feature">
          <span class="landing-feature-icon">${icon("music")}</span>
          <h3>Your music, in its own rhythm.</h3>
          <p>Browse artists, albums, and playlists, then shape the queue around the moment.</p>
        </article>
        <article class="landing-feature">
          <span class="landing-feature-icon">${icon("server")}</span>
          <h3>Direct from your server.</h3>
          <p>NOVA connects your browser straight to your Jellyfin server. Your media stays on your server, not ours.</p>
        </article>
      </div>
    </section>
    <section class="landing-privacy" id="privacy">
      <div class="privacy-orbit" aria-hidden="true">${icon("spark")}</div>
      <div>
        <p class="landing-kicker"><span></span> PRIVATE BY DESIGN</p>
        <h2>Your library stays <em>yours.</em></h2>
        <p>There’s no NOVA account and no NOVA media hosting. Sign in with your Jellyfin server; your password is only sent to that server. Remembering this device stores an access token in this browser.</p>
      </div>
      <button class="button button-secondary" type="button" data-action="connect">Connect securely ${icon("arrow")}</button>
    </section>
    <footer class="landing-footer">
      <a class="landing-brand" href="#" aria-label="NOVA home"><span class="brand-mark">${icon("spark")}</span>NOVA</a>
      <p>An independent community client. Not affiliated with the Jellyfin project.</p>
    </footer>
  `;
}

function connectedHero(item) {
  const name = escapeHtml(item?.Name || "Your library");
  const image = item?.BackdropImageTags?.length || item?.ImageTags?.Primary ?
    `<img class="hero-image" data-item-id="${escapeHtml(item.Id)}" data-image-type="${item.BackdropImageTags?.length ? "Backdrop" : "Primary"}" alt="">` : "";
  const summary = escapeHtml(item?.Overview || "Pick up where you left off or find something new in your collection.");
  const itemId = escapeHtml(item?.Id || "");
  const hero = `<section class="hero">${image}<div class="hero-content"><p class="eyebrow"><span class="eyebrow-line"></span> ${item ? "FROM YOUR LIBRARY" : "YOUR PERSONAL CINEMA"}</p><h1>${name}</h1><div class="hero-meta">${item?.ProductionYear ? `<span>${escapeHtml(item.ProductionYear)}</span>` : ""}${item?.CommunityRating ? `<span class="meta-separator"></span><span>★ ${escapeHtml(Number(item.CommunityRating).toFixed(1))}</span>` : ""}${item?.OfficialRating ? `<span class="meta-badge">${escapeHtml(item.OfficialRating)}</span>` : ""}</div><p class="hero-copy">${summary.length > 240 ? `${summary.slice(0, 237)}…` : summary}</p><div class="hero-actions">${item ? `<button class="button button-primary" type="button" data-action="play" data-id="${itemId}">${icon("play")} Play now</button><button class="button button-secondary" type="button" data-action="details" data-id="${itemId}">${icon("info")} Details</button>` : `<button class="button button-primary" type="button" data-route="movies">Explore your library ${icon("arrow")}</button>`}</div></div><div class="hero-aside"><span>✦</span> YOUR PERSONAL CINEMA</div></section>`;
  return hero;
}

async function loadHome() {
  const requestId = ++state.homeRequestId;
  homeView.innerHTML = `<div class="hero-skeleton skeleton"></div><div class="loading-grid" style="margin-top:30px"><div class="skeleton"></div><div class="skeleton"></div><div class="skeleton"></div><div class="skeleton"></div><div class="skeleton"></div></div>`;
  try {
    const [resumeResponse, viewsResponse] = await Promise.all([
      api(`/Users/${encodeURIComponent(state.session.userId)}/Items/Resume?Limit=12&MediaTypes=Video&Fields=Overview,Genres,RunTimeTicks,UserData,ImageTags,BackdropImageTags`),
      api(`/Users/${encodeURIComponent(state.session.userId)}/Views`)
    ]);
    const resume = resumeResponse.Items || [];
    const views = viewsResponse.Items || [];
    cacheItems([...resume, ...views]);
    const sections = await Promise.all(views.slice(0, 5).map(async (view) => {
      try {
        const query = new URLSearchParams({
          ParentId: view.Id,
          IncludeItemTypes: "Movie,Series",
          Recursive: "true",
          Limit: "18",
          SortBy: "DateCreated",
          SortOrder: "Descending",
          Fields: "Overview,Genres,RunTimeTicks,UserData,ImageTags,BackdropImageTags"
        });
        const response = await api(`/Users/${encodeURIComponent(state.session.userId)}/Items?${query}`);
        return { view, items: response.Items || [] };
      } catch (error) {
        console.error(`Could not load library "${view.Name}".`, error);
        return { view, error };
      }
    }));
    if (requestId !== state.homeRequestId) return;
    const featured = resume[0] || sections.find((section) => section.items?.length)?.items[0] || null;
    homeView.innerHTML = `${connectedHero(featured)}${resume.length ? shelf("Pick up where you left off", resume, { subtitle: "Right where you left it" }) : ""}${sections.map(({ view, items }) => shelf(view.Name, items, { subtitle: view.CollectionType || "From your library", route: view.CollectionType === "movies" ? "movies" : view.CollectionType === "tvshows" ? "series" : null })).join("")}${sections.length === 0 && resume.length === 0 ? emptyState("Your library is ready", "There are no movies or series here yet. Add media to your Jellyfin library and it will appear here.") : ""}`;
    attachImages(homeView);
  } catch (error) {
    if (requestId !== state.homeRequestId) return;
    homeView.innerHTML = `${connectedHero(null)}<div class="error-box">${escapeHtml(error.message)} <button class="section-action" data-action="retry-home" type="button">Try again</button></div>`;
  }
}

function emptyState(title, message, actionLabel = "", action = "") {
  return `<div class="empty-state"><span class="empty-symbol">${icon("spark")}</span><h2>${escapeHtml(title)}</h2><p>${escapeHtml(message)}</p>${actionLabel ? `<button class="button button-primary" type="button" data-action="${escapeHtml(action)}">${escapeHtml(actionLabel)}</button>` : ""}</div>`;
}

function routeTo(route) {
  state.searchSequence += 1;
  state.homeRequestId += 1;
  state.browseRequestId += 1;
  state.route = route;
  document.querySelectorAll(".nav-item").forEach((item) => {
    const active = item.dataset.route === route;
    item.classList.toggle("active", active);
    if (active) item.setAttribute("aria-current", "page");
    else item.removeAttribute("aria-current");
  });
  searchView.classList.add("hidden");
  musicView.classList.add("hidden");
  if (route === "home") {
    browseView.classList.add("hidden");
    homeView.classList.remove("hidden");
    if (state.session) loadHome();
    else disconnectedHome();
    return;
  }
  if (route === "music") {
    homeView.classList.add("hidden");
    browseView.classList.add("hidden");
    musicView.classList.remove("hidden");
    if (state.session) loadMusicCatalog("albums");
    else musicView.innerHTML = `${browseHeader("music")}${emptyState("Your music is waiting", "Connect your Jellyfin server to browse and stream your music library.", "Connect Jellyfin", "connect")}`;
    return;
  }
  homeView.classList.add("hidden");
  browseView.classList.remove("hidden");
  if (!state.session) {
    browseView.innerHTML = `${browseHeader(route)}${emptyState("Your library is waiting", "Connect your Jellyfin server to explore your movies, series, and saved favorites.", "Connect Jellyfin", "connect")}`;
    return;
  }
  loadBrowse(route);
}

function browseHeader(route, count = null) {
  const titles = { movies: ["Movies", "The films in your collection, all in one place."], series: ["Series", "Every season, episode, and story worth staying in for."], favorites: ["My list", "The things you love, saved for later."], search: ["Search", "Find something good to watch."], music: ["Music", "Browse, organize, and stream music from your Jellyfin library."] };
  const [title, subtitle] = titles[route] || titles.movies;
  return `<h1 class="browse-heading">${escapeHtml(title)}${count !== null ? ` <span class="result-count">${count}</span>` : ""}</h1><p class="browse-intro">${escapeHtml(subtitle)}</p>`;
}

async function loadBrowse(route, append = false) {
  const requestId = ++state.browseRequestId;
  const startIndex = append ? state.browseOffset : 0;
  const loadMore = browseView.querySelector('[data-action="browse-more"]');
  if (append && loadMore) {
    loadMore.disabled = true;
    loadMore.textContent = "Loading…";
  } else {
    browseView.innerHTML = `${browseHeader(route)}<div class="loading-grid" style="margin-top:25px">${"<div class=\"skeleton\"></div>".repeat(10)}</div>`;
  }
  const isFavorites = route === "favorites";
  const include = route === "series" ? "Series" : "Movie";
  const params = new URLSearchParams({
    IncludeItemTypes: isFavorites ? "Movie,Series" : include,
    Recursive: "true",
    Limit: "100",
    SortBy: route === "favorites" ? "DatePlayed" : "SortName",
    SortOrder: route === "favorites" ? "Descending" : "Ascending",
    StartIndex: String(startIndex),
    Fields: "Overview,Genres,RunTimeTicks,UserData,ImageTags,BackdropImageTags"
  });
  if (isFavorites) params.set("Filters", "IsFavorite");
  try {
    const response = await api(`/Users/${encodeURIComponent(state.session.userId)}/Items?${params}`);
    if (requestId !== state.browseRequestId) return;
    const items = response.Items || [];
    state.browseOffset = startIndex + items.length;
    cacheItems(items);
    const total = response.TotalRecordCount ?? state.browseOffset;
    const filters = route === "movies" || route === "series" ? `<div class="browse-toolbar"><button class="filter-chip active" type="button" data-filter="all">Everything</button><button class="filter-chip" type="button" data-filter="unplayed">Unwatched</button><button class="filter-chip" type="button" data-filter="favorites">Favorites</button></div>` : "";
    if (append) {
      const grid = browseView.querySelector(".browse-grid");
      if (grid) grid.insertAdjacentHTML("beforeend", items.map((item) => mediaCard(item, { portrait: true })).join(""));
      const count = browseView.querySelector(".result-count");
      if (count) count.textContent = String(total);
    } else {
      browseView.innerHTML = `${browseHeader(route, total)}${filters}${items.length ? `<div class="browse-grid">${items.map((item) => mediaCard(item, { portrait: true })).join("")}</div>` : emptyState(isFavorites ? "Your list is still yours to make" : "Nothing here just yet", isFavorites ? "Save a movie or series from its details to keep it close." : `No ${route} were found in this library.`)}`;
    }
    browseView.querySelector('[data-action="browse-more"]')?.remove();
    if (state.browseOffset < total) {
      browseView.insertAdjacentHTML("beforeend", `<button class="button button-secondary browse-more" type="button" data-action="browse-more" data-route="${escapeHtml(route)}">Load more</button>`);
    }
    attachImages(browseView);
  } catch (error) {
    if (requestId !== state.browseRequestId) return;
    if (append) {
      const button = browseView.querySelector('[data-action="browse-more"]');
      if (button) {
        button.disabled = false;
        button.textContent = "Try loading more";
      }
      showToast(error.message, true);
      return;
    }
    browseView.innerHTML = `${browseHeader(route)}<div class="error-box">${escapeHtml(error.message)} <button class="section-action" data-action="retry-browse" data-route="${escapeHtml(route)}" type="button">Try again</button></div>`;
  }
}

function musicShell() {
  const tabs = [
    ["artists", "Artists"],
    ["albums", "Albums"],
    ["tracks", "Tracks"],
    ["genres", "Genres"],
    ["playlists", "Playlists"],
    ["favorites", "Favorites"]
  ];
  const sortOptions = [["SortName", "Name"], ["AlbumArtist", "Artist"], ["Album", "Album"], ["ProductionYear", "Year"]];
  const toolbarMode = state.musicCollection?.kind === "playlists" ? "playlist-detail-toolbar" : state.musicMode === "genres" ? "genre-catalog-toolbar" : state.musicMode === "playlists" ? "playlist-catalog-toolbar" : "";
  const playlistOptions = state.musicPlaylistOptions.length ? state.musicPlaylistOptions : state.musicPlaylists;
  return `${browseHeader("music")}<div class="music-tabs" role="tablist" aria-label="Browse music">${tabs.map(([mode, label]) => `<button class="filter-chip${state.musicMode === mode && !state.musicCollection ? " active" : ""}" type="button" role="tab" aria-selected="${state.musicMode === mode && !state.musicCollection}" data-action="music-mode" data-mode="${mode}">${label}</button>`).join("")}</div><div class="music-toolbar ${toolbarMode}"><label class="music-search"><span class="sr-only">Search music</span><input id="music-search" type="search" value="${escapeHtml(state.musicSearch)}" placeholder="Search music"></label><label><span class="sr-only">Filter by genre</span><select id="music-genre" aria-label="Filter by genre"><option value="">All genres</option>${state.musicGenres.map((genre) => `<option value="${escapeHtml(genre.Name)}"${state.musicGenre === genre.Name ? " selected" : ""}>${escapeHtml(genre.Name)}</option>`).join("")}</select></label><label><span class="sr-only">Filter by year</span><input id="music-year" type="number" min="0" max="9999" value="${escapeHtml(state.musicYear)}" placeholder="Year" aria-label="Filter by year"></label><label><span class="sr-only">Sort music</span><select id="music-sort" aria-label="Sort music">${sortOptions.map(([value, label]) => `<option value="${value}"${state.musicSort === value ? " selected" : ""}>${label}</option>`).join("")}</select></label><label class="music-playlist-target-label"><span class="sr-only">Add tracks to playlist</span><select id="music-playlist-target" aria-label="Choose playlist for track actions"><option value="">Choose playlist</option>${playlistOptions.map((playlist) => `<option value="${escapeHtml(playlist.Id)}">${escapeHtml(playlist.Name)}</option>`).join("")}</select></label></div><div id="music-content" aria-live="polite"></div>`;
}

function musicCard(item, kind) {
  const name = escapeHtml(item.Name || "Untitled");
  const subtitle = kind === "artists"
    ? "Browse albums"
    : kind === "genres" || kind === "playlists"
      ? `${item.ChildCount ?? 0} tracks`
      : escapeHtml(item.AlbumArtist || item.ArtistItems?.map((artist) => artist.Name).join(", ") || "Unknown artist");
  const id = escapeHtml(item.Id);
  const itemLabel = kind === "artists" ? "artist" : kind === "genres" ? "genre" : kind === "playlists" ? "playlist" : "album";
  return `<button class="music-card" type="button" data-action="music-open" data-id="${id}" data-kind="${kind}" aria-label="Open ${itemLabel} ${name}"><span class="music-card-art">${kind !== "genres" ? `<img data-item-id="${id}" alt="" loading="lazy">` : ""}${icon(kind === "artists" || kind === "genres" ? "music" : kind === "playlists" ? "list" : "film")}</span><span class="music-card-name">${name}</span><span class="music-card-subtitle">${subtitle}</span></button>`;
}

function musicTrackRow(item, index, options = {}) {
  const title = escapeHtml(item.Name || "Untitled track");
  const artist = escapeHtml(item.AlbumArtist || item.ArtistItems?.map((entry) => entry.Name).join(", ") || item.Album || "Unknown artist");
  const metadata = [item.Album, item.ProductionYear, item.Genres?.slice(0, 1).join(", ")].filter(Boolean).map(escapeHtml).join(" · ");
  const favorite = Boolean(item.UserData?.IsFavorite);
  return `<div class="music-track-row"><span class="music-track-index">${String(index + 1).padStart(2, "0")}</span><button class="music-track-play" type="button" data-action="music-play-from-list" data-id="${escapeHtml(item.Id)}" aria-label="Play ${title} by ${artist}"><span class="music-track-copy"><strong>${title}</strong><small>${artist}${metadata ? ` · ${metadata}` : ""}${item.IndexNumber ? ` · Track ${item.IndexNumber}` : ""}</small></span>${icon("play")}</button><span class="music-track-duration">${escapeHtml(formatDuration(item.RunTimeTicks))}</span><div class="music-track-actions"><button class="music-inline-action" type="button" data-action="music-play-next" data-id="${escapeHtml(item.Id)}" aria-label="Play ${title} next" title="Play next">${icon("arrow")}</button><button class="music-inline-action" type="button" data-action="music-queue-add" data-id="${escapeHtml(item.Id)}" aria-label="Add ${title} to queue" title="Add to queue">${icon("plus")}</button><button class="music-inline-action${favorite ? " is-favorite" : ""}" type="button" data-action="music-favorite" data-id="${escapeHtml(item.Id)}" data-favorite="${favorite}" aria-label="${favorite ? "Remove from" : "Add to"} music favorites" title="${favorite ? "Remove favorite" : "Add favorite"}">${icon("heart")}</button><button class="music-inline-action" type="button" data-action="music-add-playlist" data-id="${escapeHtml(item.Id)}" aria-label="Add ${title} to selected playlist" title="Add to selected playlist">${icon("list")}</button>${options.playlistId ? `<button class="music-inline-action" type="button" data-action="music-playlist-remove" data-playlist-id="${escapeHtml(options.playlistId)}" data-id="${escapeHtml(item.Id)}" aria-label="Remove ${title} from playlist" title="Remove from playlist">${icon("close")}</button>` : ""}</div></div>`;
}

function renderMusicItems(items, kind, offset) {
  state.musicItems = offset ? [...state.musicItems, ...items] : items;
  cacheItems(items);
  const content = musicView.querySelector("#music-content");
  const total = state.musicTotal ?? state.musicOffset;
  const emptyTitle = kind === "artists" ? "No artists found" : kind === "albums" ? "No albums found" : kind === "genres" ? "No genres found" : kind === "playlists" ? "No playlists found" : kind === "favorites" ? "No favorite tracks yet" : "No tracks found";
  const emptyMessage = "This view is empty. Check that your Jellyfin account has access to a music library.";
  if (!items.length && !offset) {
    content.innerHTML = emptyState(emptyTitle, emptyMessage);
    return;
  }
  const rows = kind === "tracks" || kind === "favorites"
    ? items.map((item, index) => musicTrackRow(item, offset + index)).join("")
    : items.map((item) => musicCard(item, kind)).join("");
  if (offset) {
    const container = content.querySelector(kind === "tracks" || kind === "favorites" ? ".music-track-list" : ".music-card-grid");
    container?.insertAdjacentHTML("beforeend", rows);
  } else {
    content.innerHTML = `<p class="music-result-count">${total} ${kind}</p>${kind === "tracks" || kind === "favorites" ? `<div class="music-track-list">${rows}</div>` : `<div class="music-card-grid">${rows}</div>`}`;
  }
  content.querySelector('[data-action="music-more"]')?.remove();
  if (state.musicOffset < total) {
    content.insertAdjacentHTML("beforeend", `<button class="button button-secondary browse-more" type="button" data-action="music-more">Load more ${kind}</button>`);
  }
  attachImages(content);
}

async function loadMusicCatalog(mode = state.musicMode, append = false) {
  if (!state.session) return;
  const requestId = ++state.musicRequestId;
  state.musicMode = mode;
  state.musicCollection = null;
  const startIndex = append ? state.musicOffset : 0;
  if (!append) {
    state.musicOffset = 0;
    state.musicItems = [];
    musicView.innerHTML = musicShell();
    musicView.querySelector("#music-content").innerHTML = `<div class="loading-grid" style="margin-top:25px">${"<div class=\"skeleton\"></div>".repeat(8)}</div>`;
    loadMusicFacets();
  } else {
    const button = musicView.querySelector('[data-action="music-more"]');
    if (button) {
      button.disabled = true;
      button.textContent = "Loading…";
    }
  }
  if (mode === "genres") {
    loadMusicGenres(requestId, append, startIndex);
    return;
  }
  if (mode === "playlists") {
    loadMusicPlaylists(requestId, append, startIndex);
    return;
  }
  const itemType = { artists: "MusicArtist", albums: "MusicAlbum", tracks: "Audio", favorites: "Audio" }[mode];
  const params = new URLSearchParams({
    IncludeItemTypes: itemType,
    Recursive: "true",
    Limit: "60",
    StartIndex: String(startIndex),
    SortBy: state.musicSort,
    SortOrder: "Ascending",
    Fields: "Overview,Genres,ChildCount,SortName"
  });
  if (state.musicSearch) params.set("SearchTerm", state.musicSearch);
  if (state.musicGenre) params.set("Genres", state.musicGenre);
  if (state.musicYear) params.set("Years", state.musicYear);
  if (mode === "favorites") params.set("Filters", "IsFavorite");
  try {
    const response = await api(`/Users/${encodeURIComponent(state.session.userId)}/Items?${params}`);
    if (requestId !== state.musicRequestId || state.musicCollection) return;
    const items = response.Items || [];
    state.musicOffset = startIndex + items.length;
    state.musicTotal = response.TotalRecordCount ?? state.musicOffset;
    renderMusicItems(items, mode, startIndex);
  } catch (error) {
    if (requestId !== state.musicRequestId) return;
    if (append) {
      const button = musicView.querySelector('[data-action="music-more"]');
      if (button) {
        button.disabled = false;
        button.textContent = "Try loading more";
      }
      showToast(error.message, true);
      return;
    }
    musicView.querySelector("#music-content").innerHTML = `<div class="error-box">${escapeHtml(error.message)} <button class="section-action" type="button" data-action="music-retry">Try again</button></div>`;
  }
}

async function loadMusicFacets() {
  if (!state.session || state.musicFacetsLoaded) return;
  const requestId = ++state.musicFacetRequestId;
  try {
    const [genreResponse, playlistResponse] = await Promise.all([
      api(`/Genres?${new URLSearchParams({ UserId: state.session.userId, IncludeItemTypes: "Audio", Limit: "1000", SortBy: "SortName", SortOrder: "Ascending" })}`),
      api(`/Users/${encodeURIComponent(state.session.userId)}/Items?${new URLSearchParams({ IncludeItemTypes: "Playlist", MediaTypes: "Audio", Recursive: "true", Limit: "1000", SortBy: "SortName", SortOrder: "Ascending", Fields: "ChildCount,SortName" })}`)
    ]);
    if (requestId !== state.musicFacetRequestId || !state.session) return;
    state.musicGenres = (genreResponse.Items || []).filter((item) => item.Name);
    state.musicPlaylistOptions = (playlistResponse.Items || []).filter((item) => !item.MediaType || item.MediaType === "Audio");
    state.musicFacetsLoaded = true;
    const search = musicView.querySelector("#music-search");
    if (search) {
      const shell = musicShell();
      const content = musicView.querySelector("#music-content");
      musicView.innerHTML = shell;
      musicView.querySelector("#music-content").replaceWith(content);
    }
    refreshMusicPlaylistTargets();
  } catch (error) {
    if (requestId === state.musicFacetRequestId) showToast(`Music filters and playlists could not be loaded: ${error.message}`, true);
  }
}

function refreshMusicPlaylistTargets() {
  const selector = musicView.querySelector("#music-playlist-target");
  if (!selector) return;
  const selected = selector.value;
  const playlists = state.musicPlaylistOptions.length ? state.musicPlaylistOptions : state.musicPlaylists;
  selector.innerHTML = `<option value="">Choose playlist</option>${playlists.map((playlist) => `<option value="${escapeHtml(playlist.Id)}">${escapeHtml(playlist.Name)}</option>`).join("")}`;
  if (playlists.some((playlist) => playlist.Id === selected)) selector.value = selected;
}

async function loadMusicGenres(requestId, append, startIndex) {
  try {
    const params = new URLSearchParams({
      UserId: state.session.userId,
      IncludeItemTypes: "Audio",
      Limit: "60",
      StartIndex: String(startIndex),
      SortBy: "SortName",
      SortOrder: "Ascending"
    });
    if (state.musicSearch) params.set("SearchTerm", state.musicSearch);
    const response = await api(`/Genres?${params}`);
    if (requestId !== state.musicRequestId) return;
    const items = response.Items || [];
    state.musicOffset = startIndex + items.length;
    state.musicTotal = response.TotalRecordCount ?? state.musicOffset;
    renderMusicItems(items, "genres", startIndex);
  } catch (error) {
    if (requestId !== state.musicRequestId) return;
    musicView.querySelector("#music-content").innerHTML = `<div class="error-box">${escapeHtml(error.message)} <button class="section-action" type="button" data-action="music-retry">Try again</button></div>`;
  }
}

async function loadMusicPlaylists(requestId, append, startIndex) {
  try {
    const params = new URLSearchParams({
      IncludeItemTypes: "Playlist",
      MediaTypes: "Audio",
      Recursive: "true",
      Limit: "60",
      StartIndex: String(startIndex),
      SortBy: "SortName",
      SortOrder: "Ascending",
      Fields: "ChildCount,SortName"
    });
    if (state.musicSearch) params.set("SearchTerm", state.musicSearch);
    const response = await api(`/Users/${encodeURIComponent(state.session.userId)}/Items?${params}`);
    if (requestId !== state.musicRequestId) return;
    const items = (response.Items || []).filter((item) => !item.MediaType || item.MediaType === "Audio");
    state.musicPlaylists = append ? [...state.musicPlaylists.filter((playlist) => !items.some((item) => item.Id === playlist.Id)), ...items] : items;
    state.musicPlaylistOptions = [...new Map([...state.musicPlaylistOptions, ...items].map((playlist) => [playlist.Id, playlist])).values()];
    state.musicOffset = startIndex + (response.Items || []).length;
    state.musicTotal = response.TotalRecordCount ?? state.musicOffset;
    const content = musicView.querySelector("#music-content");
    const cards = items.map((item) => musicCard(item, "playlists")).join("");
    if (!append) {
      content.innerHTML = `<form class="music-create-playlist" data-form="music-create-playlist"><label for="music-new-playlist">Create a playlist</label><input id="music-new-playlist" name="name" maxlength="100" required placeholder="Playlist name"><button class="button button-secondary" type="submit">Create playlist</button></form>${cards ? `<p class="music-result-count">${state.musicTotal} playlists</p><div class="music-card-grid">${cards}</div>` : emptyState("No music playlists yet", "Create a playlist to organize tracks from your Jellyfin library.")}`;
    } else {
      content.querySelector(".music-card-grid")?.insertAdjacentHTML("beforeend", cards);
      content.querySelector('[data-action="music-more"]')?.remove();
    }
    if (state.musicOffset < state.musicTotal) {
      content.insertAdjacentHTML("beforeend", `<button class="button button-secondary browse-more" type="button" data-action="music-more">Load more playlists</button>`);
    }
    refreshMusicPlaylistTargets();
    attachImages(content);
  } catch (error) {
    if (requestId !== state.musicRequestId) return;
    musicView.querySelector("#music-content").innerHTML = `<div class="error-box">${escapeHtml(error.message)} <button class="section-action" type="button" data-action="music-retry">Try again</button></div>`;
  }
}

async function loadMusicCollection(item, kind, append = false) {
  if (!state.session) return;
  const requestId = ++state.musicRequestId;
  state.musicMode = kind;
  state.musicCollection = { item, kind };
  const startIndex = append ? state.musicOffset : 0;
  if (!append) {
    state.musicOffset = 0;
    state.musicItems = [];
    musicView.innerHTML = musicShell();
    musicView.querySelectorAll('[role="tab"]').forEach((tab) => tab.setAttribute("aria-selected", "false"));
    const backTab = kind === "artists" ? "artists" : kind === "genres" ? "genres" : kind === "playlists" ? "playlists" : "albums";
    musicView.querySelector("#music-content").innerHTML = `<div class="music-collection-heading"><button class="section-action" type="button" data-action="music-back" data-mode="${backTab}">← Back to ${backTab}</button>${kind === "albums" ? `<button class="button button-primary" type="button" data-action="music-play-album" data-id="${escapeHtml(item.Id)}">${icon("play")} Play album</button>` : kind === "artists" ? `<button class="button button-primary" type="button" data-action="music-play-artist" data-id="${escapeHtml(item.Id)}">${icon("play")} Play artist</button>` : ""}</div><h2 class="music-collection-title">${escapeHtml(item.Name || "Music")}</h2>${kind === "playlists" ? `<form class="music-rename-playlist" data-form="music-rename-playlist" data-id="${escapeHtml(item.Id)}"><label for="music-playlist-name">Playlist name</label><input id="music-playlist-name" name="name" maxlength="100" required value="${escapeHtml(item.Name || "")}"><button class="button button-secondary" type="submit">Rename</button></form>` : ""}<div class="loading-grid" style="margin-top:20px">${"<div class=\"skeleton\"></div>".repeat(5)}</div>`;
  } else {
    const button = musicView.querySelector('[data-action="music-more"]');
    if (button) {
      button.disabled = true;
      button.textContent = "Loading…";
    }
  }
  const childType = kind === "artists" ? "MusicAlbum" : "Audio";
  const params = new URLSearchParams({
    IncludeItemTypes: childType,
    Recursive: "true",
    Limit: "60",
    StartIndex: String(startIndex),
    SortBy: kind === "artists" ? "SortName" : "ParentIndexNumber,IndexNumber,SortName",
    SortOrder: "Ascending",
    Fields: "Overview,Genres,ChildCount,SortName"
  });
  if (kind === "artists" || kind === "albums") params.set("ParentId", item.Id);
  if (kind === "genres") params.set("Genres", item.Name);
  if (state.musicSearch) params.set("SearchTerm", state.musicSearch);
  if (state.musicGenre && kind !== "genres") params.set("Genres", state.musicGenre);
  if (state.musicYear) params.set("Years", state.musicYear);
  try {
    const response = kind === "playlists"
      ? await api(`/Playlists/${encodeURIComponent(item.Id)}/Items?${new URLSearchParams({ UserId: state.session.userId, Limit: "60", StartIndex: String(startIndex), Fields: "Overview,Genres,ChildCount" })}`)
      : await api(`/Users/${encodeURIComponent(state.session.userId)}/Items?${params}`);
    if (requestId !== state.musicRequestId || state.musicCollection?.item.Id !== item.Id) return;
    const items = response.Items || [];
    cacheItems(items);
    state.musicOffset = startIndex + items.length;
    state.musicTotal = response.TotalRecordCount ?? state.musicOffset;
    const content = musicView.querySelector("#music-content");
    content.querySelector(".loading-grid")?.remove();
    const rows = kind === "artists"
      ? items.map((album) => musicCard(album, "albums")).join("")
      : items.map((track, index) => musicTrackRow(track, startIndex + index, kind === "playlists" ? { playlistId: item.Id } : {})).join("");
    if (startIndex) {
      content.querySelector(kind === "artists" ? ".music-card-grid" : ".music-track-list")?.insertAdjacentHTML("beforeend", rows);
      state.musicItems.push(...items);
    } else {
      content.insertAdjacentHTML("beforeend", items.length
        ? `<p class="music-result-count">${state.musicTotal} ${kind === "artists" ? "albums" : "tracks"}</p>${kind === "artists" ? `<div class="music-card-grid">${rows}</div>` : `<div class="music-track-list">${rows}</div>`}`
        : `<p class="music-empty-message">No ${kind === "artists" ? "albums" : "tracks"} found here.</p>`);
      state.musicItems = items;
    }
    content.querySelector('[data-action="music-more"]')?.remove();
    if (state.musicOffset < state.musicTotal) {
      content.insertAdjacentHTML("beforeend", `<button class="button button-secondary browse-more" type="button" data-action="music-more">Load more</button>`);
    }
    attachImages(content);
  } catch (error) {
    if (requestId !== state.musicRequestId) return;
    const content = musicView.querySelector("#music-content");
    content.querySelector(".loading-grid")?.remove();
    if (append) {
      const button = content.querySelector('[data-action="music-more"]');
      if (button) {
        button.disabled = false;
        button.textContent = "Try loading more";
      } else {
        content.insertAdjacentHTML("beforeend", `<div class="episodes-error">${escapeHtml(error.message)} <button class="section-action" type="button" data-action="music-more">Try again</button></div>`);
      }
    } else {
      content.insertAdjacentHTML("beforeend", `<div class="error-box">${escapeHtml(error.message)} <button class="section-action" type="button" data-action="music-retry">Try again</button></div>`);
    }
  }
}

async function loadFullAlbum(album) {
  const allTracks = [];
  let startIndex = 0;
  let total = 0;
  do {
    const params = new URLSearchParams({
      ParentId: album.Id,
      IncludeItemTypes: "Audio",
      Recursive: "true",
      Limit: "100",
      StartIndex: String(startIndex),
      SortBy: "ParentIndexNumber,IndexNumber,SortName",
      SortOrder: "Ascending",
      Fields: "Overview,Genres,ChildCount,SortName"
    });
    const response = await api(`/Users/${encodeURIComponent(state.session.userId)}/Items?${params}`);
    const tracks = response.Items || [];
    if (!tracks.length) break;
    allTracks.push(...tracks);
    startIndex += tracks.length;
    total = response.TotalRecordCount ?? startIndex;
  } while (startIndex < total);
  return allTracks;
}

async function playMusicAlbum(album) {
  const requestId = ++state.audioRequestId;
  try {
    const tracks = await loadFullAlbum(album);
    if (requestId !== state.audioRequestId || !state.session) return;
    await playMusicQueue(tracks);
  } catch (error) {
    if (requestId === state.audioRequestId) showToast(error.message, true);
  }
}

async function playMusicArtist(artist) {
  const requestId = ++state.audioRequestId;
  const tracks = [];
  let startIndex = 0;
  let total = 0;
  try {
    do {
      const params = new URLSearchParams({
        ParentId: artist.Id,
        IncludeItemTypes: "Audio",
        Recursive: "true",
        Limit: "100",
        StartIndex: String(startIndex),
        SortBy: "Album,ParentIndexNumber,IndexNumber,SortName",
        SortOrder: "Ascending",
        Fields: "Overview,Genres,ChildCount,SortName"
      });
      const response = await api(`/Users/${encodeURIComponent(state.session.userId)}/Items?${params}`);
      if (requestId !== state.audioRequestId || !state.session) return;
      const page = response.Items || [];
      if (!page.length) break;
      tracks.push(...page);
      startIndex += page.length;
      total = response.TotalRecordCount ?? startIndex;
    } while (startIndex < total);
    await playMusicQueue(tracks);
  } catch (error) {
    if (requestId === state.audioRequestId) showToast(error.message, true);
  }
}

async function playMusicQueue(items, selectedId = items[0]?.Id) {
  const queue = items.filter((item) => item?.Id && item.Type === "Audio");
  const index = queue.findIndex((item) => item.Id === selectedId);
  if (!queue.length || index < 0) {
    showToast("No playable tracks were found.", true);
    return;
  }
  if (state.musicQueue.length && state.musicIndex >= 0) reportMusicPlayback("Stopped");
  state.musicPlayback = null;
  state.musicQueue = queue;
  state.musicIndex = index;
  if (state.musicShuffle) shuffleUpcomingMusicQueue();
  state.musicExpanded = false;
  updateMusicDock();
  await playMusicAt(index);
}

function shuffleUpcomingMusicQueue() {
  if (state.musicIndex < 0) return;
  const upcoming = state.musicQueue.slice(state.musicIndex + 1);
  for (let index = upcoming.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [upcoming[index], upcoming[swapIndex]] = [upcoming[swapIndex], upcoming[index]];
  }
  state.musicQueue.splice(state.musicIndex + 1, upcoming.length, ...upcoming);
}

function addMusicToQueue(item, playNext = false) {
  if (!item || item.Type !== "Audio") {
    showToast("This item is not a playable track.", true);
    return;
  }
  if (playNext && state.musicIndex >= 0) state.musicQueue.splice(state.musicIndex + 1, 0, item);
  else state.musicQueue.push(item);
  if (state.musicIndex < 0) {
    state.musicIndex = 0;
    updateMusicDock();
    playMusicAt(0);
  } else {
    renderMusicQueue();
    showToast(playNext ? "Track added to play next." : "Track added to queue.");
  }
}

function playNextMusicTrack() {
  if (state.musicIndex + 1 < state.musicQueue.length) {
    playMusicAt(state.musicIndex + 1);
  } else if (state.musicRepeat === "all" && state.musicQueue.length) {
    playMusicAt(0);
  }
}

function removeMusicQueueItem(index) {
  if (index < 0 || index >= state.musicQueue.length) return;
  const removingCurrent = index === state.musicIndex;
  if (removingCurrent) {
    reportMusicPlayback("Stopped");
    state.audioRequestId += 1;
    state.musicIndex = -1;
    state.musicPlayback = null;
    audioPlayer.pause();
    audioPlayer.removeAttribute("src");
    audioPlayer.load();
  }
  state.musicQueue.splice(index, 1);
  if (!state.musicQueue.length) {
    state.audioRequestId += 1;
    audioPlayer.pause();
    audioPlayer.removeAttribute("src");
    audioPlayer.load();
    state.musicIndex = -1;
    state.musicPlayback = null;
    updateMusicDock();
    return;
  }
  if (removingCurrent) {
    playMusicAt(Math.min(index, state.musicQueue.length - 1));
  } else if (index < state.musicIndex) {
    state.musicIndex -= 1;
  }
  renderMusicQueue();
}

function moveMusicQueueItem(index, direction) {
  const destination = index + direction;
  if (index < 0 || destination < 0 || destination >= state.musicQueue.length) return;
  [state.musicQueue[index], state.musicQueue[destination]] = [state.musicQueue[destination], state.musicQueue[index]];
  if (state.musicIndex === index) state.musicIndex = destination;
  else if (state.musicIndex === destination) state.musicIndex = index;
  renderMusicQueue();
}

async function playMusicAt(index) {
  const item = state.musicQueue[index];
  if (!item || !state.session) return;
  const requestId = ++state.audioRequestId;
  if (state.musicPlayback) reportMusicPlayback("Stopped");
  state.musicIndex = index;
  state.musicPlayback = null;
  audioPlayer.pause();
  audioPlayer.removeAttribute("src");
  audioPlayer.load();
  audioSeek.value = "0";
  audioSeek.disabled = true;
  document.querySelector("#audio-current-time").textContent = "0:00";
  document.querySelector("#audio-duration").textContent = "0:00";
  state.lastMusicProgressUpdate = 0;
  updateMusicDock();
  try {
    const result = await api(`/Items/${encodeURIComponent(item.Id)}/PlaybackInfo?UserId=${encodeURIComponent(state.session.userId)}&DeviceId=${encodeURIComponent(getDeviceId())}`, {
      method: "POST",
      body: JSON.stringify({ EnableDirectPlay: true, EnableDirectStream: true, EnableTranscoding: true })
    });
    if (requestId !== state.audioRequestId) return;
    const source = result.MediaSources?.[0];
    if (!source?.Id) throw new Error("Jellyfin did not provide a playable audio source for this track.");
    state.musicPlayback = {
      mediaSourceId: source.Id,
      playSessionId: result.PlaySessionId || ""
    };
    const params = new URLSearchParams({
      Static: "true",
      MediaSourceId: source.Id,
      DeviceId: getDeviceId(),
      api_key: state.session.accessToken
    });
    if (result.PlaySessionId) params.set("PlaySessionId", result.PlaySessionId);
    audioPlayer.src = `${state.session.server}/Audio/${encodeURIComponent(item.Id)}/stream?${params}`;
    audioPlayer.referrerPolicy = "no-referrer";
    audioPlayer.load();
    try {
      await audioPlayer.play();
    } catch (error) {
      if (error.name === "NotAllowedError") showToast("Press play in the music player to start this track.");
      else throw error;
    }
  } catch (error) {
    if (requestId !== state.audioRequestId) return;
    document.querySelector("#audio-status").textContent = error.message;
    showToast(error.message, true);
  }
}

function updateMusicDock() {
  const item = state.musicQueue[state.musicIndex];
  audioDock.classList.toggle("hidden", !item);
  document.body.classList.toggle("has-audio", Boolean(item));
  if (!item) {
    document.querySelector("#audio-artwork").innerHTML = icon("music");
    document.querySelector("#audio-track-title").textContent = "Nothing playing";
    document.querySelector("#audio-track-artist").textContent = "";
    document.querySelector("#audio-status").textContent = "";
    renderMusicQueue();
    return;
  }
  document.querySelector("#audio-track-title").textContent = item.Name || "Untitled track";
  document.querySelector("#audio-track-artist").textContent = item.AlbumArtist || item.ArtistItems?.map((artist) => artist.Name).join(", ") || item.Album || "Unknown artist";
  document.querySelector("#audio-status").textContent = "";
  const artwork = document.querySelector("#audio-artwork");
  artwork.innerHTML = `${icon("music")}<img data-item-id="${escapeHtml(item.Id)}" alt="">`;
  loadImage(item).then((url) => {
    const image = artwork.querySelector("img");
    if (url && image && state.musicQueue[state.musicIndex]?.Id === item.Id) {
      image.src = url;
      image.classList.add("loaded");
    }
  }).catch((error) => console.warn("Could not load music artwork.", error));
  updateAudioControls();
  renderMusicQueue();
}

function updateAudioControls() {
  const playing = !audioPlayer.paused && !audioPlayer.ended;
  const button = document.querySelector('[data-action="audio-toggle"]');
  button.innerHTML = icon(playing ? "pause" : "play");
  button.setAttribute("aria-label", playing ? "Pause" : "Play");
  button.title = playing ? "Pause" : "Play";
  const shuffle = document.querySelector('[data-action="audio-shuffle"]');
  shuffle.setAttribute("aria-pressed", String(state.musicShuffle));
  shuffle.setAttribute("aria-label", state.musicShuffle ? "Shuffle on" : "Shuffle off");
  shuffle.title = state.musicShuffle ? "Shuffle on" : "Shuffle off";
  const repeat = document.querySelector('[data-action="audio-repeat"]');
  const repeatLabel = state.musicRepeat === "one" ? "Repeat track" : state.musicRepeat === "all" ? "Repeat queue" : "Repeat off";
  repeat.setAttribute("aria-pressed", String(state.musicRepeat !== "off"));
  repeat.setAttribute("aria-label", repeatLabel);
  repeat.title = repeatLabel;
  audioVolume.value = String(state.musicVolume);
  if (playing && state.musicPlayback && !state.musicPlayback.started) {
    state.musicPlayback.started = true;
    reportMusicPlayback("Start");
  }
}

function renderMusicQueue() {
  const queue = document.querySelector("#music-queue");
  const list = document.querySelector("#music-queue-list");
  queue.classList.toggle("hidden", !state.musicExpanded || !state.musicQueue.length);
  list.innerHTML = state.musicQueue.map((item, index) => `<li class="music-queue-item"><button class="music-queue-play" type="button" data-action="music-queue-play" data-index="${index}" aria-current="${index === state.musicIndex ? "true" : "false"}"><span>${escapeHtml(item.Name || "Untitled track")}</span><small>${escapeHtml(item.AlbumArtist || item.Album || "Unknown artist")}</small></button><span class="music-queue-actions"><button type="button" class="music-inline-action" data-action="music-queue-up" data-index="${index}" aria-label="Move ${escapeHtml(item.Name || "track")} up" ${index === 0 ? "disabled" : ""}>↑</button><button type="button" class="music-inline-action" data-action="music-queue-down" data-index="${index}" aria-label="Move ${escapeHtml(item.Name || "track")} down" ${index === state.musicQueue.length - 1 ? "disabled" : ""}>↓</button><button type="button" class="music-inline-action" data-action="music-queue-remove" data-index="${index}" aria-label="Remove ${escapeHtml(item.Name || "track")} from queue">${icon("close")}</button></span></li>`).join("");
  const queueButton = document.querySelector('[data-action="queue-toggle"]');
  queueButton.setAttribute("aria-expanded", String(state.musicExpanded));
  queueButton.setAttribute("aria-label", state.musicExpanded ? "Hide queue" : "Show queue");
}

async function reportMusicPlayback(endpoint, isPaused = false) {
  const item = state.musicQueue[state.musicIndex];
  if (!item || !state.session) return;
  try {
    await api(`/Sessions/Playing/${endpoint}`, {
      method: "POST",
      body: JSON.stringify({
        ItemId: item.Id,
        MediaSourceId: state.musicPlayback?.mediaSourceId,
        PlaySessionId: state.musicPlayback?.playSessionId,
        PositionTicks: Math.floor((audioPlayer.currentTime || 0) * 10000000),
        IsPaused: isPaused,
        PlayMethod: "DirectPlay"
      })
    });
  } catch (error) {
    console.warn("Jellyfin music playback progress could not be updated.", error);
  }
}

function stopMusic() {
  if (state.musicQueue.length && state.musicIndex >= 0) reportMusicPlayback("Stopped");
  state.audioRequestId += 1;
  state.musicPlayback = null;
  audioPlayer.pause();
  audioPlayer.removeAttribute("src");
  audioPlayer.load();
  state.musicQueue = [];
  state.musicIndex = -1;
  state.musicPlayback = null;
  state.musicExpanded = false;
  audioSeek.value = "0";
  document.querySelector("#audio-current-time").textContent = "0:00";
  document.querySelector("#audio-duration").textContent = "0:00";
  audioSeek.disabled = true;
  updateMusicDock();
}

function formatClock(seconds) {
  if (!Number.isFinite(seconds)) return "0:00";
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;
}

async function performSearch(term, append = false) {
  const sequence = ++state.searchSequence;
  const query = term.trim();
  if (!query) {
    searchView.classList.add("hidden");
    if (state.route === "search") routeTo("home");
    return;
  }
  state.route = "search";
  state.searchOffset = append ? state.searchOffset : 0;
  document.querySelectorAll(".nav-item").forEach((item) => {
    item.classList.remove("active");
    item.removeAttribute("aria-current");
  });
  homeView.classList.add("hidden");
  browseView.classList.add("hidden");
  musicView.classList.add("hidden");
  searchView.classList.remove("hidden");
  const startIndex = append ? state.searchOffset : 0;
  const loadMore = searchView.querySelector('[data-action="search-more"]');
  if (append && loadMore) {
    loadMore.disabled = true;
    loadMore.textContent = "Loading…";
  } else if (!append) {
    searchView.innerHTML = `${browseHeader("search")}<div class="loading-grid" style="margin-top:25px">${"<div class=\"skeleton\"></div>".repeat(8)}</div>`;
  }
  if (!state.session) {
    searchView.innerHTML = `${browseHeader("search")}<p class="browse-intro">Connect your Jellyfin server to search your own library.</p><div class="demo-banner">${icon("spark")} Preview only <button data-action="connect">Connect now</button></div>`;
    return;
  }
  try {
    const params = new URLSearchParams({
      SearchTerm: query,
      IncludeItemTypes: "Movie,Series,Episode",
      Recursive: "true",
      Limit: "60",
      StartIndex: String(startIndex),
      Fields: "Overview,Genres,RunTimeTicks,UserData,ImageTags,BackdropImageTags"
    });
    const response = await api(`/Users/${encodeURIComponent(state.session.userId)}/Items?${params}`);
    if (sequence !== state.searchSequence) return;
    const items = response.Items || [];
    state.searchOffset = startIndex + items.length;
    const total = response.TotalRecordCount ?? state.searchOffset;
    cacheItems(items);
    if (append) {
      const grid = searchView.querySelector(".browse-grid");
      if (grid) grid.insertAdjacentHTML("beforeend", items.map((item) => mediaCard(item, { portrait: true })).join(""));
      const count = searchView.querySelector(".result-count");
      if (count) count.textContent = String(total);
    } else {
      searchView.innerHTML = `${browseHeader("search", total)}<p class="browse-intro">Results for “${escapeHtml(query)}”</p>${items.length ? `<div class="browse-grid" style="margin-top:24px">${items.map((item) => mediaCard(item, { portrait: true })).join("")}</div>` : emptyState("No matches in your library", "Try another title, actor, or keyword.")}`;
    }
    searchView.querySelector('[data-action="search-more"]')?.remove();
    if (state.searchOffset < total) {
      searchView.insertAdjacentHTML("beforeend", `<button class="button button-secondary browse-more" type="button" data-action="search-more">Load more results</button>`);
    }
    attachImages(searchView);
  } catch (error) {
    if (sequence !== state.searchSequence) return;
    if (append) {
      const button = searchView.querySelector('[data-action="search-more"]');
      if (button) {
        button.disabled = false;
        button.textContent = "Try loading more";
      }
      showToast(error.message, true);
      return;
    }
    searchView.innerHTML = `${browseHeader("search")}<div class="error-box">${escapeHtml(error.message)}</div>`;
  }
}

async function openDetails(id, isDemo = false) {
  const requestId = ++state.detailRequestId;
  if (isDemo || id.startsWith("demo-")) {
    const item = demoItems.find((entry) => entry.Id === id);
    if (item) renderDetails(item, true);
    return;
  }
  if (!state.session) return;
  try {
    const details = await api(`/Users/${encodeURIComponent(state.session.userId)}/Items/${encodeURIComponent(id)}?Fields=Overview,Genres,People,MediaSources,ProviderIds,UserData,ImageTags,BackdropImageTags,RunTimeTicks`);
    if (requestId !== state.detailRequestId) return;
    itemCache.set(details.Id, details);
    renderDetails(details, false);
    loadImage(details, details.BackdropImageTags?.length ? "Backdrop" : "Primary").then((url) => {
      const image = detailModal.querySelector(".detail-backdrop img");
      if (url && image) image.src = url;
    }).catch((error) => console.warn("Could not load details artwork.", error));
  } catch (error) {
    if (requestId !== state.detailRequestId) return;
    showToast(error.message, true);
  }
}

function renderDetails(item, isDemo) {
  const type = escapeHtml(mediaType(item));
  const year = escapeHtml(formatYear(item));
  const genres = item.Genres?.slice(0, 3).map(escapeHtml).join(" · ");
  const summary = escapeHtml(item.Overview || item.Description || "No description is available for this title.");
  const backdrop = isDemo ? demoArtwork(item, true) : "";
  const id = escapeHtml(item.Id);
  const favorite = Boolean(item.UserData?.IsFavorite);
  const isSeries = item.Type === "Series";
  const episodesSection = isSeries && !isDemo ? `<section class="episodes-section" data-series-id="${id}"><div class="episodes-heading"><div><h3>Episodes</h3><p>Every chapter, ready when you are.</p></div><label class="season-control"><span>SEASON</span><select class="season-select" aria-label="Select season" disabled><option>Loading seasons…</option></select></label></div><div class="episode-list" aria-live="polite"><div class="episode-loading"><span></span><span></span><span></span></div></div></section>` : "";
  document.querySelector("#detail-content").innerHTML = `<div class="detail-backdrop">${isDemo ? `<img src="${backdrop}" alt="">` : `<img data-item-id="${id}" data-image-type="${item.BackdropImageTags?.length ? "Backdrop" : "Primary"}" alt="">`}</div><div class="detail-body"><p class="detail-kicker">${type || "FROM YOUR LIBRARY"}</p><h2>${escapeHtml(item.Name || "Untitled")}</h2><div class="detail-meta">${year ? `<span>${year}</span>` : ""}${item.CommunityRating ? `<span class="rating">★ ${escapeHtml(Number(item.CommunityRating).toFixed(1))}</span>` : ""}${item.RunTimeTicks ? `<span>${escapeHtml(formatDuration(item.RunTimeTicks))}</span>` : ""}${item.OfficialRating ? `<span class="meta-badge">${escapeHtml(item.OfficialRating)}</span>` : ""}${genres ? `<span>${genres}</span>` : ""}</div><p class="detail-description">${summary}</p><div class="detail-actions">${isDemo ? `<button class="button button-primary" type="button" data-action="connect">${icon("server")} Connect to watch</button>` : `<button class="button button-primary" type="button" data-action="${isSeries ? "play-series" : "play"}" data-id="${id}">${icon("play")} ${isSeries ? "Play next episode" : "Play"}</button><button class="button button-secondary" type="button" data-action="favorite" data-id="${id}" data-favorite="${favorite}">${icon(favorite ? "check" : "plus")} ${favorite ? "In my list" : "Add to my list"}</button>`}</div>${episodesSection}</div>`;
  detailModal.showModal();
  if (isSeries && !isDemo) loadSeriesSeasons(item.Id, state.detailRequestId);
  if (isDemo) return;
}

async function loadSeriesSeasons(seriesId, detailRequestId) {
  const episodesSection = detailModal.querySelector(".episodes-section");
  if (!episodesSection || episodesSection.dataset.seriesId !== seriesId) return;
  const select = episodesSection.querySelector(".season-select");
  const episodeList = episodesSection.querySelector(".episode-list");
  try {
    const params = new URLSearchParams({
      UserId: state.session.userId,
      Fields: "Overview,UserData,ImageTags,BackdropImageTags",
      SortBy: "IndexNumber",
      SortOrder: "Ascending"
    });
    const response = await api(`/Shows/${encodeURIComponent(seriesId)}/Seasons?${params}`);
    if (detailRequestId !== state.detailRequestId || !episodesSection.isConnected) return;
    const seasons = response.Items || [];
    cacheItems(seasons);
    if (!seasons.length) {
      select.disabled = true;
      episodeList.innerHTML = `<p class="episodes-message">No seasons are available for this series.</p>`;
      return;
    }
    select.innerHTML = seasons.map((season, index) => {
      const label = season.IndexNumber === 0 || /specials/i.test(season.Name || "")
        ? "Specials"
        : season.Name || `Season ${season.IndexNumber ?? index + 1}`;
      return `<option value="${escapeHtml(season.Id)}">${escapeHtml(label)}</option>`;
    }).join("");
    select.disabled = false;
    await loadSeasonEpisodes(seriesId, seasons[0].Id, detailRequestId);
  } catch (error) {
    if (detailRequestId !== state.detailRequestId || !episodesSection.isConnected) return;
    select.disabled = true;
    episodeList.innerHTML = `<div class="episodes-error">${escapeHtml(error.message)} <button class="section-action" type="button" data-action="retry-seasons" data-id="${escapeHtml(seriesId)}">Try again</button></div>`;
  }
}

async function loadSeasonEpisodes(seriesId, seasonId, detailRequestId) {
  const requestId = ++state.episodeRequestId;
  const episodesSection = detailModal.querySelector(".episodes-section");
  if (!episodesSection || episodesSection.dataset.seriesId !== seriesId) return;
  const episodeList = episodesSection.querySelector(".episode-list");
  episodeList.innerHTML = `<div class="episode-loading"><span></span><span></span><span></span></div>`;
  try {
    const params = new URLSearchParams({
      UserId: state.session.userId,
      SeasonId: seasonId,
      Fields: "Overview,UserData,ImageTags,BackdropImageTags,RunTimeTicks",
      SortBy: "IndexNumber",
      SortOrder: "Ascending",
      Limit: "100"
    });
    const response = await api(`/Shows/${encodeURIComponent(seriesId)}/Episodes?${params}`);
    if (requestId !== state.episodeRequestId || detailRequestId !== state.detailRequestId || !episodesSection.isConnected) return;
    const episodes = response.Items || [];
    cacheItems(episodes);
    episodeList.innerHTML = episodes.length
      ? `<p class="episode-count">${episodes.length} ${episodes.length === 1 ? "episode" : "episodes"}</p>${episodes.map(episodeRow).join("")}`
      : `<p class="episodes-message">No episodes found in this season.</p>`;
    attachImages(episodeList);
  } catch (error) {
    if (requestId !== state.episodeRequestId || detailRequestId !== state.detailRequestId || !episodesSection.isConnected) return;
    episodeList.innerHTML = `<div class="episodes-error">${escapeHtml(error.message)} <button class="section-action" type="button" data-action="retry-episodes" data-id="${escapeHtml(seriesId)}" data-season-id="${escapeHtml(seasonId)}">Try again</button></div>`;
  }
}

function episodeRow(episode) {
  const id = escapeHtml(episode.Id);
  const number = episode.ParentIndexNumber != null && episode.IndexNumber != null
    ? `S${String(episode.ParentIndexNumber).padStart(2, "0")}:E${String(episode.IndexNumber).padStart(2, "0")}`
    : episode.IndexNumber != null ? `EPISODE ${episode.IndexNumber}` : "EPISODE";
  const title = escapeHtml(episode.Name || "Untitled episode");
  const overview = escapeHtml(episode.Overview || "No episode description available.");
  const progress = episode.UserData?.PlaybackPositionTicks && episode.RunTimeTicks
    ? Math.min(100, Math.round(episode.UserData.PlaybackPositionTicks / episode.RunTimeTicks * 100))
    : 0;
  const watched = Boolean(episode.UserData?.Played);
  return `<article class="episode-row" data-id="${id}"><div class="episode-artwork"><img data-item-id="${id}" alt="" loading="lazy"><span class="episode-artwork-fallback">${icon("play")}</span>${progress ? `<span class="episode-progress"><span style="width:${progress}%"></span></span>` : ""}</div><div class="episode-copy"><p class="episode-number">${number}${watched ? `<span class="watched-mark">${icon("check")} WATCHED</span>` : ""}</p><h4>${title}</h4><p class="episode-overview">${overview}</p></div><div class="episode-runtime">${escapeHtml(formatDuration(episode.RunTimeTicks))}</div><button class="episode-play" type="button" data-action="play" data-id="${id}" aria-label="Play ${title}">${icon("play")}</button></article>`;
}

function playNextEpisode(seriesId) {
  const section = detailModal.querySelector(`.episodes-section[data-series-id="${CSS.escape(seriesId)}"]`);
  const episodeRows = [...(section?.querySelectorAll(".episode-row") || [])];
  const next = episodeRows.find((row) => !itemCache.get(row.dataset.id)?.UserData?.Played) || episodeRows[0];
  if (!next) {
    showToast("Select a season and wait for its episodes to load first.");
    return;
  }
  startPlayback(next.dataset.id);
}

async function toggleFavorite(id, wasFavorite) {
  const method = wasFavorite ? "DELETE" : "POST";
  try {
    await api(`/Users/${encodeURIComponent(state.session.userId)}/FavoriteItems/${encodeURIComponent(id)}`, { method });
    const item = itemCache.get(id);
    if (item) {
      item.UserData = { ...item.UserData, IsFavorite: !wasFavorite };
      itemCache.set(id, item);
    }
    renderDetails(item || { Id: id, Name: "Title" }, false);
    if (item?.Type === "Series") loadSeriesSeasons(id, state.detailRequestId);
    showToast(wasFavorite ? "Removed from your list." : "Added to your list.");
    if (state.route === "favorites") loadBrowse("favorites");
  } catch (error) {
    showToast(error.message, true);
  }
}

async function toggleMusicFavorite(id, wasFavorite) {
  const item = itemCache.get(id);
  if (!item || !state.session) return;
  try {
    await api(`/Users/${encodeURIComponent(state.session.userId)}/FavoriteItems/${encodeURIComponent(id)}`, {
      method: wasFavorite ? "DELETE" : "POST"
    });
    item.UserData = { ...item.UserData, IsFavorite: !wasFavorite };
    itemCache.set(id, item);
    state.musicItems = state.musicItems.map((entry) => entry.Id === id ? item : entry);
    if (state.musicMode === "favorites") {
      loadMusicCatalog("favorites");
    } else {
      const button = musicView.querySelector(`[data-action="music-favorite"][data-id="${CSS.escape(id)}"]`);
      if (button) {
        button.dataset.favorite = String(!wasFavorite);
        button.classList.toggle("is-favorite", !wasFavorite);
        button.setAttribute("aria-label", !wasFavorite ? "Remove from music favorites" : "Add to music favorites");
        button.title = !wasFavorite ? "Remove favorite" : "Add favorite";
      }
    }
    showToast(wasFavorite ? "Removed from music favorites." : "Added to music favorites.");
  } catch (error) {
    showToast(error.message, true);
  }
}

async function createMusicPlaylist(name) {
  const playlistName = name.trim();
  if (!playlistName || !state.session) return;
  try {
    await api("/Playlists", {
      method: "POST",
      body: JSON.stringify({ Name: playlistName, Ids: [], UserId: state.session.userId, MediaType: "Audio" })
    });
    state.musicFacetsLoaded = false;
    showToast(`Created playlist “${playlistName}”.`);
    loadMusicCatalog("playlists");
  } catch (error) {
    showToast(error.message, true);
  }
}

async function renameMusicPlaylist(playlistId, name) {
  const playlistName = name.trim();
  if (!playlistName || !state.session) return;
  try {
    await api(`/Playlists/${encodeURIComponent(playlistId)}`, {
      method: "POST",
      body: JSON.stringify({ Name: playlistName })
    });
    if (state.musicCollection?.item.Id === playlistId) state.musicCollection.item.Name = playlistName;
    showToast("Playlist renamed.");
    if (state.musicCollection?.item.Id === playlistId) loadMusicCollection(state.musicCollection.item, "playlists");
    else loadMusicCatalog("playlists");
  } catch (error) {
    showToast(error.message, true);
  }
}

async function addMusicTrackToPlaylist(trackId) {
  const target = musicView.querySelector("#music-playlist-target")?.value;
  if (!target) {
    showToast("Choose a playlist before adding this track.", true);
    return;
  }
  try {
    const params = new URLSearchParams({ Ids: trackId, UserId: state.session.userId });
    await api(`/Playlists/${encodeURIComponent(target)}/Items?${params}`, { method: "POST" });
    showToast("Track added to playlist.");
    if (state.musicCollection?.kind === "playlists" && state.musicCollection.item.Id === target) {
      loadMusicCollection(state.musicCollection.item, "playlists");
    }
  } catch (error) {
    showToast(error.message, true);
  }
}

async function removeMusicTrackFromPlaylist(playlistId, trackId) {
  try {
    const playlist = await api(`/Playlists/${encodeURIComponent(playlistId)}`);
    const ids = [...(playlist.ItemIds || [])];
    const itemIndex = ids.indexOf(trackId);
    if (itemIndex < 0) throw new Error("This track is no longer in the playlist. Refresh and try again.");
    ids.splice(itemIndex, 1);
    await api(`/Playlists/${encodeURIComponent(playlistId)}`, {
      method: "POST",
      body: JSON.stringify({ Ids: ids })
    });
    showToast("Track removed from playlist.");
    if (state.musicCollection?.kind === "playlists" && state.musicCollection.item.Id === playlistId) {
      loadMusicCollection(state.musicCollection.item, "playlists");
    }
  } catch (error) {
    showToast(error.message, true);
  }
}

async function startPlayback(id) {
  const item = itemCache.get(id);
  if (!item || !state.session) return;
  try {
    const result = await api(`/Items/${encodeURIComponent(id)}/PlaybackInfo?UserId=${encodeURIComponent(state.session.userId)}&DeviceId=${encodeURIComponent(getDeviceId())}`, {
      method: "POST",
      body: JSON.stringify({ EnableDirectPlay: true, EnableDirectStream: true, EnableTranscoding: true })
    });
    const source = result.MediaSources?.[0];
    if (!source) throw new Error("Jellyfin did not provide a playable media source.");
    state.currentItem = item;
    state.currentPlayback = {
      mediaSourceId: source.Id,
      playSessionId: result.PlaySessionId || "",
      transcodeAttempted: false
    };
    state.lastProgressUpdate = 0;
    videoPlayer.src = videoStreamUrl(id, source.Id, false);
    videoPlayer.referrerPolicy = "no-referrer";
    document.querySelector("#player-caption").textContent = item.Name || "Now playing";
    detailModal.close();
    playerModal.showModal();
    try {
      await videoPlayer.play();
    } catch (error) {
      if (error.name === "NotAllowedError") showToast("Press play in the player controls to start.");
      else throw error;
    }
  } catch (error) {
    showToast(error.message, true);
  }
}

function videoStreamUrl(itemId, mediaSourceId, transcode) {
  const params = new URLSearchParams({
    Static: transcode ? "false" : "true",
    MediaSourceId: mediaSourceId,
    DeviceId: getDeviceId(),
    api_key: state.session.accessToken
  });
  if (state.currentPlayback?.playSessionId) params.set("PlaySessionId", state.currentPlayback.playSessionId);
  if (transcode) {
    params.set("VideoCodec", "h264");
    params.set("AudioCodec", "aac");
    params.set("Container", "mp4");
    params.set("MaxStreamingBitrate", "12000000");
  } else if (state.currentItem?.UserData?.PlaybackPositionTicks) {
    params.set("StartTimeTicks", String(state.currentItem.UserData.PlaybackPositionTicks));
  }
  return `${state.session.server}/Videos/${encodeURIComponent(itemId)}/stream?${params}`;
}

async function reportPlayback(endpoint, isPaused = false) {
  if (!state.currentItem || !state.currentPlayback || !state.session) return;
  const body = {
    ItemId: state.currentItem.Id,
    MediaSourceId: state.currentPlayback.mediaSourceId,
    PlaySessionId: state.currentPlayback.playSessionId,
    PositionTicks: Math.floor(videoPlayer.currentTime * 10000000),
    IsPaused: isPaused,
    PlayMethod: state.currentPlayback.transcodeAttempted ? "Transcode" : "DirectPlay"
  };
  try {
    await api(`/Sessions/Playing/${endpoint}`, { method: "POST", body: JSON.stringify(body) });
  } catch (error) {
    console.warn("Jellyfin playback progress could not be updated.", error);
  }
}

function closePlayer() {
  if (!playerModal.open) return;
  videoPlayer.pause();
  reportPlayback("Stopped");
  videoPlayer.removeAttribute("src");
  videoPlayer.load();
  playerModal.close();
  state.currentItem = null;
  state.currentPlayback = null;
}

function showToast(message, isError = false) {
  const toast = document.createElement("div");
  toast.className = `toast${isError ? " error" : ""}`;
  toast.textContent = message;
  document.querySelector("#toast-region").append(toast);
  window.setTimeout(() => toast.remove(), 4800);
}

function openConnect() {
  connectError.classList.add("hidden");
  connectError.textContent = "";
  document.querySelector("#disconnect-button").classList.toggle("hidden", !state.session);
  if (state.session) {
    const currentUrl = document.querySelector("#server-url");
    currentUrl.value = state.session.server;
    document.querySelector("#username").value = "";
    document.querySelector("#password").value = "";
  }
  connectModal.showModal();
}

async function connect(event) {
  event.preventDefault();
  const submit = connectForm.querySelector('button[type="submit"]');
  const submitText = submit.querySelector("span");
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 20000);
  connectError.classList.add("hidden");
  submit.disabled = true;
  submitText.textContent = "Connecting…";
  try {
    const formData = new FormData(connectForm);
    const server = normalizeServerUrl(formData.get("server"));
    const username = formData.get("username").trim();
    const password = formData.get("password");
    const response = await fetch(`${server}/Users/AuthenticateByName`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: authHeader(null)
      },
      signal: controller.signal,
      body: JSON.stringify({ Username: username, Pw: password })
    });
    if (!response.ok) {
      const message = response.status === 401 ? "That username or password was not accepted." :
        response.status === 404 ? "That address does not look like a Jellyfin server. Check the URL and try again." :
        `Jellyfin returned ${response.status} ${response.statusText}.`;
      throw new Error(message);
    }
    const result = await response.json();
    if (!result.AccessToken || !result.User?.Id) throw new Error("The server response did not include a valid user session.");
    state.session = {
      server,
      accessToken: result.AccessToken,
      userId: result.User.Id,
      username: result.User.Name || username
    };
    state.demo = false;
    saveSession(state.session, document.querySelector("#remember-device").checked);
    connectModal.close();
    updateProfile();
    routeTo("home");
    showToast(`Welcome, ${state.session.username}. Your library is in orbit.`);
  } catch (error) {
    const message = error.name === "TypeError" ?
      "Could not connect. Check the server address and make sure its CORS settings allow this website." :
      error.name === "AbortError" ? "The server took too long to respond." : error.message;
    connectError.textContent = message;
    connectError.classList.remove("hidden");
  } finally {
    window.clearTimeout(timeout);
    submit.disabled = false;
    submitText.textContent = "Connect to Jellyfin";
  }
}

function updateProfile() {
  const connected = Boolean(state.session);
  document.body.classList.toggle("public-landing", !connected);
  document.querySelector("#connection-dot").classList.toggle("online", connected);
  document.querySelector("#server-button-title").textContent = connected ? "Connected" : "Connect server";
  document.querySelector("#server-button-subtitle").textContent = connected ? state.session.server.replace(/^https?:\/\//, "") : "Bring your library home";
  document.querySelector("#profile-name").textContent = connected ? state.session.username : "Guest";
  document.querySelector("#profile-avatar").textContent = connected ? (state.session.username[0] || "N").toUpperCase() : "N";
}

function disconnect() {
  connectModal.close();
  stopMusic();
  clearSession();
  itemCache.clear();
  updateProfile();
  routeTo("home");
  showToast("Disconnected from your Jellyfin server.");
}

document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-action], [data-route], [data-filter]");
  if (!button) return;
  if (button.dataset.route && !button.dataset.action) {
    routeTo(button.dataset.route);
    return;
  }
  if (button.dataset.filter) {
    document.querySelectorAll(".filter-chip").forEach((chip) => chip.classList.toggle("active", chip === button));
    const cards = [...browseView.querySelectorAll(".media-card")];
    for (const card of cards) {
      const item = itemCache.get(card.dataset.id);
      const show = button.dataset.filter === "all" ||
        (button.dataset.filter === "unplayed" && !item?.UserData?.Played) ||
        (button.dataset.filter === "favorites" && item?.UserData?.IsFavorite);
      card.classList.toggle("hidden", !show);
    }
    return;
  }
  switch (button.dataset.action) {
    case "connect": openConnect(); break;
    case "close-modal": connectModal.close(); break;
    case "close-detail":
      state.detailRequestId += 1;
      detailModal.close();
      break;
    case "close-player": closePlayer(); break;
    case "details": openDetails(button.dataset.id, button.dataset.demo === "true"); break;
    case "browse-more": loadBrowse(button.dataset.route || state.route, true); break;
    case "search-more": performSearch(searchInput.value, true); break;
    case "music-mode": loadMusicCatalog(button.dataset.mode); break;
    case "music-open": {
      const item = itemCache.get(button.dataset.id);
      if (item) loadMusicCollection(item, button.dataset.kind);
      break;
    }
    case "music-back": loadMusicCatalog(button.dataset.mode || (state.musicCollection?.kind === "artists" ? "artists" : "albums")); break;
    case "music-more":
      if (state.musicCollection) loadMusicCollection(state.musicCollection.item, state.musicCollection.kind, true);
      else loadMusicCatalog(state.musicMode, true);
      break;
    case "music-retry":
      if (state.musicCollection) loadMusicCollection(state.musicCollection.item, state.musicCollection.kind);
      else loadMusicCatalog(state.musicMode);
      break;
    case "music-play-from-list": playMusicQueue(state.musicItems, button.dataset.id); break;
    case "music-queue-add": {
      const item = itemCache.get(button.dataset.id);
      if (item) addMusicToQueue(item);
      break;
    }
    case "music-play-next": {
      const item = itemCache.get(button.dataset.id);
      if (item) addMusicToQueue(item, true);
      break;
    }
    case "music-favorite": toggleMusicFavorite(button.dataset.id, button.dataset.favorite === "true"); break;
    case "music-add-playlist": addMusicTrackToPlaylist(button.dataset.id); break;
    case "music-playlist-remove": removeMusicTrackFromPlaylist(button.dataset.playlistId, button.dataset.id); break;
    case "music-play-album": {
      const album = itemCache.get(button.dataset.id);
      if (album) playMusicAlbum(album);
      break;
    }
    case "music-play-artist": {
      const artist = itemCache.get(button.dataset.id);
      if (artist) playMusicArtist(artist);
      break;
    }
    case "music-queue-play": playMusicAt(Number(button.dataset.index)); break;
    case "music-queue-up": moveMusicQueueItem(Number(button.dataset.index), -1); break;
    case "music-queue-down": moveMusicQueueItem(Number(button.dataset.index), 1); break;
    case "music-queue-remove": removeMusicQueueItem(Number(button.dataset.index)); break;
    case "audio-shuffle":
      state.musicShuffle = !state.musicShuffle;
      if (state.musicShuffle) shuffleUpcomingMusicQueue();
      updateAudioControls();
      renderMusicQueue();
      break;
    case "audio-repeat":
      state.musicRepeat = state.musicRepeat === "off" ? "all" : state.musicRepeat === "all" ? "one" : "off";
      updateAudioControls();
      break;
    case "audio-toggle":
      if (audioPlayer.paused) {
        if (audioPlayer.ended) audioPlayer.currentTime = 0;
        audioPlayer.play().catch((error) => {
          if (error.name === "NotAllowedError") showToast("Press play again to allow music playback.");
          else showToast("Could not resume music playback.", true);
        });
      }
      else audioPlayer.pause();
      break;
    case "audio-previous":
      if (audioPlayer.currentTime > 3) audioPlayer.currentTime = 0;
      else if (state.musicIndex > 0) playMusicAt(state.musicIndex - 1);
      else if (state.musicRepeat === "all" && state.musicQueue.length) playMusicAt(state.musicQueue.length - 1);
      break;
    case "audio-next":
      playNextMusicTrack();
      break;
    case "queue-toggle":
      state.musicExpanded = !state.musicExpanded;
      renderMusicQueue();
      break;
    case "audio-stop": stopMusic(); break;
    case "play-series": playNextEpisode(button.dataset.id); break;
    case "play": startPlayback(button.dataset.id); break;
    case "favorite": toggleFavorite(button.dataset.id, button.dataset.favorite === "true"); break;
    case "retry-seasons": loadSeriesSeasons(button.dataset.id, state.detailRequestId); break;
    case "retry-episodes": loadSeasonEpisodes(button.dataset.id, button.dataset.seasonId, state.detailRequestId); break;
    case "retry-home": loadHome(); break;
    case "retry-browse": loadBrowse(button.dataset.route || state.route); break;
    case "how-it-works": showToast("NOVA connects directly to your Jellyfin server. Your account and media stay on your own server."); break;
    case "disconnect": disconnect(); break;
    default: break;
  }
});

document.addEventListener("submit", (event) => {
  const form = event.target.closest('[data-form="music-create-playlist"], [data-form="music-rename-playlist"]');
  if (!form) return;
  event.preventDefault();
  const name = new FormData(form).get("name");
  if (form.dataset.form === "music-create-playlist") createMusicPlaylist(String(name || ""));
  else renameMusicPlaylist(form.dataset.id, String(name || ""));
});

document.addEventListener("input", (event) => {
  if (event.target.id !== "music-search") return;
  state.musicSearch = event.target.value.trim();
  window.clearTimeout(state.musicSearchTimer);
  state.musicSearchTimer = window.setTimeout(() => {
    if (state.musicCollection) loadMusicCollection(state.musicCollection.item, state.musicCollection.kind);
    else loadMusicCatalog(state.musicMode);
  }, 260);
});

document.addEventListener("change", (event) => {
  if (event.target.id === "audio-volume") {
    state.musicVolume = Number(event.target.value);
    audioPlayer.volume = state.musicVolume;
    return;
  }
  if (event.target.id === "music-genre" || event.target.id === "music-year" || event.target.id === "music-sort") {
    if (event.target.id === "music-genre") state.musicGenre = event.target.value;
    if (event.target.id === "music-year") state.musicYear = event.target.value;
    if (event.target.id === "music-sort") state.musicSort = event.target.value;
    if (state.musicCollection) loadMusicCollection(state.musicCollection.item, state.musicCollection.kind);
    else loadMusicCatalog(state.musicMode);
    return;
  }
  const select = event.target.closest(".season-select");
  if (!select || !select.value) return;
  const section = select.closest(".episodes-section");
  if (section) loadSeasonEpisodes(section.dataset.seriesId, select.value, state.detailRequestId);
});

connectForm.addEventListener("submit", connect);
searchInput.addEventListener("input", () => {
  window.clearTimeout(state.searchTimer);
  state.searchTimer = window.setTimeout(() => performSearch(searchInput.value), 260);
});
document.addEventListener("keydown", (event) => {
  if (event.key === "/" && document.activeElement !== searchInput && !["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) {
    event.preventDefault();
    searchInput.focus();
  }
  if (event.key === "Escape" && playerModal.open) closePlayer();
});
videoPlayer.addEventListener("pause", () => {
  if (!videoPlayer.ended && state.currentItem) reportPlayback("Progress", true);
});
videoPlayer.addEventListener("timeupdate", () => {
  const currentSecond = Math.floor(videoPlayer.currentTime);
  if (state.currentItem && !videoPlayer.paused && currentSecond - state.lastProgressUpdate >= 30) {
    state.lastProgressUpdate = currentSecond;
    reportPlayback("Progress", false);
  }
});
videoPlayer.addEventListener("ended", () => reportPlayback("Stopped"));
videoPlayer.addEventListener("error", () => {
  if (!state.currentItem || !state.currentPlayback) return;
  if (!state.currentPlayback.transcodeAttempted) {
    state.currentPlayback.transcodeAttempted = true;
    showToast("Direct playback is unavailable. Trying Jellyfin transcoding…");
    videoPlayer.src = videoStreamUrl(state.currentItem.Id, state.currentPlayback.mediaSourceId, true);
    videoPlayer.load();
    videoPlayer.play().catch((error) => {
      if (error.name !== "NotAllowedError") console.warn("Could not start transcoded playback.", error);
    });
  } else {
    showToast("Playback failed. Check Jellyfin transcoding permissions and browser codec support.", true);
  }
});
audioPlayer.addEventListener("pause", () => {
  if (!audioPlayer.ended && state.musicIndex >= 0 && state.musicPlayback?.started) reportMusicPlayback("Progress", true);
  updateAudioControls();
});
audioPlayer.addEventListener("play", updateAudioControls);
audioPlayer.addEventListener("playing", updateAudioControls);
audioPlayer.addEventListener("loadedmetadata", () => {
  audioSeek.disabled = !Number.isFinite(audioPlayer.duration);
  document.querySelector("#audio-duration").textContent = formatClock(audioPlayer.duration);
});
audioPlayer.addEventListener("timeupdate", () => {
  const duration = audioPlayer.duration;
  document.querySelector("#audio-current-time").textContent = formatClock(audioPlayer.currentTime);
  document.querySelector("#audio-duration").textContent = formatClock(duration);
  if (Number.isFinite(duration) && duration > 0 && document.activeElement !== audioSeek) {
    audioSeek.value = String(Math.round(audioPlayer.currentTime / duration * 1000));
  }
  const currentSecond = Math.floor(audioPlayer.currentTime);
  if (!audioPlayer.paused && state.musicIndex >= 0 && currentSecond - state.lastMusicProgressUpdate >= 30) {
    state.lastMusicProgressUpdate = currentSecond;
    reportMusicPlayback("Progress");
  }
});
audioSeek.addEventListener("change", () => {
  if (Number.isFinite(audioPlayer.duration) && audioPlayer.duration > 0) {
    audioPlayer.currentTime = Number(audioSeek.value) / 1000 * audioPlayer.duration;
  }
});
audioPlayer.addEventListener("ended", () => {
  if (state.musicRepeat === "one" && state.musicIndex >= 0) {
    audioPlayer.currentTime = 0;
    audioPlayer.play().catch((error) => showToast(error.message, true));
  } else if (state.musicIndex + 1 < state.musicQueue.length || state.musicRepeat === "all") {
    playNextMusicTrack();
  } else {
    reportMusicPlayback("Stopped");
    if (state.musicPlayback) state.musicPlayback.started = false;
    updateAudioControls();
  }
});
audioPlayer.addEventListener("error", () => {
  if (state.musicIndex < 0) return;
  const errorCode = audioPlayer.error?.code;
  const message = errorCode === MediaError.MEDIA_ERR_DECODE || errorCode === MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED
    ? "This audio format is not supported by your browser."
    : "Could not play this track. Check the Jellyfin server and your account's music permissions.";
  document.querySelector("#audio-status").textContent = message;
  showToast(message, true);
});
connectModal.addEventListener("click", (event) => {
  if (event.target === connectModal) connectModal.close();
});

state.session = loadSavedSession();
updateProfile();
if (state.session) {
  document.querySelector("#server-button-title").textContent = "Connected";
  document.querySelector("#server-button-subtitle").textContent = "Loading your library";
  routeTo("home");
} else {
  disconnectedHome();
}
