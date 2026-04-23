import { useEffect, useMemo, useState } from "react";
import {
    Bell,
    BookCheck,
    CalendarClock,
    FolderKanban,
    MessageCircleMore,
} from "lucide-react";

import { ListView } from "@/components/refine-ui/views/list-view";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Role } from "@/lib/rbac";
import { authProvider } from "@/providers/auth";
import { API_URL } from "@/providers/constants";
import { fetchWithAuth } from "@/providers/fetcher";

import { BadgesCard } from "./badges-card";
import { CalendarPlannerCard } from "./calendar-planner-card.tsx";
import { DashboardHero } from "./dashbaord-hero.tsx";
import { IdpJourneyCard } from "./idp-journey-card";
import { ReportPreviewCard } from "./report-preview-card";
import { getPresentationData } from "./mock-data";
import type { AchievementItem, DashboardIdentity, HeroMetric, PlannerEvent } from "./types";
import { useLanguage } from "@/components/refine-ui/language/language-provider";
import { useTranslation } from "react-i18next";

function roleLabel(role: Role, t: (key: string) => string) {
    switch (role) {
        case "student":
            return t("roles.student");
        case "supervisor":
            return t("roles.supervisor");
        case "management":
            return t("roles.management");
        case "donor":
            return t("roles.donor");
        case "expert":
            return t("roles.expert");
        default:
            return role;
    }
}

const metricIconMap = {
    Bell,
    FolderKanban,
    MessageCircleMore,
    CalendarClock,
    BookCheck,
} as const;

type DashboardOverviewResponse = {
    heroLabel: string;
    heroDescription: string;
    progressLabel: string;
    progressValue: number;
    streakDays: number;
    showProgress: boolean;
    showStreak: boolean;
    showHabitCard: boolean;
    metrics: Array<{
        label: string;
        value: string | number;
        icon: keyof typeof metricIconMap;
    }>;
    plannerEvents: PlannerEvent[];
    achievements?: AchievementItem[];
};

function normalizeMetrics(
    metrics: DashboardOverviewResponse["metrics"],
): HeroMetric[] {
    return metrics.map((metric) => ({
        ...metric,
        icon: metricIconMap[metric.icon] ?? Bell,
    }));
}

function translateLiveMetricLabel(
    label: string,
    role: Role,
    t: (key: string) => string,
) {
    switch (label) {
        case "Active consultations":
            return t("dashboard.live.metrics.activeConsultations");

        case "Pending reviews":
            if (role === "supervisor" || role === "management") {
                return t("dashboard.live.metrics.activeStudents");
            }
            return t("dashboard.live.metrics.pendingReviews");

        case "Overdue tasks":
            return t("dashboard.live.metrics.overdueTasks");

        case "Unread notifications":
            return t("dashboard.live.metrics.unreadNotifications");

        case "Open tasks":
            return t("dashboard.live.metrics.openTasks");

        case "Task completion":
            return t("dashboard.live.metrics.taskCompletion");

        default:
            return label;
    }
}

function translateLiveHeroLabel(label: string, t: (key: string) => string) {
    switch (label) {
        case "Student Dashboard":
            return t("dashboard.live.heroLabel.student");
        case "Supervisor Dashboard":
            return t("dashboard.live.heroLabel.supervisor");
        case "Management Dashboard":
            return t("dashboard.live.heroLabel.management");
        default:
            return label;
    }
}

function translateLiveHeroDescription(
    description: string,
    t: (key: string, options?: Record<string, string | number>) => string,
) {
    const managementSummaryMatch = description.match(
        /^Across the current scope, there are (\d+) pending reviews, (\d+) overdue task assignments?, and (\d+) active consultations\.?$/i,
    );

    if (managementSummaryMatch) {
        return t("dashboard.live.heroDescription.management", {
            pending: Number(managementSummaryMatch[1]),
            overdue: Number(managementSummaryMatch[2]),
            consultations: Number(managementSummaryMatch[3]),
        });
    }

    const supervisorSummaryMatch = description.match(
        /^You currently have (\d+) submissions waiting for review, (\d+) overdue task assignments?, and (\d+) active student consultations\.?$/i,
    );

    if (supervisorSummaryMatch) {
        return t("dashboard.live.heroDescription.supervisor", {
            pending: Number(supervisorSummaryMatch[1]),
            overdue: Number(supervisorSummaryMatch[2]),
            consultations: Number(supervisorSummaryMatch[3]),
        });
    }

    const studentSummaryMatch = description.match(
        /^You currently have (\d+) open tasks, (\d+) unread notifications, and (\d+) active consultations\.?$/i,
    );

    if (studentSummaryMatch) {
        return t("dashboard.live.heroDescription.student", {
            tasks: Number(studentSummaryMatch[1]),
            notifications: Number(studentSummaryMatch[2]),
            consultations: Number(studentSummaryMatch[3]),
        });
    }

    return description;
}

