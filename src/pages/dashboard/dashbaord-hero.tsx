import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Flame } from "lucide-react";
import type { HeroMetric } from "./types.ts";
import { useLanguage } from "@/components/refine-ui/language/language-provider";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import type { Role } from "@/lib/rbac";

export function DashboardHero({
                                  name,
                                  role,
                                  label,
                                  description,
                                  progressLabel,
                                  progressValue,
                                  streakDays,
                                  metrics,
                                  showProgress = true,
                                  showStreak = true,
                                  showHabitCard = true,
                              }: {
    name: string;
    role: Role;
    label: string;
    description: string;
    progressLabel: string;
    progressValue: number;
    streakDays: number;
    metrics: HeroMetric[];
    showProgress?: boolean;
    showStreak?: boolean;
    showHabitCard?: boolean;
}) {
    const { dir } = useLanguage();
    const { t } = useTranslation();
    const navigate = useNavigate();

    const localizedName = dir === "rtl" ? `\u2068${name}\u2069` : name;

    function normalizeMetricLabel(metricLabel: string) {
        const label = metricLabel.trim().toLowerCase();

        if (
            label.includes("open tasks") ||
            label.includes("المهام المفتوحة")
        ) {
            return "openTasks";
        }

        if (
            label.includes("unread notifications") ||
            label.includes("الإشعارات غير المقروءة")
        ) {
            return "unreadNotifications";
        }

        if (
            label.includes("active consultations") ||
            label.includes("الاستشارات النشطة") ||
            label.includes("الاستشارات الأنشطة")
        ) {
            return "activeConsultations";
        }

        if (
            label.includes("pending reviews") ||
            label.includes("المراجعات المعلقة")
        ) {
            return "pendingReviews";
        }

        if (
            label.includes("active students") ||
            label.includes("students") ||
            label.includes("الطلاب النشطون") ||
            label.includes("الطلاب النشطين") ||
            label.includes("الطلاب")
        ) {
            return "activeStudents";
        }

        if (
            label.includes("overdue tasks") ||
            label.includes("المهام المتأخرة")
        ) {
            return "overdueTasks";
        }

        if (
            label.includes("task completion") ||
            label.includes("إكمال المهام")
        ) {
            return "taskCompletion";
        }

        return label;
    }

    function getMetricRoute(metricLabel: string) {
        const key = normalizeMetricLabel(metricLabel);

        switch (key) {
            case "openTasks":
            case "overdueTasks":
            case "taskCompletion":
                return "/tasks";

            case "activeConsultations":
                return "/consultations";

            case "unreadNotifications":
                return "/notifications";

            case "pendingReviews":
            case "activeStudents":
                if (role === "supervisor" || role === "management") {
                    return "/students";
                }
                return "/students";

            default:
                return null;
        }
    }

    return (
        <div className="space-y-4">
            <Card className="overflow-hidden border shadow-lg">
                <CardContent className="space-y-6 p-5 md:p-8">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div
                            className={cn(
                                "space-y-3",
                                dir === "rtl" ? "text-right" : "text-left",
                            )}
                        >
                            <Badge className="rounded-full bg-primary px-4 py-1 text-sm text-primary-foreground hover:bg-primary">
                                {label}
                            </Badge>

                            <div className="space-y-2">
                                <h1 className="text-2xl font-bold tracking-tight md:text-4xl">
                                    {t("dashboard.hero.welcomeBack", {
                                        name: localizedName,
                                    })}
                                </h1>

                                <p className="max-w-3xl text-sm leading-6 text-muted-foreground md:text-base">
                                    {description}
                                </p>
                            </div>
                        </div>

                        {showStreak ? (
                            <div
                                className={cn(
                                    "inline-flex items-center gap-2 rounded-full border bg-card px-3 py-2 text-sm font-medium shadow-sm",
                                    dir === "rtl" && "flex-row-reverse",
                                )}
                            >
                                <Flame className="h-4 w-4 text-primary" />
                                {t("dashboard.hero.streakActive", {
                                    count: streakDays,
                                })}
                            </div>
                        ) : null}
                    </div>

                    {showProgress ? (
                        <Card className="border bg-card shadow-md">
                            <CardContent className="space-y-4 p-4 md:p-5">
                                <div
                                    className={cn(
                                        "flex flex-wrap items-center gap-3",
                                        dir === "rtl" ? "justify-end text-right" : "justify-between text-left",
                                    )}
                                >
                                    <div
                                        className={cn(
                                            "text-lg font-semibold",
                                            dir === "rtl" ? "text-right" : "text-left",
                                        )}
                                    >
                                        {progressLabel}
                                    </div>

                                    <div className="text-2xl font-bold text-primary">
                                        {progressValue}%
                                    </div>
                                </div>

                                <Progress
                                    value={progressValue}
                                    className="h-4 rounded-full bg-muted"
                                />
                            </CardContent>
                        </Card>
                    ) : null}

                    <div
                        className={
                            showHabitCard
                                ? "grid gap-4 md:grid-cols-[280px_1fr]"
                                : "grid gap-4"
                        }
                    >
                        {showHabitCard ? (
                            <Card className="border bg-card shadow-sm">
                                <CardContent className="flex min-h-[140px] flex-col items-center justify-center gap-3 p-6 text-center">
                                    <div className="rounded-full bg-primary/10 p-4 text-primary shadow-sm">
                                        <Flame className="h-8 w-8" />
                                    </div>

                                    <div className="space-y-1">
                                        <div className="text-xl font-bold">
                                            {t("dashboard.hero.habitBuilding")}
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            {t("dashboard.hero.consistentActivity", {
                                                count: streakDays,
                                            })}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : null}

                        <div
                            className={
                                showHabitCard
                                    ? "grid gap-4 sm:grid-cols-3"
                                    : "grid gap-4 md:grid-cols-3"
                            }
                        >
                            {metrics.map((item, index) => {
                                const Icon = item.icon;
                                const route = getMetricRoute(item.label);
                                const isClickable = Boolean(route);

                                return (
                                    <Card
                                        key={`${item.label}-${index}`}
                                        onClick={() => {
                                            if (route) navigate(route);
                                        }}
                                        className={cn(
                                            "border bg-card shadow-sm transition-all duration-200",
                                            isClickable &&
                                            "cursor-pointer hover:-translate-y-1 hover:shadow-md hover:border-primary/40",
                                        )}
                                    >
                                        <CardContent className="flex min-h-[128px] items-center p-5">
                                            <div
                                                className={cn(
                                                    "flex w-full items-center gap-4",
                                                    dir === "rtl" && "flex-row-reverse",
                                                )}
                                            >
                                                <div className="rounded-full bg-primary/10 p-2 text-primary shrink-0">
                                                    <Icon className="h-5 w-5" />
                                                </div>

                                                <div
                                                    className={cn(
                                                        "min-w-0 flex-1",
                                                        dir === "rtl"
                                                            ? "text-right"
                                                            : "text-left",
                                                    )}
                                                >
                                                    <div className="text-3xl font-bold">
                                                        {item.value}
                                                    </div>

                                                    <div className="text-sm font-medium text-muted-foreground">
                                                        {item.label}
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
