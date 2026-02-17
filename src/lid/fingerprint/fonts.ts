// ============================================================
// EchoPrint AI - Fonts Enumeration
// Определение установленных шрифтов через canvas measuring
// ============================================================

import { safeSync } from '../utils/helpers';
import type { FontsInfo } from '../types';

// Базовые шрифты для сравнения
const BASE_FONTS = ['monospace', 'sans-serif', 'serif'];

// Список шрифтов для проверки (400+ шрифтов)
const FONT_LIST = [
  // Windows fonts
  'Arial', 'Arial Black', 'Arial Narrow', 'Arial Rounded MT Bold',
  'Bahnschrift', 'Calibri', 'Cambria', 'Cambria Math', 'Candara',
  'Comic Sans MS', 'Consolas', 'Constantia', 'Corbel', 'Courier New',
  'Ebrima', 'Franklin Gothic Medium', 'Gabriola', 'Gadugi', 'Georgia',
  'HoloLens MDL2 Assets', 'Impact', 'Ink Free', 'Javanese Text',
  'Leelawadee UI', 'Lucida Console', 'Lucida Sans Unicode', 'Malgun Gothic',
  'Marlett', 'Microsoft Himalaya', 'Microsoft JhengHei', 'Microsoft New Tai Lue',
  'Microsoft PhagsPa', 'Microsoft Sans Serif', 'Microsoft Tai Le',
  'Microsoft YaHei', 'Microsoft Yi Baiti', 'MingLiU-ExtB', 'Mongolian Baiti',
  'MS Gothic', 'MS PGothic', 'MS UI Gothic', 'MV Boli', 'Myanmar Text',
  'Nirmala UI', 'Palatino Linotype', 'Segoe MDL2 Assets', 'Segoe Print',
  'Segoe Script', 'Segoe UI', 'Segoe UI Historic', 'Segoe UI Emoji',
  'Segoe UI Symbol', 'SimSun', 'Sitka Banner', 'Sitka Display', 'Sitka Heading',
  'Sitka Small', 'Sitka Subheading', 'Sitka Text', 'Sylfaen', 'Symbol',
  'Tahoma', 'Times New Roman', 'Trebuchet MS', 'Verdana', 'Webdings',
  'Wingdings', 'Yu Gothic',

  // macOS fonts
  'American Typewriter', 'Andale Mono', 'Apple Braille', 'Apple Chancery',
  'Apple Color Emoji', 'Apple SD Gothic Neo', 'Apple Symbols', 'AppleGothic',
  'AppleMyungjo', 'Avenir', 'Avenir Next', 'Avenir Next Condensed',
  'Baskerville', 'Big Caslon', 'Bodoni 72', 'Bodoni 72 Oldstyle',
  'Bodoni 72 Smallcaps', 'Bradley Hand', 'Brush Script MT', 'Chalkboard',
  'Chalkboard SE', 'Chalkduster', 'Charter', 'Cochin', 'Comic Sans MS',
  'Copperplate', 'Courier', 'Courier New', 'DIN Alternate', 'DIN Condensed',
  'Didot', 'Euphemia UCAS', 'Futura', 'Geneva', 'Gill Sans', 'Helvetica',
  'Helvetica Neue', 'Herculanum', 'Hiragino Kaku Gothic Pro',
  'Hiragino Kaku Gothic ProN', 'Hiragino Kaku Gothic Std',
  'Hiragino Maru Gothic Pro', 'Hiragino Mincho Pro', 'Hiragino Sans',
  'Hoefler Text', 'Impact', 'InaiMathi', 'Kailasa', 'Kannada MN', 'Kannada Sangam MN',
  'Kefa', 'Khmer MN', 'Khmer Sangam MN', 'Kohinoor Bangla', 'Kohinoor Devanagari',
  'Kohinoor Gujarati', 'Kohinoor Telugu', 'Kokonor', 'Krungthep', 'KufiStandardGK',
  'Lao MN', 'Lao Sangam MN', 'Lucida Grande', 'Luminari', 'Malayalam MN',
  'Malayalam Sangam MN', 'Marker Felt', 'Menlo', 'Microsoft Sans Serif',
  'Mishafi', 'Mishafi Gold', 'Monaco', 'Mshtakan', 'Mukta Mahee',
  'Muna', 'Myanmar MN', 'Myanmar Sangam MN', 'Nadeem', 'New Peninim MT',
  'Noteworthy', 'Noto Nastaliq Urdu', 'Noto Sans Kannada', 'Noto Sans Myanmar',
  'Noto Sans Oriya', 'Noto Serif Myanmar', 'Optima', 'Oriya MN',
  'Oriya Sangam MN', 'PT Mono', 'PT Sans', 'PT Sans Caption', 'PT Sans Narrow',
  'PT Serif', 'PT Serif Caption', 'Palatino', 'Papyrus', 'Phosphate',
  'PingFang HK', 'PingFang SC', 'PingFang TC', 'Plantagenet Cherokee',
  'Raanana', 'Rockwell', 'STIX Two Math', 'STIX Two Text', 'STIXGeneral',
  'STIXIntegralsD', 'STIXIntegralsSm', 'STIXIntegralsUp', 'STIXIntegralsUpD',
  'STIXIntegralsUpSm', 'STIXNonUnicode', 'STIXSizeFiveSym', 'STIXSizeFourSym',
  'STIXSizeOneSym', 'STIXSizeThreeSym', 'STIXSizeTwoSym', 'STIXVariants',
  'Sana', 'Sathu', 'Savoye LET', 'SignPainter', 'Silom', 'Sinhala MN',
  'Sinhala Sangam MN', 'Skia', 'Snell Roundhand', 'Songti SC', 'Songti TC',
  'STFangsong', 'STHeiti', 'STKaiti', 'STSong', 'Sukhumvit Set', 'Symbol',
  'System Font', 'Tamil MN', 'Tamil Sangam MN', 'Telugu MN', 'Telugu Sangam MN',
  'Thonburi', 'Times', 'Times New Roman', 'Trattatello', 'Trebuchet MS',
  'Verdana', 'Waseem', 'Zapf Dingbats', 'Zapfino',

  // Linux fonts
  'Bitstream Charter', 'Century Schoolbook L', 'Courier 10 Pitch',
  'DejaVu Sans', 'DejaVu Sans Mono', 'DejaVu Serif', 'Dingbats',
  'FreeMono', 'FreeSans', 'FreeSerif', 'Garuda', 'Liberation Mono',
  'Liberation Sans', 'Liberation Sans Narrow', 'Liberation Serif',
  'Loma', 'Nimbus Mono L', 'Nimbus Roman No9 L', 'Nimbus Sans L',
  'Norasi', 'Purisa', 'Sawasdee', 'Standard Symbols L', 'TlwgMono',
  'TlwgTypewriter', 'Tlwg Typist', 'Tlwg Typo', 'Ubuntu', 'Ubuntu Condensed',
  'Ubuntu Mono', 'Umpush', 'URW Bookman L', 'URW Chancery L',
  'URW Gothic L', 'URW Palladio L', 'Waree',

  // Common web fonts
  'Roboto', 'Roboto Condensed', 'Roboto Mono', 'Roboto Slab',
  'Open Sans', 'Open Sans Condensed', 'Lato', 'Lato Light',
  'Montserrat', 'Montserrat Alternates', 'Oswald', 'Raleway',
  'Source Sans Pro', 'Source Code Pro', 'Fira Sans', 'Fira Mono',
  'Droid Sans', 'Droid Sans Mono', 'Droid Serif', 'Ubuntu',
  'Noto Sans', 'Noto Sans CJK', 'Noto Serif', 'Noto Mono',
  'PT Sans', 'PT Serif', 'PT Mono', 'Muli', 'Poppins',
  'Work Sans', 'Karla', 'Merriweather', 'Playfair Display',
  'Inter', 'Inter Variable', 'SF Pro Display', 'SF Pro Text',

  // Google Fonts (popular)
  'Abril Fatface', 'Alegreya', 'Amatic SC', 'Anton', 'Archivo',
  'Archivo Narrow', 'Bebas Neue', 'Bitter', 'Cabin', 'Cardo',
  'Caveat', 'Cormorant Garamond', 'Crimson Text', 'DM Sans',
  'Domine', 'EB Garamond', 'Exo 2', 'Fjalla One', 'Francois One',
  'Gloria Hallelujah', 'Great Vibes', 'Hind', 'IBM Plex Sans',
  'IBM Plex Mono', 'Inconsolata', 'Indie Flower', 'Josefin Sans',
  'Jura', 'Kanit', 'Lora', 'Manrope', 'Merriweather Sans',
  'Monda', 'Neuton', 'Nobile', 'Old Standard TT', 'Orbitron',
  'Pacifico', 'Passion One', 'Patrick Hand', 'Permanent Marker',
  'Quicksand', 'Righteous', 'Sacramento', 'Shadows Into Light',
  'Signika', 'Slabo 27px', 'Spectral', 'Titillium Web', 'Ubuntu',
  'Varela Round', 'Vollkorn', 'Zilla Slab'
];