const studentJourneyPool = [
    { id: "complete_profile_setup", achievementId: "profile_complete" },
    { id: "add_profile_picture", achievementId: "profile_complete" },
    { id: "complete_required_student_information", achievementId: "fully_updated" },
    { id: "receive_first_assigned_task", achievementId: "ready_to_start" },
    { id: "start_first_assigned_task", achievementId: "fast_starter" },
    { id: "submit_first_task", achievementId: "first_submission" },
    { id: "get_first_review_feedback", achievementId: "feedback_listener" },
    { id: "complete_first_approved_task", achievementId: "approved_work" },
    { id: "open_first_consultation", achievementId: "first_consultation" },
    { id: "receive_first_consultation_reply", achievementId: "active_communicator" },
    { id: "close_first_consultation", achievementId: "resolution_seeker" },
    { id: "complete_consultation_cycle", achievementId: "consultation_star" },
    { id: "handle_resubmission_successfully", achievementId: "bounce_back" },
    { id: "complete_three_tasks", achievementId: "task_achiever" },
    { id: "maintain_zero_overdue_tasks", achievementId: "focused_finisher" },
    { id: "reach_consistency_milestone", achievementId: "consistency_builder" },
] as const;

function buildStudentJourneySteps(
    achievements: AchievementItem[] | undefined,
    fallback: ReturnType<typeof getPresentationData>["journeySteps"],
    t: (key: string) => string,
) {
    if (!achievements?.length) return fallback;

    const achievedIds = new Set(achievements.filter((item) => item.achieved).map((item) => item.id));
    const decorated = studentJourneyPool.map((item) => ({
        id: item.id,
        title: t(`dashboard.journey.items.${item.id}`),
        achieved: achievedIds.has(item.achievementId),
    }));

    const firstOpenIndex = decorated.findIndex((item) => !item.achieved);
    const focusIndex = firstOpenIndex === -1 ? decorated.length - 1 : firstOpenIndex;
    const start = Math.max(0, Math.min(focusIndex - 2, decorated.length - 5));
    const visible = decorated.slice(start, start + 5);
    const currentId = firstOpenIndex === -1 ? null : decorated[firstOpenIndex]?.id;
    const nextId = firstOpenIndex === -1 ? null : decorated[firstOpenIndex + 1]?.id;

    return visible.map((item) => ({
        title: item.title,
        status: item.achieved
            ? "done" as const
            : item.id === currentId
                ? "current" as const
                : item.id === nextId
                    ? "next" as const
                    : "locked" as const,
    }));
}

