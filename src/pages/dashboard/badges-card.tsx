import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    CheckCircle2,
    Flame,
    Goal,
    LockKeyhole,
    MessageCircleMore,
    Rocket,
    Send,
    ShieldCheck,
    Sparkles,
    Star,
    Trophy,
    UserCheck,
} from "lucide-react";
import type { AchievementItem, BadgeItem } from "./types.ts";
import { useLanguage } from "@/components/refine-ui/language/language-provider";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

const achievementIconMap = {
    profile_complete: UserCheck,
    ready_to_start: Sparkles,
    fully_updated: UserCheck,
    fast_starter: Rocket,
    first_submission: Send,
    task_achiever: Trophy,
    on_time_performer: CheckCircle2,
    review_ready: ShieldCheck,
    bounce_back: Rocket,
    focused_finisher: Goal,
    first_consultation: MessageCircleMore,
    consultation_star: Star,
    active_communicator: MessageCircleMore,
    follow_up_keeper: MessageCircleMore,
    resolution_seeker: CheckCircle2,
    feedback_listener: ShieldCheck,
    revision_complete: CheckCircle2,
    approved_work: Trophy,
    quality_submitter: ShieldCheck,
    growth_mindset: Sparkles,
    streak: Flame,
    consistency_builder: Flame,
    steady_progress: Goal,
    momentum_maker: Rocket,
    reliable_performer: CheckCircle2,
} as const;

export function BadgesCard({ items, achievements }: { items: BadgeItem[]; achievements?: AchievementItem[] }) {
    const { dir } = useLanguage();
    const { t } = useTranslation();
    const liveAchievements = achievements ?? [];
    const unlockedCount = liveAchievements.filter((item) => item.achieved).length;
    const orderedAchievements = [...liveAchievements].sort((a, b) => {
        if (a.achieved !== b.achieved) return a.achieved ? -1 : 1;
        return a.category.localeCompare(b.category) || a.id.localeCompare(b.id);
    });

    return (
        <Card className="flex h-full min-w-0 flex-col overflow-hidden shadow-lg">
            <CardHeader className={cn("flex flex-row items-center justify-between gap-3 space-y-0", dir === "rtl" && "flex-row-reverse")}>
                <div className={dir === "rtl" ? "text-right" : "text-left"}>
                    <CardTitle className="text-3xl font-bold">{t("dashboard.badges.sectionTitle")}</CardTitle>
                    <p className="mt-2 text-sm text-muted-foreground">{t("dashboard.badges.sectionDescription")}</p>
                </div>

                <div className="flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-primary">
                    <Trophy className="h-5 w-5" />
                    <span className="text-sm font-semibold">
                        {liveAchievements.length ? `${unlockedCount}/${liveAchievements.length}` : items.length}
                    </span>
                </div>
            </CardHeader>

            <CardContent className="min-h-0 min-w-0 flex-1 overflow-hidden">
                {liveAchievements.length ? (
                    <div className="max-h-[420px] w-full overflow-y-auto pr-1">
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            {orderedAchievements.map((item) => {
                                const Icon = achievementIconMap[item.id as keyof typeof achievementIconMap] ?? Trophy;
                                const percent = item.target > 0 ? Math.round((item.progress / item.target) * 100) : 0;

                                return (
                                    <div
                                        key={item.id}
                                        className={cn(
                                            "min-h-[176px] rounded-xl border p-4 text-center shadow-sm transition hover:-translate-y-0.5",
                                            item.achieved ? "border-primary/30 bg-primary/5" : "bg-card",
                                        )}
                                    >
                                        <div className="mb-3 flex justify-center">
                                            <div className={cn("flex h-14 w-14 items-center justify-center rounded-full", item.achieved ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
                                                <Icon className="h-7 w-7" />
                                            </div>
                                        </div>

                                        <div className="mb-3 flex justify-center">
                                            <Badge variant={item.achieved ? "default" : "outline"} className="h-6 gap-1 px-2 text-[10px]">
                                                {item.achieved ? <CheckCircle2 className="h-3 w-3" /> : <LockKeyhole className="h-3 w-3" />}
                                                {item.achieved ? t("dashboard.badges.unlocked") : t("dashboard.badges.locked")}
                                            </Badge>
                                        </div>

                                        <div className="line-clamp-1 text-sm font-semibold">{t(`dashboard.badges.items.${item.id}.title`)}</div>
                                        <div className="mx-auto mt-1 line-clamp-2 min-h-8 max-w-[16rem] text-[11px] leading-4 text-muted-foreground">{t(`dashboard.badges.items.${item.id}.hint`)}</div>

                                        <div className="mt-3">
                                            <div className={cn("mb-1 flex items-center justify-between gap-2 text-[10px] text-muted-foreground", dir === "rtl" && "flex-row-reverse")}>
                                                <span>{t(`dashboard.badges.categories.${item.category}`)}</span>
                                                <span>{item.progress}/{item.target}</span>
                                            </div>
                                            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                                                <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${Math.min(percent, 100)}%` }} />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                <div className="grid max-h-[420px] w-full grid-cols-1 gap-3 overflow-y-auto pr-1 sm:grid-cols-2">
                    {items.map((item) => {
                        const Icon = item.icon;

                        return (
                            <div
                                key={item.title}
                                className={cn(
                                    "min-h-[176px] rounded-xl border bg-card p-4 text-center shadow-sm transition-transform hover:-translate-y-0.5",
                                )}
                            >
                                <div className="mb-3 flex justify-center">
                                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                                        <Icon className="h-7 w-7" />
                                    </div>
                                </div>

                                <div className="line-clamp-1 text-sm font-semibold">{item.title}</div>
                                <div className="mx-auto mt-1 line-clamp-2 max-w-[16rem] text-[11px] leading-4 text-muted-foreground">{item.hint}</div>
                            </div>
                        );
                    })}
                </div>
                )}
            </CardContent>
        </Card>
    );
}
