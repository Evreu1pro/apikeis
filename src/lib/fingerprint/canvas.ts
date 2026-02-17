// ============================================================
// EchoPrint AI - Canvas Fingerprint
// Сбор Canvas 2D fingerprint (текст, геометрия, эмодзи, градиенты)
// ============================================================

import { fnv1aHash, safeSync } from '../utils/helpers';
import type { CanvasFingerprint } from '../types';

interface CanvasTest {
  name: string;
  draw: (ctx: CanvasRenderingContext2D) => void;
}

const CANVAS_TESTS: CanvasTest[] = [
  {
    name: 'text',
    draw: (ctx) => {
      // Текст с разными шрифтами и стилями
      ctx.textBaseline = 'top';
      
      // Фон
      ctx.fillStyle = '#f60';
      ctx.fillRect(100, 1, 62, 20);
      
      // Основной текст
      ctx.font = '11px Arial';
      ctx.fillStyle = '#069';
      ctx.fillText('CanvasFP 12345', 2, 15);
      
      // Emoji текст
      ctx.font = '14px Arial';
      ctx.fillText('🔥🌟🎮🎯🚀', 2, 35);
      
      // Разные шрифты
      ctx.font = '16px Times New Roman';
      ctx.fillStyle = '#333';
      ctx.fillText('Different Font', 2, 55);
      
      ctx.font = 'italic 12px Georgia';
      ctx.fillStyle = '#666';
      ctx.fillText('Italic Text Sample', 2, 75);
    }
  },
  {
    name: 'geometry',
    draw: (ctx) => {
      // Круги
      ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
      ctx.beginPath();
      ctx.arc(50, 50, 30, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = 'rgba(0, 255, 0, 0.5)';
      ctx.beginPath();
      ctx.arc(80, 50, 30, 0, Math.PI * 2);
      ctx.fill();
      
      // Прямоугольники
      ctx.fillStyle = 'rgba(0, 0, 255, 0.3)';
      ctx.fillRect(110, 20, 50, 60);
      
      // Линии
      ctx.strokeStyle = '#ff6600';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(170, 20);
      ctx.lineTo(220, 80);
      ctx.stroke();
      
      // Кривые Безье
      ctx.strokeStyle = '#0066ff';
      ctx.beginPath();
      ctx.moveTo(230, 50);
      ctx.bezierCurveTo(250, 20, 280, 80, 300, 50);
      ctx.stroke();
    }
  },
  {
    name: 'gradients',
    draw: (ctx) => {
      // Линейный градиент
      const linearGrad = ctx.createLinearGradient(0, 0, 200, 0);
      linearGrad.addColorStop(0, 'red');
      linearGrad.addColorStop(0.25, 'orange');
      linearGrad.addColorStop(0.5, 'yellow');
      linearGrad.addColorStop(0.75, 'green');
      linearGrad.addColorStop(1, 'blue');
      ctx.fillStyle = linearGrad;
      ctx.fillRect(0, 0, 200, 40);
      
      // Радиальный градиент
      const radialGrad = ctx.createRadialGradient(300, 50, 10, 300, 50, 50);
      radialGrad.addColorStop(0, 'white');
      radialGrad.addColorStop(0.5, 'gray');
      radialGrad.addColorStop(1, 'black');
      ctx.fillStyle = radialGrad;
      ctx.beginPath();
      ctx.arc(300, 50, 50, 0, Math.PI * 2);
      ctx.fill();
    }
  },
  {
    name: 'patterns',
    draw: (ctx) => {
      // Паттерн из данных изображения
      const patternCanvas = document.createElement('canvas');
      patternCanvas.width = 10;
      patternCanvas.height = 10;
      const patternCtx = patternCanvas.getContext('2d')!;
      
      patternCtx.fillStyle = '#ccc';
      patternCtx.fillRect(0, 0, 10, 10);
      patternCtx.fillStyle = '#666';
      patternCtx.fillRect(0, 0, 5, 5);
      patternCtx.fillRect(5, 5, 5, 5);
      
      const pattern = ctx.createPattern(patternCanvas, 'repeat');
      ctx.fillStyle = pattern;
      ctx.fillRect(0, 0, 150, 100);
      
      // Тень
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = 5;
      ctx.shadowOffsetY = 5;
      ctx.fillStyle = '#ff9900';
      ctx.fillRect(160, 10, 80, 60);
      ctx.shadowColor = 'transparent';
    }
  }
];

/**
 * Рисует комплексный тест на canvas
 */
function drawComplexTest(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  // Очистка
  ctx.clearRect(0, 0, width, height);
  
  // Фон
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);
  
  // Выполняем все тесты
  CANVAS_TESTS.forEach(test => test.draw(ctx));
  
  // Дополнительные тесты на анти-алиасинг
  ctx.strokeStyle = '#ff00ff';
  ctx.lineWidth = 0.5;
  for (let i = 0; i < 10; i++) {
    ctx.beginPath();
    ctx.moveTo(0, 90 + i * 0.1);
    ctx.lineTo(400, 90 + i * 0.1);
    ctx.stroke();
  }
  
  // Глобальная прозрачность
  ctx.globalAlpha = 0.5;
  ctx.fillStyle = '#00ff00';
  ctx.fillRect(320, 0, 80, 100);
  ctx.globalAlpha = 1.0;
}

