"use client";

import { Fingerprint, Github } from "lucide-react";

export function Header() {
  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center">
              <Fingerprint className="w-6 h-6 text-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-background" />
          </div>
          
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              EchoPrint AI
            </h1>
            <p className="text-xs text-muted-foreground">
              Анализатор уникальности устройства
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-xs text-muted-foreground hidden sm:inline">
            v1.0.0 • Open Source
          </span>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <Github className="w-5 h-5" />
          </a>
        </div>
      </div>
    </header>
  );
}
