"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Lock } from "lucide-react";

export function PrivacyNotice() {
  return (
    <Alert className="border-green-500/30 bg-green-500/5">
      <Shield className="h-4 w-4 text-green-500" />
      <AlertDescription className="text-sm">
        <span className="font-medium text-green-700 dark:text-green-400">
          100% приватный анализ
        </span>
        <span className="text-muted-foreground"> — Все данные обрабатываются только в вашем браузере и никуда не отправляются. </span>
        <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400">
          <Lock className="w-3 h-3" />
          Без серверов
        </span>
      </AlertDescription>
    </Alert>
  );
}
