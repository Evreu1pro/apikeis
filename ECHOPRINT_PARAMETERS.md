# EchoPrint AI — Полный список собираемых параметров (50+ сигналов)

## Категория 1: Canvas Fingerprint (5 сигналов)

| # | Параметр | Описание | JS код |
|---|----------|----------|--------|
| 1 | `canvas_2d_text` | Hash рендеринга текста разных шрифтов | `ctx.fillText('CanvasFP 12345🔥', 2, 2)` |
| 2 | `canvas_2d_geometry` | Hash геометрических фигур | `ctx.arc(), ctx.fillRect(), ctx.stroke()` |
| 3 | `canvas_2d_gradients` | Hash градиентов | `ctx.createLinearGradient()` |
| 4 | `canvas_2d_emoji` | Hash рендеринга эмодзи | `ctx.fillText('🔥🌟🎮🎯', x, y)` |
| 5 | `canvas_webgl` | WebGL canvas hash | `gl.readPixels()` |

```javascript
// Пример кода сбора Canvas
function getCanvasFingerprint() {
  const canvas = document.createElement('canvas');
  canvas.width = 400;
  canvas.height = 200;
  const ctx = canvas.getContext('2d');
  
  // Текст
  ctx.textBaseline = 'top';
  ctx.font = '14px Arial';
  ctx.fillStyle = '#f60';
  ctx.fillRect(125, 1, 62, 20);
  ctx.fillStyle = '#069';
  ctx.fillText('CanvasFP 12345🔥', 2, 15);
  
  // Геометрия
  ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
  ctx.beginPath();
  ctx.arc(100, 100, 50, 0, Math.PI * 2);
  ctx.fill();
  
  // Градиент
  const gradient = ctx.createLinearGradient(0, 0, 400, 0);
  gradient.addColorStop(0, 'red');
  gradient.addColorStop(1, 'blue');
  ctx.fillStyle = gradient;
  ctx.fillRect(200, 50, 180, 100);
  
  return canvas.toDataURL(); // -> hash
}
```

---

## Категория 2: WebGL Fingerprint (10 сигналов)

| # | Параметр | Описание | JS код |
|---|----------|----------|--------|
| 6 | `webgl_vendor` | UNMASKED_VENDOR_WEBGL | `gl.getParameter(ext.UNMASKED_VENDOR_WEBGL)` |
| 7 | `webgl_renderer` | UNMASKED_RENDERER_WEBGL | `gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)` |
| 8 | `webgl_extensions` | Список расширений | `gl.getSupportedExtensions()` |
| 9 | `webgl_max_texture_size` | Макс. размер текстуры | `gl.getParameter(gl.MAX_TEXTURE_SIZE)` |
| 10 | `webgl_max_viewport_dims` | Макс. viewport | `gl.getParameter(gl.MAX_VIEWPORT_DIMS)` |
| 11 | `webgl_vertex_shader_precision` | Vertex shader precision | `gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.HIGH_FLOAT)` |
| 12 | `webgl_fragment_shader_precision` | Fragment shader precision | `gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT)` |
| 13 | `webgl_rendered_hash` | Hash рендеринга WebGL сцены | `gl.readPixels()` -> hash |
| 14 | `webgl_max_anisotropy` | Max anisotropy | `ext.maxAnisotropy` |
| 15 | `webgl_parameters` | Остальные параметры | `gl.getParameter()` для 20+ констант |

```javascript
// Пример кода сбора WebGL
function getWebGLFingerprint() {
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  if (!gl) return null;
  
  const ext = gl.getExtension('WEBGL_debug_renderer_info');
  const debugInfo = {
    vendor: ext ? gl.getParameter(ext.UNMASKED_VENDOR_WEBGL) : 'unknown',
    renderer: ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : 'unknown',
    extensions: gl.getSupportedExtensions(),
    maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
    maxViewportDims: gl.getParameter(gl.MAX_VIEWPORT_DIMS),
    maxAnisotropy: gl.getExtension('EXT_texture_filter_anisotropic')?.MAX_TEXTURE_MAX_ANISOTROPY_EXT
  };
  
  return debugInfo;
}
```

---

## Категория 3: AudioContext Fingerprint (4 сигнала)

