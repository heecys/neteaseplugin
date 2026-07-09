;(function () {
  const ROOT = "roche-plugin-netease-music"
  let pollTimer = null
  let audioEl = null
  let styleEl = null
  let customStyleEl = null

  const CSS = `
.${ROOT} {
  --nm-bg: #050505;
  --nm-fg: #f2f2f2;
  --nm-accent: #fff;
  --nm-06: rgba(255,255,255,0.06);
  --nm-08: rgba(255,255,255,0.08);
  --nm-10: rgba(255,255,255,0.1);
  --nm-12: rgba(255,255,255,0.12);
  --nm-14: rgba(255,255,255,0.14);
  --nm-15: rgba(255,255,255,0.15);
  --nm-16: rgba(255,255,255,0.16);
  --nm-20: rgba(255,255,255,0.2);
  --nm-28: rgba(255,255,255,0.28);
  --nm-40: rgba(255,255,255,0.4);
  --nm-45: rgba(255,255,255,0.45);
  --nm-50: rgba(255,255,255,0.5);
  --nm-55: rgba(255,255,255,0.55);
  --nm-60: rgba(255,255,255,0.6);
  --nm-ov-25: rgba(0,0,0,0.25);
  --nm-ov-50: rgba(0,0,0,0.5);
  --nm-modal-bg: rgba(30,30,30,0.7);
  --nm-lyric-dim: rgba(255,255,255,0.35);
  --nm-lyric-active: #fff;

  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  background: var(--nm-bg);
  color: var(--nm-fg);
  font-family: -apple-system, "PingFang SC", sans-serif;
  font-size: 14px;
  overflow: hidden;
}
.${ROOT}.nm-theme-light {
  --nm-bg: #eef0f3;
  --nm-fg: #17171a;
  --nm-accent: #17171a;
  --nm-06: rgba(0,0,0,0.045);
  --nm-08: rgba(255,255,255,0.55);
  --nm-10: rgba(255,255,255,0.65);
  --nm-12: rgba(0,0,0,0.08);
  --nm-14: rgba(0,0,0,0.08);
  --nm-15: rgba(0,0,0,0.1);
  --nm-16: rgba(0,0,0,0.08);
  --nm-20: rgba(0,0,0,0.12);
  --nm-28: rgba(0,0,0,0.14);
  --nm-40: rgba(0,0,0,0.35);
  --nm-45: rgba(0,0,0,0.32);
  --nm-50: rgba(0,0,0,0.45);
  --nm-55: rgba(0,0,0,0.4);
  --nm-60: rgba(0,0,0,0.5);
  --nm-ov-25: rgba(255,255,255,0.4);
  --nm-ov-50: rgba(255,255,255,0.55);
  --nm-modal-bg: rgba(255,255,255,0.8);
  --nm-lyric-dim: rgba(0,0,0,0.3);
  --nm-lyric-active: #17171a;
}
.${ROOT}.nm-theme-clean {
  --nm-bg: #ffffff;
  --nm-fg: #121212;
  --nm-accent: #000000;
  --nm-06: rgba(0,0,0,0.06);
  --nm-08: rgba(0,0,0,0.08);
  --nm-10: rgba(0,0,0,0.1);
  --nm-12: rgba(0,0,0,0.12);
  --nm-14: rgba(0,0,0,0.14);
  --nm-15: rgba(0,0,0,0.15);
  --nm-16: rgba(0,0,0,0.16);
  --nm-20: rgba(0,0,0,0.2);
  --nm-28: rgba(0,0,0,0.28);
  --nm-40: rgba(0,0,0,0.4);
  --nm-45: rgba(0,0,0,0.45);
  --nm-50: rgba(0,0,0,0.5);
  --nm-55: rgba(0,0,0,0.55);
  --nm-60: rgba(0,0,0,0.6);
  --nm-ov-25: rgba(0,0,0,0.08);
  --nm-ov-50: rgba(0,0,0,0.12);
  --nm-modal-bg: rgba(255,255,255,0.96);
  --nm-lyric-dim: rgba(0,0,0,0.45);
  --nm-lyric-active: #000000;
}
.${ROOT}.nm-theme-clean .nm-bg {
  opacity: 0.18;
  filter: blur(60px) saturate(70%) brightness(1.9);
}
.${ROOT} * { box-sizing: border-box; }
.${ROOT} .nm-bg {
  position: absolute;
  inset: -40px;
  background-size: cover;
  background-position: center;
  filter: blur(60px) saturate(160%) brightness(0.5);
  transform: scale(1.2);
  transition: background-image 0.6s ease;
  z-index: 0;
}
.${ROOT} button {
  background: var(--nm-10);
  backdrop-filter: blur(16px);
  border: 1px solid var(--nm-16);
  color: var(--nm-accent);
  border-radius: 14px;
  padding: 8px 14px;
  font-size: 13px;
  cursor: pointer;
}
.${ROOT} button:active { background: var(--nm-20); }
.${ROOT} .nm-topbar {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: calc(env(safe-area-inset-top, 14px) + 10px) 12px 10px;
  flex-shrink: 0;
}
.${ROOT} .nm-round {
  width: 34px;
  height: 34px;
  padding: 0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 16px;
}
.${ROOT} .nm-tabs {
  flex: 1;
  display: flex;
  gap: 6px;
  background: var(--nm-06);
  border: 1px solid var(--nm-10);
  border-radius: 14px;
  padding: 3px;
}
.${ROOT} .nm-tab {
  flex: 1;
  text-align: center;
  padding: 7px 4px;
  border-radius: 11px;
  color: var(--nm-55);
  cursor: pointer;
}
.${ROOT} .nm-tab.active {
  color: var(--nm-accent);
  background: var(--nm-16);
}
.${ROOT} .nm-view {
  position: relative;
  z-index: 1;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
.${ROOT} .nm-search-bar {
  display: flex;
  gap: 8px;
  padding: 0 12px 8px;
  flex-shrink: 0;
}
.${ROOT} .nm-search-bar input {
  flex: 1;
  background: var(--nm-08);
  backdrop-filter: blur(16px);
  border: 1px solid var(--nm-15);
  color: var(--nm-accent);
  border-radius: 14px;
  padding: 8px 12px;
  font-size: 13px;
}
.${ROOT} .nm-search-bar input::placeholder { color: var(--nm-45); }
.${ROOT} .nm-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 4px 8px 8px;
}
.${ROOT} .nm-profile {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 12px 10px;
  flex-shrink: 0;
}
.${ROOT} .nm-profile-avatar {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  object-fit: cover;
  background: var(--nm-12);
  border: 1px solid var(--nm-15);
}
.${ROOT} .nm-profile-name {
  margin-top: 8px;
  font-size: 15px;
  font-weight: 600;
}
.${ROOT} .nm-profile button {
  margin-top: 10px;
}
.${ROOT} .nm-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 8px;
  border-radius: 14px;
  cursor: pointer;
}
.${ROOT} .nm-row:active { background: var(--nm-08); }
.${ROOT} .nm-row img {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  object-fit: cover;
  background: var(--nm-10);
}
.${ROOT} .nm-row .nm-meta { flex: 1; min-width: 0; }
.${ROOT} .nm-row .nm-title {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.${ROOT} .nm-row .nm-sub {
  color: var(--nm-50);
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.${ROOT} .nm-empty {
  color: var(--nm-40);
  text-align: center;
  padding: 40px 20px;
}
.${ROOT} .nm-miniplayer {
  position: relative;
  z-index: 1;
  flex-shrink: 0;
  margin: 8px;
  border-radius: 18px;
  padding: 8px 10px;
  display: none;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  background: var(--nm-08);
  backdrop-filter: blur(24px) saturate(180%);
  border: 1px solid var(--nm-14);
}
.${ROOT} .nm-miniplayer img {
  width: 38px;
  height: 38px;
  border-radius: 9px;
  object-fit: cover;
}
.${ROOT} .nm-miniplayer .nm-mp-meta { flex: 1; min-width: 0; }
.${ROOT} .nm-miniplayer .nm-mp-title {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 13px;
}
.${ROOT} .nm-miniplayer .nm-mp-sub {
  color: var(--nm-50);
  font-size: 11px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.${ROOT} .nm-miniplayer button {
  width: 32px;
  height: 32px;
  padding: 0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.${ROOT} .nm-nowplaying {
  position: absolute;
  inset: 0;
  z-index: 3;
  display: none;
  flex-direction: column;
  align-items: center;
  padding: calc(env(safe-area-inset-top, 12px) + 8px) 24px calc(env(safe-area-inset-bottom, 12px) + 8px);
  background: linear-gradient(135deg, rgba(5,5,5,0.95) 0%, rgba(20,20,20,0.95) 100%);
  backdrop-filter: blur(40px) saturate(180%);
}
.${ROOT} .nm-nowplaying.show { display: flex; }
.${ROOT} .nm-np-top {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  gap: 8px;
}
.${ROOT} .nm-np-top button {
  flex-shrink: 0;
}
.${ROOT} .nm-np-art {
  width: 85%;
  max-width: 320px;
  aspect-ratio: 1/1;
  border-radius: 24px;
  object-fit: cover;
  margin: 16px 0;
  box-shadow: 0 24px 60px var(--nm-ov-50);
  flex-shrink: 0;
}
.${ROOT} .nm-nowplaying.nm-showlyrics .nm-np-art { display: none; }
.${ROOT} .nm-np-lyrics {
  display: none;
  width: 100%;
  flex: 1;
  min-height: 0;
  margin: 16px 0;
  overflow-y: auto;
  mask-image: linear-gradient(to bottom, transparent 0%, #000 10%, #000 90%, transparent 100%);
  -webkit-mask-image: linear-gradient(to bottom, transparent 0%, #000 10%, #000 90%, transparent 100%);
}
.${ROOT} .nm-nowplaying.nm-showlyrics .nm-np-lyrics { display: block; }
.${ROOT} .nm-np-lyrics-inner {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 30% 10px;
  align-items: center;
}
.${ROOT} .nm-lyric-line {
  font-size: 14px;
  color: var(--nm-lyric-dim);
  text-align: center;
  transition: color 0.3s, transform 0.3s;
  line-height: 1.6;
}
.${ROOT} .nm-lyric-line.active {
  color: var(--nm-lyric-active);
  font-size: 17px;
  font-weight: 600;
  transform: scale(1.02);
}
.${ROOT} .nm-np-title {
  font-size: 20px;
  font-weight: 700;
  text-align: center;
  padding: 0 12px;
  line-height: 1.3;
  margin-top: 12px;
}
.${ROOT} .nm-np-artist {
  color: var(--nm-60);
  margin-top: 6px;
  text-align: center;
  font-size: 14px;
}
.${ROOT} .nm-np-progress {
  width: 100%;
  height: 3px;
  border-radius: 1.5px;
  background: var(--nm-20);
  margin-top: 20px;
  position: relative;
  cursor: pointer;
}
.${ROOT} .nm-np-progress-fill {
  position: absolute;
  left: 0; top: 0; bottom: 0;
  border-radius: 1.5px;
  background: var(--nm-accent);
  width: 0%;
}
.${ROOT} .nm-np-time {
  width: 100%;
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: var(--nm-50);
  margin-top: 8px;
}
.${ROOT} .nm-np-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 36px;
  margin-top: 28px;
  flex-wrap: wrap;
}
.${ROOT} .nm-np-controls button {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.${ROOT} .nm-np-controls button.nm-np-play {
  width: 64px;
  height: 64px;
  font-size: 24px;
  background: var(--nm-16);
  border: 1px solid var(--nm-20);
}
.${ROOT} .nm-modal-mask {
  position: fixed;
  inset: 0;
  background: var(--nm-ov-50);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}
.${ROOT} .nm-modal-box {
  background: var(--nm-modal-bg);
  backdrop-filter: blur(24px) saturate(180%);
  border: 1px solid var(--nm-15);
  border-radius: 20px;
  padding: 18px;
  text-align: center;
  width: 260px;
  max-height: 70vh;
  overflow-y: auto;
}
.${ROOT} .nm-modal-box img { width: 180px; height: 180px; margin: 10px 0; border-radius: 12px; }
.${ROOT} .nm-modal-status { color: var(--nm-60); font-size: 12px; margin-bottom: 10px; }
.${ROOT} .nm-modal-box input {
  width: 100%;
  background: var(--nm-08);
  border: 1px solid var(--nm-15);
  color: var(--nm-accent);
  border-radius: 12px;
  padding: 8px 10px;
  font-size: 13px;
  margin-bottom: 10px;
}
.${ROOT} .nm-modal-box textarea {
  width: 100%;
  background: var(--nm-08);
  border: 1px solid var(--nm-15);
  color: var(--nm-fg);
  border-radius: 12px;
  padding: 8px 10px;
  font-size: 12px;
  font-family: monospace;
  margin-bottom: 10px;
  resize: vertical;
}
.${ROOT} .nm-char-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
  border-radius: 12px;
  cursor: pointer;
  text-align: left;
}
.${ROOT} .nm-char-row:active { background: var(--nm-10); }
.${ROOT} .nm-char-row img {
  width: 36px; height: 36px; border-radius: 50%; object-fit: cover; margin: 0;
}
.${ROOT} .nm-char-detail-head {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 12px 6px;
}
.${ROOT} .nm-char-detail-head img {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  object-fit: cover;
  background: var(--nm-12);
  border: 1px solid var(--nm-15);
}
.${ROOT} .nm-char-detail-head .nm-char-detail-name {
  margin-top: 8px;
  font-size: 15px;
  font-weight: 600;
}
.${ROOT} .nm-char-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
  flex-wrap: wrap;
  justify-content: center;
  padding: 0 12px;
}
.${ROOT} .nm-char-actions button.on {
  background: var(--nm-28);
}
.${ROOT} .nm-reply-box {
  font-size: 13px;
  line-height: 1.5;
  padding: 6px 2px;
}
`

  window.RochePlugin.register({
    id: "netease-music",
    name: "网易云音乐",
    version: "1.2.0",
    apps: [
      {
        id: "netease-music-player",
        name: "网易云音乐",
        icon: "music_note",
        iconImage: "",
        async mount(container, roche) {
          styleEl = document.createElement("style")
          styleEl.textContent = CSS
          document.head.appendChild(styleEl)

          customStyleEl = document.createElement("style")
          document.head.appendChild(customStyleEl)

          let config = (await roche.storage.get("config")) || {
            apiBase: "",
            cookie: "",
            uid: "",
            nickname: "",
            avatar: "",
            realIP: "",
            syncChars: [],
            theme: "dark",
            customCss: ""
          }
          if (!Array.isArray(config.syncChars)) config.syncChars = []
          if (!config.theme) config.theme = "dark"
          if (config.customCss === undefined) config.customCss = ""
          customStyleEl.textContent = config.customCss || ""

          let activeTab = "library"
          let searchResults = []
          let playlists = []
          let currentTracks = []
          let currentPlaylistName = ""
          let nowPlaying = null
          let nowPlayingSource = null // "search" | "playlist" | "char"
          let nowPlayingIdx = -1
          let lyricsLines = []
          let lyricsActiveIdx = -1
          let charList = []
          let charScreen = "list" // "list" | "detail"
          let selectedChar = null
          let charPlaylist = []

          function escapeHtml(str) {
            return String(str || "").replace(/[&<>"']/g, (c) => ({
              "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
            }[c]))
          }

          container.innerHTML = `
            <div class="${ROOT}">
              <div class="nm-bg"></div>
              <div class="nm-topbar">
                <button class="nm-round nm-gear" title="设置">⚙</button>
                <button class="nm-round nm-theme-toggle" title="日间/夜间">☾</button>
                <button class="nm-round nm-topbar-login" title="登录/退出">${config.cookie ? "退出" : "登录"}</button>
                <div class="nm-tabs">
                  <div class="nm-tab active" data-tab="search">搜索</div>
                  <div class="nm-tab" data-tab="library">我的歌单</div>
                  <div class="nm-tab" data-tab="char">角色</div>
                </div>
                <button class="nm-round nm-close" title="退出插件">✕</button>
              </div>

              <div class="nm-view nm-view-search">
                <div class="nm-search-bar">
                  <input class="nm-search-input" placeholder="搜索歌曲 / 歌手" />
                  <button class="nm-search-btn">搜索</button>
                </div>
                <div class="nm-body nm-search-body"></div>
              </div>

              <div class="nm-view nm-view-library" style="display:none;">
                <div class="nm-profile">
                  <img class="nm-profile-avatar" src="${escapeHtml(config.avatar)}" />
                  <div class="nm-profile-name">${config.cookie ? escapeHtml(config.nickname || "网易云用户") : "未登录"}</div>
                </div>
                <div class="nm-body nm-library-body"></div>
              </div>

              <div class="nm-view nm-view-char" style="display:none;">
                <div class="nm-body nm-char-body"></div>
              </div>

              <div class="nm-miniplayer">
                <img />
                <div class="nm-mp-meta">
                  <div class="nm-mp-title"></div>
                  <div class="nm-mp-sub"></div>
                </div>
                <button class="nm-mp-toggle">❚❚</button>
              </div>

              <div class="nm-nowplaying">
                <div class="nm-np-top">
                  <button class="nm-round nm-np-collapse">︾</button>
                  <button class="nm-round nm-np-lyrics-toggle" title="显示歌词">词</button>
                  <button class="nm-round nm-np-share" title="分享">☰</button>
                  <button class="nm-round nm-np-share-chat" title="分享到聊天">💬</button>
                </div>
                <img class="nm-np-art" />
                <div class="nm-np-lyrics">
                  <div class="nm-np-lyrics-inner"></div>
                </div>
                <div class="nm-np-title"></div>
                <div class="nm-np-artist"></div>
                <div class="nm-np-progress">
                  <div class="nm-np-progress-fill"></div>
                </div>
                <div class="nm-np-time">
                  <span class="nm-np-cur">0:00</span>
                  <span class="nm-np-dur">0:00</span>
                </div>
                <div class="nm-np-controls">
                  <button class="nm-np-toggle nm-np-play">❚❚</button>
                </div>
              </div>
            </div>
          `

          const root = container.querySelector(`.${ROOT}`)
          root.classList.toggle("nm-theme-light", config.theme === "light")
          root.classList.toggle("nm-theme-clean", config.theme === "clean")
          const themeToggleBtn = root.querySelector(".nm-theme-toggle")
          themeToggleBtn.textContent = config.theme === "light" ? "☀" : config.theme === "clean" ? "◻" : "☾"
          const bg = root.querySelector(".nm-bg")
          const viewSearch = root.querySelector(".nm-view-search")
          const viewLibrary = root.querySelector(".nm-view-library")
          const viewChar = root.querySelector(".nm-view-char")
          const searchBody = root.querySelector(".nm-search-body")
          const libraryBody = root.querySelector(".nm-library-body")
          const charBody = root.querySelector(".nm-char-body")
          const profileAvatar = root.querySelector(".nm-profile-avatar")
          const profileName = root.querySelector(".nm-profile-name")
          const topbarLoginBtn = root.querySelector(".nm-topbar-login")
          const mini = root.querySelector(".nm-miniplayer")
          const miniImg = mini.querySelector("img")
          const miniTitle = mini.querySelector(".nm-mp-title")
          const miniSub = mini.querySelector(".nm-mp-sub")
          const miniToggle = mini.querySelector(".nm-mp-toggle")
          const np = root.querySelector(".nm-nowplaying")
          const npArt = np.querySelector(".nm-np-art")
          const npTitle = np.querySelector(".nm-np-title")
          const npArtist = np.querySelector(".nm-np-artist")
          const npProgress = np.querySelector(".nm-np-progress")
          const npFill = np.querySelector(".nm-np-progress-fill")
          const npCur = np.querySelector(".nm-np-cur")
          const npDur = np.querySelector(".nm-np-dur")
          const npToggle = np.querySelector(".nm-np-toggle")
          const npLyricsInner = np.querySelector(".nm-np-lyrics-inner")
          const npLyricsToggleBtn = np.querySelector(".nm-np-lyrics-toggle")
          const npShareChatBtn = np.querySelector(".nm-np-share-chat")

          const AUDIO_ID = "roche-netease-audio-persistent"
          audioEl = document.getElementById(AUDIO_ID)
          let resumedFromBackground = false
          if (audioEl) {
            resumedFromBackground = true
          } else {
            audioEl = document.createElement("audio")
            audioEl.id = AUDIO_ID
            audioEl.style.display = "none"
            document.body.appendChild(audioEl)
          }

          async function api(path, params) {
            if (!config.apiBase) {
              roche.ui.toast("先在设置里填 API 地址")
              throw new Error("no api base")
            }
            const usp = new URLSearchParams(params || {})
            if (config.cookie) usp.set("cookie", config.cookie)
            if (config.realIP) usp.set("realIP", config.realIP)
            usp.set("timestamp", Date.now().toString())
            const base = config.apiBase.replace(/\/+$/, "")
            const url = `${base}${path}?${usp.toString()}`
            const res = await fetch(url)
            if (!res.ok) throw new Error("请求失败 " + res.status)
            return res.json()
          }

          function renderSongList(target, items) {
            if (!items.length) {
              target.innerHTML = `<div class="nm-empty">暂无内容</div>`
              return
            }
            target.innerHTML = items.map((item, idx) => {
              const artists = (item.ar || item.artists || []).map(a => a.name).join(" / ")
              const cover = (item.al && item.al.picUrl) || item.picUrl || ""
              return `
                <div class="nm-row" data-action="play" data-idx="${idx}">
                  <img src="${cover}" />
                  <div class="nm-meta">
                    <div class="nm-title">${escapeHtml(item.name)}</div>
                    <div class="nm-sub">${escapeHtml(artists)}</div>
                  </div>
                </div>
              `
            }).join("")
          }

          function renderPlaylists() {
            if (!playlists.length) {
              libraryBody.innerHTML = `<div class="nm-empty">还没有歌单</div>`
              return
            }
            libraryBody.innerHTML = playlists.map((item, idx) => `
              <div class="nm-row" data-action="openPlaylist" data-idx="${idx}">
                <img src="${item.coverImgUrl || ""}" />
                <div class="nm-meta">
                  <div class="nm-title">${escapeHtml(item.name)}</div>
                  <div class="nm-sub">${item.trackCount || 0} 首</div>
                </div>
              </div>
            `).join("")
          }

          function renderTracks() {
            libraryBody.innerHTML = `
              <div class="nm-row" data-action="backToPlaylists">
                <div class="nm-meta"><div class="nm-title">← 返回歌单列表（${escapeHtml(currentPlaylistName)}）</div></div>
              </div>
            ` + currentTracks.map((item, idx) => {
              const artists = (item.ar || []).map(a => a.name).join(" / ")
              return `
                <div class="nm-row" data-action="playTrack" data-idx="${idx}">
                  <div class="nm-meta">
                    <div class="nm-title">${escapeHtml(item.name)}</div>
                    <div class="nm-sub">${escapeHtml(artists)}</div>
                  </div>
                </div>
              `
            }).join("")
          }

          async function doSearch() {
            const kw = root.querySelector(".nm-search-input").value.trim()
            if (!kw) return
            try {
              const data = await api("/search", { keywords: kw, limit: 30 })
              searchResults = (data.result && data.result.songs) || []
              renderSongList(searchBody, searchResults)
            } catch (e) {
              roche.ui.toast("搜索失败：" + e.message)
            }
          }

          function fmtTime(sec) {
            if (!isFinite(sec) || sec < 0) sec = 0
            const m = Math.floor(sec / 60)
            const s = Math.floor(sec % 60)
            return `${m}:${s < 10 ? "0" : ""}${s}`
          }

          function parseLrc(text) {
            const lines = text.split("\n")
            const timeExp = /\[(\d{2}):(\d{2})(?:[.:](\d{1,3}))?\]/g
            const result = []
            for (const line of lines) {
              const matches = [...line.matchAll(timeExp)]
              if (!matches.length) continue
              const content = line.replace(timeExp, "").trim()
              if (!content) continue
              for (const m of matches) {
                const min = parseInt(m[1], 10)
                const sec = parseInt(m[2], 10)
                const ms = m[3] ? parseInt(m[3].padEnd(3, "0"), 10) : 0
                result.push({ time: min * 60 + sec + ms / 1000, text: content })
              }
            }
            result.sort((a, b) => a.time - b.time)
            return result
          }

          function renderLyrics() {
            lyricsActiveIdx = -1
            if (!lyricsLines.length) {
              npLyricsInner.innerHTML = `<div class="nm-lyric-line">暂无歌词</div>`
              return
            }
            npLyricsInner.innerHTML = lyricsLines.map((l, i) =>
              `<div class="nm-lyric-line" data-idx="${i}">${escapeHtml(l.text)}</div>`
            ).join("")
          }

          async function loadLyrics(id) {
            lyricsLines = []
            renderLyrics()
            try {
              const data = await api("/lyric", { id })
              const lrc = data.lrc && data.lrc.lyric
              lyricsLines = lrc ? parseLrc(lrc) : []
              renderLyrics()
            } catch (e) {
              lyricsLines = []
              renderLyrics()
            }
          }

          function updateLyricHighlight(cur) {
            if (!lyricsLines.length) return
            let idx = -1
            for (let i = 0; i < lyricsLines.length; i++) {
              if (lyricsLines[i].time <= cur) idx = i
              else break
            }
            if (idx === lyricsActiveIdx) return
            const prevEl = npLyricsInner.querySelector(".nm-lyric-line.active")
            if (prevEl) prevEl.classList.remove("active")
            lyricsActiveIdx = idx
            if (idx >= 0) {
              const el = npLyricsInner.children[idx]
              if (el) {
                el.classList.add("active")
                el.scrollIntoView({ block: "center", behavior: "smooth" })
              }
            }
          }

          function updateProgress() {
            const dur = audioEl.duration || 0
            const cur = audioEl.currentTime || 0
            npFill.style.width = dur ? `${(cur / dur) * 100}%` : "0%"
            npCur.textContent = fmtTime(cur)
            npDur.textContent = fmtTime(dur)
            updateLyricHighlight(cur)
          }

          async function playSongById(id, title, artist, cover, source = "search", idx = -1) {
            try {
              const data = await api("/song/url/v1", { id, level: "standard" })
              const info = data.data && data.data[0]
              if (!info || !info.url) {
                roche.ui.toast("这首歌没有可播放地址（可能需要 VIP 或版权限制）")
                return
              }
              audioEl.src = info.url
              audioEl.play()
              audioEl.dataset.songId = String(id)
              audioEl.dataset.title = title
              audioEl.dataset.artist = artist || ""
              audioEl.dataset.cover = cover || ""

              nowPlaying = { id, name: title, artist: artist || "", cover: cover || "" }
              nowPlayingSource = source
              nowPlayingIdx = idx

              miniImg.src = cover || ""
              miniTitle.textContent = title
              miniSub.textContent = artist || ""
              mini.style.display = "flex"
              miniToggle.textContent = "❚❚"

              npArt.src = cover || ""
              npTitle.textContent = title
              npArtist.textContent = artist || ""
              npToggle.textContent = "❚❚"

              bg.style.backgroundImage = cover ? `url(${cover})` : "none"

              await loadLyrics(id)
              syncNowPlayingToChars()
            } catch (e) {
              roche.ui.toast("播放失败：" + e.message)
            }
          }

          async function loadPlaylists() {
            if (!config.uid) {
              libraryBody.innerHTML = `<div class="nm-empty">登录后可以看到歌单</div>`
              return
            }
            try {
              const data = await api("/user/playlist", { uid: config.uid })
              playlists = data.playlist || []
              renderPlaylists()
            } catch (e) {
              roche.ui.toast("获取歌单失败：" + e.message)
            }
          }

          async function openPlaylist(idx) {
            const pl = playlists[idx]
            if (!pl) return
            try {
              const data = await api("/playlist/track/all", { id: pl.id })
              currentTracks = data.songs || []
              currentPlaylistName = pl.name
              renderTracks()
            } catch (e) {
              roche.ui.toast("获取歌单内容失败：" + e.message)
            }
          }

          function setActiveTab() {
            root.querySelectorAll(".nm-tab").forEach(t => {
              t.classList.toggle("active", t.dataset.tab === activeTab)
            })
            viewSearch.style.display = activeTab === "search" ? "flex" : "none"
            viewLibrary.style.display = activeTab === "library" ? "flex" : "none"
            viewChar.style.display = activeTab === "char" ? "flex" : "none"
          }

          function updateProfileUI() {
            profileAvatar.src = config.avatar || ""
            profileName.textContent = config.cookie ? (config.nickname || "网易云用户") : "未登录"
            topbarLoginBtn.textContent = config.cookie ? "退出" : "登录"
          }

          function showQrLogin() {
            const mask = document.createElement("div")
            mask.className = "nm-modal-mask"
            mask.innerHTML = `
              <div class="nm-modal-box">
                <div class="nm-modal-status">正在获取二维码…</div>
                <img style="display:none;" />
                <div><button class="nm-modal-close">取消</button></div>
              </div>
            `
            root.appendChild(mask)
            const statusEl = mask.querySelector(".nm-modal-status")
            const imgEl = mask.querySelector("img")

            mask.querySelector(".nm-modal-close").onclick = () => {
              if (pollTimer) clearInterval(pollTimer)
              mask.remove()
            }

            ;(async () => {
              try {
                const keyData = await api("/login/qr/key", {})
                const unikey = keyData.data && keyData.data.unikey
                if (!unikey) throw new Error("获取二维码 key 失败")
                const qrData = await api("/login/qr/create", { key: unikey, qrimg: true })
                const qrimg = qrData.data && qrData.data.qrimg
                if (qrimg) {
                  imgEl.src = qrimg
                  imgEl.style.display = "block"
                }
                statusEl.textContent = "请用网易云音乐 App 扫码"

                pollTimer = setInterval(async () => {
                  try {
                    const checkData = await api("/login/qr/check", { key: unikey })
                    if (checkData.code === 800) {
                      statusEl.textContent = "二维码已过期"
                      clearInterval(pollTimer)
                    } else if (checkData.code === 801) {
                      statusEl.textContent = "等待扫码…"
                    } else if (checkData.code === 802) {
                      statusEl.textContent = "已扫码，请在手机上确认"
                    } else if (checkData.code === 803) {
                      clearInterval(pollTimer)
                      statusEl.textContent = "登录成功"
                      config.cookie = checkData.cookie || ""
                      const accountData = await api("/user/account", {})
                      const account = accountData.account || {}
                      const profile = accountData.profile || {}
                      config.uid = account.id ? String(account.id) : ""
                      config.nickname = profile.nickname || ""
                      config.avatar = profile.avatarUrl || ""
                      await roche.storage.set("config", config)
                      updateProfileUI()
                      loadPlaylists()
                      setTimeout(() => mask.remove(), 800)
                    }
                  } catch (e) {
                    statusEl.textContent = "检查登录状态失败"
                  }
                }, 3000)
              } catch (e) {
                statusEl.textContent = "获取二维码失败：" + e.message
              }
            })()
          }

          function showSettings() {
            const mask = document.createElement("div")
            mask.className = "nm-modal-mask"
            mask.innerHTML = `
              <div class="nm-modal-box">
                <div class="nm-modal-status">设置</div>
                <input class="nm-settings-input" placeholder="API 地址，例如 https://xxx.vercel.app" value="${escapeHtml(config.apiBase)}" />
                <input class="nm-settings-realip" placeholder="realIP（用 Vercel 部署时必填，如 116.25.146.177）" value="${escapeHtml(config.realIP)}" />
                <textarea class="nm-settings-css" placeholder="自定义 CSS（选填，会覆盖默认样式）" rows="6">${escapeHtml(config.customCss)}</textarea>
                <div class="nm-settings-note">
                  可在这里覆盖样式，例如：
                  <div style="text-align:left; margin-top:6px; font-size:12px; color: var(--nm-50); line-height:1.4;">
                    .nm-topbar, .nm-tabs, .nm-row, .nm-miniplayer, .nm-nowplaying, .nm-np-art, .nm-np-title, .nm-np-artist, .nm-np-progress, .nm-np-controls, .nm-bg, .nm-search-bar input, .nm-modal-box
                  </div>
                </div>
                <button class="nm-settings-save">保存</button>
                <div style="margin-top:8px;"><button class="nm-modal-close">关闭</button></div>
              </div>
            `
            root.appendChild(mask)
            mask.querySelector(".nm-modal-close").onclick = () => mask.remove()
            mask.querySelector(".nm-settings-save").onclick = async () => {
              config.apiBase = mask.querySelector(".nm-settings-input").value.trim()
              config.realIP = mask.querySelector(".nm-settings-realip").value.trim()
              config.customCss = mask.querySelector(".nm-settings-css").value
              customStyleEl.textContent = config.customCss || ""
              await roche.storage.set("config", config)
              roche.ui.toast("已保存")
              mask.remove()
            }
          }

          async function shareToCharacter() {
            if (!nowPlaying) {
              roche.ui.toast("先播放一首歌")
              return
            }
            let chars = []
            try {
              chars = await roche.character.list()
            } catch (e) {
              roche.ui.toast("获取角色列表失败")
              return
            }
            if (!chars.length) {
              roche.ui.toast("没有可分享的角色")
              return
            }

            const mask = document.createElement("div")
            mask.className = "nm-modal-mask"
            mask.innerHTML = `
              <div class="nm-modal-box">
                <div class="nm-modal-status">分享给谁听？</div>
                ${chars.map((c, i) => `
                  <div class="nm-char-row" data-idx="${i}">
                    <img src="${c.avatar || ""}" />
                    <div>${escapeHtml(c.handle || c.name)}</div>
                  </div>
                `).join("")}
                <div style="margin-top:8px;"><button class="nm-modal-close">取消</button></div>
              </div>
            `
            root.appendChild(mask)
            mask.querySelector(".nm-modal-close").onclick = () => mask.remove()

            mask.querySelectorAll(".nm-char-row").forEach(row => {
              row.onclick = async () => {
                const char = chars[Number(row.dataset.idx)]
                mask.remove()
                await doShare(char)
              }
            })
          }

          async function doShare(char) {
            const currentLyric = lyricsLines[lyricsActiveIdx]?.text || lyricsLines[0]?.text || "暂无歌词"
            const ok = await roche.ui.confirm({
              title: "分享给 " + (char.handle || char.name),
              message: `把正在听的《${nowPlaying.name}》分享给 ${char.handle || char.name}，这会写入和 ta 的记忆里，确定吗？`
            })
            if (!ok) return

            try {
              let conversationId = char.conversationId
              if (!conversationId) {
                const convs = await roche.conversation.list({ memberId: char.id })
                if (convs && convs.length) conversationId = convs[0].id || convs[0].conversationId
              }
              if (!conversationId) {
                roche.ui.toast("找不到和这个角色的会话")
                return
              }

              await roche.memory.write({
                conversationId,
                summaryText: `用户分享了正在听的歌曲：《${nowPlaying.name}》- ${nowPlaying.artist}。当前歌词：${currentLyric}`,
                details: {
                  song: nowPlaying.name,
                  artist: nowPlaying.artist,
                  lyric: currentLyric
                },
                who: ["用户"],
                action: "分享音乐",
                when: "刚刚",
                where: "网易云插件",
                source: "plugin"
              })

              roche.ui.toast("已分享，" + (char.handle || char.name) + " 听到了")

              const personaText = char.persona || char.bio || ""
              const result = await roche.ai.chat({
                messages: [
                  {
                    role: "system",
                    content: `你正在扮演角色"${char.name}"。人设：${personaText}。用户刚刚跟你分享了ta正在听的歌曲《${nowPlaying.name}》，歌手是${nowPlaying.artist}。你需要记住这首歌的歌名和当前一句歌词：${currentLyric}。请用符合这个人设的语气，简短自然地回应一句（不超过40字），不要加任何解释或旁白。`
                  },
                  { role: "user", content: "(分享了一首正在听的歌)" }
                ]
              })
              const replyText = result && result.text
              if (replyText) showReplyModal(char, replyText)
            } catch (e) {
              roche.ui.toast("分享失败：" + e.message)
            }
          }

          async function openConversationPage(conversationId) {
            if (!conversationId) return false
            try {
              if (roche.conversation && typeof roche.conversation.open === "function") {
                await roche.conversation.open({ conversationId })
                return true
              }
              if (roche.conversation && typeof roche.conversation.openConversation === "function") {
                await roche.conversation.openConversation(conversationId)
                return true
              }
              if (typeof roche.openConversation === "function") {
                await roche.openConversation({ conversationId })
                return true
              }
            } catch (e) {}
            return false
          }

          async function shareToChatPage() {
            if (!nowPlaying) {
              roche.ui.toast("先播放一首歌")
              return
            }
            let chars = []
            try {
              chars = await roche.character.list()
            } catch (e) {
              roche.ui.toast("获取角色列表失败")
              return
            }
            if (!chars.length) {
              roche.ui.toast("没有可分享的角色")
              return
            }

            const mask = document.createElement("div")
            mask.className = "nm-modal-mask"
            mask.innerHTML = `
              <div class="nm-modal-box">
                <div class="nm-modal-status">分享到聊天页面</div>
                ${chars.map((c, i) => `
                  <div class="nm-char-row" data-idx="${i}">
                    <img src="${c.avatar || ""}" />
                    <div>${escapeHtml(c.handle || c.name)}</div>
                  </div>
                `).join("")}
                <div style="margin-top:8px;"><button class="nm-modal-close">取消</button></div>
              </div>
            `
            root.appendChild(mask)
            mask.querySelector(".nm-modal-close").onclick = () => mask.remove()

            mask.querySelectorAll(".nm-char-row").forEach(row => {
              row.onclick = async () => {
                const char = chars[Number(row.dataset.idx)]
                mask.remove()
                await doShareToChat(char)
              }
            })
          }

          async function doShareToChat(char) {
            const currentLyric = lyricsLines[lyricsActiveIdx]?.text || lyricsLines[0]?.text || "暂无歌词"
            let conversationId = await resolveConversationId(char)
            if (!conversationId) {
              roche.ui.toast("找不到和这个角色的聊天会话")
              return
            }
            try {
              await roche.memory.write({
                conversationId,
                summaryText: `用户分享了正在听的歌曲：《${nowPlaying.name}》- ${nowPlaying.artist}。当前歌词：${currentLyric}`,
                details: {
                  song: nowPlaying.name,
                  artist: nowPlaying.artist,
                  lyric: currentLyric
                },
                who: ["用户"],
                action: "分享音乐",
                when: "刚刚",
                where: "网易云插件",
                source: "plugin"
              })
              const opened = await openConversationPage(conversationId)
              if (opened) {
                roche.ui.toast("已打开聊天页面并分享歌曲")
              } else {
                roche.ui.toast("已写入记忆，未能直接打开聊天页面")
              }
            } catch (e) {
              roche.ui.toast("分享到聊天失败：" + e.message)
            }
          }

          function showReplyModal(char, text) {
            const mask = document.createElement("div")
            mask.className = "nm-modal-mask"
            mask.innerHTML = `
              <div class="nm-modal-box">
                <img src="${char.avatar || ""}" style="width:56px;height:56px;border-radius:50%;" />
                <div class="nm-modal-status">${escapeHtml(char.handle || char.name)}</div>
                <div class="nm-reply-box">${escapeHtml(text)}</div>
                <div style="margin-top:12px;"><button class="nm-modal-close">好</button></div>
              </div>
            `
            root.appendChild(mask)
            mask.querySelector(".nm-modal-close").onclick = () => mask.remove()
          }

          async function resolveConversationId(char) {
            if (char.conversationId) return char.conversationId
            try {
              const convs = await roche.conversation.list({ memberId: char.id })
              if (convs && convs.length) return convs[0].id || convs[0].conversationId
            } catch (e) {}
            return null
          }

          async function renderCharList() {
            charScreen = "list"
            charBody.innerHTML = `<div class="nm-empty">加载角色列表…</div>`
            try {
              charList = await roche.character.list()
            } catch (e) {
              charBody.innerHTML = `<div class="nm-empty">获取角色列表失败</div>`
              return
            }
            if (!charList.length) {
              charBody.innerHTML = `<div class="nm-empty">还没有角色</div>`
              return
            }
            charBody.innerHTML = charList.map((c, i) => `
              <div class="nm-row" data-action="openChar" data-idx="${i}">
                <img src="${c.avatar || ""}" style="border-radius:50%;" />
                <div class="nm-meta">
                  <div class="nm-title">${escapeHtml(c.handle || c.name)}</div>
                  <div class="nm-sub">${config.syncChars.some(s => s.id === c.id) ? "正在同步我听的歌" : ""}</div>
                </div>
              </div>
            `).join("")
          }

          async function openChar(idx) {
            selectedChar = charList[idx]
            if (!selectedChar) return
            charScreen = "detail"
            let stored = null
            try { stored = await roche.storage.get("charplaylist:" + selectedChar.id) } catch (e) {}
            try { charPlaylist = stored ? JSON.parse(stored) : [] } catch (e) { charPlaylist = [] }
            renderCharDetail()
          }

          function renderCharDetail() {
            const isSyncing = config.syncChars.some(s => s.id === selectedChar.id)
            const songsHtml = charPlaylist.length
              ? charPlaylist.map((s, i) => `
                  <div class="nm-row" data-action="playCharSong" data-idx="${i}">
                    <img src="${s.cover || ""}" />
                    <div class="nm-meta">
                      <div class="nm-title">${escapeHtml(s.name)}</div>
                      <div class="nm-sub">${escapeHtml(s.artist)}</div>
                    </div>
                  </div>
                `).join("")
              : `<div class="nm-empty">还没有生成歌单</div>`

            charBody.innerHTML = `
              <div class="nm-row" data-action="backToCharList">
                <div class="nm-meta"><div class="nm-title">← 返回角色列表</div></div>
              </div>
              <div class="nm-char-detail-head">
                <img src="${selectedChar.avatar || ""}" />
                <div class="nm-char-detail-name">${escapeHtml(selectedChar.handle || selectedChar.name)}</div>
              </div>
              <div class="nm-char-actions">
                <button data-action="genPlaylist">生成ta喜欢的歌单</button>
                <button data-action="toggleSync" class="${isSyncing ? "on" : ""}">${isSyncing ? "已同步我在听的歌" : "同步我在听的歌"}</button>
              </div>
              ${songsHtml}
            `
          }

          async function generatePlaylistForChar() {
            if (!config.apiBase) {
              roche.ui.toast("先在设置里填 API 地址")
              return
            }
            const char = selectedChar
            roche.ui.toast("正在生成…")
            try {
              const personaText = char.persona || char.bio || ""
              const result = await roche.ai.chat({
                messages: [
                  {
                    role: "system",
                    content: `你正在扮演角色"${char.name}"。人设：${personaText}。请按这个人设列出8首ta会喜欢听的中文或英文歌曲，真实存在的歌，不要编造。只输出一个 JSON 数组，格式：[{"name":"歌名","artist":"歌手"}]，不要输出任何别的文字、解释或代码块标记。`
                  },
                  { role: "user", content: "生成歌单" }
                ]
              })
              let text = (result && result.text || "").trim()
              text = text.replace(/^```json/i, "").replace(/^```/, "").replace(/```$/, "").trim()
              let list = []
              try {
                list = JSON.parse(text)
              } catch (e) {
                roche.ui.toast("生成结果解析失败，再试一次")
                return
              }
              const tracks = []
              for (const item of list) {
                if (!item || !item.name) continue
                try {
                  const data = await api("/search", { keywords: `${item.name} ${item.artist || ""}`, limit: 1 })
                  const song = data.result && data.result.songs && data.result.songs[0]
                  if (song) {
                    const artists = (song.ar || song.artists || []).map(a => a.name).join(" / ")
                    const cover = (song.al && song.al.picUrl) || ""
                    tracks.push({ id: song.id, name: song.name, artist: artists || item.artist || "", cover })
                  }
                } catch (e) {}
              }
              if (!tracks.length) {
                roche.ui.toast("没搜到能播放的歌，再试一次")
                return
              }
              charPlaylist = tracks
              await roche.storage.set("charplaylist:" + char.id, JSON.stringify(tracks))
              renderCharDetail()
              roche.ui.toast("生成好了")
            } catch (e) {
              roche.ui.toast("生成失败：" + e.message)
            }
          }

          async function toggleSyncForChar() {
            const char = selectedChar
            const idx = config.syncChars.findIndex(s => s.id === char.id)
            if (idx >= 0) {
              config.syncChars.splice(idx, 1)
              await roche.storage.set("config", config)
              roche.ui.toast("已停止同步")
            } else {
              const conversationId = await resolveConversationId(char)
              if (!conversationId) {
                roche.ui.toast("找不到和这个角色的会话")
                return
              }
              const ok = await roche.ui.confirm({
                title: "同步给 " + (char.handle || char.name),
                message: `开启后，每次你换歌，ta 都会知道你在听什么，确定吗？`
              })
              if (!ok) return
              config.syncChars.push({ id: char.id, conversationId, name: char.handle || char.name })
              await roche.storage.set("config", config)
              roche.ui.toast("已开启同步")
            }
            renderCharDetail()
          }

          async function syncNowPlayingToChars() {
            if (!nowPlaying || !config.syncChars.length) return
            const currentLyric = lyricsLines[lyricsActiveIdx]?.text || lyricsLines[0]?.text || "暂无歌词"
            for (const s of config.syncChars) {
              try {
                await roche.memory.write({
                  conversationId: s.conversationId,
                  summaryText: `用户正在听的歌曲：《${nowPlaying.name}》- ${nowPlaying.artist}。当前歌词：${currentLyric}`,
                  details: {
                    song: nowPlaying.name,
                    artist: nowPlaying.artist,
                    lyric: currentLyric
                  },
                  who: ["用户"],
                  action: "播放音乐",
                  when: "刚刚",
                  where: "网易云插件",
                  source: "plugin"
                })
              } catch (e) {}
            }
          }

          root.querySelector(".nm-gear").onclick = showSettings
          root.querySelector(".nm-close").onclick = () => roche.ui.closeApp()

          themeToggleBtn.onclick = async () => {
            if (config.theme === "dark") config.theme = "light"
            else if (config.theme === "light") config.theme = "clean"
            else config.theme = "dark"
            root.classList.toggle("nm-theme-light", config.theme === "light")
            root.classList.toggle("nm-theme-clean", config.theme === "clean")
            themeToggleBtn.textContent = config.theme === "light" ? "☀" : config.theme === "clean" ? "◻" : "☾"
            await roche.storage.set("config", config)
          }

          root.querySelector(".nm-search-btn").onclick = doSearch
          root.querySelector(".nm-search-input").addEventListener("keydown", (e) => {
            if (e.key === "Enter") doSearch()
          })

          topbarLoginBtn.onclick = async () => {
            if (config.cookie) {
              const ok = await roche.ui.confirm({ title: "退出登录", message: "确定要退出当前账号吗？" })
              if (ok) {
                config.cookie = ""
                config.uid = ""
                config.nickname = ""
                config.avatar = ""
                await roche.storage.set("config", config)
                updateProfileUI()
                playlists = []
                libraryBody.innerHTML = `<div class="nm-empty">登录后可以看到歌单</div>`
              }
              return
            }
            showQrLogin()
          }

          root.querySelectorAll(".nm-tab").forEach(t => {
            t.onclick = () => {
              activeTab = t.dataset.tab
              setActiveTab()
              if (activeTab === "library") loadPlaylists()
              if (activeTab === "char") renderCharList()
            }
          })

          function handleRowClick(e) {
            const rowEl = e.target.closest("[data-action]")
            if (!rowEl) return
            const action = rowEl.dataset.action
            const idx = rowEl.dataset.idx !== undefined ? Number(rowEl.dataset.idx) : null
            if (action === "play") {
              const song = searchResults[idx]
              if (song) {
                const artists = (song.ar || song.artists || []).map(a => a.name).join(" / ")
                const cover = (song.al && song.al.picUrl) || song.picUrl || ""
                playSongById(song.id, song.name, artists, cover, "search", idx)
              }
            } else if (action === "openPlaylist") {
              openPlaylist(idx)
            } else if (action === "playTrack") {
              const song = currentTracks[idx]
              if (song) {
                const artists = (song.ar || []).map(a => a.name).join(" / ")
                const cover = (song.al && song.al.picUrl) || ""
                playSongById(song.id, song.name, artists, cover, "playlist", idx)
              }
            } else if (action === "backToPlaylists") {
              renderPlaylists()
            } else if (action === "openChar") {
              openChar(idx)
            } else if (action === "backToCharList") {
              renderCharList()
            } else if (action === "playCharSong") {
              const song = charPlaylist[idx]
              if (song) playSongById(song.id, song.name, song.artist, song.cover, "char", idx)
            } else if (action === "genPlaylist") {
              generatePlaylistForChar()
            } else if (action === "toggleSync") {
              toggleSyncForChar()
            }
          }
          searchBody.addEventListener("click", handleRowClick)
          libraryBody.addEventListener("click", handleRowClick)
          charBody.addEventListener("click", handleRowClick)

          function togglePlay() {
            if (audioEl.paused) {
              audioEl.play()
              miniToggle.textContent = "❚❚"
              npToggle.textContent = "❚❚"
            } else {
              audioEl.pause()
              miniToggle.textContent = "▶"
              npToggle.textContent = "▶"
            }
          }

          miniToggle.onclick = (e) => { e.stopPropagation(); togglePlay() }
          npToggle.onclick = togglePlay

          mini.addEventListener("click", (e) => {
            if (e.target === miniToggle) return
            np.classList.add("show")
          })

          np.querySelector(".nm-np-collapse").onclick = () => np.classList.remove("show")
          np.querySelector(".nm-np-share").onclick = shareToCharacter
          if (npShareChatBtn) npShareChatBtn.onclick = shareToChatPage
          npLyricsToggleBtn.onclick = () => np.classList.toggle("nm-showlyrics")

          np.querySelector(".nm-np-toggle").onclick = togglePlay

          npProgress.addEventListener("click", (e) => {
            const rect = npProgress.getBoundingClientRect()
            const ratio = (e.clientX - rect.left) / rect.width
            if (audioEl.duration) audioEl.currentTime = ratio * audioEl.duration
          })

          audioEl.addEventListener("timeupdate", updateProgress)
          audioEl.addEventListener("loadedmetadata", updateProgress)

          if (resumedFromBackground && audioEl.dataset.songId) {
            const title = audioEl.dataset.title || ""
            const artist = audioEl.dataset.artist || ""
            const cover = audioEl.dataset.cover || ""
            nowPlaying = { id: audioEl.dataset.songId, name: title, artist, cover }
            nowPlayingSource = null
            nowPlayingIdx = -1
            miniImg.src = cover
            miniTitle.textContent = title
            miniSub.textContent = artist
            mini.style.display = "flex"
            miniToggle.textContent = audioEl.paused ? "▶" : "❚❚"
            npArt.src = cover
            npTitle.textContent = title
            npArtist.textContent = artist
            npToggle.textContent = audioEl.paused ? "▶" : "❚❚"
            bg.style.backgroundImage = cover ? `url(${cover})` : "none"
            loadLyrics(audioEl.dataset.songId)
            updateProgress()
          }

          setActiveTab()
          if (activeTab === "library") loadPlaylists()
          renderSongList(searchBody, searchResults)
        },
        async unmount(container) {
          if (pollTimer) clearInterval(pollTimer)
          if (styleEl) styleEl.remove()
          if (customStyleEl) customStyleEl.remove()
          // 音频元素挂在 document.body 上，这里不清理也不暂停，
          // 如果宿主只是隐藏了这个页面（没有彻底销毁 JS 环境），音乐会继续播放。
          // 如果宿主彻底销毁了页面上下文，这里怎么写都留不住，是平台限制。
          container.replaceChildren()
        }
      }
    ]
  })
})()
