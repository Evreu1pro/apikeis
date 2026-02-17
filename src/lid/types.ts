// ============================================================
// EchoPrint AI - TypeScript Types
// Полные типы для всей системы fingerprint-анализа
// ============================================================

// === CANVAS FINGERPRINT ===
export interface CanvasFingerprint {
  textHash: string;
  geometryHash: string;
  gradientHash: string;
  emojiHash: string;
  rawDataURL: string;
  supported: boolean;
}

// === WEBGL FINGERPRINT ===
export interface WebGLFingerprint {
  vendor: string;
  renderer: string;
  extensions: string[];
  maxTextureSize: number;
  maxViewportDims: [number, number];
  maxAnisotropy: number | null;
  vertexShaderPrecision: {
    rangeMin: number;
    rangeMax: number;
    precision: number;
  } | null;
  fragmentShaderPrecision: {
    rangeMin: number;
    rangeMax: number;
    precision: number;
  } | null;
  parameters: Record<string, number | string>;
  renderedHash: string;
  supported: boolean;
}

// === AUDIO FINGERPRINT ===
export interface AudioFingerprint {
  hash: string;
  sampleRate: number;
  maxChannelCount: number;
  channelCount: number;
  supported: boolean;
}

// === FONTS ENUMERATION ===
export interface FontsInfo {
  available: string[];
  count: number;
  defaultFonts: string[];
  detectionTime: number;
}

// === WEBRTC LEAK ===
export interface WebRTCLeak {
  localIPs: string[];
  publicIP: string | null;
  enabled: boolean;
  stunServer: string;
}

// === MEDIA DEVICES ===
export interface MediaDevicesInfo {
  cameras: number;
  microphones: number;
  speakers: number;
  deviceLabels: string[];
  hasPermission: boolean;
}

// === HARDWARE INFO ===
export interface HardwareInfo {
  cpuCores: number;
  memory: number | null;
  screen: {
    width: number;
    height: number;
    availWidth: number;
    availHeight: number;
    colorDepth: number;
    pixelRatio: number;
    orientation: string | null;
  };
  maxTouchPoints: number;
  gpu: {
    vendor: string;
    renderer: string;
  };
}

// === NAVIGATOR & CLIENT HINTS ===
export interface NavigatorInfo {
  userAgent: string;
  platform: string;
  vendor: string;
  language: string;
  languages: string[];
  cookieEnabled: boolean;
  doNotTrack: string | null;
  webdriver: boolean;
  userAgentData: {
    mobile: boolean;
    platform: string;
    brands: { brand: string; version: string }[];
    highEntropy: {
      architecture?: string;
      bitness?: string;
      fullVersionList?: { brand: string; version: string }[];
      model?: string;
      platformVersion?: string;
    } | null;
  } | null;
}

// === USER AGENT PARSED ===
export interface ParsedUserAgent {
  browser: {
    name: string;
    version: string;
    major: number;
  };
  os: {
    name: string;
    version: string;
  };
  device: {
    type: 'desktop' | 'mobile' | 'tablet' | 'unknown';
    model: string;
  };
  engine: {
    name: string;
    version: string;
  };
}

// === SENSORS ===
export interface SensorsInfo {
  accelerometer: boolean;
  gyroscope: boolean;
  deviceOrientation: boolean;
  deviceMotion: boolean;
  ambientLight: boolean;
}

// === BATTERY INFO ===
export interface BatteryInfo {
  level: number;
  charging: boolean;
  chargingTime: number | null;
  dischargingTime: number | null;
  supported: boolean;
}

// === MEDIA QUERIES ===
export interface MediaQueriesInfo {
  prefersColorScheme: 'light' | 'dark';
  prefersReducedMotion: boolean;
  prefersContrast: 'no-preference' | 'high' | 'more';
  colorGamut: 'srgb' | 'p3' | 'rec2020';
  forcedColors: boolean;
  hover: 'hover' | 'none';
  pointer: 'fine' | 'coarse' | 'none';
}

// === STORAGE INFO ===
export interface StorageInfo {
  localStorage: boolean;
  sessionStorage: boolean;
  indexedDB: boolean;
  serviceWorker: boolean;
  cookiesEnabled: boolean;
  storageQuota: number | null;
}