| # | Параметр | Описание | JS код |
|---|----------|----------|--------|
| 16 | `audio_context_hash` | Hash AudioContext | OscillatorNode + DynamicsCompressor |
| 17 | `audio_sample_rate` | Sample rate | `audioContext.sampleRate` |
| 18 | `audio_max_channel_count` | Max channels | `audioContext.destination.maxChannelCount` |
| 19 | `audio_channel_count` | Channel count | `audioContext.destination.channelCount` |

```javascript
// Пример кода сбора AudioContext
function getAudioFingerprint() {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const analyser = audioContext.createAnalyser();
  const gain = audioContext.createGain();
  const scriptProcessor = audioContext.createScriptProcessor(4096, 1, 1);

  gain.gain.value = 0; // Mute
  oscillator.type = 'triangle';
  oscillator.frequency.value = 10000;

  oscillator.connect(analyser);
  analyser.connect(scriptProcessor);
  scriptProcessor.connect(gain);
  gain.connect(audioContext.destination);

  oscillator.start(0);

  return {
    sampleRate: audioContext.sampleRate,
    maxChannelCount: audioContext.destination.maxChannelCount,
    channelCount: audioContext.destination.channelCount,
    // hash от analyser data
  };
}
```

---

## Категория 4: Fonts Enumeration (3 сигнала)

| # | Параметр | Описание | JS код |
|---|----------|----------|--------|
| 20 | `fonts_available` | Список доступных шрифтов | Canvas measuring 400+ fonts |
| 21 | `fonts_count` | Количество доступных шрифтов | `fonts_available.length` |
| 22 | `fonts_default` | Default fonts detection | Проверка базовых шрифтов |

```javascript
// Пример кода определения шрифтов
async function getFonts() {
  const baseFonts = ['monospace', 'sans-serif', 'serif'];
  const testFonts = [
    'Arial', 'Helvetica', 'Times New Roman', 'Georgia', 'Verdana',
    'Courier New', 'Comic Sans MS', 'Impact', 'Trebuchet MS',
    'Ubuntu', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', // ... 400+ fonts
  ];
  
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const testString = 'mmmmmmmmmmlli';
  const testSize = '72px';
  
  const getWidth = (fontFamily) => {
    ctx.font = `${testSize} ${fontFamily}`;
    return ctx.measureText(testString).width;
  };
  
  const baseWidths = baseFonts.map(f => getWidth(f));
  const availableFonts = [];
  
  for (const font of testFonts) {
    const detected = baseFonts.some((baseFont, i) => {
      ctx.font = `${testSize} '${font}', ${baseFont}`;
      return ctx.measureText(testString).width !== baseWidths[i];
    });
    if (detected) availableFonts.push(font);
  }
  
  return availableFonts;
}
```

---

## Категория 5: WebRTC Leak (3 сигнала)

| # | Параметр | Описание | JS код |
|---|----------|----------|--------|
| 23 | `webrtc_local_ips` | Local IP addresses | RTCPeerConnection |
| 24 | `webrtc_public_ip` | Public IP (если доступен) | STUN server |
| 25 | `webrtc_enabled` | WebRTC доступность | `RTCPeerConnection` support |

```javascript
// Пример кода WebRTC leak detection
async function getWebRTCLeak() {
  return new Promise((resolve) => {
    const ips = [];
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });
    
    pc.createDataChannel('');
    pc.createOffer().then(offer => pc.setLocalDescription(offer));
    
    pc.onicecandidate = (e) => {
      if (!e.candidate) {
        pc.close();
        resolve({ ips, enabled: true });
        return;
      }
      const ipMatch = e.candidate.candidate.match(/(\d{1,3}\.){3}\d{1,3}/);
      if (ipMatch && !ips.includes(ipMatch[0])) {
        ips.push(ipMatch[0]);
      }
    };
    
    setTimeout(() => {
      pc.close();
      resolve({ ips, enabled: true });
    }, 3000);
  });
}
```

---

## Категория 6: Media Devices (3 сигнала)

| # | Параметр | Описание | JS код |
|---|----------|----------|--------|
| 26 | `media_devices_cameras` | Количество камер | `navigator.mediaDevices.enumerateDevices()` |
| 27 | `media_devices_microphones` | Количество микрофонов | `navigator.mediaDevices.enumerateDevices()` |
| 28 | `media_devices_speakers` | Количество динамиков | `navigator.mediaDevices.enumerateDevices()` |

