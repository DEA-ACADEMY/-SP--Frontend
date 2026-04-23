"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Languages } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLanguage } from "./language-provider";

type LanguageToggleProps = {
    className?: string;
};

export function LanguageToggle({ className }: LanguageToggleProps) {
    const { language, toggleLanguage } = useLanguage();
    const { t } = useTranslation();

    const label =
        language === "en"
            ? t("header.switchToArabic")
            : t("header.switchToEnglish");

    return (
        <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={toggleLanguage}
            className={cn(
                "h-10 w-10 rounded-full border-sidebar-border bg-transparent",
                className,
            )}
            title={label}
        >
            <Languages className="h-[1.2rem] w-[1.2rem]" />
            <span className="sr-only">{label}</span>
        </Button>
    );
}

LanguageToggle.displayName = "LanguageToggle";