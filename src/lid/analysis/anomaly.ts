// ============================================================
// EchoPrint AI - Anomaly Detection
// Обнаружение аномалий: виртуализация, эмуляция, автоматизация
// ============================================================

import type { FingerprintData, AnomalyAnalysis, AnomalyIndicator } from '../types';

/**
 * Индикаторы аномалий
 */
const ANOMALY_INDICATORS: Array<{
  id: string;
  name: string;
  description: string;
  type: 'virtualization' | 'emulation' | 'automation' | 'modification' | 'inconsistency';
  severity: 'low' | 'medium' | 'high';
  detect: (data: FingerprintData) => { detected: boolean; evidence: string[] };
}> = [
  // === VIRTUALIZATION ===
  {
    id: 'vm_gpu',
    name: 'Виртуальный GPU',
    description: 'GPU указывает на виртуальную машину',
    type: 'virtualization',
    severity: 'high',
    detect: (data) => {
      const evidence: string[] = [];
      const renderer = data.webgl.renderer.toLowerCase();
      
      const vmKeywords = [
        { keyword: 'virtualbox', name: 'VirtualBox' },
        { keyword: 'vmware', name: 'VMware' },
        { keyword: 'parallels', name: 'Parallels' },
        { keyword: 'qemu', name: 'QEMU' },
        { keyword: 'svga', name: 'SVGA (VMware)' },
        { keyword: 'gallium', name: 'Gallium (Mesa VM)' },
        { keyword: 'llvmpipe', name: 'LLVMpipe (Software)' },
        { keyword: 'swiftshader', name: 'SwiftShader (Software)' },
        { keyword: 'microsoft basic render', name: 'Microsoft Basic Render' },
        { keyword: 'nvlddmkm', name: 'Remote Desktop' }
      ];
      
      vmKeywords.forEach(({ keyword, name }) => {
        if (renderer.includes(keyword)) {
          evidence.push(`GPU renderer содержит "${keyword}" (${name})`);
        }
      });
      
      return { detected: evidence.length > 0, evidence };
    }
  },
  
  {
    id: 'vm_cpu_cores',
    name: 'Подозрительное CPU cores',
    description: 'Количество ядер типично для VM',
    type: 'virtualization',
    severity: 'low',
    detect: (data) => {
      const evidence: string[] = [];
      const cores = data.hardware.cpuCores;
      
      // Типичные значения для VM: 1, 2, 4
      if (cores === 1) {
        evidence.push('Только 1 CPU core - типично для минимальной VM');
      }
      
      return { detected: evidence.length > 0, evidence };
    }
  },
  
  {
    id: 'vm_memory',
    name: 'Подозрительный объём памяти',
    description: 'Объём памяти типичен для VM',
    type: 'virtualization',
    severity: 'low',
    detect: (data) => {
      const evidence: string[] = [];
      const memory = data.hardware.memory;
      
      if (memory !== null && memory <= 2) {
        evidence.push(`Всего ${memory} GB RAM - типично для минимальной VM`);
      }
      
      return { detected: evidence.length > 0, evidence };
    }
  },
  
  // === AUTOMATION ===
  {
    id: 'automation_webdriver',
    name: 'WebDriver обнаружен',
    description: 'Браузер работает в автоматическом режиме',
    type: 'automation',
    severity: 'high',
    detect: (data) => {
      const evidence: string[] = [];
      
      if (data.navigator.webdriver) {
        evidence.push('navigator.webdriver = true');
      }
      
      // Дополнительные проверки
      if (typeof window !== 'undefined') {
        // @ts-expect-error - checking automation APIs
        if (window.__webdriver_script_fn) {
          evidence.push('__webdriver_script_fn существует');
        }
        // @ts-expect-error - checking automation APIs
        if (window.__driver_evaluate) {
          evidence.push('__driver_evaluate существует');
        }
        // @ts-expect-error - checking automation APIs
        if (window.__selenium_evaluate) {
          evidence.push('__selenium_evaluate существует');
        }
        // @ts-expect-error - checking automation APIs
        if (window.__nightmare) {
          evidence.push('__nightmare существует');
        }
        // @ts-expect-error - checking automation APIs
        if (window._phantom) {
          evidence.push('_phantom существует');
        }
        // @ts-expect-error - checking automation APIs
        if (window.callPhantom) {
          evidence.push('callPhantom существует');
        }
      }
      
      return { detected: evidence.length > 0, evidence };
    }
  },
  
  {
    id: 'automation_chrome_driver',
    name: 'ChromeDriver обнаружен',
    description: 'Обнаружены переменные ChromeDriver',
    type: 'automation',
    severity: 'high',
    detect: (data) => {
      const evidence: string[] = [];
      
      if (typeof window !== 'undefined') {
        for (const key in window) {
          if (key.startsWith('cdc_') || key.startsWith('wdc_')) {
            evidence.push(`Переменная ChromeDriver: ${key}`);
          }
        }
      }
      
      return { detected: evidence.length > 0, evidence };
    }
  },
  
  {
    id: 'automation_headless',
    name: 'Headless браузер',
    description: 'Признаки headless режима',
    type: 'automation',
    severity: 'high',
    detect: (data) => {
      const evidence: string[] = [];
      const ua = data.navigator.userAgent.toLowerCase();
      
      // Проверка headless в UA
      if (ua.includes('headless')) {
        evidence.push('User-Agent содержит "headless"');
      }
      
      // PhantomJS
      if (ua.includes('phantom')) {
        evidence.push('PhantomJS User-Agent');
      }
      
      // Chrome без window.chrome
      const isChrome = ua.includes('chrome');
      // @ts-expect-error - checking chrome object
      const hasWindowChrome = typeof window !== 'undefined' && 'chrome' in window;
      
      if (isChrome && !hasWindowChrome) {
        evidence.push('Chrome UA но нет window.chrome объекта');
      }
      
      // Нет plugins (headless Chrome)
      if (data.misc.plugins.length === 0 && isChrome) {
        // Не добавляем, так как это норма для современных Chrome
      }
      
      // Нет languages
      if (data.navigator.languages.length === 0) {
        evidence.push('navigator.languages пуст');
      }
      
      return { detected: evidence.length > 0, evidence };
    }
  },
  
  // === EMULATION ===
  {
    id: 'emulation_mobile',
    name: 'Эмуляция мобильного',
    description: 'Desktop браузер эмулирует мобильное устройство',
    type: 'emulation',
    severity: 'medium',
    detect: (data) => {
      const evidence: string[] = [];
      
      const isMobileUA = data.parsedUA.device.type === 'mobile' || data.parsedUA.device.type === 'tablet';
      const hasTouch = data.hardware.maxTouchPoints > 0;
      const { width, height } = data.hardware.screen;
      const isSmallScreen = Math.min(width, height) < 768;
      
      if (isMobileUA && !isSmallScreen && !hasTouch) {
        evidence.push('Мобильный UA но десктопный экран без touch');
      }
      
      return { detected: evidence.length > 0, evidence };
    }
  },
  
  {
    id: 'emulation_touch',
    name: 'Эмуляция touch',
    description: 'Touch события эмулируются',
    type: 'emulation',
    severity: 'low',
    detect: (data) => {
      const evidence: string[] = [];
      
      // Touch points без реального touch screen
      const hasTouchPoints = data.hardware.maxTouchPoints > 0;
      const isDesktop = data.parsedUA.device.type === 'desktop';
      
      if (hasTouchPoints && isDesktop) {
        evidence.push('Touch points на desktop устройстве');
      }
      
      return { detected: evidence.length > 0, evidence };
    }
  },
  
  // === MODIFICATION ===
  {
    id: 'modified_canvas',
    name: 'Модифицированный Canvas',
    description: 'Canvas может быть модифицирован',
    type: 'modification',
    severity: 'medium',
    detect: (data) => {
      const evidence: string[] = [];
      
      // Canvas hash слишком простой или одинаковый
      if (data.canvas.textHash === data.canvas.geometryHash) {
        evidence.push('Canvas текст и геометрия имеют одинаковый hash');
      }
      
      // Canvas hash слишком короткий
      if (data.canvas.textHash.length < 4) {
        evidence.push('Canvas hash необычно короткий');
      }
      
      // Canvas not supported но должен быть
      if (!data.canvas.supported && data.webgl.supported) {
        evidence.push('Canvas не поддерживается, но WebGL поддерживается');
      }
      
      return { detected: evidence.length > 0, evidence };
    }
  },
  
  {
    id: 'modified_webgl',
    name: 'Модифицированный WebGL',
    description: 'WebGL параметры могут быть изменены',
    type: 'modification',
    severity: 'medium',
    detect: (data) => {
      const evidence: string[] = [];
      
      // Unknown vendor/renderer
      if (data.webgl.vendor === 'unknown' && data.webgl.supported) {
        evidence.push('WebGL vendor неизвестен');
      }
      
      if (data.webgl.renderer === 'unknown' && data.webgl.supported) {
        evidence.push('WebGL renderer неизвестен');
      }
      
      // Suspicious extensions
      const suspiciousExt = data.webgl.extensions.filter(ext => 
        ext.toLowerCase().includes('spoof') || 
        ext.toLowerCase().includes('fake') ||
        ext.toLowerCase().includes('random')
      );
      
      if (suspiciousExt.length > 0) {
        evidence.push(`Подозрительные расширения: ${suspiciousExt.join(', ')}`);
      }
      
      return { detected: evidence.length > 0, evidence };
    }
  },
  
  {
    id: 'modified_audio',
    name: 'Модифицированный Audio',
    description: 'Audio fingerprint может быть изменён',
    type: 'modification',
    severity: 'low',
    detect: (data) => {
      const evidence: string[] = [];
      
      // Audio not supported но должен быть
      if (!data.audio.supported && data.canvas.supported) {
        evidence.push('AudioContext не поддерживается');
      }
      
      // Audio hash error
      if (data.audio.hash === 'error') {
        evidence.push('Ошибка вычисления Audio fingerprint');
      }
      
      return { detected: evidence.length > 0, evidence };
    }
  },
  
  // === INCONSISTENCY ===
  {
    id: 'inconsistency_timezone',
    name: 'Timezone несоответствие',
    description: 'Timezone не соответствует IP или языку',
    type: 'inconsistency',
    severity: 'medium',
    detect: (data) => {
      const evidence: string[] = [];
      
      // Проверка соответствия timezone и offset
      const tz = data.misc.timezone;
      const offset = data.misc.timezoneOffset;
      
      // Это сложно проверить без базы timezone, но можно проверить аномалии
      if (Math.abs(offset) > 720) { // > 12 часов
        evidence.push(`Timezone offset аномален: ${offset} минут`);
      }
      
      return { detected: evidence.length > 0, evidence };
    }
  },
  
  {
    id: 'inconsistency_screen',
    name: 'Screen несоответствие',
    description: 'Параметры экрана не соответствуют друг другу',
    type: 'inconsistency',
    severity: 'low',
    detect: (data) => {
      const evidence: string[] = [];
      const { width, height, availWidth, availHeight } = data.hardware.screen;
      
      // Available > total
      if (availWidth > width || availHeight > height) {
        evidence.push('Available screen больше чем total screen');
      }
      
      // Очень маленький available
      if (availWidth < width * 0.5 || availHeight < height * 0.5) {
        evidence.push('Available screen значительно меньше total');
      }
      
      return { detected: evidence.length > 0, evidence };
    }
  },
  
  {
    id: 'inconsistency_ua_platform',
    name: 'UA-Platform несоответствие',
    description: 'User-Agent и Platform не соответствуют',
    type: 'inconsistency',
    severity: 'high',
    detect: (data) => {
      const evidence: string[] = [];
      const ua = data.navigator.userAgent.toLowerCase();
      const platform = data.navigator.platform.toLowerCase();
      
      const isWindowsUA = ua.includes('windows');
      const isMacUA = ua.includes('mac os') || ua.includes('macintosh');
      const isLinuxUA = ua.includes('linux') && !ua.includes('android');
      const isAndroidUA = ua.includes('android');
      const isIOSUA = ua.includes('iphone') || ua.includes('ipad');
      
      const isWindowsPlatform = platform.includes('win');
      const isMacPlatform = platform.includes('mac');
      const isLinuxPlatform = platform.includes('linux');
      const isIOSPlatform = platform.includes('iphone') || platform.includes('ipad');
      
      if (isWindowsUA && !isWindowsPlatform) {
        evidence.push(`UA: Windows, Platform: ${data.navigator.platform}`);
      }
      if (isMacUA && !isMacPlatform) {
        evidence.push(`UA: macOS, Platform: ${data.navigator.platform}`);
      }
      if (isLinuxUA && !isLinuxPlatform) {
        evidence.push(`UA: Linux, Platform: ${data.navigator.platform}`);
      }
      if (isAndroidUA && !isLinuxPlatform) {
        evidence.push(`UA: Android, Platform: ${data.navigator.platform}`);
      }
      if (isIOSUA && !isIOSPlatform && !isMacPlatform) {
        evidence.push(`UA: iOS, Platform: ${data.navigator.platform}`);
      }
      
      return { detected: evidence.length > 0, evidence };
    }
  },
  
  {
    id: 'privacy_tools',
    name: 'Privacy инструменты',
    description: 'Обнаружены признаки privacy-инструментов',
    type: 'modification',
    severity: 'low',
    detect: (data) => {
      const evidence: string[] = [];
      
      // Firefox Resist Fingerprinting
      const isFirefox = data.parsedUA.browser.name === 'Firefox';
      const hasStandardTiming = data.audio.sampleRate === 44100;
      const hasStandardScreen = 
        data.hardware.screen.width === 1920 && 
        data.hardware.screen.height === 1080;
      
      if (isFirefox && hasStandardTiming && hasStandardScreen) {
        evidence.push('Возможно используется Firefox Resist Fingerprinting');
      }
      
      // Brave browser
      const isBrave = data.parsedUA.browser.name === 'Brave';
      if (isBrave) {
        evidence.push('Brave browser имеет встроенный anti-fingerprinting');
      }
      
      // Tor Browser indicators
      const hasTorScreen = 
        data.hardware.screen.width === 1920 && 
        data.hardware.screen.height === 1080 &&
        data.hardware.screen.colorDepth === 24;
      const hasTorTiming = data.misc.timezone === 'UTC' || data.misc.timezoneOffset === 0;
      
      if (hasTorScreen && hasTorTiming && isFirefox) {
        evidence.push('Возможно используется Tor Browser');
      }
      
      return { detected: evidence.length > 0, evidence };
    }
  }
];

