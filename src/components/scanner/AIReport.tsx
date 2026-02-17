"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, 
  Fingerprint, 
  CheckCircle2, 
  AlertTriangle,
  ShieldCheck,
  Lightbulb,
  Info
} from "lucide-react";
import type { AIReport } from "@/lib/types";

interface AIReportDisplayProps {
  report: AIReport;
}

export function AIReportDisplay({ report }: AIReportDisplayProps) {
  return (
    <Card className="relative overflow-hidden">
      {/* Gradient border */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-10" />
      
      <CardHeader className="relative">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl">AI Анализ</CardTitle>
            <p className="text-sm text-muted-foreground">Автоматический отчёт о вашем устройстве</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="relative space-y-6">
        {/* Summary */}
        <div className="p-4 rounded-xl bg-muted/50 border">
          <p className="text-foreground leading-relaxed">{report.summary}</p>
        </div>

        {/* Sections */}
        <div className="grid gap-4">
          {/* Uniqueness */}
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Fingerprint className="w-5 h-5 text-blue-500" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold mb-1 flex items-center gap-2">
                Уникальность
                <Badge variant="secondary" className="text-xs">Fingerprint</Badge>
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {report.uniquenessAssessment}
              </p>
            </div>
          </div>

          {/* Consistency */}
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold mb-1 flex items-center gap-2">
                Согласованность
                <Badge variant="secondary" className="text-xs">Logic</Badge>
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {report.consistencyAssessment}
              </p>
            </div>
          </div>

          {/* Anomalies */}
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold mb-1 flex items-center gap-2">
                Аномалии
                <Badge variant="secondary" className="text-xs">Detection</Badge>
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {report.anomalyAssessment}
              </p>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-primary">
            <Lightbulb className="w-5 h-5" />
            <h4 className="font-semibold">Рекомендации</h4>
          </div>
          <ul className="space-y-2">
            {report.recommendations.map((rec, index) => (
              <li 
                key={index}
                className="flex items-start gap-2 text-sm text-muted-foreground"
              >
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-xs text-primary mt-0.5">
                  {index + 1}
                </span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Privacy Tips */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-primary">
            <ShieldCheck className="w-5 h-5" />
            <h4 className="font-semibold">Советы по приватности</h4>
          </div>
          <div className="grid gap-2">
            {report.privacyTips.map((tip, index) => (
              <div 
                key={index}
                className="flex items-start gap-2 p-3 rounded-lg bg-muted/30 text-sm"
              >
                <Info className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-muted-foreground">{tip}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
