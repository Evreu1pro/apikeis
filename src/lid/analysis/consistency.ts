// ============================================================
// EchoPrint AI - Consistency Analysis
// Анализ согласованности и реалистичности fingerprint
// 30+ правил проверки логичности
// ============================================================

import type { FingerprintData, ConsistencyAnalysis, ConsistencyRule } from '../types';

/**
 * Определяет правила проверки согласованности
 */
const CONSISTENCY_RULES: Array<{
  id: string;
  name: string;
  description: string;
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  check: (data: FingerprintData) => { passed: boolean; message: string };
}> = [
  // === USER AGENT CONSISTENCY ===
  {
    id: 'ua_platform_match',
    name: 'UA-Platform соответствие',
    description: 'Проверяет соответствие User-Agent и Platform',
    category: 'user_agent',
    severity: 'high',
    check: (data) => {
      const ua = data.navigator.userAgent.toLowerCase();
      const platform = data.navigator.platform.toLowerCase();
      
      const isWindowsUA = ua.includes('windows');
      const isMacUA = ua.includes('mac') && !ua.includes('mobile');
      const isLinuxUA = ua.includes('linux') && !ua.includes('android');
      const isAndroidUA = ua.includes('android');
      const isIOSUA = ua.includes('iphone') || ua.includes('ipad');
      
      const isWindowsPlatform = platform.includes('win');
      const isMacPlatform = platform.includes('mac');
      const isLinuxPlatform = platform.includes('linux');
      const isIOSPlatform = platform.includes('iphone') || platform.includes('ipad');
      
      let passed = true;
      let message = 'UA и Platform соответствуют';
      
      if (isWindowsUA && !isWindowsPlatform) {
        passed = false;
        message = `UA указывает на Windows, но Platform = ${data.navigator.platform}`;
      } else if (isMacUA && !isMacPlatform) {
        passed = false;
        message = `UA указывает на macOS, но Platform = ${data.navigator.platform}`;
      } else if (isLinuxUA && !isLinuxPlatform) {
        passed = false;
        message = `UA указывает на Linux, но Platform = ${data.navigator.platform}`;
      } else if (isAndroidUA && !isLinuxPlatform) {
        passed = false;
        message = `UA указывает на Android, но Platform = ${data.navigator.platform}`;
      } else if (isIOSUA && !isIOSPlatform && !isMacPlatform) {
        passed = false;
        message = `UA указывает на iOS, но Platform = ${data.navigator.platform}`;
      }
      
      return { passed, message };
    }
  },
  
  {
    id: 'ua_gpu_match',
    name: 'UA-GPU соответствие',
    description: 'Проверяет соответствие OS и GPU',
    category: 'hardware',
    severity: 'medium',
    check: (data) => {
      const ua = data.navigator.userAgent.toLowerCase();
      const renderer = data.webgl.renderer.toLowerCase();
      
      const isMacUA = ua.includes('mac');
      const isWindowsUA = ua.includes('windows');
      const isLinuxUA = ua.includes('linux') && !ua.includes('android');
      
      const hasAppleGPU = renderer.includes('apple') || renderer.includes('m1') || renderer.includes('m2') || renderer.includes('m3');
      const hasNvidiaGPU = renderer.includes('nvidia') || renderer.includes('geforce') || renderer.includes('gtx') || renderer.includes('rtx');
      const hasAMDGPU = renderer.includes('amd') || renderer.includes('radeon');
      const hasIntelGPU = renderer.includes('intel');
      
      let passed = true;
      let message = 'GPU соответствует OS';
      
      // Mac должен иметь Apple GPU
      if (isMacUA && !hasAppleGPU && renderer !== 'unknown') {
        // На старых Mac может быть Intel или AMD
        if (!hasIntelGPU && !hasAMDGPU) {
          passed = false;
          message = `UA указывает на macOS, но GPU = ${data.webgl.renderer}`;
        }
      }
      
      return { passed, message };
    }
  },
  
  {
    id: 'ua_screen_mobile',
    name: 'Мобильный экран',
    description: 'Проверяет соответствие UA и размера экрана для мобильных',
    category: 'screen',
    severity: 'low',
    check: (data) => {
      const ua = data.navigator.userAgent.toLowerCase();
      const { width, height } = data.hardware.screen;
      
      const isMobileUA = ua.includes('mobile') || ua.includes('android') || ua.includes('iphone');
      const isSmallScreen = Math.min(width, height) < 768;
      
      if (isMobileUA && !isSmallScreen && !ua.includes('ipad')) {
        return { passed: false, message: 'Мобильный UA, но десктопный размер экрана' };
      }
      
      return { passed: true, message: 'Размер экрана соответствует устройству' };
    }
  },
  
  // === HARDWARE CONSISTENCY ===
  {
    id: 'cpu_cores_realistic',
    name: 'Реалистичное количество ядер',
    description: 'Проверяет реалистичность количества CPU ядер',
    category: 'hardware',
    severity: 'low',
    check: (data) => {
      const cores = data.hardware.cpuCores;
      
      if (cores === 0) {
        return { passed: false, message: 'Количество ядер = 0 (нереалистично)' };
      }
      
      // Типичные значения: 2, 4, 6, 8, 10, 12, 16, 20, 24, 32, 64
      const commonValues = [1, 2, 4, 6, 8, 10, 12, 14, 16, 20, 24, 32, 48, 64, 128];
      
      if (!commonValues.includes(cores)) {
        return { passed: true, message: `Необычное количество ядер: ${cores}` };
      }
      
      return { passed: true, message: `Количество ядер (${cores}) реалистично` };
    }
  },
  
  {
    id: 'memory_realistic',
    name: 'Реалистичный объём памяти',
    description: 'Проверяет реалистичность объёма RAM',
    category: 'hardware',
    severity: 'low',
    check: (data) => {
      const memory = data.hardware.memory;
      
      if (memory === null) {
        return { passed: true, message: 'Информация о памяти недоступна' };
      }
      
      // deviceMemory возвращает 0.25, 0.5, 1, 2, 4, 8 (GiB)
      const validValues = [0.25, 0.5, 1, 2, 4, 8];
      
      if (!validValues.includes(memory)) {
        return { passed: false, message: `Необычное значение памяти: ${memory} GB` };
      }
      
      return { passed: true, message: `Объём памяти (${memory} GB) реалистичен` };
    }
  },
  
  {
    id: 'screen_resolution_realistic',
    name: 'Реалистичное разрешение',
    description: 'Проверяет реалистичность разрешения экрана',
    category: 'screen',
    severity: 'low',
    check: (data) => {
      const { width, height } = data.hardware.screen;
      
      if (width === 0 || height === 0) {
        return { passed: false, message: 'Нулевое разрешение экрана' };
      }
      
      if (width < 320 || height < 240) {
        return { passed: false, message: `Очень маленькое разрешение: ${width}x${height}` };
      }
      
      if (width > 7680 || height > 4320) {
        return { passed: true, message: `Очень высокое разрешение: ${width}x${height}` };
      }
      
      return { passed: true, message: `Разрешение ${width}x${height} реалистично` };
    }
  },
  
  {
    id: 'pixel_ratio_realistic',
    name: 'Реалистичный pixel ratio',
    description: 'Проверяет реалистичность devicePixelRatio',
    category: 'screen',
    severity: 'low',
    check: (data) => {
      const ratio = data.hardware.screen.pixelRatio;
      
      if (ratio < 1 || ratio > 4) {
        return { passed: false, message: `Необычный pixel ratio: ${ratio}` };
      }
      
      // Типичные значения: 1, 1.25, 1.5, 1.75, 2, 2.5, 3
      return { passed: true, message: `Pixel ratio ${ratio} реалистичен` };
    }
  },
  
  // === BROWSER CONSISTENCY ===
  {
    id: 'browser_engine_match',
    name: 'Браузер-движок соответствие',
    description: 'Проверяет соответствие браузера и движка',
    category: 'browser',
    severity: 'medium',
    check: (data) => {
      const browserName = data.parsedUA.browser.name.toLowerCase();
      const engineName = data.parsedUA.engine.name.toLowerCase();
      
      // Chrome/Edge/Brave/Opera -> Blink
      // Firefox -> Gecko
      // Safari -> WebKit
      
      const blinkBrowsers = ['chrome', 'edge', 'brave', 'opera', 'vivaldi'];
      const geckoBrowsers = ['firefox'];
      const webkitBrowsers = ['safari'];
      
      let passed = true;
      let message = 'Браузер и движок соответствуют';
      
      if (blinkBrowsers.includes(browserName) && engineName !== 'blink') {
        passed = false;
        message = `${browserName} должен использовать Blink, но найден ${engineName}`;
      } else if (geckoBrowsers.includes(browserName) && engineName !== 'gecko') {
        passed = false;
        message = `${browserName} должен использовать Gecko, но найден ${engineName}`;
      } else if (webkitBrowsers.includes(browserName) && engineName !== 'webkit') {
        passed = false;
        message = `${browserName} должен использовать WebKit, но найден ${engineName}`;
      }
      
      return { passed, message };
    }
  },
  
  {
    id: 'browser_version_current',
    name: 'Актуальная версия браузера',
    description: 'Проверяет актуальность версии браузера',
    category: 'browser',
    severity: 'low',
    check: (data) => {
      const browserName = data.parsedUA.browser.name;
      const majorVersion = data.parsedUA.browser.major;
      const currentYear = new Date().getFullYear();
      
      // Примерные актуальные версии на 2024-2025
      const expectedVersions: Record<string, number> = {
        'Chrome': 100,
        'Firefox': 100,
        'Edge': 100,
        'Safari': 15,
        'Opera': 80
      };
      
      const expected = expectedVersions[browserName];
      if (expected && majorVersion < expected - 30) {
        return { passed: true, message: `Устаревшая версия ${browserName}: ${majorVersion}` };
      }
      
      return { passed: true, message: `Версия ${browserName} ${majorVersion} актуальна` };
    }
  },
  
  // === WebGL CONSISTENCY ===
  {
    id: 'webgl_extensions_count',
    name: 'Количество WebGL расширений',
    description: 'Проверяет реалистичность количества расширений',
    category: 'webgl',
    severity: 'low',
    check: (data) => {
      const count = data.webgl.extensions.length;
      
      if (count === 0) {
        return { passed: false, message: 'Нет WebGL расширений (подозрительно)' };
      }
      
      if (count < 10) {
        return { passed: true, message: `Мало расширений (${count}), возможно мобильное устройство` };
      }
      
      if (count > 150) {
        return { passed: true, message: `Много расширений (${count})` };
      }
      
      return { passed: true, message: `${count} WebGL расширений` };
    }
  },
  
  {
    id: 'webgl_max_texture_size',
    name: 'Максимальный размер текстуры',
    description: 'Проверяет реалистичность max texture size',
    category: 'webgl',
    severity: 'low',
    check: (data) => {
      const size = data.webgl.maxTextureSize;
      
      // Типичные значения: 4096, 8192, 16384, 32768
      if (size < 1024) {
        return { passed: false, message: `Очень маленький max texture size: ${size}` };
      }
      
      if (size > 32768) {
        return { passed: true, message: `Очень большой max texture size: ${size}` };
      }
      
      return { passed: true, message: `Max texture size: ${size}` };
    }
  },
  
  // === TIMEZONE CONSISTENCY ===
  {
    id: 'timezone_language_match',
    name: 'Timezone-Language соответствие',
    description: 'Проверяет соответствие timezone и языка',
    category: 'network',
    severity: 'low',
    check: (data) => {
      const tz = data.misc.timezone;
      const lang = data.navigator.language;
      
      // Это не строгая проверка, просто информативная
      const tzLangPairs: Record<string, string[]> = {
        'Europe/Moscow': ['ru', 'ru-RU'],
        'America/New_York': ['en', 'en-US'],
        'Europe/London': ['en', 'en-GB'],
        'Asia/Tokyo': ['ja', 'ja-JP'],
        'Europe/Paris': ['fr', 'fr-FR'],
        'Europe/Berlin': ['de', 'de-DE']
      };
      
      const expectedLangs = tzLangPairs[tz];
      if (expectedLangs && !expectedLangs.some(l => lang.startsWith(l.split('-')[0]))) {
        return { passed: true, message: `Timezone ${tz} не соответствует языку ${lang}` };
      }
      
      return { passed: true, message: `Timezone и язык соответствуют` };
    }
  },
  
  // === FONTS CONSISTENCY ===
  {
    id: 'fonts_os_match',
    name: 'Шрифты-OS соответствие',
    description: 'Проверяет наличие системных шрифтов',
    category: 'fonts',
    severity: 'medium',
    check: (data) => {
      const ua = data.navigator.userAgent.toLowerCase();
      const fonts = data.fonts.available.map(f => f.toLowerCase());
      
      const isWindows = ua.includes('windows');
      const isMac = ua.includes('mac');
      const isLinux = ua.includes('linux') && !ua.includes('android');
      
      let passed = true;
      let message = 'Системные шрифты присутствуют';
      
      if (isWindows) {
        const windowsFonts = ['arial', 'times new roman', 'tahoma', 'verdana', 'segoe ui'];
        const hasWindowsFont = windowsFonts.some(f => fonts.includes(f));
        if (!hasWindowsFont) {
          passed = true; // Не критично, шрифты могли измениться
          message = 'Не найдены типичные Windows шрифты';
        }
      }
      
      if (isMac) {
        const macFonts = ['helvetica', 'sf pro', 'lucida grande', 'geneva'];
        const hasMacFont = macFonts.some(f => fonts.some(ff => ff.includes(f)));
        if (!hasMacFont) {
          passed = true;
          message = 'Не найдены типичные macOS шрифты';
        }
      }
      
      return { passed, message };
    }
  },
  
  // === AUTOMATION DETECTION ===
  {
    id: 'webdriver_flag',
    name: 'WebDriver флаг',
    description: 'Проверяет флаг автоматизации',
    category: 'automation',
    severity: 'critical',
    check: (data) => {
      if (data.navigator.webdriver) {
        return { passed: false, message: 'WebDriver флаг установлен - признак автоматизации' };
      }
      return { passed: true, message: 'WebDriver флаг не установлен' };
    }
  },
  
  {
    id: 'plugins_empty',
    name: 'Отсутствие плагинов',
    description: 'Проверяет наличие плагинов браузера',
    category: 'automation',
    severity: 'low',
    check: (data) => {
      if (data.misc.plugins.length === 0) {
        return { passed: true, message: 'Нет плагинов (норма для современных браузеров)' };
      }
      return { passed: true, message: `${data.misc.plugins.length} плагинов` };
    }
  },
  
  // === CANVAS CONSISTENCY ===
  {
    id: 'canvas_supported',
    name: 'Canvas поддержка',
    description: 'Проверяет поддержку Canvas',
    category: 'canvas',
    severity: 'medium',
    check: (data) => {
      if (!data.canvas.supported) {
        return { passed: false, message: 'Canvas не поддерживается' };
      }
      return { passed: true, message: 'Canvas поддерживается' };
    }
  },
  
  {
    id: 'canvas_hash_valid',
    name: 'Canvas hash валидность',
    description: 'Проверяет валидность Canvas hash',
    category: 'canvas',
    severity: 'medium',
    check: (data) => {
      if (data.canvas.textHash === 'error' || data.canvas.textHash === 'not_supported') {
        return { passed: false, message: 'Canvas hash не может быть вычислен' };
      }
      return { passed: true, message: 'Canvas hash вычислен корректно' };
    }
  },
  
  // === AUDIO CONSISTENCY ===
  {
    id: 'audio_supported',
    name: 'AudioContext поддержка',
    description: 'Проверяет поддержку AudioContext',
    category: 'audio',
    severity: 'low',
    check: (data) => {
      if (!data.audio.supported) {
        return { passed: true, message: 'AudioContext не поддерживается' };
      }
      return { passed: true, message: 'AudioContext поддерживается' };
    }
  },
  
  {
    id: 'audio_sample_rate',
    name: 'Audio sample rate',
    description: 'Проверяет реалистичность sample rate',
    category: 'audio',
    severity: 'low',
    check: (data) => {
      const rate = data.audio.sampleRate;
      if (rate === 0) {
        return { passed: true, message: 'Sample rate неизвестен' };
      }
      
      // Типичные значения: 44100, 48000
      if (rate !== 44100 && rate !== 48000 && rate !== 22050 && rate !== 96000) {
        return { passed: true, message: `Необычный sample rate: ${rate} Hz` };
      }
      
      return { passed: true, message: `Sample rate: ${rate} Hz` };
    }
  },
  
  // === STORAGE CONSISTENCY ===
  {
    id: 'storage_available',
    name: 'Storage доступность',
    description: 'Проверяет доступность storage API',
    category: 'storage',
    severity: 'low',
    check: (data) => {
      if (!data.storage.localStorage && !data.storage.sessionStorage) {
        return { passed: false, message: 'Storage API недоступны' };
      }
      return { passed: true, message: 'Storage API доступны' };
    }
  },
  
  // === TOUCH CONSISTENCY ===
  {
    id: 'touch_points_screen',
    name: 'Touch-экран соответствие',
    description: 'Проверяет соответствие touch points и типа устройства',
    category: 'hardware',
    severity: 'low',
    check: (data) => {
      const touchPoints = data.hardware.maxTouchPoints;
      const { width, height } = data.hardware.screen;
      const isSmallScreen = Math.min(width, height) < 1024;
      
      if (touchPoints > 0 && !isSmallScreen) {
        return { passed: true, message: 'Touch screen на большом экране (возможно планшет или touch-ноутбук)' };
      }
      
      return { passed: true, message: `Touch points: ${touchPoints}` };
    }
  },
  
  // === WEBRTC CONSISTENCY ===
  {
    id: 'webrtc_realistic_ips',
    name: 'WebRTC IP реалистичность',
    description: 'Проверяет реалистичность обнаруженных IP',
    category: 'network',
    severity: 'medium',
    check: (data) => {
      const ips = data.webrtc.localIPs;
      
      if (ips.length > 10) {
        return { passed: false, message: `Слишком много IP адресов: ${ips.length}` };
      }
      
      // Проверяем на suspicious IP
      const hasSuspicious = ips.some(ip => ip.startsWith('0.') || ip === '0.0.0.0');
      if (hasSuspicious) {
        return { passed: false, message: 'Обнаружены подозрительные IP адреса' };
      }
      
      return { passed: true, message: `${ips.length} локальных IP адресов` };
    }
  },
  
  // === COLOR DEPTH ===
  {
    id: 'color_depth_realistic',
    name: 'Color depth',
    description: 'Проверяет реалистичность color depth',
    category: 'screen',
    severity: 'low',
    check: (data) => {
      const depth = data.hardware.screen.colorDepth;
      
      if (depth !== 24 && depth !== 30 && depth !== 32) {
        return { passed: true, message: `Необычный color depth: ${depth}` };
      }
      
      return { passed: true, message: `Color depth: ${depth}-bit` };
    }
  },
  
  // === HEADLESS DETECTION ===
  {
    id: 'headless_chrome',
    name: 'Headless Chrome признаки',
    description: 'Проверяет признаки headless браузера',
    category: 'automation',
    severity: 'high',
    check: (data) => {
      const ua = data.navigator.userAgent.toLowerCase();
      const isChrome = ua.includes('chrome');
      
      // @ts-expect-error - checking chrome object
      const hasWindowChrome = typeof window !== 'undefined' && 'chrome' in window;
      
      if (isChrome && !hasWindowChrome) {
        return { passed: false, message: 'Chrome UA но нет window.chrome - признак headless' };
      }
      
      return { passed: true, message: 'Признаков headless не обнаружено' };
    }
  },
  
  {
    id: 'languages_set',
    name: 'Languages установлены',
    description: 'Проверяет наличие установленных языков',
    category: 'browser',
    severity: 'low',
    check: (data) => {
      if (data.navigator.languages.length === 0) {
        return { passed: false, message: 'Нет установленных языков' };
      }
      return { passed: true, message: `${data.navigator.languages.length} языков` };
    }
  },
  
  // === CLIENT HINTS ===
  {
    id: 'client_hints_consistency',
    name: 'Client Hints согласованность',
    description: 'Проверяет согласованность Client Hints с UA',
    category: 'browser',
    severity: 'medium',
    check: (data) => {
      if (!data.navigator.userAgentData) {
        return { passed: true, message: 'Client Hints не поддерживаются' };
      }
      
      const uaData = data.navigator.userAgentData;
      const ua = data.navigator.userAgent;
      
      // Проверяем platform
      if (uaData.platform) {
        const uaPlatform = uaData.platform.toLowerCase();
        const uaLower = ua.toLowerCase();
        
        if (uaPlatform.includes('windows') && !uaLower.includes('windows')) {
          return { passed: false, message: 'Client Hints platform не соответствует UA' };
        }
        if (uaPlatform.includes('mac') && !uaLower.includes('mac')) {
          return { passed: false, message: 'Client Hints platform не соответствует UA' };
        }
        if (uaPlatform.includes('linux') && !uaLower.includes('linux')) {
          return { passed: false, message: 'Client Hints platform не соответствует UA' };
        }
      }
      
      return { passed: true, message: 'Client Hints согласованы с UA' };
    }
  },
  
  // === VIRTUALIZATION DETECTION ===
  {
    id: 'gpu_virtualization',
    name: 'GPU виртуализация',
    description: 'Проверяет признаки виртуализации GPU',
    category: 'virtualization',
    severity: 'high',
    check: (data) => {
      const renderer = data.webgl.renderer.toLowerCase();
      
      const vmKeywords = [
        'virtualbox', 'vmware', 'parallels', 'qemu', 'virtual',
        'svga', 'gallium', 'llvmpipe', 'swiftshader', 'microsoft basic render'
      ];
      
      const foundKeyword = vmKeywords.find(kw => renderer.includes(kw));
      
      if (foundKeyword) {
        return { passed: false, message: `GPU указывает на виртуализацию: ${foundKeyword}` };
      }
      
      return { passed: true, message: 'Признаков GPU виртуализации не обнаружено' };
    }
  },
  
  // === BATTERY CONSISTENCY ===
  {
    id: 'battery_level',
    name: 'Battery level',
    description: 'Проверяет реалистичность уровня батареи',
    category: 'hardware',
    severity: 'low',
    check: (data) => {
      if (!data.battery.supported) {
        return { passed: true, message: 'Battery API не поддерживается' };
      }
      
      const level = data.battery.level;
      if (level < 0 || level > 1) {
        return { passed: false, message: `Невалидный уровень батареи: ${level}` };
      }
      
      return { passed: true, message: `Battery: ${Math.round(level * 100)}%` };
    }
  },
  
  // === ADDITIONAL CHECKS ===
  {
    id: 'cookie_enabled_match',
    name: 'Cookies доступность',
    description: 'Проверяет согласованность cookieEnabled и Storage',
    category: 'storage',
    severity: 'low',
    check: (data) => {
      if (data.navigator.cookieEnabled && !data.storage.localStorage) {
        return { passed: false, message: 'Cookies включены, но localStorage недоступен' };
      }
      return { passed: true, message: 'Cookies и Storage согласованы' };
    }
  },
  
  {
    id: 'do_not_track_header',
    name: 'DNT заголовок',
    description: 'Проверяет DNT настройку',
    category: 'privacy',
    severity: 'low',
    check: (data) => {
      const dnt = data.navigator.doNotTrack;
      if (dnt === '1') {
        return { passed: true, message: 'Do Not Track включён' };
      }
      return { passed: true, message: `DNT: ${dnt || 'не установлен'}` };
    }
  },
  
  {
    id: 'media_devices_consistency',
    name: 'Media devices согласованность',
    description: 'Проверяет реалистичность media устройств',
    category: 'hardware',
    severity: 'low',
    check: (data) => {
      const { cameras, microphones, speakers } = data.mediaDevices;
      
      if (cameras > 5 || microphones > 10 || speakers > 10) {
        return { passed: true, message: 'Необычно много media устройств' };
      }
      
      return { passed: true, message: `Media: ${cameras} камер, ${microphones} микрофонов` };
    }
  }
];

