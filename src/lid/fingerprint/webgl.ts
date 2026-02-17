// ============================================================
// EchoPrint AI - WebGL Fingerprint
// Сбор WebGL информации (vendor, renderer, extensions, параметры)
// ============================================================

import { fnv1aHash, safeSync } from '../utils/helpers';
import type { WebGLFingerprint } from '../types';

// Параметры WebGL для извлечения
const WEBGL_PARAMETERS = [
  'VERSION',
  'SHADING_LANGUAGE_VERSION',
  'VENDOR',
  'RENDERER',
  'MAX_VERTEX_ATTRIBS',
  'MAX_VERTEX_UNIFORM_VECTORS',
  'MAX_VARYING_VECTORS',
  'MAX_COMBINED_TEXTURE_IMAGE_UNITS',
  'MAX_VERTEX_TEXTURE_IMAGE_UNITS',
  'MAX_TEXTURE_IMAGE_UNITS',
  'MAX_FRAGMENT_UNIFORM_VECTORS',
  'MAX_CUBE_MAP_TEXTURE_SIZE',
  'MAX_RENDERBUFFER_SIZE',
  'MAX_TEXTURE_SIZE',
  'MAX_VIEWPORT_DIMS',
  'RED_BITS',
  'GREEN_BITS',
  'BLUE_BITS',
  'ALPHA_BITS',
  'DEPTH_BITS',
  'STENCIL_BITS'
];

/**
 * Получает WebGL контекст
 */
function getWebGLContext(): WebGLRenderingContext | null {
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  return gl as WebGLRenderingContext | null;
}

/**
 * Рендерит WebGL сцену и возвращает hash
 */
function renderWebGLScene(gl: WebGLRenderingContext): string {
  const canvas = gl.canvas as HTMLCanvasElement;
  canvas.width = 256;
  canvas.height = 128;

  // Vertex shader
  const vsSource = `
    attribute vec4 aVertexPosition;
    attribute vec4 aVertexColor;
    varying lowp vec4 vColor;
    void main() {
      gl_Position = aVertexPosition;
      vColor = aVertexColor;
    }
  `;

  // Fragment shader
  const fsSource = `
    varying lowp vec4 vColor;
    void main() {
      gl_FragColor = vColor;
    }
  `;

  // Компиляция шейдеров
  const compileShader = (type: number, source: string): WebGLShader | null => {
    const shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    return shader;
  };

  const vertexShader = compileShader(gl.VERTEX_SHADER, vsSource);
  const fragmentShader = compileShader(gl.FRAGMENT_SHADER, fsSource);

  if (!vertexShader || !fragmentShader) {
    return 'shader_error';
  }

  // Создаём программу
  const program = gl.createProgram();
  if (!program) return 'program_error';
  
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  gl.useProgram(program);

  // Вершины треугольника
  const positions = new Float32Array([
    0.0,  1.0,  0.0,
   -1.0, -1.0,  0.0,
    1.0, -1.0,  0.0
  ]);

  const colors = new Float32Array([
    1.0, 0.0, 0.0, 1.0,
    0.0, 1.0, 0.0, 1.0,
    0.0, 0.0, 1.0, 1.0
  ]);

  // Буфер позиций
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

  const positionLocation = gl.getAttribLocation(program, 'aVertexPosition');
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

  // Буфер цветов
  const colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);

  const colorLocation = gl.getAttribLocation(program, 'aVertexColor');
  gl.enableVertexAttribArray(colorLocation);
  gl.vertexAttribPointer(colorLocation, 4, gl.FLOAT, false, 0, 0);

  // Очистка и рендеринг
  gl.clearColor(0.2, 0.2, 0.2, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLES, 0, 3);

  // Читаем пиксели
  const pixels = new Uint8Array(canvas.width * canvas.height * 4);
  gl.readPixels(0, 0, canvas.width, canvas.height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

  return fnv1aHash(Array.from(pixels).join(','));
}

/**
 * Получает информацию о shader precision
 */
function getShaderPrecision(
  gl: WebGLRenderingContext,
  shaderType: number,
  precisionType: number
): { rangeMin: number; rangeMax: number; precision: number } | null {
  try {
    const format = gl.getShaderPrecisionFormat(shaderType, precisionType);
    if (!format) return null;
    return {
      rangeMin: format.rangeMin,
      rangeMax: format.rangeMax,
      precision: format.precision
    };
  } catch {
    return null;
  }
}

/**
 * Основная функция сбора WebGL fingerprint
 */
