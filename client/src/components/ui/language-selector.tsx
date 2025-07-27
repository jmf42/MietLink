import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Globe } from "lucide-react";
import { useLanguage, type Language } from "@/hooks/useLanguage";

const languages = [
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "it", name: "Italiano", flag: "🇮🇹" },
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "es", name: "Español", flag: "🇪🇸" },
];

interface LanguageSelectorProps {
  variant?: "full" | "compact";
  className?: string;
}

export function LanguageSelector({
  variant = "compact",
  className = "",
}: LanguageSelectorProps) {
  const { language, setLanguage } = useLanguage();

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage as Language);
    console.log("Language changed to:", newLanguage);
  };

  const currentLanguage = languages.find(lang => lang.code === language) || languages[0];

  if (variant === "compact") {
    return (
      <div className={`flex items-center space-x-2 text-sm text-slate-600 ${className}`}>
        <Globe className="w-4 h-4" />
        <Select value={language} onValueChange={handleLanguageChange}>
          <SelectTrigger 
            className="language-dropdown border-none bg-transparent p-0 h-auto focus:ring-0 focus:ring-offset-0"
            data-testid="language-selector-trigger"
          >
            <SelectValue>
              <span className="flex items-center space-x-1">
                <span>{currentLanguage.flag}</span>
                <span className="font-medium">{currentLanguage.code.toUpperCase()}</span>
              </span>
            </SelectValue>
          </SelectTrigger>
          <SelectContent data-testid="language-selector-content">
            {languages.map((language) => (
              <SelectItem 
                key={language.code} 
                value={language.code}
                className="flex items-center space-x-2"
                data-testid={`language-option-${language.code}`}
              >
                <span className="flex items-center space-x-2">
                  <span>{language.flag}</span>
                  <span>{language.name}</span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="text-sm font-medium text-slate-700">
        {t("common.selectLanguage")}
      </label>
      <Select value={language} onValueChange={handleLanguageChange}>
        <SelectTrigger 
          className="w-full"
          data-testid="language-selector-full-trigger"
        >
          <SelectValue>
            <span className="flex items-center space-x-2">
              <span>{currentLanguage.flag}</span>
              <span>{currentLanguage.name}</span>
            </span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent data-testid="language-selector-full-content">
          {languages.map((language) => (
            <SelectItem 
              key={language.code} 
              value={language.code}
              data-testid={`language-option-full-${language.code}`}
            >
              <span className="flex items-center space-x-2">
                <span>{language.flag}</span>
                <span>{language.name}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
