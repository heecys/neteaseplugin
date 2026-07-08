;(function () {
  const ROOT = "roche-plugin-netease-music"
  let audioEl = null
  let styleEl = null

  // 严丝合缝适配 Roche 的网易云深色系极简 UI
  const CSS = `
.${ROOT} {
  position: absolute; inset: 0; display: flex; flex-direction: column; background: #0b0b0c; color: #f2f2f2;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 14px; overflow: hidden;
  padding-top: max(24px, env(safe-area-inset-top)); padding-bottom: max(12px, env(safe-area-inset-bottom));
}
.${ROOT} * { box-sizing: border-box; }
.${ROOT} button { background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.12); color: #fff; border-radius: 12px; padding: 6px 14px; cursor: pointer; font-size: 13px; transition: background 0.2s; }
.${ROOT} button:active { background: rgba(255,255,255,0.16); }
.${ROOT} .nm-topbar { position: relative; z-index: 1; display: flex; align-items: center; gap: 12px; padding: 12px 16px; flex-shrink: 0; }
.${ROOT} .nm-round { width: 34px; height: 34px; padding: 0; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.${ROOT} .nm-title-text { flex: 1; font-weight: bold; font-size: 16px; letter-spacing: -0.2px; }
.${ROOT} .nm-body { flex: 1; min-height: 0; overflow-y: auto; padding: 12px; position: relative; }
.${ROOT} .nm-row { display: flex; align-items: center; gap: 12px; padding: 10px 8px; border-radius: 12px; cursor: pointer; transition: background 0.2s; }
.${ROOT} .nm-row:active { background: rgba(255,255,255,0.06); }
.${ROOT} .nm-row img { width: 46px; height: 46px; border-radius: 8px; object-fit: cover; background: #222; }
.${ROOT} .nm-row .nm-meta { flex: 1; min-width: 0; }
.${ROOT} .nm-row .nm-title { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-weight: 500; }
.${ROOT} .nm-row .nm-sub { color: rgba(255,255,255,0.45); font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 3px; }
.${ROOT} .nm-empty { color: rgba(255,255,255,0.35); text-align: center; padding: 60px 20px; font-size: 13px; }
.${ROOT} .nm-miniplayer { flex-shrink: 0; margin: 8px 12px; border-radius: 16px; padding: 10px; display: none; align-items: center; gap: 12px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.08); backdrop-filter: blur(20px); }
.${ROOT} .nm-miniplayer img { width: 40px; height: 40px; border-radius: 8px; }
.${ROOT} .nm-miniplayer .nm-mp-meta { flex: 1; min-width: 0; }
.${ROOT} .nm-miniplayer .nm-mp-title { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-size: 13px; font-weight: 500; }
.${ROOT} .nm-miniplayer .nm-mp-sub { color: rgba(255,255,255,0.4); font-size: 11px; margin-top: 2px; }
.${ROOT} .nm-miniplayer .nm-mp-toggle { font-size: 14px; width: 36px; height: 36px; padding: 0; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
.${ROOT} .nm-modal-mask { position: fixed; inset: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(10px); display: flex; align-items: center; justify-content: center; z-index: 999; }
.${ROOT} .nm-modal-box { background: #1c1c1e; border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; padding: 24px; text-align: center; width: 290px; box-shadow: 0 12px 30px rgba(0,0,0,0.5); }
.${ROOT} .nm-modal-box input { width: 100%; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); color: #fff; border-radius: 10px; padding: 9px 12px; font-size: 13px; margin-bottom: 14px; outline: none; }
.${ROOT} .nm-modal-box input:focus { border-color: #ea4335; }
.${ROOT} .nm-qrcode-wrap { width: 180px; height: 180px; background: #fff; margin: 12px auto; padding: 10px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
.${ROOT} .nm-qrcode-wrap img { width: 100%; height: 100%; object-fit: contain; }
`

  window.RochePlugin.register({
    id: "netease-music-app",
    name: "网易云音乐",
    version: "1.2.0",
    apps: [
      {
        id: "netease-player",
        name: "网易云音乐",
        icon: "music_note",
        async mount(container, roche) {
          styleEl = document.createElement("style")
          styleEl.textContent = CSS
          document.head.appendChild(styleEl)

          let config = (await roche.storage.get("nm_config")) || { apiBase: "http://localhost:3000" }
          let playlists = []
          let currentTracks = []
          let isViewingTracks = false
          let qrTimer = null
          let userProfile = null

          function escapeHtml(str) {
            return String(str || "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]))
          }

          container.innerHTML = `
            <div class="${ROOT}">
              <div class="nm-topbar">
                <button class="nm-round nm-gear" title="设置服务器">⚙</button>
                <div class="nm-title-text">我的网易云音乐</div>
                <button class="nm-login-btn">登录</button>
                <button class="nm-round nm-close" title="退出">✕</button>
              </div>
              <div class="nm-body"></div>
              <div class="nm-miniplayer">
                <img src="" />
                <div class="nm-mp-meta">
                  <div class="nm-mp-title"></div>
                  <div class="nm-mp-sub"></div>
                </div>
                <button class="nm-mp-toggle">❚❚</button>
              </div>
            </div>
          `

          const root = container.querySelector(`.${ROOT}`)
          const body = root.querySelector(".nm-body")
          const mini = root.querySelector(".nm-miniplayer")
          const miniImg = mini.querySelector("img")
          const miniTitle = mini.querySelector(".nm-mp-title")
          const miniSub = mini.querySelector(".nm-mp-sub")
          const miniToggle = mini.querySelector(".nm-mp-toggle")
          const loginBtn = root.querySelector(".nm-login-btn")

          audioEl = document.createElement("audio")
          root.appendChild(audioEl)

          // 核心网络请求包装（带上本地凭证支持跨域）
          async function api(path, params = {}) {
            if (!config.apiBase) { showSettings(); throw new Error("no_api_base") }
            const usp = new URLSearchParams(params)
            usp.set("timestamp", Date.now().toString())
            // 保持持久化 Cookie 登录状态的关键参数
            usp.set("cookie", localStorage.getItem("__nm_cookie") || "")
            
            const url = `${config.apiBase.replace(/\/+$/, "")}${path}?${usp.toString()}`
            const res = await fetch(url, { method: "POST" === path.toUpperCase() ? "POST" : "GET" })
            const data = await res.json()
            
            if (data.cookie) {
              localStorage.setItem("__nm_cookie", data.cookie)
            }
            return data
          }

          function renderPlaylists() {
            isViewingTracks = false
            if (!playlists.length) {
              body.innerHTML = `<div class="nm-empty">请确保本地服务启动，并点击右上角登录账号</div>`
              return
            }
            body.innerHTML = playlists.map((item, idx) => `
              <div class="nm-row" data-action="openPlaylist" data-idx="${idx}">
                <img src="${item.coverImgUrl || ""}?param=100y100" />
                <div class="nm-meta">
                  <div class="nm-title">${escapeHtml(item.name)}</div>
                  <div class="nm-sub">${item.trackCount || 0} 首 · by ${escapeHtml(item.creator.nickname)}</div>
                </div>
              </div>
            `).join("")
          }

          function renderTracks(playlistName) {
            isViewingTracks = true
            body.innerHTML = `
              <div class="nm-row" data-action="back">
                <div class="nm-meta"><div class="nm-title" style="color:#ea4335;">← 返回歌单列表 (${escapeHtml(playlistName)})</div></div>
              </div>
            ` + currentTracks.map((item, idx) => {
              const artists = (item.ar || []).map(a => a.name).join(" / ")
              return `
                <div class="nm-row" data-action="play" data-idx="${idx}">
                  <img src="${(item.al && item.al.picUrl) || ''}?param=100y100" />
                  <div class="nm-meta">
                    <div class="nm-title">${escapeHtml(item.name)}</div>
                    <div class="nm-sub">${escapeHtml(artists)} - ${escapeHtml(item.al?.name)}</div>
                  </div>
                </div>
              `
            }).join("")
          }

          async function checkLoginStatus() {
            try {
              const status = await api("/login/status")
              if (status.data && status.data.profile) {
                userProfile = status.data.profile
                loginBtn.textContent = userProfile.nickname
                loadUserPlaylists(userProfile.userId)
              } else {
                loginBtn.textContent = "登录"
                renderPlaylists()
              }
            } catch (e) {
              renderPlaylists()
            }
          }

          async function loadUserPlaylists(uid) {
            try {
              const data = await api("/user/playlist", { uid })
              playlists = data.playlist || []
              renderPlaylists()
            } catch (e) { roche.ui.toast("加载歌单失败") }
          }

          // 核心：全自动双端扫码登录闭环逻辑
          async function startQrLogin() {
            try {
              roche.ui.toast("正在生成登录二维码...")
              const keyData = await api("/login/qr/key")
              const key = keyData.data.unikey
              
              const qrCodeData = await api("/login/qr/create", { key, qrimg: "true" })
              const qrimg = qrCodeData.data.qrimg

              const mask = document.createElement("div")
              mask.className = "nm-modal-mask"
              mask.innerHTML = `
                <div class="nm-modal-box">
                  <div style="font-weight:bold; font-size:15px;">网易云扫码登录</div>
                  <div class="nm-qrcode-wrap"><img src="${qrimg}" /></div>
                  <div style="font-size:12px; color:rgba(255,255,255,0.4); margin-bottom:12px;">请使用网易云音乐App扫码</div>
                  <button class="nm-qr-cancel" style="width:100%; background:rgba(255,255,255,0.05)">取消</button>
                </div>
              `
              root.appendChild(mask)

              const cleanTimer = () => { if (qrTimer) { clearInterval(qrTimer); qrTimer = null; } }
              
              mask.querySelector(".nm-qr-cancel").onclick = () => {
                cleanTimer()
                mask.remove()
              }

              qrTimer = setInterval(async () => {
                try {
                  const check = await api("/login/qr/check", { key })
                  if (check.code === 801) { /* 等待扫码 */ }
                  if (check.code === 802) { roche.ui.toast("已扫描，请在手机上确认") }
                  if (check.code === 803) {
                    cleanTimer()
                    roche.ui.toast("登录成功！")
                    mask.remove()
                    // 刷新状态存储 Cookie
                    if(check.cookie) localStorage.setItem("__nm_cookie", check.cookie)
                    await checkLoginStatus()
                  }
                } catch (err) { cleanTimer() }
              }, 3000)

            } catch (e) { roche.ui.toast("生成二维码失败：" + e.message) }
          }

          // 全局点击事件委托
          root.addEventListener("click", async (e) => {
            const row = e.target.closest(".nm-row")
            if (!row) return
            const action = row.dataset.action
            const idx = Number(row.dataset.idx)

            if (action === "openPlaylist") {
              const pl = playlists[idx]
              try {
                const data = await api("/playlist/track/all", { id: pl.id })
                currentTracks = data.songs || []
                renderTracks(pl.name)
              } catch (e) { roche.ui.toast("读取歌曲失败") }
            } else if (action === "back") {
              renderPlaylists()
            } else if (action === "play") {
              const song = currentTracks[idx]
              try {
                const data = await api("/song/url/v1", { id: song.id, level: "standard" })
                const url = data.data && data.data[0] && data.data[0].url
                if (!url) return roche.ui.toast("VIP或无版权歌曲，暂无法播放")
                audioEl.src = url
                audioEl.play()
                miniImg.src = song.al.picUrl + "?param=100y100"
                miniTitle.textContent = song.name
                miniSub.textContent = song.ar.map(a => a.name).join(" / ")
                mini.style.display = "flex"
                miniToggle.textContent = "❚❚"
              } catch (e) { roche.ui.toast("音频加载失败") }
            }
          })

          miniToggle.onclick = () => {
            if (audioEl.paused) { audioEl.play(); miniToggle.textContent = "❚❚" }
            else { audioEl.pause(); miniToggle.textContent = "▶" }
          }

          loginBtn.onclick = () => {
            if (userProfile) {
              if(confirm(`确定退出账号 ${userProfile.nickname} 吗？`)) {
                localStorage.removeItem("__nm_cookie")
                userProfile = null
                playlists = []
                loginBtn.textContent = "登录"
                renderPlaylists()
              }
            } else {
              startQrLogin()
            }
          }

          function showSettings() {
            const mask = document.createElement("div")
            mask.className = "nm-modal-mask"
            mask.innerHTML = `
              <div class="nm-modal-box">
                <div style="margin-bottom:14px; font-weight:bold;">本地服务设置</div>
                <input class="nm-in-api" placeholder="本地 API 地址" value="${escapeHtml(config.apiBase)}" />
                <button class="nm-save" style="width:100%; background:#ea4335;">保存并检查</button>
                <button class="nm-cancel" style="width:100%; margin-top:8px; background:transparent; border:none;">取消</button>
              </div>
            `
            root.appendChild(mask)
            mask.querySelector(".nm-cancel").onclick = () => mask.remove()
            mask.querySelector(".nm-save").onclick = async () => {
              config.apiBase = mask.querySelector(".nm-in-api").value.trim()
              await roche.storage.set("nm_config", config)
              mask.remove()
              checkLoginStatus()
            }
          }

          root.querySelector(".nm-gear").onclick = showSettings
          root.querySelector(".nm-close").onclick = () => roche.ui.closeApp()

          // 自动启动流
          checkLoginStatus()
        },
        async unmount(container) {
          if (audioEl) audioEl.pause()
          if (styleEl) styleEl.remove()
          if (qrTimer) clearInterval(qrTimer)
          container.replaceChildren()
        }
      }
    ]
  })
})()