// ============================================================
// EchoPrint AI - Utility Functions
// Хеширование и вспомогательные функции
// ============================================================

/**
 * FNV-1a hash - быстрый и надёжный хеш для fingerprint
 */
export function fnv1aHash(str: string): string {
  let hash = 2166136261; // FNV offset basis
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619); // FNV prime
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

/**
 * SHA-256 hash для более точного хеширования
 */
export async function sha256Hash(str: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Синхронный SHA-256 fallback (использует FNV для совместимости)
 */
export function fastHash(str: string): string {
  // Комбинируем FNV для разных частей строки
  const parts = [
    fnv1aHash(str.slice(0, Math.floor(str.length / 3))),
    fnv1aHash(str.slice(Math.floor(str.length / 3), Math.floor(2 * str.length / 3))),
    fnv1aHash(str.slice(Math.floor(2 * str.length / 3))),
  ];
  return parts.join('');
}

/**
 * Создание краткого хеша для отображения
 */
export function shortHash(str: string, length = 8): string {
  return fnv1aHash(str).slice(0, length);
}

/**
 * Безопасное получение значения свойства
 */
export function safeGet<T>(obj: unknown, path: string, defaultValue: T): T {
  try {
    const keys = path.split('.');
    let result: unknown = obj;
    for (const key of keys) {
      if (result && typeof result === 'object' && key in result) {
        result = (result as Record<string, unknown>)[key];
      } else {
        return defaultValue;
      }
    }
    return (result as T) ?? defaultValue;
  } catch {
    return defaultValue;
  }
}

/**
 * Проверка поддержки API
 */
export function isSupported(apiPath: string): boolean {
  try {
    const keys = apiPath.split('.');
    let obj: unknown = window;
    for (const key of keys) {
      if (obj && typeof obj === 'object' && key in obj) {
        obj = (obj as Record<string, unknown>)[key];
      } else {
        return false;
      }
    }
    return obj !== undefined && obj !== null;
  } catch {
    return false;
  }
}

/**
 * Безопасное выполнение async функции с таймаутом
 */
export async function safeAsync<T>(
  fn: () => Promise<T>,
  defaultValue: T,
  timeout = 5000
): Promise<T> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    const result = await Promise.race([
      fn(),
      new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Timeout')), timeout);
      })
    ]);
    
    clearTimeout(timeoutId);
    return result;
  } catch {
    return defaultValue;
  }
}

/**
 * Безопасное выполнение sync функции
 */
export function safeSync<T>(fn: () => T, defaultValue: T): T {
  try {
    return fn();
  } catch {
    return defaultValue;
  }
}

/**
 * Измерение времени выполнения
 */
export async function measureTime<T>(
  fn: () => Promise<T>
): Promise<{ result: T; duration: number }> {
  const start = performance.now();
  const result = await fn();
  const duration = performance.now() - start;
  return { result, duration };
}

/**
 * Задержка для анимаций
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Форматирование байтов
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Форматирование числа с разделителями
 */
export function formatNumber(num: number): string {
  return num.toLocaleString('ru-RU');
}

/**
 * Определение ранка редкости сигнала (0-100)
 * 100 = крайне редкий, 0 = очень распространённый
 */
export function calculateRarityScore(
  value: unknown,
  distribution: Map<unknown, number>,
  totalSamples: number
): number {
  if (!distribution.has(value)) return 100;
  const count = distribution.get(value) ?? 0;
  const frequency = count / totalSamples;
  
  // Чем ниже частота, тем выше редкость
  return Math.round((1 - frequency) * 100);
}

/**
 * Генерация случайного ID
 */
export function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Глубокое клонирование объекта
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Сравнение версий
 */
export function compareVersions(v1: string, v2: string): number {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);
  
  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const p1 = parts1[i] ?? 0;
    const p2 = parts2[i] ?? 0;
    if (p1 > p2) return 1;
    if (p1 < p2) return -1;
  }
  return 0;
}

/**
 * Проверка валидности IP адреса
 */
export function isValidIP(ip: string): boolean {
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (ipv4Regex.test(ip)) {
    return ip.split('.').every(octet => parseInt(octet) <= 255);
  }
  return false;
}

/**
 * Проверка является ли IP локальным
 */
export function isPrivateIP(ip: string): boolean {
  if (!isValidIP(ip)) return false;
  const parts = ip.split('.').map(Number);
  
  // 10.0.0.0/8
  if (parts[0] === 10) return true;
  // 172.16.0.0/12
  if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
  // 192.168.0.0/16
  if (parts[0] === 192 && parts[1] === 168) return true;
  // 169.254.0.0/16 (link-local)
  if (parts[0] === 169 && parts[1] === 254) return true;
  // 127.0.0.0/8 (loopback)
  if (parts[0] === 127) return true;
  
  return false;
}
