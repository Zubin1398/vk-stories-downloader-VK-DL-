````md
# VK Stories Video Downloader

## Project Overview

Пользовательский скрипт для Tampermonkey/Greasemonkey, предназначенный для загрузки видео из VK Stories.

Скрипт обходит Content Security Policy (CSP) ВКонтакте, внедряя код непосредственно в контекст страницы. Это позволяет перехватывать сетевые запросы и извлекать прямые URL-адреса видео.

---

## Key Features

- Перехват `fetch` и `XMLHttpRequest` для получения URL-адресов видео
- Автоматическое обнаружение элементов `<video>` в DOM
- Поддержка доменов:
  - `vk.com`
  - `*.vk.com`
  - `vk.ru`
  - `*.vk.ru`
- Зеленая пульсирующая кнопка в левом нижнем углу
- Панель управления видео:
  - `Download`
  - `Open`
  - `Copy URL`
  - `Clear List`
- Поддержка:
  - `.mp4`
  - `.m3u8`
  - CDN-адресов VK (`sun*`, `psv*`, `vkvideo*`, `cs*`)

---

# Installation

## 1. Установите Tampermonkey

- Chrome — [Chrome Web Store](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
- Firefox — [Firefox Add-ons](https://addons.mozilla.org/firefox/addon/tampermonkey/)
- Edge — [Microsoft Edge Add-ons](https://microsoftedge.microsoft.com/addons/detail/tampermonkey/iikmkjmpaadaobahmlepeloendndfphd)

## 2. Установите скрипт

Откройте файл:

```text
vk-stories-downloader.user.js
```

Tampermonkey автоматически предложит установить скрипт.

## 3. Проверьте настройки браузера

Убедитесь, что:
- включены пользовательские скрипты
- активирован Developer Mode

---

# Usage

1. Откройте VK Stories
2. В левом нижнем углу появится зеленая кнопка
3. Нажмите на неё для открытия панели Video Downloader
4. Скрипт автоматически обнаружит все видео на странице

Для каждого видео доступны действия:

- **Download** — открыть URL для загрузки
- **Open** — открыть видео напрямую
- **Copy URL** — скопировать ссылку
- **Clear List** — очистить список видео

---

# Technical Details

## How It Works

### 1. CSP Bypass

Скрипт использует `document-start injection` и внедряет `<script>` напрямую в контекст страницы, что позволяет выполнять код вне sandbox-контекста расширения.

### 2. Network Interception

Перехватываются:

```js
window.fetch
XMLHttpRequest.prototype.open
XMLHttpRequest.prototype.send
```

Для анализа ответов API, содержащих:

```text
video
story
al_
```

### 3. URL Extraction

Используются регулярные выражения для поиска:

- `.mp4`
- `.m3u8`
- CDN URL:
  - `sun*`
  - `psv*`
  - `vkvideo*`
  - `cs*`

### 4. DOM Monitoring

Используется:

```js
MutationObserver
```

совместно с:

```js
requestAnimationFrame
```

для обнаружения динамически добавляемых элементов `<video>`.

---

# Performance Optimizations

- Защита от повторного запуска:

```js
window.__vkDLRunning
window.__vkDLInner
```

- Ограниченные проверки DOM
- Минимальная нагрузка на страницу
- `requestAnimationFrame` throttling
- Минимальный debug output

---

# Technologies

- JavaScript (ES6+)
- Tampermonkey / Greasemonkey API
- React-based VK SPA interface

---

# Version History

| Version | Notes |
|----------|-------|
| 1.0 | Базовый fetch/XHR interception |
| 2.0 | Добавлена debug panel и document-start injection |
| 3.0 | CSP bypass через page-context injection |
| 3.1 | Оптимизация производительности, anti-lag fixes, clear button |
````