export function getWebGLFingerprint(): WebGLFingerprint {
  const gl = getWebGLContext();

  if (!gl) {
    return {
      vendor: 'not_supported',
      renderer: 'not_supported',
      extensions: [],
      maxTextureSize: 0,
      maxViewportDims: [0, 0],
      maxAnisotropy: null,
      vertexShaderPrecision: null,
      fragmentShaderPrecision: null,
      parameters: {},
      renderedHash: 'not_supported',
      supported: false
    };
  }

  // UNMASKED_VENDOR и UNMASKED_RENDERER
  const debugExt = gl.getExtension('WEBGL_debug_renderer_info');
  const vendor = safeSync(() => 
    debugExt ? gl.getParameter(debugExt.UNMASKED_VENDOR_WEBGL) : 'unknown',
    'unknown'
  );
  const renderer = safeSync(() => 
    debugExt ? gl.getParameter(debugExt.UNMASKED_RENDERER_WEBGL) : 'unknown',
    'unknown'
  );

  // Extensions
  const extensions = safeSync(() => gl.getSupportedExtensions() || [], []);

  // Max texture size
  const maxTextureSize = safeSync(() => gl.getParameter(gl.MAX_TEXTURE_SIZE), 0);

  // Max viewport dimensions
  const maxViewportDims = safeSync<[number, number]>(() => {
    const dims = gl.getParameter(gl.MAX_VIEWPORT_DIMS);
    return Array.isArray(dims) ? [dims[0], dims[1]] : [0, 0];
  }, [0, 0]);

  // Max anisotropy
  const anisotropyExt = gl.getExtension('EXT_texture_filter_anisotropic');
  const maxAnisotropy = safeSync(() => 
    anisotropyExt ? gl.getParameter(anisotropyExt.MAX_TEXTURE_MAX_ANISOTROPY_EXT) : null,
    null
  );

  // Shader precision
  const vertexShaderPrecision = getShaderPrecision(
    gl,
    gl.VERTEX_SHADER,
    gl.HIGH_FLOAT
  );
  const fragmentShaderPrecision = getShaderPrecision(
    gl,
    gl.FRAGMENT_SHADER,
    gl.HIGH_FLOAT
  );

  // Параметры WebGL
  const parameters: Record<string, number | string> = {};
  WEBGL_PARAMETERS.forEach((param) => {
    try {
      const value = gl.getParameter((gl as Record<string, number>)[param]);
      parameters[param] = Array.isArray(value) ? value.join(',') : value;
    } catch {
      parameters[param] = 'error';
    }
  });

  // Rendered hash
  const renderedHash = safeSync(() => renderWebGLScene(gl), 'error');

  return {
    vendor,
    renderer,
    extensions,
    maxTextureSize,
    maxViewportDims,
    maxAnisotropy,
    vertexShaderPrecision,
    fragmentShaderPrecision,
    parameters,
    renderedHash,
    supported: true
  };
}

/**
 * Проверка WebGL2 поддержки
 */
export function hasWebGL2(): boolean {
  return safeSync(() => {
    const canvas = document.createElement('canvas');
    return !!canvas.getContext('webgl2');
  }, false);
}

/**
 * Проверка конкретных расширений
 */
export function checkWebGLExtensions(gl: WebGLRenderingContext, extensions: string[]): Record<string, boolean> {
  const result: Record<string, boolean> = {};
  extensions.forEach(ext => {
    try {
      result[ext] = !!gl.getExtension(ext);
    } catch {
      result[ext] = false;
    }
  });
  return result;
}

/**
 * Определяет GPU vendor из renderer строки
 */
export function parseGPUVendor(renderer: string): 'nvidia' | 'amd' | 'intel' | 'apple' | 'unknown' {
  const lower = renderer.toLowerCase();
  if (lower.includes('nvidia') || lower.includes('geforce') || lower.includes('gtx') || lower.includes('rtx')) {
    return 'nvidia';
  }
  if (lower.includes('amd') || lower.includes('radeon') || lower.includes('ati')) {
    return 'amd';
  }
  if (lower.includes('intel')) {
    return 'intel';
  }
  if (lower.includes('apple') || lower.includes('m1') || lower.includes('m2') || lower.includes('m3')) {
    return 'apple';
  }
  return 'unknown';
}

/**
 * Определяет примерный год GPU по названию
 */
export function estimateGPUYear(renderer: string): number | null {
  const lower = renderer.toLowerCase();
  
  // NVIDIA серии
  const gtxMatch = lower.match(/gtx\s*(\d+)/);
  if (gtxMatch) {
    const series = parseInt(gtxMatch[1]);
    if (series >= 1000) return 2016 + Math.floor((series - 1000) / 100);
  }
  
  const rtxMatch = lower.match(/rtx\s*(\d+)/);
  if (rtxMatch) {
    const series = parseInt(rtxMatch[1]);
    if (series >= 2000) return 2018 + Math.floor((series - 2000) / 100);
    if (series >= 3000) return 2020;
    if (series >= 4000) return 2022;
  }
  
  // AMD Radeon
  const radeonMatch = lower.match(/rx\s*(\d+)/);
  if (radeonMatch) {
    const series = parseInt(radeonMatch[1]);
    if (series >= 500) return 2017;
    if (series >= 5000) return 2020;
    if (series >= 6000) return 2021;
    if (series >= 7000) return 2023;
  }
  
  // Apple Silicon
  if (lower.includes('m1')) return 2020;
  if (lower.includes('m2')) return 2022;
  if (lower.includes('m3')) return 2023;
  
  // Intel HD/UHD
  const intelMatch = lower.match(/(hd|uhd)\s*(\d+)/);
  if (intelMatch) {
    const series = parseInt(intelMatch[2]);
    if (series >= 4000) return 2012;
    if (series >= 5000) return 2013;
    if (series >= 6000) return 2015;
    if (series >= 630) return 2017;
    if (series >= 700) return 2020;
  }
  
  return null;
}
