import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Download, FileText, FilterX } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { API_URL } from "@/providers/constants";
import { fetchWithAuth } from "@/providers/fetcher";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/components/refine-ui/language/language-provider";
import { cn } from "@/lib/utils";

type Branch = { id: string; name?: string | null };
type Program = { id: string; name?: string | null; branchId?: string | null };
type Cohort = { id: string; name?: string | null; programId?: string | null };
type Supervisor = { id: string; name?: string | null; email?: string | null };
type Student = { id: string; name?: string | null; email?: string | null };

type ReportFilters = {
    branchId: string;
    programId: string;
    cohortId: string;
    supervisorId: string;
    studentId: string;
    startDate: string;
    endDate: string;
};

function getFilenameFromDisposition(header: string | null) {
    if (!header) return null;
    const match = header.match(/filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i);
    const rawName = match?.[1] ?? match?.[2];
    return rawName ? decodeURIComponent(rawName) : null;
}

function normalizeArray<T>(value: any): T[] {
    if (Array.isArray(value)) return value as T[];
    if (Array.isArray(value?.data)) return value.data as T[];
    return [];
}

function buildSelectedSummary(params: {
    filters: ReportFilters;
    branches: Branch[];
    programs: Program[];
    cohorts: Cohort[];
    supervisors: Supervisor[];
    students: Student[];
    t: (key: string, options?: Record<string, string>) => string;
}) {
    const { filters, branches, programs, cohorts, supervisors, students, t } = params;
    const selected: string[] = [];

    const branch = branches.find((item) => item.id === filters.branchId);
    const program = programs.find((item) => item.id === filters.programId);
    const cohort = cohorts.find((item) => item.id === filters.cohortId);
    const supervisor = supervisors.find((item) => item.id === filters.supervisorId);
    const student = students.find((item) => item.id === filters.studentId);

    if (branch?.name) selected.push(t("dashboard.report.summary.branch", { value: branch.name }));
    if (program?.name) selected.push(t("dashboard.report.summary.program", { value: program.name }));
    if (cohort?.name) selected.push(t("dashboard.report.summary.cohort", { value: cohort.name }));
    if (supervisor?.name || supervisor?.email) selected.push(t("dashboard.report.summary.supervisor", { value: supervisor.name ?? supervisor.email ?? "" }));
    if (student?.name || student?.email) selected.push(t("dashboard.report.summary.student", { value: student.name ?? student.email ?? "" }));
    if (filters.startDate) selected.push(t("dashboard.report.summary.startDate", { value: filters.startDate }));
    if (filters.endDate) selected.push(t("dashboard.report.summary.endDate", { value: filters.endDate }));

    return selected;
}

