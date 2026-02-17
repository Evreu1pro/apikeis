"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Info,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { useState } from "react";
import type { ParameterDisplay, CategoryGroup } from "@/lib/types";

interface ParameterCardProps {
  parameter: ParameterDisplay;
  compact?: boolean;
}

const getStatusIcon = (status: ParameterDisplay['status']) => {
  switch (status) {
    case 'normal': return <CheckCircle className="w-4 h-4 text-green-500" />;
    case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    case 'danger': return <XCircle className="w-4 h-4 text-red-500" />;
    case 'info': return <Info className="w-4 h-4 text-blue-500" />;
  }
};

const getStatusColor = (status: ParameterDisplay['status']) => {
  switch (status) {
    case 'normal': return 'border-green-500/30 bg-green-500/5';
    case 'warning': return 'border-yellow-500/30 bg-yellow-500/5';
    case 'danger': return 'border-red-500/30 bg-red-500/5';
    case 'info': return 'border-blue-500/30 bg-blue-500/5';
  }
};

export function ParameterCard({ parameter, compact }: ParameterCardProps) {
  const formatValue = (value: unknown): string => {
    if (value === null || value === undefined) return 'Не определено';
    if (typeof value === 'boolean') return value ? 'Да' : 'Нет';
    if (Array.isArray(value)) return value.length > 0 ? value.join(', ').slice(0, 100) + (value.join(', ').length > 100 ? '...' : '') : 'Пусто';
    if (typeof value === 'object') return JSON.stringify(value).slice(0, 100);
    return String(value);
  };

  if (compact) {
    return (
      <div className={`flex items-center justify-between p-2 rounded-lg border ${getStatusColor(parameter.status)}`}>
        <div className="flex items-center gap-2">
          {getStatusIcon(parameter.status)}
          <span className="text-sm font-medium truncate">{parameter.name}</span>
        </div>
        <span className="text-xs text-muted-foreground truncate max-w-[150px]">
          {formatValue(parameter.value)}
        </span>
      </div>
    );
  }

  return (
    <div className={`p-4 rounded-xl border ${getStatusColor(parameter.status)} transition-all duration-200 hover:shadow-md`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          {getStatusIcon(parameter.status)}
          <span className="font-medium">{parameter.name}</span>
        </div>
        {parameter.rarity !== undefined && (
          <Badge variant="outline" className="text-xs">
            Редкость: {parameter.rarity}%
          </Badge>
        )}
      </div>
      
      <div className="mt-2 text-sm text-muted-foreground">
        {formatValue(parameter.value)}
      </div>
      
      {parameter.description && (
        <div className="mt-2 text-xs text-muted-foreground/70">
          {parameter.description}
        </div>
      )}
    </div>
  );
}

// Category Section Component
interface CategorySectionProps {
  category: CategoryGroup;
  defaultExpanded?: boolean;
}

export function CategorySection({ category, defaultExpanded = false }: CategorySectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const getCategoryStatusColor = (status: CategoryGroup['status']) => {
    switch (status) {
      case 'normal': return 'from-green-500 to-emerald-600';
      case 'warning': return 'from-yellow-500 to-amber-600';
      case 'danger': return 'from-red-500 to-rose-600';
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader 
        className="cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${getCategoryStatusColor(category.status)} flex items-center justify-center`}>
              <span className="text-lg">{category.icon}</span>
            </div>
            <div>
              <CardTitle className="text-lg">{category.name}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {category.parameters.length} параметров
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {category.parameters.filter(p => p.status === 'normal').length}/{category.parameters.length}
            </Badge>
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            )}
          </div>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="pt-0">
          <div className="grid gap-2 mt-4">
            {category.parameters.map((param) => (
              <ParameterCard key={param.id} parameter={param} compact />
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