/**
 * Выполняет анализ аномалий
 */
export function analyzeAnomalies(data: FingerprintData): AnomalyAnalysis {
  const indicators: AnomalyIndicator[] = ANOMALY_INDICATORS.map(ind => {
    const result = ind.detect(data);
    return {
      id: ind.id,
      name: ind.name,
      description: ind.description,
      type: ind.type,
      severity: ind.severity,
      detected: result.detected,
      evidence: result.evidence
    };
  });
  
  const detectedAnomalies = indicators.filter(i => i.detected);
  
  // Calculate probabilities
  const virtualizationCount = detectedAnomalies.filter(a => a.type === 'virtualization').length;
  const automationCount = detectedAnomalies.filter(a => a.type === 'automation').length;
  const modificationCount = detectedAnomalies.filter(a => a.type === 'modification').length;
  
  // Calculate overall score (higher = less anomalies)
  let score = 100;
  detectedAnomalies.forEach(anomaly => {
    switch (anomaly.severity) {
      case 'high': score -= 15; break;
      case 'medium': score -= 8; break;
      case 'low': score -= 3; break;
    }
  });
  score = Math.max(0, score);
  
  return {
    overallScore: score,
    detectedAnomalies,
    virtualizationProbability: Math.min(virtualizationCount * 0.3, 0.95),
    automationProbability: Math.min(automationCount * 0.35, 0.95),
    modificationProbability: Math.min(modificationCount * 0.25, 0.95)
  };
}

/**
 * Интерпретация anomaly score
 */
export function interpretAnomalyScore(score: number): {
  level: string;
  description: string;
  riskLevel: 'none' | 'low' | 'medium' | 'high';
} {
  if (score >= 90) {
    return {
      level: 'Без аномалий',
      description: 'Не обнаружено признаков виртуализации, автоматизации или модификации браузера.',
      riskLevel: 'none'
    };
  }
  if (score >= 70) {
    return {
      level: 'Незначительные аномалии',
      description: 'Обнаружены некоторые признаки, которые могут быть связаны с особенностями вашего браузера или настроек.',
      riskLevel: 'low'
    };
  }
  if (score >= 50) {
    return {
      level: 'Умеренные аномалии',
      description: 'Обнаружены признаки, указывающие на возможную модификацию браузера или использование privacy-инструментов.',
      riskLevel: 'medium'
    };
  }
  return {
    level: 'Значительные аномалии',
    description: 'Обнаружены серьёзные признаки виртуализации, автоматизации или модификации. Это может влиять на работу сайтов.',
    riskLevel: 'high'
  };
}
