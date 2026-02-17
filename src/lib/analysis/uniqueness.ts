// ============================================================
// EchoPrint AI - Uniqueness Analysis
// Анализ уникальности fingerprint
// ============================================================

import {
  calculateShannonEntropy,
  getEstimatedEntropy,
  entropyToUniquenessScore,
  estimatePopulationSize
} from './entropy';
import type { FingerprintData, UniquenessAnalysis } from '../types';

// Примерные распределения популярных значений (на основе open-source данных)
const POPULAR_VALUES: Record<string, { value: string; frequency: number }[]> = {
  screen_resolution: [
    { value: '1920x1080', frequency: 0.23 },
    { value: '1366x768', frequency: 0.15 },
    { value: '1536x864', frequency: 0.08 },
    { value: '2560x1440', frequency: 0.07 },
    { value: '1440x900', frequency: 0.05 },
    { value: '1280x720', frequency: 0.04 },
    { value: '3840x2160', frequency: 0.03 }
  ],
  hardware_concurrency: [
    { value: '8', frequency: 0.28 },
    { value: '4', frequency: 0.25 },
    { value: '16', frequency: 0.15 },
    { value: '12', frequency: 0.10 },
    { value: '6', frequency: 0.08 },
    { value: '2', frequency: 0.05 }
  ],
  device_memory: [
    { value: '8', frequency: 0.35 },
    { value: '16', frequency: 0.25 },
    { value: '4', frequency: 0.20 },
    { value: '32', frequency: 0.10 },
    { value: '2', frequency: 0.05 }
  ],
  timezone: [
    { value: 'Europe/Moscow', frequency: 0.04 },
    { value: 'America/New_York', frequency: 0.08 },
    { value: 'Europe/London', frequency: 0.05 },
    { value: 'America/Los_Angeles', frequency: 0.04 },
    { value: 'Asia/Tokyo', frequency: 0.03 },
    { value: 'Europe/Paris', frequency: 0.02 },
    { value: 'Asia/Shanghai', frequency: 0.05 }
  ],
  platform: [
    { value: 'Win32', frequency: 0.70 },
    { value: 'MacIntel', frequency: 0.15 },
    { value: 'Linux x86_64', frequency: 0.08 },
    { value: 'iPhone', frequency: 0.04 },
    { value: 'Android', frequency: 0.02 }
  ],
  language: [
    { value: 'en-US', frequency: 0.35 },
    { value: 'ru-RU', frequency: 0.04 },
    { value: 'de-DE', frequency: 0.03 },
    { value: 'fr-FR', frequency: 0.02 },
    { value: 'zh-CN', frequency: 0.10 },
    { value: 'es-ES', frequency: 0.04 },
    { value: 'ja', frequency: 0.03 }
  ],
  color_depth: [
    { value: '24', frequency: 0.85 },
    { value: '30', frequency: 0.08 },
    { value: '32', frequency: 0.05 }
  ],
  pixel_ratio: [
    { value: '1', frequency: 0.45 },
    { value: '1.25', frequency: 0.15 },
    { value: '1.5', frequency: 0.10 },
    { value: '2', frequency: 0.25 },
    { value: '1.75', frequency: 0.03 }
  ]
};

/**
 * Получает частоту значения на основе популярных распределений
 */
function getValueFrequency(category: string, value: string): number {
  const distribution = POPULAR_VALUES[category];
  if (!distribution) return 0.01; // По умолчанию редкое

  const match = distribution.find(item => item.value === String(value));
  return match ? match.frequency : 0.01;
}

/**
 * Вычисляет rarity score (насколько редкое значение)
 * 100 = очень редкое, 0 = очень распространённое
 */
function calculateRarity(frequency: number): number {
  return Math.round((1 - frequency) * 100);
}

/**
 * Анализирует уникальность fingerprint
 */
