// ============================================================
// EchoPrint AI - Scanner Hook
// React hook для управления процессом сканирования
// ============================================================

import { useState, useCallback } from 'react';
import { collectFingerprint, type ProgressCallback } from '@/lib/fingerprint/collector';
import { analyzeFingerprint } from '@/lib/analysis/report';
import type { FingerprintData, AnalysisResult, ScanProgress } from '@/lib/types';

interface UseScannerResult {
  isScanning: boolean;
  progress: ScanProgress | null;
  fingerprintData: FingerprintData | null;
  analysisResult: AnalysisResult | null;
  error: string | null;
  startScan: () => Promise<void>;
  resetScan: () => void;
}

export function useScanner(): UseScannerResult {
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState<ScanProgress | null>(null);
  const [fingerprintData, setFingerprintData] = useState<FingerprintData | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleProgress: ProgressCallback = useCallback((newProgress) => {
    setProgress(newProgress);
  }, []);

  const startScan = useCallback(async () => {
    setIsScanning(true);
    setError(null);
    setProgress(null);
    setFingerprintData(null);
    setAnalysisResult(null);

    try {
      // Собираем fingerprint
      const data = await collectFingerprint(handleProgress);
      setFingerprintData(data);

      // Анализируем
      const analysis = analyzeFingerprint(data);
      setAnalysisResult(analysis);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка при сканировании');
    } finally {
      setIsScanning(false);
    }
  }, [handleProgress]);

  const resetScan = useCallback(() => {
    setIsScanning(false);
    setProgress(null);
    setFingerprintData(null);
    setAnalysisResult(null);
    setError(null);
  }, []);

  return {
    isScanning,
    progress,
    fingerprintData,
    analysisResult,
    error,
    startScan,
    resetScan
  };
}