```javascript
// Пример кода MediaDevices
async function getMediaDevices() {
  if (!navigator.mediaDevices?.enumerateDevices) return null;
  
  const devices = await navigator.mediaDevices.enumerateDevices();
  return {
    cameras: devices.filter(d => d.kind === 'videoinput').length,
    microphones: devices.filter(d => d.kind === 'audioinput').length,
    speakers: devices.filter(d => d.kind === 'audiooutput').length,
    deviceLabels: devices.map(d => d.label).filter(Boolean)
  };
}
```

---

## Категория 7: Hardware (8 сигналов)

| # | Параметр | Описание | JS код |
|---|----------|----------|--------|
| 29 | `hardware_concurrency` | CPU cores | `navigator.hardwareConcurrency` |
| 30 | `device_memory` | RAM в GB | `navigator.deviceMemory` |
| 31 | `screen_width` | Ширина экрана | `screen.width` |
| 32 | `screen_height` | Высота экрана | `screen.height` |
| 33 | `screen_avail_width` | Available width | `screen.availWidth` |
| 34 | `screen_avail_height` | Available height | `screen.availHeight` |
| 35 | `screen_color_depth` | Color depth | `screen.colorDepth` |
| 36 | `screen_pixel_ratio` | Device pixel ratio | `window.devicePixelRatio` |
| 37 | `screen_orientation` | Orientation | `screen.orientation.type` |

```javascript
// Пример кода Hardware
function getHardwareInfo() {
  return {
    cpuCores: navigator.hardwareConcurrency,
    memory: navigator.deviceMemory,
    screen: {
      width: screen.width,
      height: screen.height,
      availWidth: screen.availWidth,
      availHeight: screen.availHeight,
      colorDepth: screen.colorDepth,
      pixelRatio: window.devicePixelRatio,
      orientation: screen.orientation?.type,
      maxTouchPoints: navigator.maxTouchPoints
    }
  };
}
```

---

## Категория 8: Navigator & Client Hints (12 сигналов)

| # | Параметр | Описание | JS код |
|---|----------|----------|--------|
| 38 | `user_agent` | User-Agent string | `navigator.userAgent` |
| 39 | `platform` | Platform | `navigator.platform` |
| 40 | `vendor` | Browser vendor | `navigator.vendor` |
| 41 | `language` | Primary language | `navigator.language` |
| 42 | `languages` | All languages | `navigator.languages` |
| 43 | `cookies_enabled` | Cookies enabled | `navigator.cookieEnabled` |
| 44 | `do_not_track` | DNT header | `navigator.doNotTrack` |
| 45 | `ua_ch_mobile` | Sec-CH-UA-Mobile | `navigator.userAgentData.mobile` |
| 46 | `ua_ch_platform` | Sec-CH-UA-Platform | `navigator.userAgentData.platform` |
| 47 | `ua_ch_brands` | Sec-CH-UA brands | `navigator.userAgentData.brands` |
| 48 | `webdriver` | Selenium detection | `navigator.webdriver` |
| 49 | `headless` | Headless detection | `navigator.webdriver || !window.chrome` |

```javascript
// Пример кода Navigator + Client Hints
async function getNavigatorInfo() {
  const nav = navigator;
  const uaData = nav.userAgentData;
  
  return {
    userAgent: nav.userAgent,
    platform: nav.platform,
    vendor: nav.vendor,
    language: nav.language,
    languages: [...nav.languages],
    cookieEnabled: nav.cookieEnabled,
    doNotTrack: nav.doNotTrack,
    webdriver: nav.webdriver,
    userAgentData: uaData ? {
      mobile: uaData.mobile,
      platform: uaData.platform,
      brands: uaData.brands,
      // getHighEntropyValues если доступен
      highEntropy: await uaData.getHighEntropyValues?.([
        'architecture', 'bitness', 'fullVersionList',
        'model', 'platformVersion', 'uaFullVersion'
      ]).catch(() => null)
    } : null
  };
}
```

---

## Категория 9: User-Agent Parsing (5 сигналов)

