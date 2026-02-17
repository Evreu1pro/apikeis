// ============================================================
// EchoPrint AI - Hardware Information
// Сбор информации о железе: CPU, RAM, Screen, GPU
// ============================================================

import { safeSync, safeAsync } from '../utils/helpers';
import type { HardwareInfo } from '../types';

/**
 * Получает информацию о CPU cores
 */
function getCPUCores(): number {
  return safeSync(() => navigator.hardwareConcurrency, 0);
}

/**
 * Получает информацию о памяти
 */
function getDeviceMemory(): number | null {
  return safeSync(() => (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? null, null);
}

/**
 * Получает информацию об экране
 */
function getScreenInfo(): HardwareInfo['screen'] {
  return safeSync(() => ({
    width: screen.width,
    height: screen.height,
    availWidth: screen.availWidth,
    availHeight: screen.availHeight,
    colorDepth: screen.colorDepth,
    pixelRatio: window.devicePixelRatio || 1,
    orientation: screen.orientation?.type || null
  }), {
    width: 0,
    height: 0,
    availWidth: 0,
    availHeight: 0,
    colorDepth: 24,
    pixelRatio: 1,
    orientation: null
  });
}

/**
 * Получает touch points
 */
function getMaxTouchPoints(): number {
  return safeSync(() => navigator.maxTouchPoints || 0, 0);
}

/**
 * Получает GPU информацию из WebGL
 */
function getGPUInfo(): { vendor: string; renderer: string } {
  return safeSync(() => {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl') as WebGLRenderingContext | null;
    
    if (!gl) {
      return { vendor: 'unknown', renderer: 'unknown' };
    }

    const debugExt = gl.getExtension('WEBGL_debug_renderer_info');
    if (debugExt) {
      return {
        vendor: gl.getParameter(debugExt.UNMASKED_VENDOR_WEBGL) || 'unknown',
        renderer: gl.getParameter(debugExt.UNMASKED_RENDERER_WEBGL) || 'unknown'
      };
    }

    return { vendor: 'unknown', renderer: 'unknown' };
  }, { vendor: 'unknown', renderer: 'unknown' });
}

/**
 * Основная функция сбора hardware информации
 */
export function getHardwareInfo(): HardwareInfo {
  return {
    cpuCores: getCPUCores(),
    memory: getDeviceMemory(),
    screen: getScreenInfo(),
    maxTouchPoints: getMaxTouchPoints(),
    gpu: getGPUInfo()
  };
}

/**
 * Проверяет наличие multiple monitors
 */
export function hasMultipleMonitors(): boolean {
  return safeSync(() => {
    // Если availWidth/Height отличаются от screen width/height значительно
    const screenArea = screen.width * screen.height;
    const availArea = screen.availWidth * screen.availHeight;
    
    // Если доступная область значительно меньше, возможно несколько мониторов
    // или панель задач занимает много места
    return screenArea > availArea * 1.2;
  }, false);
}

/**
 * Оценивает примерную мощность устройства
 */
export function estimateDevicePerformance(): 'low' | 'medium' | 'high' | 'very_high' {
  const cpuCores = getCPUCores();
  const memory = getDeviceMemory();
  const gpu = getGPUInfo();
  
  let score = 0;
  
  // CPU cores
  if (cpuCores >= 16) score += 4;
  else if (cpuCores >= 8) score += 3;
  else if (cpuCores >= 4) score += 2;
  else if (cpuCores >= 2) score += 1;
  
  // Memory
  if (memory !== null) {
    if (memory >= 32) score += 4;
    else if (memory >= 16) score += 3;
    else if (memory >= 8) score += 2;
    else if (memory >= 4) score += 1;
  }
  
  // GPU
  const renderer = gpu.renderer.toLowerCase();
  if (renderer.includes('rtx 40') || renderer.includes('rx 7')) score += 4;
  else if (renderer.includes('rtx 30') || renderer.includes('rx 6')) score += 3;
  else if (renderer.includes('rtx 20') || renderer.includes('gtx 16') || renderer.includes('rx 5')) score += 2;
  else if (renderer.includes('gtx') || renderer.includes('radeon')) score += 1;
  
  // Screen resolution
  const { width, height } = getScreenInfo();
  const resolution = width * height;
  if (resolution >= 3840 * 2160) score += 2; // 4K
  else if (resolution >= 2560 * 1440) score += 1; // 2K
  
  if (score >= 12) return 'very_high';
  if (score >= 8) return 'high';
  if (score >= 4) return 'medium';
  return 'low';
}

/**
 * Определяет тип устройства
 */
export function detectDeviceType(): 'desktop' | 'mobile' | 'tablet' {
  const maxTouchPoints = getMaxTouchPoints();
  const { width, height } = getScreenInfo();
  const pixelRatio = window.devicePixelRatio || 1;
  
  // Tablet detection
  if (maxTouchPoints > 0 && width >= 768 && height >= 768) {
    // Проверяем user agent для подтверждения
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes('tablet') || ua.includes('ipad')) {
      return 'tablet';
    }
    // iPad Pro с высокой плотностью пикселей
    if (ua.includes('mac') && maxTouchPoints > 0) {
      return 'tablet';
    }
  }
  
  // Mobile detection
  if (maxTouchPoints > 0 && (width < 768 || height < 768)) {
    return 'mobile';
  }
  
  // Default
  return 'desktop';
}

/**
 * Проверяет наличие Retina/HiDPI дисплея
 */
export function hasHiDPIDisplay(): boolean {
  const pixelRatio = window.devicePixelRatio || 1;
  return pixelRatio >= 2;
}

/**
 * Получает информацию о батарее (если доступно)
 */
export async function getBatteryStatus(): Promise<{
  level: number;
  charging: boolean;
  chargingTime: number | null;
  dischargingTime: number | null;
} | null> {
  const nav = navigator as Navigator & { 
    getBattery?: () => Promise<{
      level: number;
      charging: boolean;
      chargingTime: number;
      dischargingTime: number;
    }> 
  };
  
  if (!nav.getBattery) {
    return null;
  }

  try {
    const battery = await nav.getBattery();
    return {
      level: battery.level,
      charging: battery.charging,
      chargingTime: battery.chargingTime === Infinity ? null : battery.chargingTime,
      dischargingTime: battery.dischargingTime === Infinity ? null : battery.dischargingTime
    };
  } catch {
    return null;
  }
}

/**
 * Проверяет поддержку pointer events
 */
export function getPointerCapabilities(): {
  primaryPointer: 'mouse' | 'touch' | 'pen' | 'unknown';
  maxTouchPoints: number;
  coarsePointer: boolean;
} {
  const coarsePointer = safeSync(
    () => window.matchMedia('(pointer: coarse)').matches,
    false
  );
  const finePointer = safeSync(
    () => window.matchMedia('(pointer: fine)').matches,
    false
  );
  const anyHover = safeSync(
    () => window.matchMedia('(any-hover: hover)').matches,
    false
  );
  
  let primaryPointer: 'mouse' | 'touch' | 'pen' | 'unknown' = 'unknown';
  
  if (finePointer && anyHover) {
    primaryPointer = 'mouse';
  } else if (coarsePointer) {
    primaryPointer = 'touch';
  }
  
  return {
    primaryPointer,
    maxTouchPoints: getMaxTouchPoints(),
    coarsePointer
  };
}
