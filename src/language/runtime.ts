export type AppLanguage = "en" | "ar";

export const LANGUAGE_STORAGE_KEY = "snowball-language";

export function isAppLanguage(value: string | null | undefined): value is AppLanguage {
    return value === "en" || value === "ar";
}

export function getInitialLanguage(fallback: AppLanguage = "en"): AppLanguage {
    if (typeof window === "undefined") return fallback;

    const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (isAppLanguage(stored)) return stored;

    const htmlLang = document.documentElement.lang;
    if (isAppLanguage(htmlLang)) return htmlLang;

    return fallback;
}

export function getDirection(language: AppLanguage): "ltr" | "rtl" {
    return language === "ar" ? "rtl" : "ltr";
}

export function applyLanguageToDocument(language: AppLanguage) {
    if (typeof document === "undefined") return;

    const dir = getDirection(language);
    const root = document.documentElement;

    root.lang = language;
    root.dir = dir;
    root.setAttribute("data-language", language);
    document.body.setAttribute("dir", dir);
}