// Тестовая строка для измерения ширины
const TEST_STRING = 'mmmmmmmmmmlli';
const TEST_SIZE = '72px';

/**
 * Измеряет ширину текста с указанным шрифтом
 */
function measureWidth(ctx: CanvasRenderingContext2D, fontFamily: string): number {
  ctx.font = `${TEST_SIZE} ${fontFamily}`;
  return ctx.measureText(TEST_STRING).width;
}

/**
 * Определяет, установлен ли шрифт
 */
function isFontInstalled(
  ctx: CanvasRenderingContext2D,
  fontName: string,
  baseWidths: number[]
): boolean {
  // Пробуем каждый базовый шрифт
  for (let i = 0; i < BASE_FONTS.length; i++) {
    ctx.font = `${TEST_SIZE} '${fontName}', ${BASE_FONTS[i]}`;
    const width = ctx.measureText(TEST_STRING).width;
    
    // Если ширина отличается от базовой, шрифт установлен
    if (Math.abs(width - baseWidths[i]) > 1) {
      return true;
    }
  }
  return false;
}

/**
 * Основная функция определения шрифтов
 */
export function getFontsInfo(): FontsInfo {
  const startTime = performance.now();
  
  const supported = safeSync(() => {
    const canvas = document.createElement('canvas');
    return !!canvas.getContext?.('2d');
  }, false);

  if (!supported) {
    return {
      available: [],
      count: 0,
      defaultFonts: BASE_FONTS,
      detectionTime: 0
    };
  }

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;

  // Измеряем базовые ширины
  const baseWidths = BASE_FONTS.map(font => measureWidth(ctx, font));

  // Проверяем каждый шрифт
  const available: string[] = [];
  
  for (const font of FONT_LIST) {
    try {
      if (isFontInstalled(ctx, font, baseWidths)) {
        available.push(font);
      }
    } catch {
      // Игнорируем ошибки
    }
  }

  const detectionTime = performance.now() - startTime;

  return {
    available,
    count: available.length,
    defaultFonts: BASE_FONTS,
    detectionTime
  };
}

/**
 * Получает список системных шрифтов через Document.fonts (если доступно)
 */
export function getSystemFontsAPI(): string[] {
  if (!document.fonts) {
    return [];
  }

  try {
    const fonts: string[] = [];
    // @ts-expect-error - checkin API exists
    document.fonts.forEach?.((font: FontFace) => {
      if (font.status === 'loaded') {
        fonts.push(font.family);
      }
    });
    return fonts;
  } catch {
    return [];
  }
}

/**
 * Проверяет поддержку конкретного шрифта
 */
export function checkFontSupport(fontName: string): boolean {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return false;

  const baseWidths = BASE_FONTS.map(font => measureWidth(ctx, font));
  return isFontInstalled(ctx, fontName, baseWidths);
}

/**
 * Получает уникальный hash набора шрифтов
 */
export function getFontsHash(fonts: string[]): string {
  const sorted = [...fonts].sort();
  return sorted.join('|');
}