/**
 * Выполняет анализ согласованности fingerprint
 */
export function analyzeConsistency(data: FingerprintData): ConsistencyAnalysis {
  const rules: ConsistencyRule[] = CONSISTENCY_RULES.map(rule => {
    const result = rule.check(data);
    return {
      id: rule.id,
      name: rule.name,
      description: rule.description,
      category: rule.category,
      severity: rule.severity,
      passed: result.passed,
      message: result.message
    };
  });
  
  const passedRules = rules.filter(r => r.passed).length;
  const totalRules = rules.length;
  
  // Calculate score based on severity
  let score = 100;
  rules.forEach(rule => {
    if (!rule.passed) {
      switch (rule.severity) {
        case 'critical': score -= 20; break;
        case 'high': score -= 10; break;
        case 'medium': score -= 5; break;
        case 'low': score -= 2; break;
      }
    }
  });
  
  score = Math.max(0, Math.min(100, score));
  
  const criticalIssues = rules.filter(r => !r.passed && r.severity === 'critical');
  
  return {
    overallScore: score,
    passedRules,
    totalRules,
    rules,
    criticalIssues
  };
}

/**
 * Интерпретация consistency score
 */
export function interpretConsistencyScore(score: number): {
  level: string;
  description: string;
  riskLevel: 'none' | 'low' | 'medium' | 'high';
} {
  if (score >= 90) {
    return {
      level: 'Отличная согласованность',
      description: 'Все параметры вашего устройства логичны и согласованы. Браузер выглядит реалистично.',
      riskLevel: 'none'
    };
  }
  if (score >= 75) {
    return {
      level: 'Хорошая согласованность',
      description: 'Большинство параметров согласованы. Небольшие несоответствия могут быть связаны с особенностями браузера.',
      riskLevel: 'low'
    };
  }
  if (score >= 50) {
    return {
      level: 'Средняя согласованность',
      description: 'Обнаружены некоторые несоответствия между параметрами. Это может указывать на использование модифицированного браузера или VPN.',
      riskLevel: 'medium'
    };
  }
  return {
    level: 'Низкая согласованность',
    description: 'Обнаружены серьёзные несоответствия. Это может указывать на виртуализацию, эмуляцию или использование anti-fingerprinting инструментов.',
    riskLevel: 'high'
  };
}
