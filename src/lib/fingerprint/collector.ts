// ============================================================
// EchoPrint AI - Main Fingerprint Collector
// Главный сборщик всех fingerprint данных
// ============================================================

import FingerprintJS from '@fingerprintjs/fingerprintjs';
import { getCanvasFingerprint } from './canvas';
import { getWebGLFingerprint } from './webgl';
import { getAudioFingerprint } from './audio';
import { getFontsInfo } from './fonts';
import { getWebRTCLeak } from './webrtc';
import { getHardwareInfo, getBatteryStatus } from './hardware';
import { getNavigatorInfo, parseUserAgent } from './navigator';
import { getSensorsInfo } from './sensors';
import { getStorageInfo } from './storage';
import { getMiscInfo, getMediaQueriesInfo, getBatteryInfo, getPerformanceInfo, getMediaDevicesFull } from './misc';
import type { FingerprintData, ScanProgress } from '../types';

export type ProgressCallback = (progress: ScanProgress) => void;

/**
 * Главный сборщик fingerprint данных
 */
export async function collectFingerprint(
  onProgress?: ProgressCallback
): Promise<FingerprintData> {
  const startTime = performance.now();
  let signalsCollected = 0;
  const totalSignals = 16; // Количество основных категорий

  const updateProgress = (stage: string, currentSignal: string) => {
    signalsCollected++;
    onProgress?.({
      stage,
      progress: Math.round((signalsCollected / totalSignals) * 100),
      currentSignal,
      signalsCollected,
      totalSignals
    });
  };

  // 1. Canvas Fingerprint
  updateProgress('Сбор Canvas данных', 'Canvas 2D');
  const canvas = getCanvasFingerprint();
  await new Promise(r => setTimeout(r, 100));

  // 2. WebGL Fingerprint
  updateProgress('Сбор WebGL данных', 'WebGL');
  const webgl = getWebGLFingerprint();
  await new Promise(r => setTimeout(r, 100));

  // 3. Audio Fingerprint
  updateProgress('Сбор Audio данных', 'AudioContext');
  const audio = await getAudioFingerprint();
  await new Promise(r => setTimeout(r, 100));

  // 4. Fonts
  updateProgress('Определение шрифтов', 'Fonts');
  const fonts = getFontsInfo();
  await new Promise(r => setTimeout(r, 100));

  // 5. WebRTC
  updateProgress('Проверка WebRTC', 'WebRTC');
  const webrtc = await getWebRTCLeak();
  await new Promise(r => setTimeout(r, 100));

  // 6. Media Devices
  updateProgress('Проверка медиа-устройств', 'Media Devices');
  const mediaDevices = await getMediaDevicesFull();
  await new Promise(r => setTimeout(r, 100));

  // 7. Hardware
  updateProgress('Сбор информации о железе', 'Hardware');
  const hardware = getHardwareInfo();
  await new Promise(r => setTimeout(r, 100));

  // 8. Navigator
  updateProgress('Сбор Navigator данных', 'Navigator');
  const navigatorInfo = await getNavigatorInfo();
  const parsedUA = parseUserAgent(navigatorInfo.userAgent);
  await new Promise(r => setTimeout(r, 100));

  // 9. Sensors
  updateProgress('Проверка сенсоров', 'Sensors');
  const sensors = getSensorsInfo();
  await new Promise(r => setTimeout(r, 100));

  // 10. Battery
  updateProgress('Проверка батареи', 'Battery');
  const battery = await getBatteryInfo();
  await new Promise(r => setTimeout(r, 100));

  // 11. Media Queries
  updateProgress('Сбор медиа-настроек', 'Media Queries');
  const mediaQueries = getMediaQueriesInfo();
  await new Promise(r => setTimeout(r, 100));

  // 12. Storage
  updateProgress('Проверка Storage API', 'Storage');
  const storage = await getStorageInfo();
  await new Promise(r => setTimeout(r, 100));

  // 13. Performance
  updateProgress('Анализ Performance', 'Performance');
  const perfInfo = getPerformanceInfo();
  const performance = {
    domContentLoaded: perfInfo.timing.domContentLoaded,
    loadComplete: perfInfo.timing.loadComplete,
    domInteractive: perfInfo.timing.domInteractive,
    memory: perfInfo.memory,
    timingAnomaly: false
  };
  await new Promise(r => setTimeout(r, 100));

  // 14. Misc
  updateProgress('Сбор дополнительных данных', 'Misc');
  const misc = getMiscInfo();
  await new Promise(r => setTimeout(r, 100));

  // 15. FingerprintJS
  updateProgress('FingerprintJS анализ', 'FingerprintJS');
  let fpjs = null;
  try {
    const fp = await FingerprintJS.load();
    const result = await fp.detect();
    fpjs = {
      visitorId: result.visitorId,
      components: result.components
    };
  } catch {
    fpjs = null;
  }
  await new Promise(r => setTimeout(r, 100));

  // Финальный прогресс
  updateProgress('Завершение', 'Финализация');

  const scanDuration = performance.now() - startTime;

  // Подсчёт общего количества сигналов
  const totalSignalsCount = countTotalSignals({
    canvas,
    webgl,
    audio,
    fonts,
    webrtc,
    mediaDevices,
    hardware,
    navigator: navigatorInfo,
    parsedUA,
    sensors,
    battery,
    mediaQueries,
    storage,
    performance,
    misc,
    fpjs,
    timestamp: new Date().toISOString(),
    scanDuration,
    totalSignals: 0
  });

  return {
    canvas,
    webgl,
    audio,
    fonts,
    webrtc,
    mediaDevices,
    hardware,
    navigator: navigatorInfo,
    parsedUA,
    sensors,
    battery,
    mediaQueries,
    storage,
    performance,
    misc,
    fpjs,
    timestamp: new Date().toISOString(),
    scanDuration,
    totalSignals: totalSignalsCount
  };
}

/**
 * Подсчитывает общее количество собранных сигналов
 */
function countTotalSignals(data: FingerprintData): number {
  let count = 0;

  // Canvas signals
  count += 4; // textHash, geometryHash, gradientHash, emojiHash

  // WebGL signals
  count += 10; // vendor, renderer, extensions, maxTextureSize, maxViewportDims, etc.

  // Audio signals
  count += 4;

  // Fonts signals
  count += 3;

  // WebRTC signals
  count += 3;

  // Media devices signals
  count += 4;

  // Hardware signals
  count += 9;

  // Navigator signals
  count += 12;

  // Parsed UA signals
  count += 5;

  // Sensors signals
  count += 5;

  // Battery signals
  count += 4;

  // Media queries signals
  count += 7;

  // Storage signals
  count += 6;

  // Performance signals
  count += 5;

  // Misc signals
  count += 8;

  // FingerprintJS
  count += 2;

  return count;
}

/**
 * Быстрый сбор только критичных данных
 */
export async function collectQuickFingerprint(): Promise<Partial<FingerprintData>> {
  const [navigatorInfo, hardware] = await Promise.all([
    getNavigatorInfo(),
    Promise.resolve(getHardwareInfo())
  ]);

  return {
    navigator: navigatorInfo,
    parsedUA: parseUserAgent(navigatorInfo.userAgent),
    hardware,
    timestamp: new Date().toISOString(),
    totalSignals: 20
  } as Partial<FingerprintData>;
}
