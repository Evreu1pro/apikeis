// ============================================================
// EchoPrint AI - WebRTC Leak Detection
// Обнаружение утечек локальных IP через WebRTC
// ============================================================

import { safeAsync, isValidIP, isPrivateIP } from '../utils/helpers';
import type { WebRTCLeak } from '../types';

// STUN серверы для проверки
const STUN_SERVERS = [
  'stun:stun.l.google.com:19302',
  'stun:stun1.l.google.com:19302',
  'stun:stun2.l.google.com:19302'
];

/**
 * Создаёт RTCPeerConnection и собирает ICE candidates
 */
async function gatherIPs(stunServer: string): Promise<string[]> {
  return new Promise((resolve) => {
    const ips: string[] = [];

    // Проверяем поддержку WebRTC
    const RTCPeerConnectionClass = window.RTCPeerConnection ||
      (window as unknown as { webkitRTCPeerConnection: typeof RTCPeerConnection }).webkitRTCPeerConnection;

    if (!RTCPeerConnectionClass) {
      resolve([]);
      return;
    }

    try {
      // Создаём соединение
      const pc = new RTCPeerConnectionClass({
        iceServers: [{ urls: stunServer }]
      });

      // Создаём data channel (необходим для ICE gathering)
      pc.createDataChannel('');

      // Обработчик ICE candidates
      pc.onicecandidate = (event) => {
        if (!event.candidate) {
          // ICE gathering завершён
          pc.close();
          resolve(ips);
          return;
        }

        const candidate = event.candidate.candidate;
        
        // Извлекаем IPv4 адреса
        const ipv4Match = candidate.match(/(\d{1,3}\.){3}\d{1,3}/g);
        if (ipv4Match) {
          ipv4Match.forEach(ip => {
            if (isValidIP(ip) && !ips.includes(ip)) {
              ips.push(ip);
            }
          });
        }

        // Извлекаем IPv6 адреса
        const ipv6Match = candidate.match(/([a-f0-9:]+:+)+[a-f0-9]+/gi);
        if (ipv6Match) {
          ipv6Match.forEach(ip => {
            if (!ips.includes(ip)) {
              ips.push(ip);
            }
          });
        }
      };

      // Создаём offer и устанавливаем local description
      pc.createOffer()
        .then(offer => pc.setLocalDescription(offer))
        .catch(() => {
          pc.close();
          resolve(ips);
        });

      // Таймаут на случай медленного ICE gathering
      setTimeout(() => {
        pc.close();
        resolve(ips);
      }, 5000);

    } catch {
      resolve([]);
    }
  });
}

/**
 * Основная функция обнаружения WebRTC утечек
 */
export async function getWebRTCLeak(): Promise<WebRTCLeak> {
  // Проверяем поддержку WebRTC
  const enabled = typeof RTCPeerConnection !== 'undefined' ||
    typeof (window as unknown as { webkitRTCPeerConnection: unknown }).webkitRTCPeerConnection !== 'undefined';

  if (!enabled) {
    return {
      localIPs: [],
      publicIP: null,
      enabled: false,
      stunServer: ''
    };
  }

  // Пытаемся собрать IP через первый STUN сервер
  const allIPs = await safeAsync(
    () => gatherIPs(STUN_SERVERS[0]),
    [],
    10000
  );

  // Разделяем на локальные и публичные
  const localIPs: string[] = [];
  let publicIP: string | null = null;

  allIPs.forEach(ip => {
    if (isPrivateIP(ip)) {
      localIPs.push(ip);
    } else if (!ip.startsWith('[') && !ip.includes(':')) {
      // IPv4 публичный (не локальный и не IPv6)
      publicIP = ip;
    }
  });

  // Убираем дубликаты
  const uniqueLocalIPs = [...new Set(localIPs)];

  return {
    localIPs: uniqueLocalIPs,
    publicIP,
    enabled: true,
    stunServer: STUN_SERVERS[0]
  };
}

/**
 * Проверяет, включён ли WebRTC
 */
export function isWebRTCEnabled(): boolean {
  return typeof RTCPeerConnection !== 'undefined' ||
    typeof (window as unknown as { webkitRTCPeerConnection: unknown }).webkitRTCPeerConnection !== 'undefined';
}

/**
 * Проверяет, блокирует ли браузер WebRTC утечки
 */
export async function checkWebRTCLeakProtection(): Promise<boolean> {
  const leak = await getWebRTCLeak();
  // Если нет локальных IP, утечка заблокирована
  return leak.localIPs.length === 0;
}

/**
 * Определяет тип сети по IP
 */
export function detectNetworkType(ips: string[]): {
  type: 'vpn' | 'proxy' | 'direct' | 'unknown';
  confidence: number;
} {
  if (ips.length === 0) {
    return { type: 'unknown', confidence: 0 };
  }

  // Простая эвристика
  const hasOnlyLoopback = ips.every(ip => ip.startsWith('127.'));
  const hasVPNlikeIP = ips.some(ip => ip.startsWith('10.') || ip.startsWith('172.'));
  const hasCarrierGradeNAT = ips.some(ip => ip.startsWith('100.64.'));

  if (hasOnlyLoopback) {
    return { type: 'proxy', confidence: 0.7 };
  }

  if (hasCarrierGradeNAT) {
    return { type: 'vpn', confidence: 0.6 };
  }

  if (hasVPNlikeIP && ips.length === 1) {
    return { type: 'vpn', confidence: 0.5 };
  }

  return { type: 'direct', confidence: 0.8 };
}
