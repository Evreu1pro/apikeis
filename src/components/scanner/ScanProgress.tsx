"use client";

import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Loader2, 
  Monitor, 
  Palette, 
  Cpu, 
  Globe, 
  Wifi, 
  Volume2,
  Type,
  Camera,
  Battery,
  Database
} from "lucide-react";
import type { ScanProgress } from "@/lib/types";

interface ScanProgressProps {
  progress: ScanProgress;
}

const stageIcons: Record<string, typeof Monitor> = {
  'Сбор Canvas данных': Palette,
  'Сбор WebGL данных': Monitor,
  'Сбор Audio данных': Volume2,
  'Определение шрифтов': Type,
  'Проверка WebRTC': Wifi,
  'Проверка медиа-устройств': Camera,
  'Сбор информации о железе': Cpu,
  'Сбор Navigator данных': Globe,
  'Проверка сенсоров': Monitor,
  'Проверка батареи': Battery,
  'Сбор медиа-настроек': Palette,
  'Проверка Storage API': Database,
  'Анализ Performance': Cpu,
  'Сбор дополнительных данных': Globe,
  'FingerprintJS анализ': Monitor,
  'Завершение': Loader2
};

export function ScanProgressDisplay({ progress }: ScanProgressProps) {
  const Icon = stageIcons[progress.stage] || Monitor;
  const percentage = Math.round(progress.progress);

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Main progress bar */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground font-medium">{progress.stage}</span>
          <Badge variant="secondary" className="font-mono">
            {progress.signalsCollected}/{progress.totalSignals}
          </Badge>
        </div>
        
        <div className="relative">
          <Progress 
            value={percentage} 
            className="h-4 bg-secondary/50"
          />
          
          {/* Animated glow effect */}
          <div 
            className="absolute top-0 left-0 h-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full transition-all duration-300 opacity-80"
            style={{ width: `${percentage}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
          </div>
        </div>
        
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Icon className="w-4 h-4 animate-pulse" />
          <span>{progress.currentSignal}</span>
        </div>
      </div>

      {/* Scanning animation */}
      <div className="flex justify-center">
        <div className="relative w-48 h-48">
          {/* Outer ring */}
          <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
          
          {/* Spinning ring */}
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary border-r-primary animate-spin" />
          
          {/* Inner content */}
          <div className="absolute inset-4 rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                {percentage}%
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                анализ...
              </div>
            </div>
          </div>
          
          {/* Orbiting dots */}
          <div className="absolute inset-0 animate-spin" style={{ animationDuration: '3s' }}>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-blue-500 rounded-full shadow-lg shadow-blue-500/50" />
          </div>
          <div className="absolute inset-0 animate-spin" style={{ animationDuration: '4s', animationDirection: 'reverse' }}>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 bg-purple-500 rounded-full shadow-lg shadow-purple-500/50" />
          </div>
        </div>
      </div>

      {/* Status messages */}
      <div className="grid grid-cols-2 gap-2 text-xs text-center">
        {Object.entries(stageIcons).slice(0, 6).map(([stage, StageIcon]) => {
          const isCompleted = progress.progress > (Object.keys(stageIcons).indexOf(stage) + 1) * (100 / Object.keys(stageIcons).length);
          const isCurrent = progress.stage === stage;
          
          return (
            <div 
              key={stage}
              className={`p-2 rounded-lg transition-all duration-300 ${
                isCompleted 
                  ? 'bg-green-500/10 text-green-600' 
                  : isCurrent 
                    ? 'bg-primary/10 text-primary animate-pulse' 
                    : 'bg-muted/50 text-muted-foreground'
              }`}
            >
              <StageIcon className="w-4 h-4 mx-auto mb-1" />
              <span className="truncate">{stage.split(' ').slice(0, 2).join(' ')}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
