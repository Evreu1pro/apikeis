// ============================================================
// EchoPrint AI - Shannon Entropy Calculation
// Расчёт Shannon entropy для оценки уникальности
// ============================================================

/**
 * Вычисляет Shannon entropy для массива значений
 */
export function calculateShannonEntropy(values: string[]): number {
  if (values.length === 0) return 0;

  // Подсчёт частот
  const frequency = new Map<string, number>();
  values.forEach(value => {
    frequency.set(value, (frequency.get(value) || 0) + 1);
  });

  // Расчёт энтропии
  let entropy = 0;
  const total = values.length;

  frequency.forEach(count => {
    const probability = count / total;
    if (probability > 0) {
      entropy -= probability * Math.log2(probability);
    }
  });

  return entropy;
}

/**
 * Вычисляет bits of entropy для значения в наборе
 */
export function calculateBitsOfEntropy(
  value: string,
  distribution: Map<string, number>,
  totalSamples: number
): number {
  const count = distribution.get(value) || 0;
  if (count === 0) return 0;

  const probability = count / totalSamples;
  return -Math.log2(probability);
}

/**
 * Оценивает общую энтропию fingerprint на основе комбинации сигналов
 */
export function estimateFingerprintEntropy(
  signals: Map<string, { value: string; entropy: number }>
): {
  totalEntropy: number;
  averageEntropy: number;
  maxEntropy: number;
  contributingSignals: { signal: string; contribution: number }[];
} {
  let totalEntropy = 0;
  const contributions: { signal: string; contribution: number }[] = [];

  signals.forEach((data, signal) => {
    totalEntropy += data.entropy;
    contributions.push({ signal, contribution: data.entropy });
  });

  // Сортируем по вкладу
  contributions.sort((a, b) => b.contribution - a.contribution);

  return {
    totalEntropy,
    averageEntropy: signals.size > 0 ? totalEntropy / signals.size : 0,
    maxEntropy: contributions[0]?.contribution || 0,
    contributingSignals: contributions.slice(0, 10)
  };
}

/**
 * Оценочная энтропия для различных типов сигналов
 */
export const SIGNAL_ENTROPY_ESTIMATES: Record<string, number> = {
  // Высокая энтропия (уникальные значения)
  webgl_renderer: 12.5,
  webgl_vendor: 8.2,
  canvas_text: 15.3,
  canvas_geometry: 14.8,
  canvas_gradient: 13.2,
  audio_hash: 11.4,
  fonts_list: 10.7,
  fpjs_visitor_id: 33.0,

  // Средняя энтропия
  screen_resolution: 6.5,
  timezone: 5.8,
  languages: 4.2,
  user_agent: 9.5,
  platform: 3.8,
  hardware_concurrency: 4.1,
  device_memory: 3.5,
  color_depth: 2.1,
  pixel_ratio: 3.2,

  // Низкая энтропия
  do_not_track: 0.8,
  cookie_enabled: 0.3,
  local_storage: 0.2,
  session_storage: 0.2,
  indexed_db: 0.2,
  touch_support: 2.8,
  max_touch_points: 2.5,

  // Очень низкая энтропия
  webdriver: 0.1,
  color_scheme: 1.0,
  reduced_motion: 0.5
};

/**
 * Получает примерную оценку энтропии для сигнала
 */
export function getEstimatedEntropy(signalName: string): number {
  // Нормализуем имя сигнала
  const normalized = signalName.toLowerCase().replace(/[^a-z_]/g, '_');
  
  // Ищем прямое совпадение
  if (SIGNAL_ENTROPY_ESTIMATES[signalName] !== undefined) {
    return SIGNAL_ENTROPY_ESTIMATES[signalName];
  }

  // Ищем частичное совпадение
  for (const [key, value] of Object.entries(SIGNAL_ENTROPY_ESTIMATES)) {
    if (normalized.includes(key.toLowerCase()) || key.toLowerCase().includes(normalized)) {
      return value;
    }
  }

  // Значение по умолчанию
  return 5.0;
}

/**
 * Вычисляет combined entropy с учётом корреляции
 */
export function calculateCombinedEntropy(
  entropies: number[],
  correlationFactors: number[] = []
): number {
  if (entropies.length === 0) return 0;
  if (entropies.length === 1) return entropies[0];

  // Простая модель: предполагаем некоторую корреляцию между сигналами
  // Используем формулу: H(X,Y) = H(X) + H(Y|X)
  // Где H(Y|X) = H(Y) - I(X,Y) и I(X,Y) зависит от корреляции

  let combined = entropies[0];

  for (let i = 1; i < entropies.length; i++) {
    const correlation = correlationFactors[i] ?? 0.3; // Средняя корреляция по умолчанию
    // Уменьшаем вклад на основе корреляции
    const conditionalEntropy = entropies[i] * (1 - correlation * 0.5);
    combined += conditionalEntropy;
  }

  return combined;
}

/**
 * Оценка population size на основе энтропии
 */
export function estimatePopulationSize(entropy: number): number {
  // N ≈ 2^H
  return Math.pow(2, entropy);
}

/**
 * Оценка uniqueness score на основе энтропии
 */
export function entropyToUniquenessScore(entropy: number): number {
  // Максимум ~33 бита (полная уникальность в популяции 8 млрд)
  const maxEntropy = 33;
  
  // Нормализуем к 0-100
  const score = Math.min(entropy / maxEntropy, 1) * 100;
  
  return Math.round(score);
}