/**
 * Получает hash данных canvas
 */
function getCanvasHash(canvas: HTMLCanvasElement): string {
  const dataURL = canvas.toDataURL();
  return fnv1aHash(dataURL);
}

/**
 * Получает hash отдельного теста
 */
function getTestHash(ctx: CanvasRenderingContext2D, width: number, height: number, test: CanvasTest): string {
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);
  test.draw(ctx);
  return fnv1aHash(ctx.canvas.toDataURL());
}

/**
 * Основная функция сбора Canvas fingerprint
 */
export function getCanvasFingerprint(): CanvasFingerprint {
  const supported = safeSync(() => {
    const testCanvas = document.createElement('canvas');
    return !!(testCanvas.getContext?.('2d'));
  }, false);

  if (!supported) {
    return {
      textHash: 'not_supported',
      geometryHash: 'not_supported',
      gradientHash: 'not_supported',
      emojiHash: 'not_supported',
      rawDataURL: '',
      supported: false
    };
  }

  const canvas = document.createElement('canvas');
  canvas.width = 400;
  canvas.height = 100;
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;

  // Получаем hash для каждого типа теста
  const textHash = safeSync(() => {
    ctx.clearRect(0, 0, 400, 100);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 400, 100);
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillStyle = '#069';
    ctx.fillText('Canvas fingerprint test 🔥🌟', 2, 2);
    ctx.font = '16px serif';
    ctx.fillText('Cwm fjordbank glyphs vext quiz', 2, 25);
    return fnv1aHash(canvas.toDataURL());
  }, 'error');

  const geometryHash = safeSync(() => {
    ctx.clearRect(0, 0, 400, 100);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 400, 100);
    
    // Различные геометрические фигуры
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(10, 10, 50, 50);
    
    ctx.fillStyle = 'rgba(0, 255, 0, 0.5)';
    ctx.beginPath();
    ctx.arc(100, 35, 25, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.strokeStyle = '#0000ff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(150, 10);
    ctx.lineTo(200, 60);
    ctx.lineTo(150, 60);
    ctx.closePath();
    ctx.stroke();
    
    return fnv1aHash(canvas.toDataURL());
  }, 'error');

  const gradientHash = safeSync(() => {
    ctx.clearRect(0, 0, 400, 100);
    
    const gradient = ctx.createLinearGradient(0, 0, 400, 0);
    gradient.addColorStop(0, 'red');
    gradient.addColorStop(0.25, 'yellow');
    gradient.addColorStop(0.5, 'green');
    gradient.addColorStop(0.75, 'cyan');
    gradient.addColorStop(1, 'blue');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 400, 100);
    
    return fnv1aHash(canvas.toDataURL());
  }, 'error');

  const emojiHash = safeSync(() => {
    ctx.clearRect(0, 0, 400, 100);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 400, 100);
    
    ctx.font = '24px Arial';
    ctx.textBaseline = 'middle';
    
    // Разные эмодзи для тестирования рендеринга
    const emojis = ['🔥', '🌟', '🎮', '🎯', '🚀', '💻', '🎨', '🌈', '⚡', '🔮'];
    emojis.forEach((emoji, i) => {
      ctx.fillText(emoji, 10 + (i % 10) * 38, 50);
    });
    
    return fnv1aHash(canvas.toDataURL());
  }, 'error');

  // Полный комплексный тест
  const rawDataURL = safeSync(() => {
    drawComplexTest(ctx, 400, 100);
    return canvas.toDataURL();
  }, '');

  return {
    textHash,
    geometryHash,
    gradientHash,
    emojiHash,
    rawDataURL,
    supported: true
  };
}

/**
 * Проверка поддержки toBlob
 */
export function supportsCanvasToBlob(): boolean {
  return safeSync(() => {
    const canvas = document.createElement('canvas');
    return typeof canvas.toBlob === 'function';
  }, false);
}

/**
 * Проверка поддержки imageData
 */
export function supportsImageData(): boolean {
  return safeSync(() => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    return typeof ctx?.getImageData === 'function';
  }, false);
}