export function ReportPreviewCard({ title, description }: { title: string; description: string }) {
    const { t } = useTranslation();
    const { dir, language } = useLanguage();
    const [isDownloading, setIsDownloading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loadingOptions, setLoadingOptions] = useState(true);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [programs, setPrograms] = useState<Program[]>([]);
    const [cohorts, setCohorts] = useState<Cohort[]>([]);
    const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [filters, setFilters] = useState<ReportFilters>({ branchId: "", programId: "", cohortId: "", supervisorId: "", studentId: "", startDate: "", endDate: "" });

    useEffect(() => {
        let active = true;

        async function loadOptions() {
            try {
                setLoadingOptions(true);
                setError(null);

                const [branchesRes, programsRes, cohortsRes, supervisorsRes, studentsRes] = await Promise.all([
                    fetchWithAuth(`${API_URL}/branches`),
                    fetchWithAuth(`${API_URL}/programs`),
                    fetchWithAuth(`${API_URL}/cohorts`),
                    fetchWithAuth(`${API_URL}/supervisors?_start=0&_end=500`),
                    fetchWithAuth(`${API_URL}/students?_start=0&_end=500`),
                ]);

                if (!branchesRes.ok || !programsRes.ok || !cohortsRes.ok || !supervisorsRes.ok || !studentsRes.ok) {
                    throw new Error(t("dashboard.report.errors.loadFilters"));
                }

                const [branchesJson, programsJson, cohortsJson, supervisorsJson, studentsJson] = await Promise.all([
                    branchesRes.json(),
                    programsRes.json(),
                    cohortsRes.json(),
                    supervisorsRes.json(),
                    studentsRes.json(),
                ]);

                if (!active) return;
                setBranches(normalizeArray<Branch>(branchesJson));
                setPrograms(normalizeArray<Program>(programsJson));
                setCohorts(normalizeArray<Cohort>(cohortsJson));
                setSupervisors(normalizeArray<Supervisor>(supervisorsJson));
                setStudents(normalizeArray<Student>(studentsJson));
            } catch (e: any) {
                if (!active) return;
                setError(e?.message ?? t("dashboard.report.errors.loadFilters"));
            } finally {
                if (active) setLoadingOptions(false);
            }
        }

        void loadOptions();
        return () => {
            active = false;
        };
    }, [t]);

    const visiblePrograms = useMemo(() => (filters.branchId ? programs.filter((item) => item.branchId === filters.branchId) : programs), [programs, filters.branchId]);
    const visibleCohorts = useMemo(() => (filters.programId ? cohorts.filter((item) => item.programId === filters.programId) : cohorts), [cohorts, filters.programId]);

    useEffect(() => {
        if (!filters.programId) return;
        if (!visiblePrograms.some((item) => item.id === filters.programId)) {
            setFilters((prev) => ({ ...prev, programId: "", cohortId: "" }));
        }
    }, [visiblePrograms, filters.programId]);

    useEffect(() => {
        if (!filters.cohortId) return;
        if (!visibleCohorts.some((item) => item.id === filters.cohortId)) {
            setFilters((prev) => ({ ...prev, cohortId: "" }));
        }
    }, [visibleCohorts, filters.cohortId]);

    const selectedSummary = useMemo(() => buildSelectedSummary({ filters, branches, programs, cohorts, supervisors, students, t }), [filters, branches, programs, cohorts, supervisors, students, t]);

    function updateFilter<K extends keyof ReportFilters>(key: K, value: ReportFilters[K]) {
        setFilters((prev) => ({ ...prev, [key]: value }));
    }

    function clearFilters() {
        setFilters({ branchId: "", programId: "", cohortId: "", supervisorId: "", studentId: "", startDate: "", endDate: "" });
        setError(null);
    }

    function buildReportUrl() {
        const url = new URL(`${API_URL}/reports/summary.pdf`);
        if (filters.branchId) url.searchParams.set("branchId", filters.branchId);
        if (filters.programId) url.searchParams.set("programId", filters.programId);
        if (filters.cohortId) url.searchParams.set("cohortId", filters.cohortId);
        if (filters.supervisorId) url.searchParams.set("supervisorId", filters.supervisorId);
        if (filters.studentId) url.searchParams.set("studentId", filters.studentId);
        if (filters.startDate) url.searchParams.set("startDate", filters.startDate);
        if (filters.endDate) url.searchParams.set("endDate", filters.endDate);
        url.searchParams.set("lang", language);
        return url.toString();
    }

    async function handleDownload() {
        try {
            if (filters.startDate && filters.endDate && filters.startDate > filters.endDate) {
                throw new Error(t("dashboard.report.errors.invalidDateRange"));
            }

            setIsDownloading(true);
            setError(null);
            const response = await fetchWithAuth(buildReportUrl());
            if (!response.ok) throw new Error(t("dashboard.report.errors.download"));

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            const filename = getFilenameFromDisposition(response.headers.get("content-disposition")) ?? "management-report.pdf";
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (e: any) {
            setError(e?.message ?? t("dashboard.report.errors.download"));
        } finally {
            setIsDownloading(false);
        }
    }

    const unnamedBranch = t("dashboard.report.unnamed.branch");
    const unnamedProgram = t("dashboard.report.unnamed.program");
    const unnamedCohort = t("dashboard.report.unnamed.cohort");
    const unnamedSupervisor = t("dashboard.report.unnamed.supervisor");
    const unnamedStudent = t("dashboard.report.unnamed.student");

    return (
        <Card className="overflow-hidden shadow-xl">
            <CardHeader className="border-b">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className={dir === "rtl" ? "text-right" : "text-left"}>
                        <CardTitle className="text-2xl font-bold">{title}</CardTitle>
                        <p className="mt-2 max-w-2xl text-sm">{description}</p>
                    </div>
                    <Badge className="bg-primary text-primary-foreground hover:bg-primary">{t("dashboard.report.exportBadge")}</Badge>
                </div>
            </CardHeader>

            <CardContent className="space-y-6 bg-muted/40 p-6">
                <div className="rounded-[28px] border-2 border-primary/20 bg-accent/40 p-5 shadow-sm">
                    <div className={cn("text-sm font-semibold text-foreground", dir === "rtl" ? "text-right" : "text-left")}>{t("dashboard.report.currentFilters")}</div>
                    {selectedSummary.length > 0 ? (
                        <div className={cn("mt-3 flex flex-wrap gap-2", dir === "rtl" && "justify-end")}>
                            {selectedSummary.map((item) => (
                                <Badge key={item} variant="outline" className="border-primary/30 bg-card text-foreground">{item}</Badge>
                            ))}
                        </div>
                    ) : (
                        <p className={cn("mt-2 text-sm text-accent-foreground", dir === "rtl" ? "text-right" : "text-left")}>{t("dashboard.report.noFilters")}</p>
                    )}
                </div>

                <div className="rounded-[28px] border bg-card p-6 shadow-lg">
                    <div className="mb-5 flex items-start gap-4">
                        <div className="rounded-2xl bg-primary/10 p-3 text-primary"><FileText className="h-6 w-6" /></div>
                        <div className={cn("space-y-2", dir === "rtl" ? "text-right" : "text-left")}>
                            <div className="text-lg font-semibold text-foreground">{t("dashboard.report.chooseFilters")}</div>
                            <p className="max-w-3xl text-sm leading-6 text-muted-foreground">{t("dashboard.report.filtersDescription")}</p>
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        <div className={cn("space-y-2", dir === "rtl" && "text-right")}><Label>{t("dashboard.report.fields.branch")}</Label><Select value={filters.branchId || "all"} onValueChange={(value) => setFilters((prev) => ({ ...prev, branchId: value === "all" ? "" : value, programId: "", cohortId: "" }))} disabled={loadingOptions}><SelectTrigger className={dir === "rtl" ? "text-right" : undefined}><SelectValue placeholder={t("dashboard.report.placeholders.allBranches")} /></SelectTrigger><SelectContent><SelectItem value="all">{t("dashboard.report.placeholders.allBranches")}</SelectItem>{branches.map((item) => <SelectItem key={item.id} value={item.id}>{item.name ?? unnamedBranch}</SelectItem>)}</SelectContent></Select></div>
                        <div className={cn("space-y-2", dir === "rtl" && "text-right")}><Label>{t("dashboard.report.fields.program")}</Label><Select value={filters.programId || "all"} onValueChange={(value) => setFilters((prev) => ({ ...prev, programId: value === "all" ? "" : value, cohortId: "" }))} disabled={loadingOptions}><SelectTrigger className={dir === "rtl" ? "text-right" : undefined}><SelectValue placeholder={t("dashboard.report.placeholders.allPrograms")} /></SelectTrigger><SelectContent><SelectItem value="all">{t("dashboard.report.placeholders.allPrograms")}</SelectItem>{visiblePrograms.map((item) => <SelectItem key={item.id} value={item.id}>{item.name ?? unnamedProgram}</SelectItem>)}</SelectContent></Select></div>
                        <div className={cn("space-y-2", dir === "rtl" && "text-right")}><Label>{t("dashboard.report.fields.cohort")}</Label><Select value={filters.cohortId || "all"} onValueChange={(value) => updateFilter("cohortId", value === "all" ? "" : value)} disabled={loadingOptions}><SelectTrigger className={dir === "rtl" ? "text-right" : undefined}><SelectValue placeholder={t("dashboard.report.placeholders.allCohorts")} /></SelectTrigger><SelectContent><SelectItem value="all">{t("dashboard.report.placeholders.allCohorts")}</SelectItem>{visibleCohorts.map((item) => <SelectItem key={item.id} value={item.id}>{item.name ?? unnamedCohort}</SelectItem>)}</SelectContent></Select></div>
                        <div className={cn("space-y-2", dir === "rtl" && "text-right")}><Label>{t("dashboard.report.fields.supervisor")}</Label><Select value={filters.supervisorId || "all"} onValueChange={(value) => updateFilter("supervisorId", value === "all" ? "" : value)} disabled={loadingOptions}><SelectTrigger className={dir === "rtl" ? "text-right" : undefined}><SelectValue placeholder={t("dashboard.report.placeholders.allSupervisors")} /></SelectTrigger><SelectContent><SelectItem value="all">{t("dashboard.report.placeholders.allSupervisors")}</SelectItem>{supervisors.map((item) => <SelectItem key={item.id} value={item.id}>{item.name ?? item.email ?? unnamedSupervisor}</SelectItem>)}</SelectContent></Select></div>
                        <div className={cn("space-y-2", dir === "rtl" && "text-right")}><Label>{t("dashboard.report.fields.student")}</Label><Select value={filters.studentId || "all"} onValueChange={(value) => updateFilter("studentId", value === "all" ? "" : value)} disabled={loadingOptions}><SelectTrigger className={dir === "rtl" ? "text-right" : undefined}><SelectValue placeholder={t("dashboard.report.placeholders.allStudents")} /></SelectTrigger><SelectContent><SelectItem value="all">{t("dashboard.report.placeholders.allStudents")}</SelectItem>{students.map((item) => <SelectItem key={item.id} value={item.id}>{item.name ?? item.email ?? unnamedStudent}</SelectItem>)}</SelectContent></Select></div>
                        <div className={cn("space-y-2", dir === "rtl" && "text-right")}><Label>{t("dashboard.report.fields.startDate")}</Label><div className="relative"><CalendarDays className={cn("pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground", dir === "rtl" ? "right-3" : "left-3")} /><Input type="date" value={filters.startDate} onChange={(e) => updateFilter("startDate", e.target.value)} className={cn(dir === "rtl" ? "pr-10 text-right" : "pl-10", "bg-background")} /></div></div>
                        <div className={cn("space-y-2", dir === "rtl" && "text-right")}><Label>{t("dashboard.report.fields.endDate")}</Label><div className="relative"><CalendarDays className={cn("pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground", dir === "rtl" ? "right-3" : "left-3")} /><Input type="date" value={filters.endDate} onChange={(e) => updateFilter("endDate", e.target.value)} className={cn(dir === "rtl" ? "pr-10 text-right" : "pl-10", "bg-background")} /></div></div>
                    </div>

                    <div className={cn("mt-5 flex flex-wrap items-center gap-3", dir === "rtl" && "justify-start")}>
                        <Button type="button" onClick={handleDownload} disabled={isDownloading || loadingOptions} className="gap-2"><Download className="h-4 w-4" />{isDownloading ? t("dashboard.report.downloading") : t("dashboard.report.downloadPdf")}</Button>
                        <Button type="button" variant="outline" onClick={clearFilters} disabled={isDownloading} className="gap-2"><FilterX className="h-4 w-4" />{t("dashboard.report.clearFilters")}</Button>
                    </div>

                    {loadingOptions ? <p className={cn("mt-4 text-sm text-muted-foreground", dir === "rtl" ? "text-right" : "text-left")}>{t("dashboard.report.loading")}</p> : null}
                    {error ? <p className={cn("mt-4 text-sm text-destructive", dir === "rtl" ? "text-right" : "text-left")}>{error}</p> : null}
                </div>
            </CardContent>
        </Card>
    );
}
