// ============================================================
// EchoPrint AI - Sensors API
// Определение доступности сенсоров устройства
// ============================================================

import { safeSync, safeAsync } from '../utils/helpers';
import type { SensorsInfo } from '../types';

/**
 * Проверяет поддержку Sensor APIs
 */
function checkSensorAPI(name: string): boolean {
  return safeSync(() => name in window, false);
}

/**
 * Проверяет доступность DeviceOrientation
 */
function checkDeviceOrientation(): boolean {
  return safeSync(() => 'DeviceOrientationEvent' in window, false);
}

/**
 * Проверяет доступность DeviceMotion
 */
function checkDeviceMotion(): boolean {
  return safeSync(() => 'DeviceMotionEvent' in window, false);
}

/**
 * Пытается получить разрешение на доступ к сенсорам (iOS 13+)
 */
async function requestSensorPermission(): Promise<boolean> {
  try {
    // iOS 13+ требует запрос разрешения для DeviceOrientation
    const DeviceOrientationEventClass = window.DeviceOrientationEvent as typeof DeviceOrientationEvent & {
      requestPermission?: () => Promise<'granted' | 'denied'>;
    };
    
    if (typeof DeviceOrientationEventClass.requestPermission === 'function') {
      const permission = await DeviceOrientationEventClass.requestPermission();
      return permission === 'granted';
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Получает данные с акселерометра
 */
async function getAccelerometerData(): Promise<{
  available: boolean;
  x: number | null;
  y: number | null;
  z: number | null;
}> {
  if (!checkSensorAPI('Accelerometer')) {
    return { available: false, x: null, y: null, z: null };
  }

  try {
    const AccelerometerClass = window.Accelerometer as typeof Accelerometer;
    const accelerometer = new AccelerometerClass({ frequency: 1 });
    
    return new Promise((resolve) => {
      accelerometer.addEventListener('reading', () => {
        const data = {
          available: true,
          x: accelerometer.x,
          y: accelerometer.y,
          z: accelerometer.z
        };
        accelerometer.stop();
        resolve(data);
      });
      
      accelerometer.addEventListener('error', () => {
        accelerometer.stop();
        resolve({ available: false, x: null, y: null, z: null });
      });
      
      accelerometer.start();
      
      // Таймаут
      setTimeout(() => {
        accelerometer.stop();
        resolve({ available: false, x: null, y: null, z: null });
      }, 2000);
    });
  } catch {
    return { available: false, x: null, y: null, z: null };
  }
}

/**
 * Основная функция сбора информации о сенсорах
 */
export function getSensorsInfo(): SensorsInfo {
  return {
    accelerometer: checkSensorAPI('Accelerometer'),
    gyroscope: checkSensorAPI('Gyroscope'),
    deviceOrientation: checkDeviceOrientation(),
    deviceMotion: checkDeviceMotion(),
    ambientLight: checkSensorAPI('AmbientLightSensor')
  };
}

/**
 * Полная проверка сенсоров с попыткой получения данных
 */
export async function getSensorsInfoFull(): Promise<SensorsInfo & {
  orientationData: { alpha: number; beta: number; gamma: number } | null;
  motionData: { acceleration: { x: number; y: number; z: number } | null } | null;
  accelerometerData: { x: number; y: number; z: number } | null;
  gyroscopeData: { x: number; y: number; z: number } | null;
}> {
  const basicInfo = getSensorsInfo();
  
  // Пытаемся получить данные ориентации
  let orientationData: { alpha: number; beta: number; gamma: number } | null = null;
  if (basicInfo.deviceOrientation) {
    orientationData = await new Promise((resolve) => {
      const handler = (event: DeviceOrientationEvent) => {
        resolve({
          alpha: event.alpha,
          beta: event.beta,
          gamma: event.gamma
        });
        window.removeEventListener('deviceorientation', handler);
      };
      
      window.addEventListener('deviceorientation', handler);
      
      setTimeout(() => {
        window.removeEventListener('deviceorientation', handler);
        resolve(null);
      }, 1000);
    });
  }

  // Пытаемся получить данные движения
  let motionData: { acceleration: { x: number; y: number; z: number } | null } | null = null;
  if (basicInfo.deviceMotion) {
    motionData = await new Promise((resolve) => {
      const handler = (event: DeviceMotionEvent) => {
        resolve({
          acceleration: event.acceleration ? {
            x: event.acceleration.x,
            y: event.acceleration.y,
            z: event.acceleration.z
          } : null
        });
        window.removeEventListener('devicemotion', handler);
      };
      
      window.addEventListener('devicemotion', handler);
      
      setTimeout(() => {
        window.removeEventListener('devicemotion', handler);
        resolve(null);
      }, 1000);
    });
  }

  // Accelerometer API
  let accelerometerData: { x: number; y: number; z: number } | null = null;
  if (basicInfo.accelerometer) {
    const accData = await getAccelerometerData();
    if (accData.available) {
      accelerometerData = { x: accData.x!, y: accData.y!, z: accData.z! };
    }
  }

  // Gyroscope API
  let gyroscopeData: { x: number; y: number; z: number } | null = null;
  if (basicInfo.gyroscope) {
    try {
      const GyroscopeClass = window.Gyroscope as typeof Gyroscope;
      const gyro = new GyroscopeClass({ frequency: 1 });
      
      gyroscopeData = await new Promise((resolve) => {
        gyro.addEventListener('reading', () => {
          resolve({ x: gyro.x, y: gyro.y, z: gyro.z });
          gyro.stop();
        });
        
        gyro.addEventListener('error', () => {
          gyro.stop();
          resolve(null);
        });
        
        gyro.start();
        
        setTimeout(() => {
          gyro.stop();
          resolve(null);
        }, 2000);
      });
    } catch {
      gyroscopeData = null;
    }
  }

  return {
    ...basicInfo,
    orientationData,
    motionData,
    accelerometerData,
    gyroscopeData
  };
}

/**
 * Проверяет, является ли устройство мобильным на основе сенсоров
 */
export function isMobileBySensors(): boolean {
  const info = getSensorsInfo();
  return info.deviceOrientation || info.deviceMotion || info.accelerometer;
}