export function analyzeUniqueness(data: FingerprintData): UniquenessAnalysis {
  const signals: { signal: string; value: unknown; entropy: number; rarity: number }[] = [];

  // === CANVAS ===
  signals.push({
    signal: 'canvas_text',
    value: data.canvas.textHash,
    entropy: getEstimatedEntropy('canvas_text'),
    rarity: 90 // Canvas практически уникален
  });
  signals.push({
    signal: 'canvas_geometry',
    value: data.canvas.geometryHash,
    entropy: getEstimatedEntropy('canvas_geometry'),
    rarity: 88
  });
  signals.push({
    signal: 'canvas_gradient',
    value: data.canvas.gradientHash,
    entropy: getEstimatedEntropy('canvas_gradient'),
    rarity: 85
  });

  // === WEBGL ===
  const webglRendererRarity = calculateRarity(getValueFrequency('webgl_renderer', data.webgl.renderer));
  signals.push({
    signal: 'webgl_vendor',
    value: data.webgl.vendor,
    entropy: getEstimatedEntropy('webgl_vendor'),
    rarity: 75
  });
  signals.push({
    signal: 'webgl_renderer',
    value: data.webgl.renderer,
    entropy: getEstimatedEntropy('webgl_renderer'),
    rarity: webglRendererRarity
  });
  signals.push({
    signal: 'webgl_extensions',
    value: data.webgl.extensions.length,
    entropy: 6.5,
    rarity: 50
  });

  // === AUDIO ===
  signals.push({
    signal: 'audio_hash',
    value: data.audio.hash,
    entropy: getEstimatedEntropy('audio_hash'),
    rarity: 80
  });

  // === FONTS ===
  const fontsRarity = data.fonts.count > 100 ? 30 : data.fonts.count > 50 ? 50 : 70;
  signals.push({
    signal: 'fonts_count',
    value: data.fonts.count,
    entropy: getEstimatedEntropy('fonts_list'),
    rarity: fontsRarity
  });

  // === HARDWARE ===
  const screenRes = `${data.hardware.screen.width}x${data.hardware.screen.height}`;
  const screenRarity = calculateRarity(getValueFrequency('screen_resolution', screenRes));
  signals.push({
    signal: 'screen_resolution',
    value: screenRes,
    entropy: getEstimatedEntropy('screen_resolution'),
    rarity: screenRarity
  });

  const cpuRarity = calculateRarity(getValueFrequency('hardware_concurrency', String(data.hardware.cpuCores)));
  signals.push({
    signal: 'hardware_concurrency',
    value: data.hardware.cpuCores,
    entropy: getEstimatedEntropy('hardware_concurrency'),
    rarity: cpuRarity
  });

  if (data.hardware.memory) {
    const memRarity = calculateRarity(getValueFrequency('device_memory', String(data.hardware.memory)));
    signals.push({
      signal: 'device_memory',
      value: data.hardware.memory,
      entropy: getEstimatedEntropy('device_memory'),
      rarity: memRarity
    });
  }

  const pixelRarity = calculateRarity(getValueFrequency('pixel_ratio', String(data.hardware.screen.pixelRatio)));
  signals.push({
    signal: 'pixel_ratio',
    value: data.hardware.screen.pixelRatio,
    entropy: getEstimatedEntropy('pixel_ratio'),
    rarity: pixelRarity
  });

  const colorRarity = calculateRarity(getValueFrequency('color_depth', String(data.hardware.screen.colorDepth)));
  signals.push({
    signal: 'color_depth',
    value: data.hardware.screen.colorDepth,
    entropy: getEstimatedEntropy('color_depth'),
    rarity: colorRarity
  });

  // === NAVIGATOR ===
  const platformRarity = calculateRarity(getValueFrequency('platform', data.navigator.platform));
  signals.push({
    signal: 'platform',
    value: data.navigator.platform,
    entropy: getEstimatedEntropy('platform'),
    rarity: platformRarity
  });

  const langRarity = calculateRarity(getValueFrequency('language', data.navigator.language));
  signals.push({
    signal: 'language',
    value: data.navigator.language,
    entropy: getEstimatedEntropy('language'),
    rarity: langRarity
  });

  const tzRarity = calculateRarity(getValueFrequency('timezone', data.misc.timezone));
  signals.push({
    signal: 'timezone',
    value: data.misc.timezone,
    entropy: getEstimatedEntropy('timezone'),
    rarity: tzRarity
  });

  // === BROWSER ===
  signals.push({
    signal: 'browser_name',
    value: data.parsedUA.browser.name,
    entropy: 3.5,
    rarity: data.parsedUA.browser.name === 'Chrome' ? 20 : 60
  });

  signals.push({
    signal: 'browser_version',
    value: data.parsedUA.browser.version,
    entropy: 4.0,
    rarity: 50
  });

  // === TOUCH ===
  signals.push({
    signal: 'max_touch_points',
    value: data.hardware.maxTouchPoints,
    entropy: getEstimatedEntropy('max_touch_points'),
    rarity: data.hardware.maxTouchPoints > 0 ? 30 : 50
  });

  // === WEBRTC ===
  signals.push({
    signal: 'webrtc_local_ips',
    value: data.webrtc.localIPs.length,
    entropy: 4.5,
    rarity: data.webrtc.localIPs.length > 0 ? 40 : 60
  });

  // === MEDIA DEVICES ===
  signals.push({
    signal: 'cameras',
    value: data.mediaDevices.cameras,
    entropy: 3.0,
    rarity: data.mediaDevices.cameras === 1 ? 20 : 50
  });

  // === FPJS ===
  if (data.fpjs) {
    signals.push({
      signal: 'fpjs_visitor_id',
      value: data.fpjs.visitorId,
      entropy: 33.0,
      rarity: 100
    });
  }

  // === Расчёты ===
  
  // Суммарная энтропия
  const totalEntropy = signals.reduce((sum, s) => sum + s.entropy, 0);
  
  // Средняя редкость
  const avgRarity = signals.reduce((sum, s) => sum + s.rarity, 0) / signals.length;
  
  // Overall uniqueness score
  const overallScore = Math.round((entropyToUniquenessScore(totalEntropy) + avgRarity) / 2);

  // Сортируем по редкости
  const sortedByRarity = [...signals].sort((a, b) => b.rarity - a.rarity);
  
  // Редчайшие сигналы
  const rarestSignals = sortedByRarity.slice(0, 5).map(s => ({
    signal: s.signal,
    rarity: s.rarity,
    value: s.value
  }));

  // Распространённые сигналы
  const commonSignals = sortedByRarity.slice(-5).reverse().map(s => ({
    signal: s.signal,
    rarity: s.rarity,
    value: s.value
  }));

  // Category scores
  const categoryScores: Record<string, number> = {
    canvas: signals.filter(s => s.signal.startsWith('canvas')).reduce((sum, s) => sum + s.rarity, 0) / 3,
    webgl: signals.filter(s => s.signal.startsWith('webgl')).reduce((sum, s) => sum + s.rarity, 0) / 3,
    hardware: signals.filter(s => ['screen_resolution', 'hardware_concurrency', 'device_memory', 'pixel_ratio', 'color_depth'].includes(s.signal)).reduce((sum, s) => sum + s.rarity, 0) / 5,
    browser: signals.filter(s => ['platform', 'language', 'browser_name', 'browser_version'].includes(s.signal)).reduce((sum, s) => sum + s.rarity, 0) / 4,
    network: signals.filter(s => ['timezone', 'webrtc_local_ips'].includes(s.signal)).reduce((sum, s) => sum + s.rarity, 0) / 2
  };

  return {
    overallScore: Math.min(overallScore, 100),
    entropy: totalEntropy,
    bitsOfEntropy: totalEntropy,
    rarestSignals,
    commonSignals,
    categoryScores
  };
}