// === PERFORMANCE INFO ===
export interface PerformanceInfo {
  domContentLoaded: number | null;
  loadComplete: number | null;
  domInteractive: number | null;
  memory: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  } | null;
  timingAnomaly: boolean;
}

// === MISC INFO ===
export interface MiscInfo {
  timezone: string;
  timezoneOffset: number;
  speechVoices: { lang: string; name: string }[];
  connection: {
    effectiveType: string;
    downlink: number;
    rtt: number;
    saveData: boolean;
  } | null;
  plugins: string[];
  pdfViewerEnabled: boolean;
  javaEnabled: boolean | null;
}

// === FINGERPRINTJS RESULT ===
export interface FingerprintJSResult {
  visitorId: string;
  components: Record<string, { value: unknown; duration: number }>;
}

// === FULL FINGERPRINT DATA ===
export interface FingerprintData {
  // Основные категории
  canvas: CanvasFingerprint;
  webgl: WebGLFingerprint;
  audio: AudioFingerprint;
  fonts: FontsInfo;
  webrtc: WebRTCLeak;
  mediaDevices: MediaDevicesInfo;
  hardware: HardwareInfo;
  navigator: NavigatorInfo;
  parsedUA: ParsedUserAgent;
  sensors: SensorsInfo;
  battery: BatteryInfo;
  mediaQueries: MediaQueriesInfo;
  storage: StorageInfo;
  performance: PerformanceInfo;
  misc: MiscInfo;
  fpjs: FingerprintJSResult | null;

  // Метаданные
  timestamp: string;
  scanDuration: number;
  totalSignals: number;
}

// === АНАЛИЗ ===

export interface ConsistencyRule {
  id: string;
  name: string;
  description: string;
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  passed: boolean;
  message: string;
}

export interface AnomalyIndicator {
  id: string;
  name: string;
  description: string;
  type: 'virtualization' | 'emulation' | 'automation' | 'modification' | 'inconsistency';
  severity: 'low' | 'medium' | 'high';
  detected: boolean;
  evidence: string[];
}

export interface UniquenessAnalysis {
  overallScore: number; // 0-100
  entropy: number; // Shannon entropy in bits
  bitsOfEntropy: number;
  rarestSignals: { signal: string; rarity: number; value: unknown }[];
  commonSignals: { signal: string; rarity: number; value: unknown }[];
  categoryScores: Record<string, number>;
}

export interface ConsistencyAnalysis {
  overallScore: number; // 0-100
  passedRules: number;
  totalRules: number;
  rules: ConsistencyRule[];
  criticalIssues: ConsistencyRule[];
}

export interface AnomalyAnalysis {
  overallScore: number; // 0-100 (higher = less anomalies)
  detectedAnomalies: AnomalyIndicator[];
  virtualizationProbability: number;
  automationProbability: number;
  modificationProbability: number;
}

export interface AnalysisResult {
  uniqueness: UniquenessAnalysis;
  consistency: ConsistencyAnalysis;
  anomaly: AnomalyAnalysis;
  
  // Итоговые скоры
  overallScore: number;
  privacyRiskLevel: 'very_low' | 'low' | 'medium' | 'high' | 'very_high';
  trackabilityLevel: 'very_low' | 'low' | 'medium' | 'high' | 'very_high';
  
  // AI отчёт
  aiReport: AIReport;
}

export interface AIReport {
  summary: string;
  uniquenessAssessment: string;
  consistencyAssessment: string;
  anomalyAssessment: string;
  recommendations: string[];
  privacyTips: string[];
}

// === UI TYPES ===
export interface ParameterDisplay {
  id: string;
  name: string;
  value: string | number | boolean | null;
  status: 'normal' | 'warning' | 'danger' | 'info';
  category: string;
  rarity?: number;
  description?: string;
}

export interface CategoryGroup {
  id: string;
  name: string;
  icon: string;
  parameters: ParameterDisplay[];
  status: 'normal' | 'warning' | 'danger';
}

// === SCAN PROGRESS ===
export interface ScanProgress {
  stage: string;
  progress: number; // 0-100
  currentSignal: string;
  signalsCollected: number;
  totalSignals: number;
}

// === EXPORT FORMAT ===
export interface ExportReport {
  version: string;
  generatedAt: string;
  fingerprint: FingerprintData;
  analysis: AnalysisResult;
  disclaimer: string;
}
