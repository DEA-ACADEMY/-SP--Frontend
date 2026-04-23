import type { I18nProvider } from "@refinedev/core";
import i18n from "@/language/i18n";
import {
    applyLanguageToDocument,
    isAppLanguage,
    LANGUAGE_STORAGE_KEY,
} from "@/language/runtime";

export const appI18nProvider: I18nProvider = {
    translate: (key: string, options?: any, defaultMessage?: string) => {
        const translated = i18n.t(key, {
            defaultValue: defaultMessage,
            ...(options ?? {}),
        });

        return typeof translated === "string"
            ? translated
            : defaultMessage ?? key;
    },

    changeLocale: async (lang: string) => {
        if (!isAppLanguage(lang)) return;
        await i18n.changeLanguage(lang);
        localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);  // was "app-language"
        applyLanguageToDocument(lang);
    },

    getLocale: () =>
        i18n.language ||
        localStorage.getItem(LANGUAGE_STORAGE_KEY) ||       // was "app-language"
        "en",
};
