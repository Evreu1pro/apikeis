// ============================================================
// EchoPrint AI - Miscellaneous Fingerprint Data
// Timezone, Connection, Plugins, Speech, Media Queries
// ============================================================

import { safeSync, safeAsync } from '../utils/helpers';
import type { MiscInfo, MediaQueriesInfo, BatteryInfo } from '../types';

/**
 * Получает информацию о timezone
 */
function getTimezoneInfo(): { timezone: string; offset: number } {
  return {
    timezone: safeSync(
      () => Intl.DateTimeFormat().resolvedOptions().timeZone,
      'Unknown'
    ),
    offset: new Date().getTimezoneOffset()
  };
}

/**
 * Получает список голосов для Speech Synthesis
 */
function getSpeechVoices(): { lang: string; name: string }[] {
  return safeSync(() => {
    const voices = speechSynthesis.getVoices();
    return voices.map(v => ({ lang: v.lang, name: v.name }));
  }, []);
}

/**
 * Получает информацию о сетевом соединении
 */
function getConnectionInfo(): MiscInfo['connection'] {
  const nav = navigator as Navigator & {
    connection?: {
      effectiveType?: string;
      downlink?: number;
      rtt?: number;
      saveData?: boolean;
    };
  };

  const connection = nav.connection;
  if (!connection) return null;

  return {
    effectiveType: connection.effectiveType || 'unknown',
    downlink: connection.downlink || 0,
    rtt: connection.rtt || 0,
    saveData: connection.saveData || false
  };
}

/**
 * Получает список плагинов браузера
 */
function getPlugins(): string[] {
  return safeSync(() => {
    const plugins = navigator.plugins;
    if (!plugins) return [];
    return Array.from(plugins).map(p => p.name);
  }, []);
}

/**
 * Проверяет PDF viewer
 */
function checkPDFViewer(): boolean {
  return safeSync(() => navigator.pdfViewerEnabled ?? false, false);
}

/**
 * Проверяет Java
 */
function checkJava(): boolean | null {
  return safeSync(() => {
    // @ts-expect-error - deprecated API
    return navigator.javaEnabled?.() ?? null;
  }, null);
}

/**
 * Основная функция сбора misc информации
 */
export function getMiscInfo(): MiscInfo {
  const { timezone, offset } = getTimezoneInfo();
  
  return {
    timezone,
    timezoneOffset: offset,
    speechVoices: getSpeechVoices(),
    connection: getConnectionInfo(),
    plugins: getPlugins(),
    pdfViewerEnabled: checkPDFViewer(),
    javaEnabled: checkJava()
  };
}

/**
 * Получает информацию о предпочтениях медиа
 */
export function getMediaQueriesInfo(): MediaQueriesInfo {
  const matchMedia = (query: string): boolean => {
    return safeSync(() => window.matchMedia(query).matches, false);
  };

  // Color scheme
  let prefersColorScheme: 'light' | 'dark' = 'light';
  if (matchMedia('(prefers-color-scheme: dark)')) {
    prefersColorScheme = 'dark';
  }

  // Reduced motion
  const prefersReducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

  // Contrast
  let prefersContrast: 'no-preference' | 'high' | 'more' = 'no-preference';
  if (matchMedia('(prefers-contrast: more)')) {
    prefersContrast = 'more';
  } else if (matchMedia('(prefers-contrast: high)')) {
    prefersContrast = 'high';
  }

  // Color gamut
  let colorGamut: 'srgb' | 'p3' | 'rec2020' = 'srgb';
  if (matchMedia('(color-gamut: rec2020)')) {
    colorGamut = 'rec2020';
  } else if (matchMedia('(color-gamut: p3)')) {
    colorGamut = 'p3';
  }

  // Forced colors
  const forcedColors = matchMedia('(forced-colors: active)');

  // Hover capability
  let hover: 'hover' | 'none' = 'none';
  if (matchMedia('(hover: hover)').valueOf()) {
    hover = 'hover';
  }

  // Pointer type
  let pointer: 'fine' | 'coarse' | 'none' = 'none';
  if (matchMedia('(pointer: fine)')) {
    pointer = 'fine';
  } else if (matchMedia('(pointer: coarse)')) {
    pointer = 'coarse';
  }

  return {
    prefersColorScheme,
    prefersReducedMotion,
    prefersContrast,
    colorGamut,
    forcedColors,
    hover,
    pointer
  };
}

