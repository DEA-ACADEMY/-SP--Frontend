import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { kyInstance } from "@/providers/data";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/components/refine-ui/language/language-provider";
import { cn } from "@/lib/utils";

type Branch = {
    id: string;
    name?: string | null;
};

type Cohort = {
    id: string;
    name?: string | null;
    programId?: string | null;
};

type Student = {
    id: string;
    name?: string | null;
    email?: string | null;
    branchId?: string | null;
    cohortId?: string | null;
};

type Enrollment = {
    studentId: string;
    branchId?: string | null;
    cohortId?: string | null;
};

type CohortGroup = {
    key: string;
    name: string;
    cohortIds: string[];
};

function asArray<T>(value: unknown): T[] {
    return Array.isArray(value) ? value : (value as any)?.data ?? [];
}

function normalizeCohortName(name?: string | null) {
    return (name ?? "").trim().toLowerCase() || "untitled";
}

function getCohortNumber(name: string) {
    const match = name.match(/\d+/);
    return match ? Number(match[0]) : Number.POSITIVE_INFINITY;
}

function compareCohortGroups(a: CohortGroup, b: CohortGroup) {
    const numberA = getCohortNumber(a.name);
    const numberB = getCohortNumber(b.name);

    if (numberA !== numberB) return numberA - numberB;
    return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" });
}

export default function CohortsList() {
    const { t } = useTranslation();
    const { dir } = useLanguage();

    const [branches, setBranches] = useState<Branch[]>([]);
    const [cohorts, setCohorts] = useState<Cohort[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    async function load() {
        const [branchesJson, cohortsJson, studentsJson, enrollmentsJson] = await Promise.all([
            kyInstance.get("branches", { searchParams: { _start: "0", _end: "1000" } }).json(),
            kyInstance.get("cohorts", { searchParams: { _start: "0", _end: "1000" } }).json(),
            kyInstance.get("students", { searchParams: { _start: "0", _end: "1000" } }).json(),
            kyInstance.get("enrollments", { searchParams: { _start: "0", _end: "1000" } }).json(),
        ]);

        setBranches(asArray<Branch>(branchesJson));
        setCohorts(asArray<Cohort>(cohortsJson));
        setStudents(asArray<Student>(studentsJson));
        setEnrollments(asArray<Enrollment>(enrollmentsJson));
    }

    useEffect(() => {
        let cancelled = false;

        async function run() {
            try {
                setLoading(true);
                setError(null);
                await load();
            } catch (e: any) {
                if (!cancelled) setError(e?.message ?? t("cohorts.messages.failedToLoad"));
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        void run();

        return () => {
            cancelled = true;
        };
    }, [t]);

    const branchName = useMemo(
        () => new Map(branches.map((branch) => [branch.id, branch.name ?? t("dashboard.report.unnamed.branch")])),
        [branches, t],
    );

    const cohortGroups = useMemo(() => {
        const map = new Map<string, CohortGroup>();

        for (const cohort of cohorts) {
            const name = cohort.name ?? t("dashboard.report.unnamed.cohort");
            const key = normalizeCohortName(name);
            const existing = map.get(key);

            if (existing) {
                existing.cohortIds.push(cohort.id);
            } else {
                map.set(key, {
                    key,
                    name,
                    cohortIds: [cohort.id],
                });
            }
        }

        return Array.from(map.values()).sort(compareCohortGroups);
    }, [cohorts, t]);

    const cohortGroupKeyById = useMemo(() => {
        const map = new Map<string, string>();

        for (const group of cohortGroups) {
            for (const cohortId of group.cohortIds) {
                map.set(cohortId, group.key);
            }
        }

        return map;
    }, [cohortGroups]);

    const studentsByCohortKey = useMemo(() => {
        const studentById = new Map(students.map((student) => [student.id, student]));
        const map = new Map<string, Student[]>();
        const seen = new Set<string>();

        for (const enrollment of enrollments) {
            if (!enrollment.cohortId) continue;
            const cohortKey = cohortGroupKeyById.get(enrollment.cohortId);
            if (!cohortKey) continue;
            const student = studentById.get(enrollment.studentId);
            if (!student) continue;

            const key = `${cohortKey}:${student.id}`;
            if (seen.has(key)) continue;
            seen.add(key);
            map.set(cohortKey, [...(map.get(cohortKey) ?? []), student]);
        }

        for (const student of students) {
            const cohortKey = student.cohortId ? cohortGroupKeyById.get(student.cohortId) : null;
            if (!cohortKey) continue;
            const key = `${cohortKey}:${student.id}`;
            if (seen.has(key)) continue;
            seen.add(key);
            map.set(cohortKey, [...(map.get(cohortKey) ?? []), student]);
        }

        return map;
    }, [students, enrollments, cohortGroupKeyById]);

    return (
        <div className={cn("w-full max-w-6xl space-y-6 p-4 md:p-6", dir === "rtl" ? "text-right" : "text-left")}>
            <div className={dir === "rtl" ? "text-right" : "text-left"}>
                <h1 className="text-2xl font-semibold">{t("cohorts.titles.list")}</h1>
                <p className="text-sm text-muted-foreground">{t("cohorts.messages.description")}</p>
            </div>

            {loading ? <div className="text-sm text-muted-foreground">{t("common.loading")}</div> : null}
            {error ? <div className="text-sm text-destructive">{error}</div> : null}

            {!loading && !error && cohorts.length === 0 ? (
                <div className="text-sm text-muted-foreground">{t("cohorts.messages.noCohorts")}</div>
            ) : null}

            <div className="space-y-5">
                {cohortGroups.map((cohort) => {
                    const cohortStudents = studentsByCohortKey.get(cohort.key) ?? [];

                    return (
                        <Card key={cohort.key} className="overflow-hidden">
                            <CardHeader>
                                <div className={cn("flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between", dir === "rtl" && "sm:flex-row-reverse")}>
                                    <div className={dir === "rtl" ? "text-right" : "text-left"}>
                                        <CardTitle>{cohort.name}</CardTitle>
                                    </div>
                                    <div className="rounded-full border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                                        {t("cohorts.messages.studentCount", { count: cohortStudents.length })}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {cohortStudents.length === 0 ? (
                                    <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                                        {t("cohorts.messages.noStudents")}
                                    </div>
                                ) : (
                                    <div className="grid gap-3 md:grid-cols-2">
                                        {cohortStudents.map((student) => {
                                            const studentEnrollment = enrollments.find(
                                                (enrollment) =>
                                                    enrollment.studentId === student.id &&
                                                    enrollment.cohortId &&
                                                    cohort.cohortIds.includes(enrollment.cohortId),
                                            );
                                            const studentBranchId = student.branchId ?? studentEnrollment?.branchId ?? null;

                                            return (
                                                <div
                                                    key={student.id}
                                                    className={cn(
                                                        "flex items-center justify-between gap-3 rounded-lg border bg-background p-3",
                                                        dir === "rtl" && "flex-row-reverse",
                                                    )}
                                                >
                                                    <div className="min-w-0">
                                                        <div className="truncate font-medium">
                                                            {student.name ?? t("dashboard.report.unnamed.student")}
                                                        </div>
                                                        {student.email ? (
                                                            <div className="truncate text-sm text-muted-foreground">{student.email}</div>
                                                        ) : null}
                                                    </div>
                                                    <div className="shrink-0 rounded-full border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                                                        {studentBranchId ? branchName.get(studentBranchId) ?? t("common.notAvailable") : t("common.notAvailable")}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
