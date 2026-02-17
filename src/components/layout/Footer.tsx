"use client";

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="font-medium">EchoPrint AI</span>
            <span>•</span>
            <span>Образовательный инструмент</span>
          </div>
          
          <div className="flex items-center gap-4">
            <span>© 2025</span>
            <span>•</span>
            <span>MIT License</span>
          </div>
        </div>
        
        <div className="mt-4 text-center text-xs text-muted-foreground/70">
          Все данные обрабатываются исключительно в вашем браузере. 
          Никакая информация не отправляется на внешние серверы.
        </div>
      </div>
    </footer>
  );
}
