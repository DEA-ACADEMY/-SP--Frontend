import { EditView } from "@/components/refine-ui/views/edit-view";
import { useLanguage } from "@/components/refine-ui/language/language-provider";
import { useTheme } from "@/components/refine-ui/theme/theme-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Globe, LogOut, Moon, Languages } from "lucide-react";
import { useLogout } from "@refinedev/core";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

export default function Settings() {
    const { t } = useTranslation();
    const { theme, setTheme } = useTheme();
    const { language, setLanguage, dir } = useLanguage();
    const { mutate: logout, isPending: isLoggingOut } = useLogout();

    const isDarkMode = theme === "dark";
    const isArabic = language === "ar";

    const themeLabel =
        theme === "dark"
            ? t("common.darkMode")
            : theme === "light"
                ? t("common.lightMode")
                : t("common.systemMode");

    const languageLabel =
        language === "ar" ? t("common.arabic") : t("common.english");

    const directionLabel =
        dir === "rtl" ? t("common.rightToLeft") : t("common.leftToRight");

    return (
        <EditView>
            <div className="w-full max-w-4xl space-y-6">
                <div className={cn("space-y-1", dir === "rtl" ? "text-right" : "text-left")}>
                    <h1 className="text-2xl font-bold tracking-tight">
                        {t("settingsPage.title")}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        {t("settingsPage.description")}
                    </p>
                </div>

                <Card>
                    <CardHeader className={dir === "rtl" ? "text-right" : "text-left"}>
                        <CardTitle className="text-base">
                            {t("settingsPage.appearanceTitle")}
                        </CardTitle>
                        <CardDescription>
                            {t("settingsPage.appearanceDescription")}
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-5">
                        <div className="flex items-center justify-between gap-4 rounded-2xl border bg-card px-4 py-4">
                            <div className={cn("space-y-1", dir === "rtl" ? "text-right" : "text-left")}>
                                <div className="flex items-center gap-2 font-medium">
                                    <Moon className="h-4 w-4" />
                                    <Label htmlFor="dark-mode" className="cursor-pointer">
                                        {t("settingsPage.darkModeTitle")}
                                    </Label>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    {t("settingsPage.darkModeDescription")}
                                </p>
                            </div>

                            <Switch
                                id="dark-mode"
                                checked={isDarkMode}
                                onCheckedChange={(checked) =>
                                    setTheme(checked ? "dark" : "light")
                                }
                            />
                        </div>

                        <Separator />

                        <div className="flex items-center justify-between gap-4 rounded-2xl border bg-card px-4 py-4">
                            <div className={cn("space-y-1", dir === "rtl" ? "text-right" : "text-left")}>
                                <div className="flex items-center gap-2 font-medium">
                                    <Languages className="h-4 w-4" />
                                    <Label htmlFor="language-mode" className="cursor-pointer">
                                        {t("settingsPage.languageTitle")}
                                    </Label>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    {t("settingsPage.languageDescription")}
                                </p>
                            </div>

                            <Switch
                                id="language-mode"
                                checked={isArabic}
                                onCheckedChange={(checked) =>
                                    setLanguage(checked ? "ar" : "en")
                                }
                            />
                        </div>

                        <div className="rounded-2xl border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
                            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                                <span>
                                    {t("settingsPage.currentTheme")}:{" "}
                                    <strong className="text-foreground">{themeLabel}</strong>
                                </span>
                                <span>
                                    {t("settingsPage.currentLanguage")}:{" "}
                                    <strong className="text-foreground">{languageLabel}</strong>
                                </span>
                                <span>
                                    {t("settingsPage.currentDirection")}:{" "}
                                    <strong className="text-foreground">{directionLabel}</strong>
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className={dir === "rtl" ? "text-right" : "text-left"}>
                        <CardTitle className="text-base">
                            {t("settingsPage.notificationsTitle")}
                        </CardTitle>
                        <CardDescription>
                            {t("settingsPage.notificationsDescription")}
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label>{t("settingsPage.enableNotifications")}</Label>
                            <Switch />
                        </div>

                        <Separator />

                        <div className="flex items-center justify-between">
                            <Label>{t("settingsPage.emailNotifications")}</Label>
                            <Switch />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className={dir === "rtl" ? "text-right" : "text-left"}>
                        <CardTitle className="text-base">
                            {t("settingsPage.accountTitle")}
                        </CardTitle>
                        <CardDescription>
                            {t("settingsPage.accountDescription")}
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        <div className="flex flex-wrap gap-3">
                            <Button variant="outline" className="gap-2">
                                <Globe className="h-4 w-4" />
                                {t("settingsPage.updateProfileSettings")}
                            </Button>

                            <Button
                                variant="destructive"
                                className="gap-2"
                                onClick={() => logout()}
                            >
                                <LogOut className="h-4 w-4" />
                                {isLoggingOut ? t("common.loggingOut") : t("common.logout")}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </EditView>
    );
}