export default function Dashboard() {
    const { t, i18n } = useTranslation();
    const { dir } = useLanguage();

    const [identity, setIdentity] = useState<DashboardIdentity | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [overview, setOverview] = useState<DashboardOverviewResponse | null>(null);
    const [overviewLoading, setOverviewLoading] = useState(true);
    const [overviewError, setOverviewError] = useState<string | null>(null);

    useEffect(() => {
        let active = true;

        async function loadIdentity() {
            try {
                setLoading(true);
                setError(null);

                const user = (await authProvider.getIdentity?.()) as
                    | {
                    id: string;
                    name?: string;
                    fullName?: string;
                    email?: string;
                    role?: Role;
                }
                    | null;

                if (!active) return;

                if (!user?.id || !user?.role) {
                    throw new Error(t("dashboard.errors.currentUser"));
                }

                setIdentity({
                    id: user.id,
                    name: user.fullName || user.name || t("common.user"),
                    email: user.email,
                    role: user.role,
                });
            } catch (e: any) {
                if (!active) return;
                setError(e?.message ?? t("dashboard.errors.loadDashboard"));
            } finally {
                if (active) setLoading(false);
            }
        }

        void loadIdentity();

        return () => {
            active = false;
        };
    }, [t]);

    useEffect(() => {
        if (!identity?.id) return;

        let active = true;

        async function loadOverview() {
            try {
                setOverviewLoading(true);
                setOverviewError(null);

                const response = await fetchWithAuth(`${API_URL}/dashboard/overview`);
                if (!response.ok) {
                    const payload = await response.json().catch(() => null);
                    throw new Error(
                        payload?.message ?? t("dashboard.errors.loadLiveData"),
                    );
                }

                const json = (await response.json()) as DashboardOverviewResponse;
                if (!active) return;
                setOverview(json);
            } catch (e: any) {
                if (!active) return;
                setOverview(null);
                setOverviewError(
                    e?.message ?? t("dashboard.errors.loadLiveData"),
                );
            } finally {
                if (active) setOverviewLoading(false);
            }
        }

        void loadOverview();

        return () => {
            active = false;
        };
    }, [identity?.id, t]);

    const presentation = useMemo(() => {
        return getPresentationData(identity?.role ?? "student", t);
    }, [identity?.role, t]);

    const heroMetrics = useMemo(() => {
        if (!overview) return presentation.metrics;

        const normalized = normalizeMetrics(overview.metrics);

        return normalized.map((metric) => ({
            ...metric,
            label: translateLiveMetricLabel(
                metric.label,
                identity?.role ?? "student",
                t,
            ),
        }));
    }, [overview, presentation.metrics, identity?.role, t]);

    const heroLabel =
        overview?.heroLabel && i18n.language === "ar"
            ? translateLiveHeroLabel(overview.heroLabel, t)
            : overview?.heroLabel ?? presentation.heroLabel;

    const heroDescription =
        overview?.heroDescription && i18n.language === "ar"
            ? translateLiveHeroDescription(overview.heroDescription, t)
            : overview?.heroDescription ?? presentation.heroDescription;

    const journeySteps =
        identity?.role === "student"
            ? buildStudentJourneySteps(overview?.achievements, presentation.journeySteps, t)
            : presentation.journeySteps;

    if (loading || overviewLoading) {
        return (
            <ListView>
                <div className="space-y-6">
                    <Skeleton className="h-[360px] rounded-[32px]" />
                    <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                        <Skeleton className="h-[520px] rounded-[32px]" />
                        <Skeleton className="h-[520px] rounded-[32px]" />
                    </div>
                    <Skeleton className="h-[520px] rounded-[32px]" />
                </div>
            </ListView>
        );
    }

    if (error || !identity) {
        return (
            <ListView>
                <Card>
                    <CardHeader>
                        <CardTitle>{t("nav.dashboard")}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-destructive">
                        {error ?? t("dashboard.errors.unavailable")}
                    </CardContent>
                </Card>
            </ListView>
        );
    }

    return (
        <ListView className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className={dir === "rtl" ? "text-right" : "text-left"}>
                    <h2 className="text-2xl font-bold">{t("nav.dashboard")}</h2>
                    <p className="text-sm text-muted-foreground">
                        {t("dashboard.subtitle")}
                    </p>
                </div>

                <Badge variant="outline">{roleLabel(identity.role, t)}</Badge>
            </div>

            {overviewError ? (
                <Card className="border-destructive/30 bg-destructive/5">
                    <CardContent className="p-4 text-sm text-destructive">
                        {overviewError}
                    </CardContent>
                </Card>
            ) : null}

            <DashboardHero
                name={identity.name}
                role={identity.role}
                label={heroLabel}
                description={heroDescription}
                progressLabel={overview?.progressLabel ?? presentation.progressLabel}
                progressValue={overview?.progressValue ?? presentation.progressValue}
                streakDays={overview?.streakDays ?? 0}
                metrics={heroMetrics}
                showProgress={overview?.showProgress ?? identity.role === "student"}
                showStreak={overview?.showStreak ?? false}
                showHabitCard={overview?.showHabitCard ?? false}
            />

            {identity.role === "student" ? (
                <div className="grid min-w-0 items-stretch gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                    <div className="min-w-0">
                        <IdpJourneyCard
                            title={presentation.journeyTitle}
                            steps={journeySteps}
                        />
                    </div>
                    <div className="min-w-0">
                        <BadgesCard items={presentation.badges} achievements={overview?.achievements} />
                    </div>
                </div>
            ) : null}

            <CalendarPlannerCard initialEvents={overview?.plannerEvents ?? []} storageKeyId={identity.id} />

            {identity.role === "management" ? (
                <ReportPreviewCard
                    title={presentation.reportTitle}
                    description={presentation.reportDescription}
                />
            ) : null}
        </ListView>
    );
}
