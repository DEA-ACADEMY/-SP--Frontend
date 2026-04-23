import { ListView } from "@/components/refine-ui/views/list-view";
import { Badge } from "@/components/ui/badge";
import { MiniGamesSection } from "@/pages/dashboard/mini-games-card";
import { useTranslation } from "react-i18next";

export default function MiniGamesPage() {
    const { t } = useTranslation();
    return (
        <ListView className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="text-2xl font-bold">{t("gamesPage.title")}</h2>
                    <p className="text-sm text-muted-foreground">
                        {t("gamesPage.description")}
                    </p>
                </div>

                <Badge variant="outline">{t("gamesPage.badge")}</Badge>
            </div>

            <MiniGamesSection />
        </ListView>
    );
}
