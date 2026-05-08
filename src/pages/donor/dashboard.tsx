import { useEffect, useState } from "react";
import { Bell, BookCheck, FileText, GraduationCap } from "lucide-react";

import { ListView } from "@/components/refine-ui/views/list-view";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { API_URL } from "@/providers/constants";
import { fetchWithAuth } from "@/providers/fetcher";
import { useTranslation } from "react-i18next";
import type { DonorDashboardData } from "./types";

const metricIcons = [GraduationCap, BookCheck, FileText, Bell] as const;

export default function DonorDashboard() {
    const { t } = useTranslation();
    const [data, setData] = useState<DonorDashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let active = true;

        async function loadDashboard() {
            try {
                setLoading(true);
                setError(null);
                const response = await fetchWithAuth(`${API_URL}/donor/dashboard`);
                if (!response.ok) throw new Error(t("donor.messages.failedToLoadDashboard"));
                const json = await response.json();
                if (active) setData(json);
            } catch (e: any) {
                if (active) setError(e?.message ?? t("donor.messages.failedToLoadDashboard"));
            } finally {
                if (active) setLoading(false);
            }
        }

        void loadDashboard();
        return () => {
            active = false;
        };
    }, [t]);

    if (loading) {
        return (
            <ListView>
                <Skeleton className="h-48 rounded-lg" />
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <Skeleton className="h-28 rounded-lg" />
                    <Skeleton className="h-28 rounded-lg" />
                    <Skeleton className="h-28 rounded-lg" />
                    <Skeleton className="h-28 rounded-lg" />
                </div>
            </ListView>
        );
    }

    if (error || !data) {
        return (
            <ListView>
                <Card>
                    <CardContent className="p-6 text-sm text-destructive">
                        {error ?? t("donor.messages.failedToLoadDashboard")}
                    </CardContent>
                </Card>
            </ListView>
        );
    }

    const metrics = [
        { label: t("donor.metrics.supportedStudents"), value: data.supportedStudents },
        { label: t("donor.metrics.activeStudents"), value: data.activeStudents },
        { label: t("donor.metrics.completedTasks"), value: data.completedTasks },
        { label: t("donor.metrics.supportedPrograms"), value: data.supportedPrograms },
    ];

    return (
        <ListView className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold">{t("donor.dashboard.title")}</h2>
                <p className="text-sm text-muted-foreground">{t("donor.dashboard.description")}</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {metrics.map((metric, index) => {
                    const Icon = metricIcons[index] ?? Bell;
                    return (
                        <Card key={metric.label}>
                            <CardContent className="flex items-center justify-between gap-4 p-5">
                                <div>
                                    <p className="text-sm text-muted-foreground">{metric.label}</p>
                                    <p className="mt-2 text-2xl font-bold">{metric.value}</p>
                                </div>
                                <Icon className="h-6 w-6 text-primary" />
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            <div className="grid gap-4 xl:grid-cols-3">
                <Card>
                    <CardHeader><CardTitle>{t("donor.dashboard.latestUpdates")}</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                        {data.latestUpdates.length ? data.latestUpdates.map((item) => (
                            <p key={item.id} className="text-sm">{item.message}</p>
                        )) : <p className="text-sm text-muted-foreground">{t("donor.empty.noUpdates")}</p>}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle>{t("donor.dashboard.latestReports")}</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                        {data.latestReports.map((item) => (
                            <p key={item.id} className="text-sm">{item.title}</p>
                        ))}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle>{t("donor.dashboard.recentNotifications")}</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                        {data.recentNotifications.length ? data.recentNotifications.map((item) => (
                            <div key={item.id} className="text-sm">
                                <p className="font-medium">{item.title}</p>
                                {item.body ? <p className="text-muted-foreground">{item.body}</p> : null}
                            </div>
                        )) : <p className="text-sm text-muted-foreground">{t("donor.empty.noNotifications")}</p>}
                    </CardContent>
                </Card>
            </div>
        </ListView>
    );
}
