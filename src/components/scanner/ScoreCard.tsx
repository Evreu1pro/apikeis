"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Fingerprint, 
  Shield, 
  AlertTriangle,
  Eye,
  CheckCircle
} from "lucide-react";

interface ScoreCardProps {
  title: string;
  score: number;
  description: string;
  type: 'uniqueness' | 'consistency' | 'anomaly' | 'overall';
  level?: string;
}

// Маппинг иконок вне компонента
const ICON_MAP = {
  uniqueness: Fingerprint,
  consistency: CheckCircle,
  anomaly: AlertTriangle,
  overall: Shield
};

const getScoreColor = (score: number, type: string): { bg: string; text: string; ring: string } => {
  if (type === 'anomaly') {
    // Для anomaly: высокий score = хорошо (нет аномалий)
    if (score >= 80) return { bg: 'from-green-500 to-emerald-600', text: 'text-green-600', ring: 'ring-green-500/30' };
    if (score >= 60) return { bg: 'from-yellow-500 to-amber-600', text: 'text-yellow-600', ring: 'ring-yellow-500/30' };
    return { bg: 'from-red-500 to-rose-600', text: 'text-red-600', ring: 'ring-red-500/30' };
  }
  
  if (type === 'uniqueness') {
    // Для uniqueness: высокий score = плохо (уникальный = легко отследить)
    if (score >= 80) return { bg: 'from-red-500 to-rose-600', text: 'text-red-600', ring: 'ring-red-500/30' };
    if (score >= 60) return { bg: 'from-yellow-500 to-amber-600', text: 'text-yellow-600', ring: 'ring-yellow-500/30' };
    return { bg: 'from-green-500 to-emerald-600', text: 'text-green-600', ring: 'ring-green-500/30' };
  }
  
  // Для consistency и overall: высокий score = хорошо
  if (score >= 80) return { bg: 'from-green-500 to-emerald-600', text: 'text-green-600', ring: 'ring-green-500/30' };
  if (score >= 60) return { bg: 'from-yellow-500 to-amber-600', text: 'text-yellow-600', ring: 'ring-yellow-500/30' };
  return { bg: 'from-red-500 to-rose-600', text: 'text-red-600', ring: 'ring-red-500/30' };
};

export function ScoreCard({ title, score, description, type, level }: ScoreCardProps) {
  const colors = getScoreColor(score, type);
  const IconComponent = ICON_MAP[type] || Shield;

  return (
    <Card className={`relative overflow-hidden ring-2 ${colors.ring} transition-all duration-300 hover:shadow-xl hover:-translate-y-1`}>
      {/* Background gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${colors.bg} opacity-5`} />
      
      <CardContent className="relative p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-gradient-to-br ${colors.bg}`}>
              <IconComponent className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{title}</h3>
              {level && (
                <Badge variant="outline" className="mt-1 text-xs">
                  {level}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Score display */}
        <div className="flex items-center justify-center my-6">
          <div className="relative w-32 h-32">
            {/* Background circle */}
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="56"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="text-muted/20"
              />
              <circle
                cx="64"
                cy="64"
                r="56"
                fill="none"
                stroke="url(#gradient)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${score * 3.51} 351`}
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" className={`${colors.text}`} stopColor="currentColor" />
                  <stop offset="100%" className={`${colors.text}`} stopColor="currentColor" />
                </linearGradient>
              </defs>
            </svg>
            
            {/* Score text */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <span className={`text-3xl font-bold ${colors.text}`}>
                  {score}
                </span>
                <span className="text-lg text-muted-foreground">%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground text-center leading-relaxed">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}

// Big score card for main metrics
interface BigScoreCardProps {
  title: string;
  score: number;
  subtitle: string;
  type: 'privacy' | 'trackability';
}

export function BigScoreCard({ title, score, subtitle, type }: BigScoreCardProps) {
  const isGood = type === 'privacy' ? score < 40 : score < 40;
  
  return (
    <Card className={`relative overflow-hidden ${
      isGood 
        ? 'bg-gradient-to-br from-green-500/10 to-emerald-500/10 ring-2 ring-green-500/30' 
        : score < 70
          ? 'bg-gradient-to-br from-yellow-500/10 to-amber-500/10 ring-2 ring-yellow-500/30'
          : 'bg-gradient-to-br from-red-500/10 to-rose-500/10 ring-2 ring-red-500/30'
    }`}>
      <CardContent className="p-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          {type === 'privacy' ? (
            <Shield className="w-6 h-6 text-primary" />
          ) : (
            <Eye className="w-6 h-6 text-primary" />
          )}
          <h3 className="text-xl font-semibold">{title}</h3>
        </div>
        
        <div className="text-6xl font-bold mb-2 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          {score}%
        </div>
        
        <p className="text-muted-foreground">{subtitle}</p>
      </CardContent>
    </Card>
  );
}
