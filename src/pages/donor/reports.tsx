import { useEffect, useState } from "react";
import { Download } from "lucide-react";

import { ListView, ListViewHeader } from "@/components/refine-ui/views/list-view";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { API_URL } from "@/providers/constants";
import { fetchWithAuth } from "@/providers/fetcher";
import { useTranslation } from "react-i18next";

type DonorReport = {
    id: string;
    title: string;
    generatedAt: string;
    summary: {
        supportedStudents: number;
        activeStudents: number;
        completedTasks: number;
        supportedPrograms: number;
    };
};

export default function DonorReports() {
    const { t } = useTranslation();
    const [reports, setReports] = useState<DonorReport[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let active = true;
        fetchWithAuth(`${API_URL}/donor/reports`)
            .then(async (response) => {
                if (!response.ok) throw new Error(t("donor.messages.failedToLoadReports"));
                return response.json();
            })
            .then((data) => { if (active) setReports(data); })
            .catch((e) => { if (active) setError(e?.message ?? t("donor.messages.failedToLoadReports")); });
        return () => { active = false; };
    }, [t]);

    function downloadReport(report: DonorReport) {
        const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${report.id}.json`;
        link.click();
        URL.revokeObjectURL(url);
    }

    return (
        <ListView>
            <ListViewHeader title={t("nav.donorReports")} canCreate={false} />
            {error ? <Card><CardContent className="p-4 text-sm text-destructive">{error}</CardContent></Card> : null}
            <div className="grid gap-4">
                {reports.map((report) => (
                    <Card key={report.id}>
                        <CardHeader className="flex flex-row items-center justify-between gap-4">
                            <CardTitle>{report.title}</CardTitle>
                            <Button type="button" variant="outline" onClick={() => downloadReport(report)}>
                                <Download className="h-4 w-4" />
                                {t("donor.actions.download")}
                            </Button>
                        </CardHeader>
                        <CardContent className="grid gap-4 text-sm md:grid-cols-4">
                            <div>{t("donor.metrics.supportedStudents")}: {report.summary.supportedStudents}</div>
                            <div>{t("donor.metrics.activeStudents")}: {report.summary.activeStudents}</div>
                            <div>{t("donor.metrics.completedTasks")}: {report.summary.completedTasks}</div>
                            <div>{t("donor.metrics.supportedPrograms")}: {report.summary.supportedPrograms}</div>
                        </CardContent>
                    </Card>
                ))}
                {!reports.length && !error ? (
                    <Card><CardContent className="p-4 text-sm text-muted-foreground">{t("donor.empty.noReports")}</CardContent></Card>
                ) : null}
            </div>
        </ListView>
    );
}
