// ============================================================
// EchoPrint AI - Report Generator
// Генерация AI-отчёта и рекомендаций на русском языке
// ============================================================

import type { FingerprintData, AnalysisResult, AIReport } from '../types';
import { analyzeUniqueness, interpretUniquenessScore } from './uniqueness';
import { analyzeConsistency, interpretConsistencyScore } from './consistency';
import { analyzeAnomalies, interpretAnomalyScore } from './anomaly';

/**
 * Определяет уровень риска приватности
 */
function getPrivacyRiskLevel(
  uniquenessScore: number,
  consistencyScore: number,
  anomalyScore: number
): 'very_low' | 'low' | 'medium' | 'high' | 'very_high' {
  // Высокая уникальность = высокий риск отслеживания
  // Низкая согласованность = использование privacy инструментов
  // Аномалии = могут означать защиту или проблемы
  
  // Если высокая уникальность и хорошая согласованность - высокий риск
  if (uniquenessScore >= 80 && consistencyScore >= 80) {
    return 'very_high';
  }
  
  // Если средняя уникальность - средний риск
  if (uniquenessScore >= 60 && consistencyScore >= 70) {
    return 'high';
  }
  
  // Если низкая уникальность или много аномалий (privacy tools) - низкий риск
  if (uniquenessScore < 40 || anomalyScore < 60) {
    return 'low';
  }
  
  // Если очень низкая уникальность - очень низкий риск
  if (uniquenessScore < 25) {
    return 'very_low';
  }
  
  return 'medium';
}

/**
 * Определяет уровень отслеживаемости
 */
function getTrackabilityLevel(uniquenessScore: number): 'very_low' | 'low' | 'medium' | 'high' | 'very_high' {
  if (uniquenessScore >= 85) return 'very_high';
  if (uniquenessScore >= 70) return 'high';
  if (uniquenessScore >= 50) return 'medium';
  if (uniquenessScore >= 30) return 'low';
  return 'very_low';
}

/**
 * Генерирует AI-отчёт
 */