| # | Параметр | Описание | JS код |
|---|----------|----------|--------|
| 50 | `ua_browser_name` | Browser name | Parser: Chrome, Firefox, Safari... |
| 51 | `ua_browser_version` | Browser version | Parser |
| 52 | `ua_os_name` | OS name | Parser: Windows, macOS, Linux... |
| 53 | `ua_os_version` | OS version | Parser |
| 54 | `ua_device_type` | Device type | Parser: desktop, mobile, tablet |

```javascript
// Пример кода UA Parser
function parseUserAgent(ua) {
  const browserPatterns = [
    { name: 'Chrome', regex: /Chrome\/(\d+)/ },
    { name: 'Firefox', regex: /Firefox\/(\d+)/ },
    { name: 'Safari', regex: /Version\/(\d+).*Safari/ },
    { name: 'Edge', regex: /Edg\/(\d+)/ },
    { name: 'Opera', regex: /OPR\/(\d+)/ },
  ];
  
  const osPatterns = [
    { name: 'Windows', regex: /Windows NT (\d+\.?\d*)/ },
    { name: 'macOS', regex: /Mac OS X (\d+[._]\d+)/ },
    { name: 'Linux', regex: /Linux/ },
    { name: 'Android', regex: /Android (\d+\.?\d*)/ },
    { name: 'iOS', regex: /iPhone OS (\d+[._]\d+)/ },
  ];
  
  // ... parsing logic
  return { browser, os, device };
}
```

---

## Категория 10: Sensors API (3 сигнала)

| # | Параметр | Описание | JS код |
|---|----------|----------|--------|
| 55 | `sensor_accelerometer` | Accelerometer available | `Accelerometer` in window |
| 56 | `sensor_gyroscope` | Gyroscope available | `Gyroscope` in window |
| 57 | `sensor_orientation` | DeviceOrientation available | `DeviceOrientationEvent` |

```javascript
// Пример кода Sensors
async function getSensorsInfo() {
  return {
    accelerometer: 'Accelerometer' in window,
    gyroscope: 'Gyroscope' in window,
    deviceOrientation: 'DeviceOrientationEvent' in window,
    deviceMotion: 'DeviceMotionEvent' in window,
    permission: await DeviceOrientationEvent?.requestPermission?.().catch(() => null)
  };
}
```

---

## Категория 11: Battery & Power (3 сигнала)

| # | Параметр | Описание | JS код |
|---|----------|----------|--------|
| 58 | `battery_level` | Battery level | `navigator.getBattery()` |
| 59 | `battery_charging` | Is charging | `navigator.getBattery()` |
| 60 | `battery_time_remaining` | Time remaining | `navigator.getBattery()` |

```javascript
// Пример кода Battery API
async function getBatteryInfo() {
  if (!navigator.getBattery) return null;
  
  const battery = await navigator.getBattery();
  return {
    level: battery.level,
    charging: battery.charging,
    chargingTime: battery.chargingTime,
    dischargingTime: battery.dischargingTime
  };
}
```

---

## Категория 12: CSS Media Queries (4 сигнала)

| # | Параметр | Описание | JS код |
|---|----------|----------|--------|
| 61 | `prefers_color_scheme` | Dark/Light mode | `matchMedia('(prefers-color-scheme: dark)')` |
| 62 | `prefers_reduced_motion` | Reduced motion preference | `matchMedia('(prefers-reduced-motion: reduce)')` |
| 63 | `prefers_contrast` | Contrast preference | `matchMedia('(prefers-contrast: high)')` |
| 64 | `color_gamut` | Color gamut support | `matchMedia('(color-gamut: p3)')` |

```javascript
// Пример кода Media Queries
function getMediaQueryInfo() {
  const queries = {
    prefersColorScheme: matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
    prefersReducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
    prefersContrast: matchMedia('(prefers-contrast: high)').matches ? 'high' : 'normal',
    colorGamut: [
      matchMedia('(color-gamut: p3)').matches && 'p3',
      matchMedia('(color-gamut: srgb)').matches && 'srgb'
    ].filter(Boolean)[0],
    forcedColors: matchMedia('(forced-colors: active)').matches,
    hover: matchMedia('(hover: hover)').matches ? 'hover' : 'none',
    pointer: matchMedia('(pointer: fine)').matches ? 'fine' : 'coarse'
  };
  return queries;
}
```

---

## Категория 13: Storage APIs (4 сигнала)

