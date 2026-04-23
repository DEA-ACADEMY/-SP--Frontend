import {
    createContext,
    useEffect,
    PropsWithChildren,
    useCallback,
    useContext,
    useLayoutEffect,
    useMemo,
    useState,
} from "react";
import i18n from "@/language/i18n";
import {
    AppLanguage,
    applyLanguageToDocument,
    getDirection,
    getInitialLanguage,
    isAppLanguage,
    LANGUAGE_STORAGE_KEY,
} from "@/language/runtime";

type LanguageContextValue = {
    language: AppLanguage;
    dir: "ltr" | "rtl";
    setLanguage: (nextLanguage: AppLanguage) => void;
    toggleLanguage: () => void;
};

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

type LanguageProviderProps = PropsWithChildren<{
    defaultLanguage?: AppLanguage;
}>;

export function LanguageProvider({ children, defaultLanguage = "en" }: LanguageProviderProps) {
    const [language, setLanguageState] = useState<AppLanguage>(() =>
        getInitialLanguage(defaultLanguage),
    );

    useEffect(() => {
        const handleLanguageChanged = (nextLanguage: string) => {
            if (!isAppLanguage(nextLanguage)) return;
            setLanguageState((current) => (current === nextLanguage ? current : nextLanguage));
        };

        i18n.on("languageChanged", handleLanguageChanged);

        return () => {
            i18n.off("languageChanged", handleLanguageChanged);
        };
    }, []);

    useLayoutEffect(() => {
        applyLanguageToDocument(language);
        window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    }, [language]);

    const setLanguage = useCallback((nextLanguage: AppLanguage) => {
        if (!isAppLanguage(nextLanguage)) return;
        void i18n.changeLanguage(nextLanguage);
        setLanguageState((current) => (current === nextLanguage ? current : nextLanguage));
    }, []);

    const toggleLanguage = useCallback(() => {
        const nextLanguage = language === "ar" ? "en" : "ar";
        void i18n.changeLanguage(nextLanguage);
        setLanguageState(nextLanguage);
    }, [language]);

    const dir = useMemo(() => getDirection(language), [language]);

    const value = useMemo<LanguageContextValue>(
        () => ({ language, dir, setLanguage, toggleLanguage }),
        [dir, language, setLanguage, toggleLanguage],
    );

    return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
    const context = useContext(LanguageContext);

    if (!context) {
        throw new Error("useLanguage must be used within a LanguageProvider");
    }

    return context;
}
