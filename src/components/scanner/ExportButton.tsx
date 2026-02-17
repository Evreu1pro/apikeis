"use client";

import { Button } from "@/components/ui/button";
import { 
  Download, 
  FileJson, 
  Copy,
  Check
} from "lucide-react";
import { useState } from "react";
import type { FingerprintData, AnalysisResult, ExportReport } from "@/lib/types";

interface ExportButtonProps {
  fingerprintData: FingerprintData;
  analysisResult: AnalysisResult;
}

export function ExportButton({ fingerprintData, analysisResult }: ExportButtonProps) {
  const [copied, setCopied] = useState(false);

  const generateReport = (): ExportReport => {
    return {
      version: "1.0.0",
      generatedAt: new Date().toISOString(),
      fingerprint: fingerprintData,
      analysis: analysisResult,
      disclaimer: "Этот отчёт сгенерирован EchoPrint AI для личного использования. Все данные обрабатывались только в вашем браузере."
    };
  };

  const downloadJSON = () => {
    const report = generateReport();
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `echoprint-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = async () => {
    const report = generateReport();
    await navigator.clipboard.writeText(JSON.stringify(report, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex gap-2">
      <Button
        onClick={downloadJSON}
        variant="outline"
        className="gap-2"
      >
        <Download className="w-4 h-4" />
        Скачать JSON
      </Button>
      
      <Button
        onClick={copyToClipboard}
        variant="outline"
        className="gap-2"
      >
        {copied ? (
          <>
            <Check className="w-4 h-4 text-green-500" />
            Скопировано
          </>
        ) : (
          <>
            <Copy className="w-4 h-4" />
            Копировать
          </>
        )}
      </Button>
    </div>
  );
}
