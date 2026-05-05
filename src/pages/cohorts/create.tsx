import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { kyInstance } from "@/providers/data";

type Program = {
    id: string;
    name?: string | null;
};

function asArray<T>(value: unknown): T[] {
    return Array.isArray(value) ? value : (value as any)?.data ?? [];
}

export default function CohortCreatePage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [programs, setPrograms] = useState<Program[]>([]);
    const [name, setName] = useState("");
    const [programId, setProgramId] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        (async () => {
            try {
                const json = await kyInstance
                    .get("programs", { searchParams: { _start: "0", _end: "1000" } })
                    .json();
                if (!cancelled) setPrograms(asArray<Program>(json));
            } catch {
                if (!cancelled) setPrograms([]);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, []);

    async function onSubmit(event: React.FormEvent) {
        event.preventDefault();
        setError(null);

        if (!name.trim()) {
            setError(t("cohorts.messages.nameRequired"));
            return;
        }

        try {
            setSaving(true);
            await kyInstance.post("cohorts", {
                json: {
                    name: name.trim(),
                    programId: programId || null,
                    startDate: startDate || null,
                    endDate: endDate || null,
                },
            });
            navigate("/cohorts");
        } catch (e: any) {
            setError(e?.message ?? t("cohorts.messages.failedToCreate"));
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="w-full max-w-3xl space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>{t("cohorts.titles.create")}</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={onSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label>{t("cohorts.fields.name")}</Label>
                            <Input
                                value={name}
                                onChange={(event) => setName(event.target.value)}
                                placeholder={t("cohorts.placeholders.name")}
                                disabled={saving}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>{t("common.program")}</Label>
                            <select
                                className="h-9 w-full rounded-md border bg-background px-3"
                                value={programId}
                                onChange={(event) => setProgramId(event.target.value)}
                                disabled={saving}
                            >
                                <option value="">{t("cohorts.placeholders.noProgram")}</option>
                                {programs.map((program) => (
                                    <option key={program.id} value={program.id}>
                                        {program.name ?? t("dashboard.report.unnamed.program")}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label>{t("cohorts.fields.startDate")}</Label>
                                <Input
                                    type="date"
                                    value={startDate}
                                    onChange={(event) => setStartDate(event.target.value)}
                                    disabled={saving}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>{t("cohorts.fields.endDate")}</Label>
                                <Input
                                    type="date"
                                    value={endDate}
                                    onChange={(event) => setEndDate(event.target.value)}
                                    disabled={saving}
                                />
                            </div>
                        </div>

                        {error ? <p className="text-sm text-destructive">{error}</p> : null}

                        <div className="flex gap-2">
                            <Button type="submit" disabled={saving}>
                                {saving ? t("common.saving") : t("buttons.create")}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate("/cohorts")}
                                disabled={saving}
                            >
                                {t("buttons.cancel")}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
