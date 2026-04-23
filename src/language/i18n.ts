import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./en.json";
import ar from "./ar.json";
import { getInitialLanguage } from "./runtime";

void i18n
    .use(initReactI18next)
    .init({
        resources: {
            en: { translation: en },
            ar: { translation: ar },
        },
        lng: getInitialLanguage(),
        fallbackLng: "en",
        supportedLngs: ["en", "ar"],
        interpolation: {
            escapeValue: false,
        },
    });


export default i18n;