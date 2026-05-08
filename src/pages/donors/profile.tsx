import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { ListView, ListViewHeader } from "@/components/refine-ui/views/list-view";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { API_URL } from "@/providers/constants";
import { fetchWithAuth } from "@/providers/fetcher";
import { useTranslation } from "react-i18next";

type DonorProfile = {
    donor: {
        id: string;
        name: string | null;
        email: string;
        phone?: string | null;
        city?: string | null;
        bio?: string | null;
    };
    supportedStudents: Array<{
        id: string;
        name: string | null;
        code: string;
        branch: string | null;
        program: string | null;
        cohort: string | null;
        progressSummary: string;
    }>;
    supportedPrograms: Array<{
        id: string;
        name: string;
        branch: string | null;
        supportedStudentCount: number;
    }>;
};

export default function DonorProfilePage() {
    const { id } = useParams();
    const { t } = useTranslation();
    const [profile, setProfile] = useState<DonorProfile | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let active = true;
        fetchWithAuth(`${API_URL}/donors/${id}/profile`)
            .then(async (response) => {
                if (!response.ok) throw new Error(t("donors.messages.failedToLoadProfile"));
                return response.json();
            })
            .then((data) => {
                if (active) setProfile(data);
            })
            .catch((e) => {
                if (active) setError(e?.message ?? t("donors.messages.failedToLoadProfile"));
            });

        return () => {
            active = false;
        };
    }, [id, t]);

    return (
        <ListView>
            <ListViewHeader title={t("donors.titles.show")} canCreate={false} />
            {error ? <Card><CardContent className="p-4 text-sm text-destructive">{error}</CardContent></Card> : null}
            {profile ? (
                <div className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
                    <Card>
                        <CardHeader>
                            <CardTitle>{profile.donor.name ?? t("common.user")}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <div>{t("common.email")}: {profile.donor.email}</div>
                            <div>{t("common.phone")}: {profile.donor.phone ?? t("common.notAvailable")}</div>
                            <div>{t("common.city")}: {profile.donor.city ?? t("common.notAvailable")}</div>
                            <div>{t("common.bio")}: {profile.donor.bio ?? t("common.notAvailable")}</div>
                        </CardContent>
                    </Card>

                    <div className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>{t("nav.supportedStudents")}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {profile.supportedStudents.length ? profile.supportedStudents.map((student) => (
                                    <div key={student.id} className="rounded-md border p-3 text-sm">
                                        <div className="font-medium">{student.name ?? student.code}</div>
                                        <div className="mt-1 text-muted-foreground">
                                            {student.branch ?? t("common.notAvailable")} · {student.program ?? t("common.notAvailable")} · {student.cohort ?? t("common.notAvailable")}
                                        </div>
                                        <Badge variant="outline" className="mt-2">{student.progressSummary}</Badge>
                                    </div>
                                )) : <p className="text-sm text-muted-foreground">{t("donor.empty.noUpdates")}</p>}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>{t("nav.supportedPrograms")}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {profile.supportedPrograms.length ? profile.supportedPrograms.map((program) => (
                                    <div key={program.id} className="rounded-md border p-3 text-sm">
                                        <div className="font-medium">{program.name}</div>
                                        <div className="mt-1 text-muted-foreground">{program.branch ?? t("common.notAvailable")}</div>
                                    </div>
                                )) : <p className="text-sm text-muted-foreground">{t("donor.empty.noReports")}</p>}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            ) : null}
        </ListView>
    );
}
