import { useEffect, useState } from "react";

import { ListView, ListViewHeader } from "@/components/refine-ui/views/list-view";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { API_URL } from "@/providers/constants";
import { fetchWithAuth } from "@/providers/fetcher";
import { useTranslation } from "react-i18next";
import type { DonorProgram } from "./types";

export default function DonorPrograms() {
    const { t } = useTranslation();
    const [rows, setRows] = useState<DonorProgram[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let active = true;
        fetchWithAuth(`${API_URL}/donor/programs`)
            .then(async (response) => {
                if (!response.ok) throw new Error(t("donor.messages.failedToLoadPrograms"));
                return response.json();
            })
            .then((data) => { if (active) setRows(data); })
            .catch((e) => { if (active) setError(e?.message ?? t("donor.messages.failedToLoadPrograms")); });
        return () => { active = false; };
    }, [t]);

    return (
        <ListView>
            <ListViewHeader title={t("nav.supportedPrograms")} canCreate={false} />
            {error ? <Card><CardContent className="p-4 text-sm text-destructive">{error}</CardContent></Card> : null}
            <div className="overflow-x-auto rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t("common.program")}</TableHead>
                            <TableHead>{t("common.branch")}</TableHead>
                            <TableHead>{t("donor.fields.cohorts")}</TableHead>
                            <TableHead>{t("donor.fields.supportedStudents")}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {rows.length ? rows.map((row) => (
                            <TableRow key={row.id}>
                                <TableCell>{row.name}</TableCell>
                                <TableCell>{row.branch ?? t("common.notAvailable")}</TableCell>
                                <TableCell>{row.cohortCount}</TableCell>
                                <TableCell>{row.supportedStudentCount}</TableCell>
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={4} className="h-32 text-center text-sm text-muted-foreground">
                                    {t("table.empty.title")}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </ListView>
    );
}
