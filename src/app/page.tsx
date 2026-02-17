'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { PrivacyNotice } from '@/components/layout/PrivacyNotice';
import { ScannerButton } from '@/components/scanner/ScannerButton';
import { ScanProgressDisplay } from '@/components/scanner/ScanProgress';
import { ScoreCard, BigScoreCard } from '@/components/scanner/ScoreCard';
import { AIReportDisplay } from '@/components/scanner/AIReport';
import { CategorySection } from '@/components/scanner/ParameterCard';
import { ExportButton } from '@/components/scanner/ExportButton';
import { useScanner } from '@/hooks/useScanner';
import { fingerprintToCategories } from '@/lib/utils/display';
import { 
  Fingerprint, 
  Shield, 
  Eye, 
  AlertTriangle,
  CheckCircle2,
  ArrowDown
} from 'lucide-react';

export default function Home() {
  const { 
    isScanning, 
    progress, 
    fingerprintData, 
    analysisResult, 
    error,
    startScan,
    resetScan 
  } = useScanner();

  const categories = fingerprintData ? fingerprintToCategories(fingerprintData) : [];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background via-background to-muted/30">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Hero Section */}
        {!fingerprintData && !isScanning && (
          <section className="max-w-4xl mx-auto text-center space-y-8 mb-12">
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="relative">
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-2xl shadow-purple-500/20">
                    <Fingerprint className="w-14 h-14 text-white" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-green-500 border-4 border-background flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold">
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  EchoPrint AI
                </span>
              </h1>
              
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Образовательный анализатор уникальности и реалистичности вашего браузера
              </p>
            </div>

            <PrivacyNotice />

            <div className="space-y-4">
              <ScannerButton onClick={startScan} isScanning={isScanning} />
              
              <p className="text-sm text-muted-foreground">
                Анализ занимает ~10 секунд и собирает 80+ сигналов
              </p>
            </div>

            {/* Features */}
            <div className="grid md:grid-cols-3 gap-4 mt-12">
              <div className="p-6 rounded-xl bg-card border">
                <Fingerprint className="w-8 h-8 text-blue-500 mb-3" />
                <h3 className="font-semibold mb-2">Uniqueness Score</h3>
                <p className="text-sm text-muted-foreground">
                  Насколько ваше устройство выделяется среди миллионов других
                </p>
              </div>
              
              <div className="p-6 rounded-xl bg-card border">
                <CheckCircle2 className="w-8 h-8 text-green-500 mb-3" />
                <h3 className="font-semibold mb-2">Consistency Check</h3>
                <p className="text-sm text-muted-foreground">
                  30+ правил проверки логичности и согласованности параметров
                </p>
              </div>
              
              <div className="p-6 rounded-xl bg-card border">
                <Shield className="w-8 h-8 text-purple-500 mb-3" />
                <h3 className="font-semibold mb-2">Privacy Risk</h3>
                <p className="text-sm text-muted-foreground">
                  Оценка риска отслеживания и рекомендации по приватности
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Scanning Progress */}
        {isScanning && progress && (
          <section className="max-w-4xl mx-auto py-12">
            <ScanProgressDisplay progress={progress} />
          </section>
        )}

        {/* Error Display */}
        {error && (
          <section className="max-w-2xl mx-auto text-center py-12">
            <div className="p-6 rounded-xl bg-red-500/10 border border-red-500/30">
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Ошибка сканирования</h2>
              <p className="text-muted-foreground mb-4">{error}</p>
              <ScannerButton onClick={startScan} isScanning={false} />
            </div>
          </section>
        )}

        {/* Results */}
        {fingerprintData && analysisResult && !isScanning && (
          <section className="max-w-6xl mx-auto space-y-8">
            {/* Header */}
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold">Результаты анализа</h2>
              <p className="text-muted-foreground">
                Собрано {fingerprintData.totalSignals} сигналов за {Math.round(fingerprintData.scanDuration / 1000)} секунд
              </p>
              <div className="flex justify-center gap-2">
                <ExportButton 
                  fingerprintData={fingerprintData} 
                  analysisResult={analysisResult} 
                />
                <button
                  onClick={resetScan}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Сбросить
                </button>
              </div>
            </div>

            {/* Main Scores */}
            <div className="grid md:grid-cols-3 gap-4">
              <ScoreCard
                title="Уникальность"
                score={analysisResult.uniqueness.overallScore}
                description={analysisResult.uniqueness.overallScore >= 70 
                  ? "Ваше устройство легко идентифицировать" 
                  : analysisResult.uniqueness.overallScore >= 40
                    ? "Средний уровень уникальности"
                    : "Ваше устройство похоже на многие другие"}
                type="uniqueness"
                level={analysisResult.uniqueness.overallScore >= 80 ? "Высокая" : analysisResult.uniqueness.overallScore >= 50 ? "Средняя" : "Низкая"}
              />
              
              <ScoreCard
                title="Согласованность"
                score={analysisResult.consistency.overallScore}
                description={`${analysisResult.consistency.passedRules}/${analysisResult.consistency.totalRules} проверок пройдено`}
                type="consistency"
                level={analysisResult.consistency.overallScore >= 80 ? "Отличная" : analysisResult.consistency.overallScore >= 60 ? "Хорошая" : "Требует внимания"}
              />
              
              <ScoreCard
                title="Реалистичность"
                score={analysisResult.anomaly.overallScore}
                description={analysisResult.anomaly.detectedAnomalies.length === 0
                  ? "Аномалий не обнаружено"
                  : `${analysisResult.anomaly.detectedAnomalies.length} аномалий обнаружено`}
                type="anomaly"
                level={analysisResult.anomaly.overallScore >= 80 ? "Норма" : analysisResult.anomaly.overallScore >= 60 ? "Есть вопросы" : "Подозрительно"}
              />
            </div>

            {/* Big Scores */}
            <div className="grid md:grid-cols-2 gap-4">
              <BigScoreCard
                title="Privacy Risk Level"
                score={analysisResult.uniqueness.overallScore}
                subtitle={analysisResult.privacyRiskLevel === 'very_high' 
                  ? "Очень высокий риск отслеживания" 
                  : analysisResult.privacyRiskLevel === 'high'
                    ? "Высокий риск отслеживания"
                    : analysisResult.privacyRiskLevel === 'medium'
                      ? "Средний риск отслеживания"
                      : analysisResult.privacyRiskLevel === 'low'
                        ? "Низкий риск отслеживания"
                        : "Очень низкий риск отслеживания"}
                type="privacy"
              />
              
              <BigScoreCard
                title="Trackability Level"
                score={analysisResult.uniqueness.overallScore}
                subtitle={analysisResult.trackabilityLevel === 'very_high'
                  ? "Вас очень легко отследить"
                  : analysisResult.trackabilityLevel === 'high'
                    ? "Вас легко отследить"
                    : analysisResult.trackabilityLevel === 'medium'
                      ? "Частичное отслеживание возможно"
                      : analysisResult.trackabilityLevel === 'low'
                        ? "Отслеживание затруднено"
                        : "Почти невозможно отследить"}
                type="trackability"
              />
            </div>

            {/* AI Report */}
            <AIReportDisplay report={analysisResult.aiReport} />

            {/* Detailed Parameters */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">Детальные параметры</h3>
                <p className="text-sm text-muted-foreground">
                  Нажмите на категорию для раскрытия
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                {categories.slice(0, 6).map((category) => (
                  <CategorySection 
                    key={category.id} 
                    category={category}
                    defaultExpanded={category.id === 'hardware' || category.id === 'browser'}
                  />
                ))}
              </div>
              
              <details className="group">
                <summary className="cursor-pointer flex items-center justify-center gap-2 p-4 text-muted-foreground hover:text-foreground transition-colors">
                  <ArrowDown className="w-4 h-4 group-open:rotate-180 transition-transform" />
                  <span>Показать все категории ({categories.length})</span>
                </summary>
                
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  {categories.slice(6).map((category) => (
                    <CategorySection 
                      key={category.id} 
                      category={category}
                    />
                  ))}
                </div>
              </details>
            </div>

            {/* New Scan Button */}
            <div className="text-center pt-8 border-t">
              <ScannerButton onClick={startScan} isScanning={isScanning} />
            </div>
          </section>
        )}
      </main>
      
      <Footer />
    </div>
  );
}
