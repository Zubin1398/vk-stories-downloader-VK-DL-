// ==UserScript==
// @name         VK Stories Video Downloader (CSP Bypass)
// @namespace    http://tampermonkey.net/
// @version      3.1
// @description  Скачивает видео из историй ВКонтакте — обход CSP
// @match        https://vk.com/*
// @match        https://*.vk.com/*
// @match        https://vk.ru/*
// @match        https://*.vk.ru/*
// @grant        GM_download
// @grant        GM_xmlhttpRequest
// @grant        unsafeWindow
// @connect      *
// @run-at       document-start
// @inject-into  page
// ==/UserScript==

(function () {
  "use strict";

  // === Защита от повторного запуска ===
  if (window.__vkDLRunning) return;
  window.__vkDLRunning = true;

  function injectIntoPage() {
    const actualCode = "(" + realFunction.toString() + ")();";
    const script = document.createElement("script");
    script.textContent = actualCode;
    script.setAttribute("data-csp-bypass", "1");
    (document.head || document.documentElement || document).appendChild(script);
    script.remove();
  }

  function realFunction() {
    // Защита от повторного запуска внутри страницы
    if (window.__vkDLInner) return;
    window.__vkDLInner = true;

    const STYLE = `
      .vkdl-btn {
        position: fixed !important;
        bottom: 20px !important;
        left: 20px !important;
        right: auto !important;
        z-index: 2147483647 !important;
        background: #4BB34B !important;
        color: white !important;
        border: 3px solid red !important;
        border-radius: 50% !important;
        width: 60px !important;
        height: 60px !important;
        cursor: pointer !important;
        box-shadow: 0 0 20px rgba(255,0,0,0.8) !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        font-size: 28px !important;
        font-weight: bold !important;
      }
      .vkdl-btn:hover {
        background: #ff0000 !important;
        transform: scale(1.1) !important;
      }
      .vkdl-btn.downloading {
        background: #FFA000 !important;
        pointer-events: none !important;
      }
      .vkdl-panel {
        position: fixed !important;
        bottom: 90px !important;
        left: 20px !important;
        right: auto !important;
        z-index: 2147483646 !important;
        background: #1a1a2e !important;
        color: #eee !important;
        border-radius: 10px !important;
        box-shadow: 0 0 25px rgba(0,0,0,0.6) !important;
        width: 400px !important;
        max-height: 450px !important;
        overflow-y: auto !important;
        font-family: 'Segoe UI', sans-serif !important;
        font-size: 13px !important;
        display: none !important;
      }
      .vkdl-panel.show { display: block !important; }
      .vkdl-header {
        background: #16213e !important;
        padding: 14px 18px !important;
        border-radius: 10px 10px 0 0 !important;
        font-weight: bold !important;
        font-size: 15px !important;
        display: flex !important;
        justify-content: space-between !important;
        align-items: center !important;
      }
      .vkdl-close {
        background: none !important;
        border: none !important;
        color: #fff !important;
        font-size: 20px !important;
        cursor: pointer !important;
      }
      .vkdl-clear {
        background: #e53935 !important;
        border: none !important;
        color: #fff !important;
        padding: 4px 10px !important;
        border-radius: 4px !important;
        cursor: pointer !important;
        font-size: 12px !important;
        font-weight: bold !important;
      }
      .vkdl-clear:hover { background: #c62828 !important; }
      .vkdl-item {
        padding: 12px 18px !important;
        border-bottom: 1px solid #2a2a4a !important;
        cursor: pointer !important;
        display: flex !important;
        gap: 12px !important;
        align-items: flex-start !important;
      }
      .vkdl-item:hover { background: #2a2a4a !important; }
      .vkdl-num {
        color: #fff !important;
        background: linear-gradient(135deg, #4BB34B, #2E7D32) !important;
        font-weight: 900 !important;
        font-size: 16px !important;
        min-width: 32px !important;
        height: 32px !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        border-radius: 8px !important;
        box-shadow: 0 2px 6px rgba(0,0,0,0.4) !important;
        flex-shrink: 0 !important;
        border: 2px solid rgba(255,255,255,0.3) !important;
      }
      .vkdl-item-content { flex: 1 !important; min-width: 0 !important; }
      .vkdl-item-url {
        color: #aaa !important;
        word-break: break-all !important;
        font-size: 11px !important;
        font-family: monospace !important;
      }
      .vkdl-item-actions {
        display: flex !important;
        gap: 6px !important;
        margin-top: 8px !important;
      }
      .vkdl-act {
        color: white !important;
        border: none !important;
        padding: 5px 14px !important;
        border-radius: 4px !important;
        cursor: pointer !important;
        font-size: 11px !important;
        font-weight: bold !important;
      }
      .vkdl-act.dl { background: #4BB34B !important; }
      .vkdl-act.open { background: #2196F3 !important; }
      .vkdl-act.copy { background: #FF9800 !important; }
      .vkdl-empty {
        padding: 25px !important;
        text-align: center !important;
        color: #666 !important;
      }
      .vkdl-status {
        position: fixed !important;
        top: 10px !important;
        left: 10px !important;
        z-index: 2147483645 !important;
        background: rgba(0,0,0,0.85) !important;
        color: #0f0 !important;
        padding: 8px 14px !important;
        border-radius: 6px !important;
        font-family: sans-serif !important;
        font-size: 13px !important;
        border: 1px solid #0f0 !important;
      }
    `;

    const styleEl = document.createElement("style");
    styleEl.textContent = STYLE;
    document.documentElement.appendChild(styleEl);

    // === Логирование — без постоянного обновления DOM ===
    let statusEl = null;
    let videoCount = 0;

    function setStatus(msg) {
      if (!statusEl) {
        statusEl = document.createElement("div");
        statusEl.className = "vkdl-status";
        document.body.appendChild(statusEl);
      }
      statusEl.textContent = msg;
    }

    setStatus("✅ VK DL запущен");
    console.log("[VK DL] ✅ Скрипт работает!");

    setTimeout(() => { if (statusEl) statusEl.style.display = "none"; }, 4000);

    // === Кнопка ===
    const btn = document.createElement("button");
    btn.className = "vkdl-btn";
    btn.innerHTML = "⬇";
    btn.title = "Скачать видео";
    document.body.appendChild(btn);

    // === Панель ===
    const panel = document.createElement("div");
    panel.className = "vkdl-panel";
    panel.innerHTML = `
      <div class="vkdl-header">
        <span>🎬 Видео</span>
        <div style="display:flex;gap:8px;align-items:center;">
          <button class="vkdl-clear" id="vkdl-clear">🗑 Очистить</button>
          <button class="vkdl-close" id="vkdl-x">✕</button>
        </div>
      </div>
      <div id="vkdl-list"></div>
    `;
    document.body.appendChild(panel);

    document.getElementById("vkdl-x").addEventListener("click", () => {
      panel.classList.remove("show");
    });

    document.getElementById("vkdl-clear").addEventListener("click", () => {
      found.clear();
      videoList.length = 0;
      videoCount = 0;
      renderList();
      setStatus("✅ Список очищен");
      setTimeout(() => { if (statusEl) statusEl.style.display = "none"; }, 2000);
      console.log("[VK DL] ✅ Список очищен");
    });

    btn.addEventListener("click", () => {
      panel.classList.toggle("show");
    });

    // === Видео ===
    const found = new Set();
    const videoList = [];

    function addVideo(url) {
      try { url = decodeURIComponent(url); } catch (e) {}
      if (found.has(url) || !url || url.length < 10) return;

      found.add(url);
      videoList.push(url);
      videoCount++;
      console.log("[VK DL] 🎬 Видео:", url.substring(0, 100));

      renderList();
      setStatus(`🎬 Найдено: ${videoCount}`);
    }

    function renderList() {
      const c = document.getElementById("vkdl-list");
      if (!c) return;
      c.innerHTML = "";

      if (videoList.length === 0) {
        c.innerHTML = `<div class="vkdl-empty">Видео не найдено.<br><small>Откройте историю с видео</small></div>`;
        return;
      }

      videoList.forEach((url, i) => {
        const short = url.length > 80 ? url.substring(0, 80) + "..." : url;
        const item = document.createElement("div");
        item.className = "vkdl-item";
        item.innerHTML = `
          <div class="vkdl-num">${i + 1}</div>
          <div class="vkdl-item-content">
            <div class="vkdl-item-url">${short}</div>
            <div class="vkdl-item-actions">
              <button class="vkdl-act dl">⬇ Скачать</button>
              <button class="vkdl-act open">↗ Открыть</button>
              <button class="vkdl-act copy">📋 Копировать</button>
            </div>
          </div>
        `;
        c.appendChild(item);
      });

      c.querySelectorAll(".vkdl-act").forEach(el => {
        el.addEventListener("click", (e) => {
          e.stopPropagation();
          const url = el.closest(".vkdl-item").querySelector(".vkdl-item-url").textContent;
          const fullUrl = videoList.find(v => v.includes(url.substring(0, 40))) || url;

          if (el.classList.contains("dl") || el.classList.contains("open")) {
            window.open(fullUrl, "_blank");
          } else if (el.classList.contains("copy")) {
            navigator.clipboard.writeText(fullUrl).then(() => {
              el.textContent = "✅ Готово!";
              setTimeout(() => { el.textContent = "📋 Копировать"; }, 2000);
            });
          }
        });
      });
    }

    renderList();

    // === Перехват fetch (только один раз!) ===
    const origFetch = window.fetch;
    window.fetch = async function (...args) {
      const url = typeof args[0] === "string" ? args[0] : args[0]?.url || "";
      const response = await origFetch.apply(this, args);

      try {
        if (url.includes("video") || url.includes("story") || url.includes("al_")) {
          const clone = response.clone();
          const text = await clone.text();
          searchInText(text);
        }
      } catch (e) {}

      return response;
    };

    // === Перехват XHR (только один раз!) ===
    const origOpen = XMLHttpRequest.prototype.open;
    const origSend = XMLHttpRequest.prototype.send;

    XMLHttpRequest.prototype.open = function (method, url, ...rest) {
      this._vkurl = url;
      return origOpen.apply(this, [method, url, ...rest]);
    };

    XMLHttpRequest.prototype.send = function (...args) {
      this.addEventListener("readystatechange", function () {
        if (this.readyState === 4 && this._vkurl) {
          if (this._vkurl.includes("video") || this._vkurl.includes("story") || this._vkurl.includes("al_")) {
            try {
              searchInText(this.responseText);
            } catch (e) {}
          }
        }
      });
      return origSend.apply(this, args);
    };

    // === Поиск URL ===
    function searchInText(text) {
      if (!text) return;

      const patterns = [
        /https?:\/\/[^\\\s"')]+\.mp4(\?[^\\\s"')]+)?/gi,
        /https?:\/\/[^\\\s"')]+\.m3u8(\?[^\\\s"')]+)?/gi,
        /https?:\/\/(sun\d+|psv|vkvideo|cs\d+)[^\\\s"')]+\.mp4(\?[^\\\s"')]+)?/gi,
      ];

      for (let p = 0; p < patterns.length; p++) {
        let m;
        const pattern = patterns[p];
        pattern.lastIndex = 0;
        while ((m = pattern.exec(text)) !== null) {
          const url = m[1] || m[0];
          if (url.startsWith("http")) addVideo(url);
        }
      }
    }

    // === Проверка <video> — с троттлингом ===
    let lastCheck = 0;
    function checkVideoElements() {
      const now = Date.now();
      if (now - lastCheck < 3000) return;
      lastCheck = now;

      document.querySelectorAll("video").forEach(v => {
        const src = v.src || v.currentSrc || "";
        if (src && src.startsWith("http") && !src.includes("blob:")) {
          addVideo(src);
        }
      });
    }

    // === MutationObserver — лёгкий ===
    let checkScheduled = false;
    const observer = new MutationObserver(() => {
      if (checkScheduled) return;
      checkScheduled = true;
      requestAnimationFrame(() => {
        checkScheduled = false;
        checkVideoElements();
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: false
    });

    // Минимальная периодическая проверка
    setInterval(checkVideoElements, 5000);

    console.log("[VK DL] ✅ Готово! Откройте историю с видео");
  }

  // === Запуск ===
  function tryInject() {
    if (document.body) {
      injectIntoPage();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", tryInject);
  } else {
    tryInject();
  }

  // Одна повторная попытка через 2 сек
  setTimeout(tryInject, 2000);
})();