| # | Параметр | Описание | JS код |
|---|----------|----------|--------|
| 65 | `local_storage` | LocalStorage available | Try/catch `localStorage.setItem` |
| 66 | `session_storage` | SessionStorage available | Try/catch |
| 67 | `indexed_db` | IndexedDB available | `'indexedDB' in window` |
| 68 | `service_worker` | ServiceWorker support | `'serviceWorker' in navigator` |

```javascript
// Пример кода Storage
function getStorageInfo() {
  const test = (fn) => {
    try { fn(); return true; } catch { return false; }
  };
  
  return {
    localStorage: test(() => localStorage.setItem('test', '1')),
    sessionStorage: test(() => sessionStorage.setItem('test', '1')),
    indexedDB: 'indexedDB' in window,
    serviceWorker: 'serviceWorker' in navigator,
    cookiesEnabled: navigator.cookieEnabled,
    storageQuota: navigator.storage?.estimate?.().then(q => q.quota)
  };
}
```

---

## Категория 14: Performance & Timing (4 сигнала)

| # | Параметр | Описание | JS код |
|---|----------|----------|--------|
| 69 | `performance_timing` | Navigation timing | `performance.getEntriesByType('navigation')` |
| 70 | `performance_memory` | JS heap size | `performance.memory` |
| 71 | `timing_anomaly` | Timing inconsistencies | Comparison checks |
| 72 | `request_idle_callback` | Idle callback support | `'requestIdleCallback' in window` |

```javascript
// Пример кода Performance
function getPerformanceInfo() {
  const timing = performance.getEntriesByType('navigation')[0];
  return {
    domContentLoaded: timing?.domContentLoadedEventEnd - timing?.domContentLoadedEventStart,
    loadComplete: timing?.loadEventEnd - timing?.loadEventStart,
    domInteractive: timing?.domInteractive,
    memory: performance.memory ? {
      usedJSHeapSize: performance.memory.usedJSHeapSize,
      totalJSHeapSize: performance.memory.totalJSHeapSize,
      jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
    } : null,
    timingAnomalies: detectTimingAnomalies()
  };
}
```

---

## Категория 15: Miscellaneous (6 сигналов)

| # | Параметр | Описание | JS код |
|---|----------|----------|--------|
| 73 | `timezone` | Timezone | `Intl.DateTimeFormat().resolvedOptions().timeZone` |
| 74 | `timezone_offset` | Timezone offset | `new Date().getTimezoneOffset()` |
| 75 | `keyboard_layout` | Keyboard layout hints | `navigator.keyboard` |
| 76 | `speech_synthesis_voices` | Available voices | `speechSynthesis.getVoices()` |
| 77 | `connection_type` | Network connection type | `navigator.connection.effectiveType` |
| 78 | `plugins` | Browser plugins | `navigator.plugins` |

```javascript
// Пример кода Misc
function getMiscInfo() {
  return {
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    timezoneOffset: new Date().getTimezoneOffset(),
    keyboard: navigator.keyboard?.getLayoutMap?.(),
    speechVoices: speechSynthesis.getVoices().map(v => ({ lang: v.lang, name: v.name })),
    connection: navigator.connection ? {
      effectiveType: navigator.connection.effectiveType,
      downlink: navigator.connection.downlink,
      rtt: navigator.connection.rtt,
      saveData: navigator.connection.saveData
    } : null,
    plugins: Array.from(navigator.plugins || []).map(p => p.name),
    pdfViewerEnabled: navigator.pdfViewerEnabled,
    javaEnabled: navigator.javaEnabled?.()
  };
}
```

---

## Категория 16: FingerprintJS Integration (2 сигнала)

| # | Параметр | Описание | JS код |
|---|----------|----------|--------|
| 79 | `fpjs_visitor_id` | FingerprintJS visitorId | `FingerprintJS.load().get()` |
| 80 | `fpjs_components` | All FPJS components | `result.components` |

```javascript
// Пример кода FingerprintJS
import FingerprintJS from '@fingerprintjs/fingerprintjs';

async function getFingerprintJS() {
  const fp = await FingerprintJS.load();
  const result = await fp.detect();
  return {
    visitorId: result.visitorId,
    components: result.components // Все компоненты детально
  };
}
```

---

## Итого: 80 сигналов для сбора

Все сигналы собираются **полностью на клиенте**, без отправки данных на сервер.