/**
 * Получает информацию о батарее
 */
export async function getBatteryInfo(): Promise<BatteryInfo> {
  const nav = navigator as Navigator & {
    getBattery?: () => Promise<{
      level: number;
      charging: boolean;
      chargingTime: number;
      dischargingTime: number;
    }>;
  };

  if (!nav.getBattery) {
    return {
      level: 0,
      charging: false,
      chargingTime: null,
      dischargingTime: null,
      supported: false
    };
  }

  try {
    const battery = await nav.getBattery();
    return {
      level: battery.level,
      charging: battery.charging,
      chargingTime: battery.chargingTime === Infinity ? null : battery.chargingTime,
      dischargingTime: battery.dischargingTime === Infinity ? null : battery.dischargingTime,
      supported: true
    };
  } catch {
    return {
      level: 0,
      charging: false,
      chargingTime: null,
      dischargingTime: null,
      supported: false
    };
  }
}

/**
 * Получает информацию о Performance
 */
export function getPerformanceInfo(): {
  timing: {
    domContentLoaded: number | null;
    loadComplete: number | null;
    domInteractive: number | null;
  };
  memory: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  } | null;
} {
  // Navigation timing
  let domContentLoaded: number | null = null;
  let loadComplete: number | null = null;
  let domInteractive: number | null = null;

  try {
    const entries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    if (entries.length > 0) {
      const timing = entries[0];
      domContentLoaded = timing.domContentLoadedEventEnd - timing.domContentLoadedEventStart;
      loadComplete = timing.loadEventEnd - timing.loadEventStart;
      domInteractive = timing.domInteractive;
    }
  } catch {
    // Ignore
  }

  // Memory info (Chrome only)
  let memory: { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number } | null = null;
  try {
    // @ts-expect-error - memory API
    if (performance.memory) {
      // @ts-expect-error - memory API
      memory = {
        usedJSHeapSize: performance.memory.usedJSHeapSize,
        totalJSHeapSize: performance.memory.totalJSHeapSize,
        jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
      };
    }
  } catch {
    // Ignore
  }

  return {
    timing: { domContentLoaded, loadComplete, domInteractive },
    memory
  };
}

/**
 * Проверяет timing anomalies (признаки виртуализации)
 */
export function detectTimingAnomalies(): {
  hasAnomalies: boolean;
  indicators: string[];
} {
  const indicators: string[] = [];

  // Проверка timestamp
  const now = Date.now();
  const perfNow = performance.now();
  const diff = Math.abs(now - perfNow - performance.timeOrigin);
  
  if (diff > 1000) {
    indicators.push('Timestamp discrepancy detected');
  }

  // Проверка скорости выполнения
  const start = performance.now();
  for (let i = 0; i < 1000000; i++) {
    Math.random();
  }
  const duration = performance.now() - start;
  
  // Если очень быстро - возможна виртуализация
  if (duration < 10) {
    indicators.push('Unusually fast execution (possible virtualization)');
  }

  return {
    hasAnomalies: indicators.length > 0,
    indicators
  };
}

/**
 * Полная информация о media devices
 */
export async function getMediaDevicesFull(): Promise<{
  cameras: number;
  microphones: number;
  speakers: number;
  deviceLabels: string[];
  hasPermission: boolean;
}> {
  if (!navigator.mediaDevices?.enumerateDevices) {
    return {
      cameras: 0,
      microphones: 0,
      speakers: 0,
      deviceLabels: [],
      hasPermission: false
    };
  }

  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const deviceLabels = devices.map(d => d.label).filter(Boolean);
    
    return {
      cameras: devices.filter(d => d.kind === 'videoinput').length,
      microphones: devices.filter(d => d.kind === 'audioinput').length,
      speakers: devices.filter(d => d.kind === 'audiooutput').length,
      deviceLabels,
      hasPermission: deviceLabels.length > 0
    };
  } catch {
    return {
      cameras: 0,
      microphones: 0,
      speakers: 0,
      deviceLabels: [],
      hasPermission: false
    };
  }
}

/**
 * Получает информацию о клавиатуре
 */
export function getKeyboardInfo(): {
  supported: boolean;
  layout: string | null;
} {
  const nav = navigator as Navigator & {
    keyboard?: {
      getLayoutMap?: () => Promise<Map<string, string>>;
    };
  };

  return {
    supported: !!nav.keyboard?.getLayoutMap,
    layout: null // Требует user interaction для получения
  };
}
