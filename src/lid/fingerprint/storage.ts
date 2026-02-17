// ============================================================
// EchoPrint AI - Storage APIs
// Проверка доступности Storage APIs
// ============================================================

import { safeSync, safeAsync } from '../utils/helpers';
import type { StorageInfo } from '../types';

/**
 * Проверяет доступность localStorage
 */
function checkLocalStorage(): boolean {
  try {
    const test = '__echoprint_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

/**
 * Проверяет доступность sessionStorage
 */
function checkSessionStorage(): boolean {
  try {
    const test = '__echoprint_test__';
    sessionStorage.setItem(test, test);
    sessionStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

/**
 * Проверяет доступность IndexedDB
 */
function checkIndexedDB(): boolean {
  return safeSync(() => 'indexedDB' in window, false);
}

/**
 * Проверяет поддержку Service Worker
 */
function checkServiceWorker(): boolean {
  return safeSync(() => 'serviceWorker' in navigator, false);
}

/**
 * Проверяет включены ли cookies
 */
function checkCookiesEnabled(): boolean {
  return safeSync(() => navigator.cookieEnabled, false);
}

/**
 * Получает информацию о квоте хранилища
 */
async function getStorageQuota(): Promise<number | null> {
  try {
    // @ts-expect-error - storage API may not exist
    if (navigator.storage && navigator.storage.estimate) {
      // @ts-expect-error - storage API
      const estimate = await navigator.storage.estimate();
      return estimate.quota || null;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Основная функция сбора информации о storage
 */
export async function getStorageInfo(): Promise<StorageInfo> {
  const quota = await safeAsync(() => getStorageQuota(), null, 5000);

  return {
    localStorage: checkLocalStorage(),
    sessionStorage: checkSessionStorage(),
    indexedDB: checkIndexedDB(),
    serviceWorker: checkServiceWorker(),
    cookiesEnabled: checkCookiesEnabled(),
    storageQuota: quota
  };
}

/**
 * Проверяет доступность всех API для PWA
 */
export function checkPWASupport(): {
  serviceWorker: boolean;
  manifest: boolean;
  pushManager: boolean;
  notifications: boolean;
} {
  return {
    serviceWorker: checkServiceWorker(),
    manifest: safeSync(() => {
      const manifest = document.querySelector('link[rel="manifest"]');
      return !!manifest;
    }, false),
    pushManager: safeSync(() => 'PushManager' in window, false),
    notifications: safeSync(() => 'Notification' in window, false)
  };
}

/**
 * Проверяет режим приватного просмотра
 */
export function detectPrivateMode(): {
  isPrivate: boolean;
  confidence: number;
  indicators: string[];
} {
  const indicators: string[] = [];
  
  // Проверка filesystem API (Chrome)
  // @ts-expect-error - checking webkit filesystem
  if (window.webkitRequestFileSystem) {
    // В приватном режиме этот API недоступен
    // Это асинхронная проверка, пропускаем здесь
  }

  // Проверка localStorage в Safari
  try {
    if (typeof localStorage === 'object') {
      try {
        localStorage.setItem('test', 'test');
        localStorage.removeItem('test');
      } catch {
        indicators.push('localStorage quota exceeded');
      }
    }
  } catch {
    indicators.push('localStorage not available');
  }

  // Проверка IndexedDB в Firefox
  try {
    if (window.indexedDB) {
      // В приватном режиме Firefox IndexedDB может быть недоступен
    }
  } catch {
    indicators.push('IndexedDB not available');
  }

  // Проверка requestFileSystem
  // @ts-expect-error - checking requestFileSystem
  if (typeof window.requestFileSystem === 'function') {
    // Может быть недоступен в приватном режиме
  }

  return {
    isPrivate: indicators.length > 0,
    confidence: Math.min(indicators.length * 0.3, 0.9),
    indicators
  };
}

/**
 * Получает размер используемого хранилища
 */
export async function getStorageUsage(): Promise<{
  usage: number;
  quota: number;
  percentage: number;
} | null> {
  try {
    // @ts-expect-error - storage API
    if (navigator.storage && navigator.storage.estimate) {
      // @ts-expect-error - storage API
      const estimate = await navigator.storage.estimate();
      return {
        usage: estimate.usage || 0,
        quota: estimate.quota || 0,
        percentage: estimate.quota ? (estimate.usage || 0) / estimate.quota * 100 : 0
      };
    }
    return null;
  } catch {
    return null;
  }
}