function generateAIReport(
  data: FingerprintData,
  uniqueness: ReturnType<typeof analyzeUniqueness>,
  consistency: ReturnType<typeof analyzeConsistency>,
  anomaly: ReturnType<typeof analyzeAnomalies>
): AIReport {
  const uniquenessInterpret = interpretUniquenessScore(uniqueness.overallScore);
  const consistencyInterpret = interpretConsistencyScore(consistency.overallScore);
  const anomalyInterpret = interpretAnomalyScore(anomaly.overallScore);
  
  // Summary
  let summary = `Ваше устройство "${data.parsedUA.browser.name} ${data.parsedUA.browser.version}" на ${data.parsedUA.os.name} `;
  
  if (uniqueness.overallScore >= 80) {
    summary += 'имеет очень уникальный цифровой отпечаток. ';
  } else if (uniqueness.overallScore >= 60) {
    summary += 'имеет умеренно уникальный цифровой отпечаток. ';
  } else {
    summary += 'имеет распространённый цифровой отпечаток. ';
  }
  
  summary += `Уровень уникальности: ${uniqueness.overallScore}%. `;
  summary += `Согласованность параметров: ${consistency.overallScore}%.`;
  
  // Uniqueness assessment
  let uniquenessAssessment = `${uniquenessInterpret.level}. `;
  uniquenessAssessment += uniquenessInterpret.description + ' ';
  
  if (uniqueness.rarestSignals.length > 0) {
    const rarest = uniqueness.rarestSignals[0];
    uniquenessAssessment += `Наиболее редкая характеристика: ${formatSignalName(rarest.signal)} (редкость: ${rarest.rarity}%). `;
  }
  
  if (uniqueness.commonSignals.length > 0) {
    const common = uniqueness.commonSignals[0];
    uniquenessAssessment += `Наиболее распространённая: ${formatSignalName(common.signal)} (редкость: ${common.rarity}%).`;
  }
  
  // Consistency assessment
  let consistencyAssessment = `${consistencyInterpret.level}. `;
  consistencyAssessment += consistencyInterpret.description + ' ';
  
  const failedRules = consistency.rules.filter(r => !r.passed);
  if (failedRules.length > 0) {
    consistencyAssessment += `Обнаружено ${failedRules.length} несоответствий. `;
    
    const criticalIssues = failedRules.filter(r => r.severity === 'critical' || r.severity === 'high');
    if (criticalIssues.length > 0) {
      consistencyAssessment += `Критичные: ${criticalIssues.map(r => r.name).join(', ')}.`;
    }
  } else {
    consistencyAssessment += 'Все параметры согласованы и логичны.';
  }
  
  // Anomaly assessment
  let anomalyAssessment = `${anomalyInterpret.level}. `;
  anomalyAssessment += anomalyInterpret.description + ' ';
  
  if (anomaly.detectedAnomalies.length > 0) {
    const groupedByType = anomaly.detectedAnomalies.reduce((acc, a) => {
      acc[a.type] = (acc[a.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    if (groupedByType['virtualization']) {
      anomalyAssessment += `Признаки виртуализации: ${groupedByType['virtualization']}. `;
    }
    if (groupedByType['automation']) {
      anomalyAssessment += `Признаки автоматизации: ${groupedByType['automation']}. `;
    }
    if (groupedByType['modification']) {
      anomalyAssessment += `Признаки модификации: ${groupedByType['modification']}. `;
    }
  }
  
  // Recommendations
  const recommendations = generateRecommendations(data, uniqueness, consistency, anomaly);
  
  // Privacy tips
  const privacyTips = generatePrivacyTips(data, uniqueness, consistency, anomaly);
  
  return {
    summary,
    uniquenessAssessment,
    consistencyAssessment,
    anomalyAssessment,
    recommendations,
    privacyTips
  };
}

/**
 * Форматирует имя сигнала для русского языка
 */
function formatSignalName(signal: string): string {
  const names: Record<string, string> = {
    'canvas_text': 'Canvas текст',
    'canvas_geometry': 'Canvas геометрия',
    'canvas_gradient': 'Canvas градиент',
    'webgl_vendor': 'WebGL vendor',
    'webgl_renderer': 'GPU renderer',
    'webgl_extensions': 'WebGL расширения',
    'audio_hash': 'Audio fingerprint',
    'fonts_count': 'Количество шрифтов',
    'screen_resolution': 'Разрешение экрана',
    'hardware_concurrency': 'Ядра процессора',
    'device_memory': 'Объём памяти',
    'pixel_ratio': 'Pixel ratio',
    'color_depth': 'Глубина цвета',
    'platform': 'Платформа',
    'language': 'Язык',
    'timezone': 'Часовой пояс',
    'browser_name': 'Браузер',
    'browser_version': 'Версия браузера',
    'max_touch_points': 'Touch points',
    'webrtc_local_ips': 'WebRTC IP',
    'cameras': 'Камеры',
    'fpjs_visitor_id': 'FingerprintJS ID'
  };
  
  return names[signal] || signal;
}

/**
 * Генерирует рекомендации
 */
function generateRecommendations(
  data: FingerprintData,
  uniqueness: ReturnType<typeof analyzeUniqueness>,
  consistency: ReturnType<typeof analyzeConsistency>,
  anomaly: ReturnType<typeof analyzeAnomalies>
): string[] {
  const recommendations: string[] = [];
  
  // На основе уникальности
  if (uniqueness.overallScore >= 80) {
    recommendations.push('Ваше устройство очень уникально. Для повышения приватности рассмотрите использование браузера с anti-fingerprinting.');
    recommendations.push('Измените настройки экрана на более распространённые (например, 1920x1080).');
  } else if (uniqueness.overallScore < 30) {
    recommendations.push('Ваше устройство похоже на многие другие. Это хорошо для приватности.');
    recommendations.push('Если нужна большая уникальность (например, для тестирования), установите дополнительные шрифты.');
  }
  
  // На основе согласованности
  const failedCritical = consistency.rules.filter(r => !r.passed && r.severity === 'critical');
  if (failedCritical.length > 0) {
    recommendations.push('Критичные несоответствия в fingerprint могут вызывать проблемы на некоторых сайтах. Проверьте настройки браузера.');
  }
  
  // На основе аномалий
  if (anomaly.virtualizationProbability > 0.5) {
    recommendations.push('Обнаружены признаки виртуализации. Если вы используете VM, это нормально.');
  }
  
  if (anomaly.automationProbability > 0.5) {
    recommendations.push('Обнаружены признаки автоматизации. Это может блокировать некоторые сайты.');
  }
  
  // Браузер-специфичные рекомендации
  if (data.parsedUA.browser.name === 'Chrome') {
    recommendations.push('Chrome предоставляет много fingerprint-данных. Рассмотрите Firefox или Brave для лучшей приватности.');
  }
  
  if (data.parsedUA.browser.name === 'Firefox') {
    recommendations.push('Firefox имеет встроенную защиту от fingerprinting. Включите Resist Fingerprinting в about:config для максимальной защиты.');
  }
  
  if (data.parsedUA.browser.name === 'Brave') {
    recommendations.push('Brave имеет отличную встроенную защиту от fingerprinting. Ваша приватность на высоком уровне.');
  }
  
  // WebRTC leak
  if (data.webrtc.localIPs.length > 0) {
    recommendations.push('WebRTC утечка IP: рассмотрите установку расширения для блокировки WebRTC или отключение в настройках браузера.');
  }
  
  // Количество шрифтов
  if (data.fonts.count > 200) {
    recommendations.push('Большое количество шрифтов увеличивает уникальность. Для приватности используйте стандартный набор.');
  }
  
  return recommendations.slice(0, 6); // Максимум 6 рекомендаций
}

/**
 * Генерирует советы по приватности
 */
function generatePrivacyTips(
  data: FingerprintData,
  uniqueness: ReturnType<typeof analyzeUniqueness>,
  consistency: ReturnType<typeof analyzeConsistency>,
  anomaly: ReturnType<typeof analyzeAnomalies>
): string[] {
  const tips: string[] = [];
  
  // Общие советы
  tips.push('Регулярно обновляйте браузер - новые версии часто улучшают защиту.');
  tips.push('Используйте приватный режим для чувствительного просмотра.');
  
  // На основе текущего состояния
  if (uniqueness.overallScore > 70) {
    tips.push('Установите расширение для randomization fingerprint (например, Canvas Defender).');
  }
  
  if (data.webrtc.localIPs.length > 0) {
    tips.push('Используйте VPN с защитой от WebRTC утечек.');
  }
  
  // Браузер-специфичные советы
  if (data.parsedUA.browser.name === 'Firefox') {
    tips.push('В about:config установите privacy.resistFingerprinting = true для максимальной защиты.');
    tips.push('Установите extensions.pocket.enabled = false для уменьшения fingerprint.');
  }
  
  if (data.parsedUA.browser.name === 'Chrome') {
    tips.push('Рассмотрите переход на Brave или Firefox для лучшей приватности.');
    tips.push('Установите расширение uBlock Origin для блокировки трекеров.');
  }
  
  // Для продвинутых пользователей
  tips.push('Используйте Tor Browser для анонимного просмотра (максимальная защита).');
  tips.push('Рассмотрите использование контейнеров (Firefox) для изоляции сайтов.');
  
  return tips.slice(0, 5); // Максимум 5 советов
}

/**
 * Основная функция анализа
 */
export function analyzeFingerprint(data: FingerprintData): AnalysisResult {
  const uniqueness = analyzeUniqueness(data);
  const consistency = analyzeConsistency(data);
  const anomaly = analyzeAnomalies(data);
  
  // Общий score - средневзвешенное
  const overallScore = Math.round(
    uniqueness.overallScore * 0.4 +
    consistency.overallScore * 0.35 +
    anomaly.overallScore * 0.25
  );
  
  const privacyRiskLevel = getPrivacyRiskLevel(
    uniqueness.overallScore,
    consistency.overallScore,
    anomaly.overallScore
  );
  
  const trackabilityLevel = getTrackabilityLevel(uniqueness.overallScore);
  
  const aiReport = generateAIReport(data, uniqueness, consistency, anomaly);
  
  return {
    uniqueness,
    consistency,
    anomaly,
    overallScore,
    privacyRiskLevel,
    trackabilityLevel,
    aiReport
  };
}

/**
 * Формирует полное описание уровня риска
 */
export function getRiskLevelDescription(level: string): string {
  const descriptions: Record<string, string> = {
    'very_low': 'Очень низкий риск - ваше устройство практически невозможно отследить',
    'low': 'Низкий риск - отслеживание затруднено',
    'medium': 'Средний риск - частичное отслеживание возможно',
    'high': 'Высокий риск - вас легко идентифицировать',
    'very_high': 'Очень высокий риск - ваше устройство уникально и легко отслеживается'
  };
  
  return descriptions[level] || 'Неизвестный уровень';
}
