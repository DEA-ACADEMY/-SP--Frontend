"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
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
                "h-10 min-w-10 rounded-full border-sidebar-border bg-transparent px-2 text-xs font-bold uppercase tracking-normal",
                className,
            )}
            title={label}
        >
            <span aria-hidden>{language === "en" ? "EN" : "AR"}</span>
            <span className="sr-only">{label}</span>
        </Button>
    );
}

LanguageToggle.displayName = "LanguageToggle";
