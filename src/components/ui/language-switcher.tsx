"use client";

import { useState, useEffect } from "react";
import { getAvailableLanguages, changeLanguage } from "@/lib/i18n-utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe } from "lucide-react";
import { useTranslation } from "react-i18next";

interface LanguageSwitcherProps {
  variant?: "default" | "outline" | "secondary" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function LanguageSwitcher({
  variant = "outline",
  size = "sm",
  className = "",
}: LanguageSwitcherProps) {
  const { i18n } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const availableLanguages = getAvailableLanguages();

  // This effect prevents hydration mismatch by only rendering
  // the component after client-side hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Get the current language display name
  const getCurrentLanguageName = () => {
    const lang = availableLanguages.find(lang => lang.code === i18n.language);
    return lang ? lang.nativeName : "English";
  };

  if (!mounted) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} className={`gap-2 ${className}`}>
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">{getCurrentLanguageName()}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {availableLanguages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => changeLanguage(language.code)}
            className="flex items-center justify-between gap-2 min-w-32"
          >
            <span>{language.nativeName}</span>
            {i18n.language === language.code && (
              <span className="text-primary">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