/**
 * Интерпретация uniqueness score
 */
export function interpretUniquenessScore(score: number): {
  level: string;
  description: string;
  trackability: 'very_low' | 'low' | 'medium' | 'high' | 'very_high';
} {
  if (score >= 90) {
    return {
      level: 'Экстремально уникальный',
      description: 'Ваше устройство имеет очень редкую комбинацию характеристик. Вы легко идентифицируетесь среди миллионов пользователей.',
      trackability: 'very_high'
    };
  }
  if (score >= 75) {
    return {
      level: 'Очень уникальный',
      description: 'Ваш fingerprint содержит много редких сигналов. Вас легко отследить.',
      trackability: 'high'
    };
  }
  if (score >= 50) {
    return {
      level: 'Умеренно уникальный',
      description: 'Ваше устройство имеет средний уровень уникальности. Часть характеристик делает вас узнаваемым.',
      trackability: 'medium'
    };
  }
  if (score >= 25) {
    return {
      level: 'Мало уникальный',
      description: 'Ваши характеристики достаточно распространены. Отследить вас сложнее, но возможно.',
      trackability: 'low'
    };
  }
  return {
    level: 'Массовое устройство',
    description: 'Ваше устройство похоже на миллионы других. Это хорошо для приватности, но может быть признаком использования anti-fingerprinting инструментов.',
    trackability: 'very_low'
  };
}
