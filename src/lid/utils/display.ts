// ============================================================
// EchoPrint AI - Display Utils
// Утилиты для отображения данных
// ============================================================

import type { FingerprintData, ParameterDisplay, CategoryGroup } from '../types';

/**
 * Конвертирует FingerprintData в категории для отображения
 */
export function fingerprintToCategories(data: FingerprintData): CategoryGroup[] {
  const categories: CategoryGroup[] = [];

  // Canvas
  categories.push({
    id: 'canvas',
    name: 'Canvas Fingerprint',
    icon: '🎨',
    status: data.canvas.supported ? 'normal' : 'danger',
    parameters: [
      {
        id: 'canvas_text',
        name: 'Canvas Text Hash',
        value: data.canvas.textHash,
        status: 'normal',
        category: 'canvas',
        rarity: 90,
        description: 'Хеш рендеринга текста'
      },
      {
        id: 'canvas_geometry',
        name: 'Canvas Geometry Hash',
        value: data.canvas.geometryHash,
        status: 'normal',
        category: 'canvas',
        rarity: 88
      },
      {
        id: 'canvas_gradient',
        name: 'Canvas Gradient Hash',
        value: data.canvas.gradientHash,
        status: 'normal',
        category: 'canvas',
        rarity: 85
      },
      {
        id: 'canvas_emoji',
        name: 'Canvas Emoji Hash',
        value: data.canvas.emojiHash,
        status: 'normal',
        category: 'canvas',
        rarity: 87
      },
      {
        id: 'canvas_supported',
        name: 'Canvas Поддержка',
        value: data.canvas.supported ? 'Да' : 'Нет',
        status: data.canvas.supported ? 'normal' : 'warning',
        category: 'canvas'
      }
    ]
  });

  // WebGL
  const webglStatus = data.webgl.supported && data.webgl.renderer !== 'unknown' ? 'normal' : 'warning';
  categories.push({
    id: 'webgl',
    name: 'WebGL Fingerprint',
    icon: '🖥️',
    status: webglStatus,
    parameters: [
      {
        id: 'webgl_vendor',
        name: 'GPU Vendor',
        value: data.webgl.vendor,
        status: 'normal',
        category: 'webgl',
        rarity: 75
      },
      {
        id: 'webgl_renderer',
        name: 'GPU Renderer',
        value: data.webgl.renderer,
        status: data.webgl.renderer === 'unknown' ? 'warning' : 'normal',
        category: 'webgl',
        rarity: 70,
        description: 'Модель видеокарты'
      },
      {
        id: 'webgl_extensions',
        name: 'WebGL Расширения',
        value: `${data.webgl.extensions.length} расширений`,
        status: 'normal',
        category: 'webgl'
      },
      {
        id: 'webgl_max_texture',
        name: 'Max Texture Size',
        value: data.webgl.maxTextureSize,
        status: 'normal',
        category: 'webgl'
      },
      {
        id: 'webgl_max_anisotropy',
        name: 'Max Anisotropy',
        value: data.webgl.maxAnisotropy || 'N/A',
        status: 'normal',
        category: 'webgl'
      }
    ]
  });

  // Hardware
  categories.push({
    id: 'hardware',
    name: 'Hardware',
    icon: '💻',
    status: 'normal',
    parameters: [
      {
        id: 'cpu_cores',
        name: 'CPU Ядра',
        value: data.hardware.cpuCores,
        status: 'normal',
        category: 'hardware',
        rarity: 50
      },
      {
        id: 'device_memory',
        name: 'RAM',
        value: data.hardware.memory ? `${data.hardware.memory} GB` : 'Не определено',
        status: 'normal',
        category: 'hardware',
        rarity: 45
      },
      {
        id: 'screen_resolution',
        name: 'Разрешение экрана',
        value: `${data.hardware.screen.width}x${data.hardware.screen.height}`,
        status: 'normal',
        category: 'hardware',
        rarity: 30
      },
      {
        id: 'pixel_ratio',
        name: 'Pixel Ratio',
        value: data.hardware.screen.pixelRatio,
        status: 'normal',
        category: 'hardware',
        rarity: 40
      },
      {
        id: 'color_depth',
        name: 'Color Depth',
        value: `${data.hardware.screen.colorDepth}-bit`,
        status: 'normal',
        category: 'hardware',
        rarity: 20
      },
      {
        id: 'max_touch_points',
        name: 'Touch Points',
        value: data.hardware.maxTouchPoints,
        status: 'normal',
        category: 'hardware',
        rarity: 35
      }
    ]
  });

  // Browser
  categories.push({
    id: 'browser',
    name: 'Браузер',
    icon: '🌐',
    status: 'normal',
    parameters: [
      {
        id: 'browser_name',
        name: 'Браузер',
        value: data.parsedUA.browser.name,
        status: 'normal',
        category: 'browser',
        rarity: 30
      },
      {
        id: 'browser_version',
        name: 'Версия',
        value: data.parsedUA.browser.version,
        status: 'normal',
        category: 'browser',
        rarity: 50
      },
      {
        id: 'browser_engine',
        name: 'Движок',
        value: data.parsedUA.engine.name,
        status: 'normal',
        category: 'browser'
      },
      {
        id: 'os_name',
        name: 'ОС',
        value: `${data.parsedUA.os.name} ${data.parsedUA.os.version}`,
        status: 'normal',
        category: 'browser',
        rarity: 40
      },
      {
        id: 'device_type',
        name: 'Тип устройства',
        value: data.parsedUA.device.type,
        status: 'normal',
        category: 'browser'
      }
    ]
  });

  // Navigator
  categories.push({
    id: 'navigator',
    name: 'Navigator',
    icon: '📋',
    status: 'normal',
    parameters: [
      {
        id: 'platform',
        name: 'Platform',
        value: data.navigator.platform,
        status: 'normal',
        category: 'navigator',
        rarity: 30
      },
      {
        id: 'language',
        name: 'Язык',
        value: data.navigator.language,
        status: 'normal',
        category: 'navigator',
        rarity: 25
      },
      {
        id: 'languages',
        name: 'Языки',
        value: data.navigator.languages.join(', '),
        status: 'normal',
        category: 'navigator'
      },
      {
        id: 'webdriver',
        name: 'WebDriver',
        value: data.navigator.webdriver ? 'Да' : 'Нет',
        status: data.navigator.webdriver ? 'danger' : 'normal',
        category: 'navigator',
        description: 'Признак автоматизации'
      },
      {
        id: 'cookies_enabled',
        name: 'Cookies',
        value: data.navigator.cookieEnabled ? 'Включены' : 'Отключены',
        status: data.navigator.cookieEnabled ? 'normal' : 'warning',
        category: 'navigator'
      }
    ]
  });

  // Network
  categories.push({
    id: 'network',
    name: 'Сеть',
    icon: '🔗',
    status: data.webrtc.localIPs.length > 0 ? 'warning' : 'normal',
    parameters: [
      {
        id: 'timezone',
        name: 'Timezone',
        value: data.misc.timezone,
        status: 'normal',
        category: 'network',
        rarity: 40
      },
      {
        id: 'webrtc_enabled',
        name: 'WebRTC',
        value: data.webrtc.enabled ? 'Включён' : 'Отключён',
        status: 'normal',
        category: 'network'
      },
      {
        id: 'webrtc_ips',
        name: 'WebRTC IP утечки',
        value: data.webrtc.localIPs.length > 0 ? data.webrtc.localIPs.join(', ') : 'Нет утечек',
        status: data.webrtc.localIPs.length > 0 ? 'warning' : 'normal',
        category: 'network',
        description: data.webrtc.localIPs.length > 0 ? 'Обнаружены локальные IP' : 'IP не утекают'
      },
      {
        id: 'connection_type',
        name: 'Тип соединения',
        value: data.misc.connection?.effectiveType || 'Не определено',
        status: 'normal',
        category: 'network'
      }
    ]
  });

  // Audio
  categories.push({
    id: 'audio',
    name: 'Audio',
    icon: '🔊',
    status: data.audio.supported ? 'normal' : 'warning',
    parameters: [
      {
        id: 'audio_supported',
        name: 'AudioContext',
        value: data.audio.supported ? 'Поддерживается' : 'Не поддерживается',
        status: data.audio.supported ? 'normal' : 'warning',
        category: 'audio'
      },
      {
        id: 'audio_hash',
        name: 'Audio Hash',
        value: data.audio.hash,
        status: 'normal',
        category: 'audio',
        rarity: 80
      },
      {
        id: 'audio_sample_rate',
        name: 'Sample Rate',
        value: `${data.audio.sampleRate} Hz`,
        status: 'normal',
        category: 'audio'
      }
    ]
  });

  // Fonts
  categories.push({
    id: 'fonts',
    name: 'Шрифты',
    icon: '🔤',
    status: 'normal',
    parameters: [
      {
        id: 'fonts_count',
        name: 'Количество шрифтов',
        value: data.fonts.count,
        status: 'normal',
        category: 'fonts',
        rarity: data.fonts.count > 150 ? 30 : data.fonts.count > 50 ? 50 : 70
      },
      {
        id: 'fonts_sample',
        name: 'Примеры шрифтов',
        value: data.fonts.available.slice(0, 10).join(', ') + (data.fonts.count > 10 ? '...' : ''),
        status: 'normal',
        category: 'fonts'
      }
    ]
  });

  // Media
  categories.push({
    id: 'media',
    name: 'Медиа',
    icon: '📷',
    status: 'normal',
    parameters: [
      {
        id: 'cameras',
        name: 'Камеры',
        value: data.mediaDevices.cameras,
        status: 'normal',
        category: 'media'
      },
      {
        id: 'microphones',
        name: 'Микрофоны',
        value: data.mediaDevices.microphones,
        status: 'normal',
        category: 'media'
      },
      {
        id: 'speakers',
        name: 'Динамики',
        value: data.mediaDevices.speakers,
        status: 'normal',
        category: 'media'
      }
    ]
  });

  // Storage
  categories.push({
    id: 'storage',
    name: 'Storage',
    icon: '💾',
    status: 'normal',
    parameters: [
      {
        id: 'local_storage',
        name: 'LocalStorage',
        value: data.storage.localStorage ? 'Доступен' : 'Недоступен',
        status: data.storage.localStorage ? 'normal' : 'warning',
        category: 'storage'
      },
      {
        id: 'session_storage',
        name: 'SessionStorage',
        value: data.storage.sessionStorage ? 'Доступен' : 'Недоступен',
        status: data.storage.sessionStorage ? 'normal' : 'warning',
        category: 'storage'
      },
      {
        id: 'indexed_db',
        name: 'IndexedDB',
        value: data.storage.indexedDB ? 'Доступен' : 'Недоступен',
        status: data.storage.indexedDB ? 'normal' : 'warning',
        category: 'storage'
      },
      {
        id: 'service_worker',
        name: 'ServiceWorker',
        value: data.storage.serviceWorker ? 'Поддерживается' : 'Не поддерживается',
        status: 'normal',
        category: 'storage'
      }
    ]
  });

  // Battery
  if (data.battery.supported) {
    categories.push({
      id: 'battery',
      name: 'Батарея',
      icon: '🔋',
      status: 'normal',
      parameters: [
        {
          id: 'battery_level',
          name: 'Уровень заряда',
          value: `${Math.round(data.battery.level * 100)}%`,
          status: 'normal',
          category: 'battery'
        },
        {
          id: 'battery_charging',
          name: 'Зарядка',
          value: data.battery.charging ? 'Да' : 'Нет',
          status: 'normal',
          category: 'battery'
        }
      ]
    });
  }

  // FingerprintJS
  if (data.fpjs) {
    categories.push({
      id: 'fpjs',
      name: 'FingerprintJS',
      icon: '🔑',
      status: 'normal',
      parameters: [
        {
          id: 'fpjs_visitor_id',
          name: 'Visitor ID',
          value: data.fpjs.visitorId,
          status: 'normal',
          category: 'fpjs',
          rarity: 100,
          description: 'Уникальный идентификатор посетителя'
        }
      ]
    });
  }

  return categories;
}

/**
 * Определяет статус категории на основе параметров
 */
export function getCategoryStatus(parameters: ParameterDisplay[]): 'normal' | 'warning' | 'danger' {
  const hasDanger = parameters.some(p => p.status === 'danger');
  const hasWarning = parameters.some(p => p.status === 'warning');
  
  if (hasDanger) return 'danger';
  if (hasWarning) return 'warning';
  return 'normal';
}
