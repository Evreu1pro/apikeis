"use client";

import { Button } from "@/components/ui/button";
import { Scan } from "lucide-react";

interface ScannerButtonProps {
  onClick: () => void;
  isScanning: boolean;
  disabled?: boolean;
}

export function ScannerButton({ onClick, isScanning, disabled }: ScannerButtonProps) {
  return (
    <Button
      onClick={onClick}
      disabled={isScanning || disabled}
      size="lg"
      className="relative group overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 text-white font-bold py-6 px-12 text-xl rounded-2xl shadow-2xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
    >
      <span className="relative z-10 flex items-center gap-3">
        <Scan className={`w-6 h-6 ${isScanning ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
        {isScanning ? "Анализируем..." : "Запустить полный анализ устройства"}
      </span>
      
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
      
      {/* Shimmer effect */}
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
    </Button>
  );
}
