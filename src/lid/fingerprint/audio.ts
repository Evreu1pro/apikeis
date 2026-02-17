// ============================================================
// EchoPrint AI - Audio Fingerprint
// AudioContext fingerprint для определения уникальности
// ============================================================

import { fnv1aHash, safeSync, safeAsync } from '../utils/helpers';
import type { AudioFingerprint } from '../types';

/**
 * Создаёт AudioContext и генерирует fingerprint
 */
async function generateAudioFingerprint(): Promise<string> {
  const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  
  if (!AudioContextClass) {
    return 'not_supported';
  }

  const audioContext = new AudioContextClass();
  
  try {
    // Создаём осциллятор
    const oscillator = audioContext.createOscillator();
    const analyser = audioContext.createAnalyser();
    const gain = audioContext.createGain();
    const scriptProcessor = audioContext.createScriptProcessor(4096, 1, 1);

    // Настройка осциллятора
    oscillator.type = 'triangle';
    oscillator.frequency.value = 10000;

    // Mute для избежания звука
    gain.gain.value = 0;

    // Подключение узлов
    oscillator.connect(analyser);
    analyser.connect(scriptProcessor);
    scriptProcessor.connect(gain);
    gain.connect(audioContext.destination);

    // Запуск
    oscillator.start(0);

    // Ждём немного для стабилизации
    await new Promise(resolve => setTimeout(resolve, 100));

    // Получаем данные анализатора
    const frequencyData = new Float32Array(analyser.frequencyBinCount);
    analyser.getFloatFrequencyData(frequencyData);

    // Остановка
    oscillator.stop();
    audioContext.close();

    // Хеш от данных
    const dataString = Array.from(frequencyData).map(v => v.toFixed(2)).join(',');
    return fnv1aHash(dataString);
  } catch (error) {
    audioContext.close().catch(() => {});
    return 'error';
  }
}

/**
 * Альтернативный метод через OfflineAudioContext
 */
async function generateOfflineAudioFingerprint(): Promise<string> {
  const OfflineAudioContextClass = window.OfflineAudioContext || 
    (window as unknown as { webkitOfflineAudioContext: typeof OfflineAudioContext }).webkitOfflineAudioContext;

  if (!OfflineAudioContextClass) {
    return 'not_supported';
  }

  try {
    const context = new OfflineAudioContextClass(1, 44100, 44100);

    // Осциллятор
    const oscillator = context.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.value = 1000;

    // Компрессор
    const compressor = context.createDynamicsCompressor();
    compressor.threshold.value = -50;
    compressor.knee.value = 40;
    compressor.ratio.value = 12;
    compressor.attack.value = 0;
    compressor.release.value = 0.2;

    oscillator.connect(compressor);
    compressor.connect(context.destination);

    oscillator.start(0);

    const renderedBuffer = await context.startRendering();
    const channelData = renderedBuffer.getChannelData(0);

    // Выбираем ключевые сэмплы
    const samples: number[] = [];
    for (let i = 0; i < channelData.length; i += 100) {
      samples.push(channelData[i]);
    }

    return fnv1aHash(samples.map(v => v.toFixed(6)).join(','));
  } catch {
    return 'error';
  }
}

/**
 * Основная функция сбора Audio fingerprint
 */
export async function getAudioFingerprint(): Promise<AudioFingerprint> {
  const supported = safeSync(() => {
    return !!(window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext);
  }, false);

  if (!supported) {
    return {
      hash: 'not_supported',
      sampleRate: 0,
      maxChannelCount: 0,
      channelCount: 0,
      supported: false
    };
  }

  const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

  // Получаем информацию об AudioContext
  let sampleRate = 0;
  let maxChannelCount = 0;
  let channelCount = 0;

  try {
    const tempContext = new AudioContextClass();
    sampleRate = tempContext.sampleRate;
    maxChannelCount = tempContext.destination.maxChannelCount;
    channelCount = tempContext.destination.channelCount;
    tempContext.close();
  } catch {
    // Игнорируем ошибки
  }

  // Генерируем fingerprint
  const hash = await safeAsync(
    async () => {
      const primary = await generateAudioFingerprint();
      if (primary !== 'error' && primary !== 'not_supported') {
        return primary;
      }
      return generateOfflineAudioFingerprint();
    },
    'error',
    10000
  );

  return {
    hash,
    sampleRate,
    maxChannelCount,
    channelCount,
    supported: true
  };
}

/**
 * Проверка поддержки AudioWorklet
 */
export function hasAudioWorklet(): boolean {
  return safeSync(() => {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return false;
    const ctx = new AudioContextClass();
    const hasWorklet = 'audioWorklet' in ctx;
    ctx.close();
    return hasWorklet;
  }, false);
}

/**
 * Получение списка аудио устройств
 */
export async function getAudioDevices(): Promise<string[]> {
  if (!navigator.mediaDevices?.enumerateDevices) {
    return [];
  }

  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices
      .filter(d => d.kind === 'audioinput' || d.kind === 'audiooutput')
      .map(d => d.label || `unknown_${d.kind}`);
  } catch {
    return [];
  }
}
