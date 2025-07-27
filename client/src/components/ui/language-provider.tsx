import React from "react";
import { LanguageContext, createLanguageSystem } from "@/hooks/useLanguage";

interface LanguageProviderProps {
  children: React.ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const languageSystem = createLanguageSystem();

  return (
    <LanguageContext.Provider value={languageSystem}>
      {children}
    </LanguageContext.Provider>
  );
}