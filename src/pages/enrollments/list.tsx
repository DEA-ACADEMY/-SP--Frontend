import { FormEvent, useEffect, useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { authProvider } from "@/providers/auth";
import { kyInstance } from "@/providers/data";
import type { Role } from "@/lib/rbac";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/components/refine-ui/language/language-provider";
import { cn } from "@/lib/utils";
import { BookOpen, GitBranch, Layers3, UserPlus, UsersRound } from "lucide-react";
import { toast } from "sonner";

type EnrollmentAction = {
    title: string;
    description: string;
    href: string;
    icon: ReactNode;
    managementOnly?: boolean;
};

type Branch = {
    id: string;
    name?: string | null;
};

type Program = {
    id: string;
    name?: string | null;
    branchId: string;
};

type Cohort = {
    id: string;
    name?: string | null;
};

type Student = {
    id: string;
    name?: string | null;
    email?: string | null;
    branchId?: string | null;
    cohortId?: string | null;
};

type Enrollment = {
    id: string;
    studentId: string;
    branchId?: string | null;
    programId?: string | null;
    cohortId?: string | null;
};

function asArray<T>(value: unknown): T[] {
    return Array.isArray(value) ? value : (value as any)?.data ?? [];
}

function getCohortNumber(name: string) {
    const match = name.match(/\d+/);
    return match ? Number(match[0]) : Number.POSITIVE_INFINITY;
}

function getUniqueSortedCohorts(cohorts: Cohort[]) {
    const map = new Map<string, Cohort>();

    for (const cohort of cohorts) {
        const name = (cohort.name ?? "").trim();
        const key = name.toLowerCase() || cohort.id;
        if (!map.has(key)) map.set(key, cohort);
    }

    return Array.from(map.values()).sort((a, b) => {
        const nameA = a.name ?? "";
        const nameB = b.name ?? "";
        const numberA = getCohortNumber(nameA);
        const numberB = getCohortNumber(nameB);
        return numberA === numberB
            ? nameA.localeCompare(nameB, undefined, { numeric: true, sensitivity: "base" })
            : numberA - numberB;
    });
}

export default function EnrollmentsList() {
    const { t } = useTranslation();
    const { dir } = useLanguage();

    const [role, setRole] = useState<Role | null>(null);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [programs, setPrograms] = useState<Program[]>([]);
    const [cohorts, setCohorts] = useState<Cohort[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [selectedStudentId, setSelectedStudentId] = useState("");
    const [selectedProgramId, setSelectedProgramId] = useState("");
    const [selectedCohortId, setSelectedCohortId] = useState("");
    const [loading, setLoading] = useState(true);
    const [savingAssignment, setSavingAssignment] = useState(false);
    const [savingCohortAssignment, setSavingCohortAssignment] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function loadData() {
        const [branchesJson, programsJson, cohortsJson, studentsJson, enrollmentsJson] = await Promise.all([
            kyInstance.get("branches", { searchParams: { _start: "0", _end: "1000" } }).json(),
            kyInstance.get("programs", { searchParams: { _start: "0", _end: "1000" } }).json(),
            kyInstance.get("cohorts", { searchParams: { _start: "0", _end: "1000" } }).json(),
            kyInstance.get("students", { searchParams: { _start: "0", _end: "1000" } }).json(),
            kyInstance.get("enrollments", { searchParams: { _start: "0", _end: "1000" } }).json(),
        ]);

        setBranches(asArray<Branch>(branchesJson));
        setPrograms(asArray<Program>(programsJson));
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

                const nextRole = (await authProvider.getPermissions?.()) as Role | null;
                await loadData();

                if (!cancelled) {
                    setRole(nextRole ?? null);
                }
            } catch (e: any) {
                if (!cancelled) {
                    setError(e?.message ?? t("enrollments.messages.failedToLoad"));
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        void run();

        return () => {
            cancelled = true;
        };
    }, [t]);

    const branchNameById = useMemo(
        () => new Map(branches.map((branch) => [branch.id, branch.name ?? t("dashboard.report.unnamed.branch")])),
        [branches, t],
    );

    const programNameById = useMemo(
        () => new Map(programs.map((program) => [program.id, program.name ?? t("dashboard.report.unnamed.program")])),
        [programs, t],
    );

    const cohortNameById = useMemo(
        () => new Map(cohorts.map((cohort) => [cohort.id, cohort.name ?? t("dashboard.report.unnamed.cohort")])),
        [cohorts, t],
    );

    const selectedStudent = useMemo(
        () => students.find((student) => student.id === selectedStudentId) ?? null,
        [students, selectedStudentId],
    );

    const selectedStudentBranchId = useMemo(() => {
        if (!selectedStudent) return "";
        return selectedStudent.branchId ?? enrollments.find((item) => item.studentId === selectedStudent.id)?.branchId ?? "";
    }, [selectedStudent, enrollments]);

    const selectedStudentCohortId = useMemo(() => {
        if (!selectedStudent) return "";
        return selectedStudent.cohortId ?? enrollments.find((item) => item.studentId === selectedStudent.id && item.cohortId)?.cohortId ?? "";
    }, [selectedStudent, enrollments]);

    const assignedProgramIds = useMemo(() => {
        if (!selectedStudentId) return new Set<string>();
        return new Set(
            enrollments
                .filter((enrollment) => enrollment.studentId === selectedStudentId && enrollment.programId)
                .map((enrollment) => enrollment.programId as string),
        );
    }, [selectedStudentId, enrollments]);

    const availablePrograms = useMemo(() => {
        if (!selectedStudentBranchId) return [];
        return programs
            .filter((program) => program.branchId === selectedStudentBranchId)
            .sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""));
    }, [programs, selectedStudentBranchId]);

    const assignablePrograms = useMemo(
        () => availablePrograms.filter((program) => !assignedProgramIds.has(program.id)),
        [availablePrograms, assignedProgramIds],
    );

    const sortedCohorts = useMemo(() => getUniqueSortedCohorts(cohorts), [cohorts]);

    useEffect(() => {
        setSelectedProgramId("");
        setSelectedCohortId("");
    }, [selectedStudentId]);

    async function submitProgramAssignment(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!selectedStudentId || !selectedProgramId) {
            toast.error(t("enrollments.messages.assignmentRequired"));
            return;
        }

        try {
            setSavingAssignment(true);
            const result = await kyInstance
                .post("enrollments/assign-program", {
                    json: {
                        studentId: selectedStudentId,
                        programId: selectedProgramId,
                    },
                })
                .json<any>();

            toast.success(
                result?.alreadyAssigned
                    ? t("enrollments.messages.programAlreadyAssigned")
                    : t("enrollments.messages.programAssigned"),
            );
            setSelectedProgramId("");
            await loadData();
        } catch (e: any) {
            toast.error(e?.message ?? t("enrollments.messages.failedToAssignProgram"));
        } finally {
            setSavingAssignment(false);
        }
    }

    async function submitCohortAssignment(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!selectedStudentId || !selectedCohortId) {
            toast.error(t("enrollments.messages.cohortAssignmentRequired"));
            return;
        }

        try {
            setSavingCohortAssignment(true);
            const result = await kyInstance
                .post("enrollments/assign-cohort", {
                    json: {
                        studentId: selectedStudentId,
                        cohortId: selectedCohortId,
                    },
                })
                .json<any>();

            toast.success(
                result?.alreadyAssigned
                    ? t("enrollments.messages.cohortAlreadyAssigned")
                    : t("enrollments.messages.cohortAssigned"),
            );
            setSelectedCohortId("");
            await loadData();
        } catch (e: any) {
            toast.error(e?.message ?? t("enrollments.messages.failedToAssignCohort"));
        } finally {
            setSavingCohortAssignment(false);
        }
    }

    const actions: EnrollmentAction[] = [
        {
            title: t("enrollments.actions.addStudent"),
            description: t("enrollments.messages.addStudentDescription"),
            href: "/students/create",
            icon: <UserPlus className="h-5 w-5" />,
        },
        {
            title: t("enrollments.actions.addProgram"),
            description: t("enrollments.messages.addProgramDescription"),
            href: "/programs/create",
            icon: <BookOpen className="h-5 w-5" />,
            managementOnly: true,
        },
        {
            title: t("enrollments.actions.manageBranches"),
            description: t("enrollments.messages.manageBranchesDescription"),
            href: "/branches",
            icon: <GitBranch className="h-5 w-5" />,
        },
    ].filter((action) => !action.managementOnly || role === "management");

    return (
        <div className={cn("w-full max-w-6xl space-y-6 p-4 md:p-6", dir === "rtl" ? "text-right" : "text-left")}>
            <div className={cn("flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between", dir === "rtl" && "sm:flex-row-reverse")}>
                <div className={dir === "rtl" ? "text-right" : "text-left"}>
                    <h1 className="text-2xl font-semibold">{t("enrollments.titles.list")}</h1>
                    <p className="text-sm text-muted-foreground">{t("enrollments.messages.description")}</p>
                </div>
            </div>

            {loading ? <div className="text-sm text-muted-foreground">{t("common.loading")}</div> : null}
            {error ? <div className="text-sm text-destructive">{error}</div> : null}

            {!loading && !error ? (
                <>
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {actions.map((action) => (
                            <Card key={action.href} className="overflow-hidden">
                                <CardHeader className={cn("flex flex-row items-start gap-3 space-y-0", dir === "rtl" && "flex-row-reverse")}>
                                    <div className="rounded-md border bg-muted/40 p-2 text-primary">
                                        {action.icon}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <CardTitle className="text-base">{action.title}</CardTitle>
                                        <p className="mt-1 text-sm text-muted-foreground">{action.description}</p>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <Button asChild variant="outline" className="w-full">
                                        <Link to={action.href}>{t("common.open")}</Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <Card className="overflow-hidden">
                        <CardHeader className={cn("flex flex-row items-start gap-3 space-y-0", dir === "rtl" && "flex-row-reverse")}>
                            <div className="rounded-md border bg-muted/40 p-2 text-primary">
                                <UsersRound className="h-5 w-5" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <CardTitle className="text-base">{t("enrollments.actions.assignProgram")}</CardTitle>
                                <p className="mt-1 text-sm text-muted-foreground">{t("enrollments.messages.assignProgramDescription")}</p>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <form className="grid gap-4 lg:grid-cols-[1fr_1fr_auto]" onSubmit={submitProgramAssignment}>
                                <div className="space-y-2">
                                    <Label>{t("enrollments.fields.student")}</Label>
                                    <Select value={selectedStudentId || undefined} onValueChange={setSelectedStudentId}>
                                        <SelectTrigger className="h-9 w-full">
                                            <SelectValue placeholder={t("enrollments.placeholders.selectStudent")} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {students.map((student) => (
                                                <SelectItem key={student.id} value={student.id}>
                                                    {student.name ?? student.email ?? t("dashboard.report.unnamed.student")}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>{t("enrollments.fields.program")}</Label>
                                    <Select
                                        value={selectedProgramId || undefined}
                                        onValueChange={setSelectedProgramId}
                                        disabled={!selectedStudentId || assignablePrograms.length === 0}
                                    >
                                        <SelectTrigger className="h-9 w-full">
                                            <SelectValue placeholder={t("enrollments.placeholders.selectProgram")} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {assignablePrograms.map((program) => (
                                                <SelectItem key={program.id} value={program.id}>
                                                    {program.name ?? t("dashboard.report.unnamed.program")}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex items-end">
                                    <Button type="submit" className="h-9 w-full gap-2" disabled={savingAssignment}>
                                        <UsersRound className="h-4 w-4" />
                                        {savingAssignment ? t("common.saving") : t("enrollments.actions.assignSelected")}
                                    </Button>
                                </div>
                            </form>

                            <div className={cn("mt-4 rounded-lg border bg-muted/20 p-4", dir === "rtl" ? "text-right" : "text-left")}>
                                {selectedStudent ? (
                                    <div className="space-y-3">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <Badge variant="outline">
                                                {t("common.branch")}: {selectedStudentBranchId ? branchNameById.get(selectedStudentBranchId) ?? t("common.notAvailable") : t("common.notAvailable")}
                                            </Badge>
                                            <Badge variant="secondary">
                                                {t("enrollments.fields.availablePrograms")}: {availablePrograms.length}
                                            </Badge>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="text-sm font-medium">{t("enrollments.fields.assignedPrograms")}</div>
                                            {assignedProgramIds.size ? (
                                                <div className={cn("flex flex-wrap gap-2", dir === "rtl" && "justify-end")}>
                                                    {Array.from(assignedProgramIds).map((programId) => (
                                                        <Badge key={programId} variant="outline">
                                                            {programNameById.get(programId) ?? t("dashboard.report.unnamed.program")}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-sm text-muted-foreground">{t("enrollments.messages.noAssignedPrograms")}</div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-sm text-muted-foreground">{t("enrollments.messages.selectStudentHint")}</div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="overflow-hidden">
                        <CardHeader className={cn("flex flex-row items-start gap-3 space-y-0", dir === "rtl" && "flex-row-reverse")}>
                            <div className="rounded-md border bg-muted/40 p-2 text-primary">
                                <Layers3 className="h-5 w-5" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <CardTitle className="text-base">{t("enrollments.actions.assignCohort")}</CardTitle>
                                <p className="mt-1 text-sm text-muted-foreground">{t("enrollments.messages.assignCohortDescription")}</p>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <form className="grid gap-4 lg:grid-cols-[1fr_1fr_auto]" onSubmit={submitCohortAssignment}>
                                <div className="space-y-2">
                                    <Label>{t("enrollments.fields.student")}</Label>
                                    <Select value={selectedStudentId || undefined} onValueChange={setSelectedStudentId}>
                                        <SelectTrigger className="h-9 w-full">
                                            <SelectValue placeholder={t("enrollments.placeholders.selectStudent")} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {students.map((student) => (
                                                <SelectItem key={student.id} value={student.id}>
                                                    {student.name ?? student.email ?? t("dashboard.report.unnamed.student")}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>{t("enrollments.fields.cohort")}</Label>
                                    <Select
                                        value={selectedCohortId || undefined}
                                        onValueChange={setSelectedCohortId}
                                        disabled={!selectedStudentId || sortedCohorts.length === 0}
                                    >
                                        <SelectTrigger className="h-9 w-full">
                                            <SelectValue placeholder={t("enrollments.placeholders.selectCohort")} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {sortedCohorts.map((cohort) => (
                                                <SelectItem key={cohort.id} value={cohort.id}>
                                                    {cohort.name ?? t("dashboard.report.unnamed.cohort")}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex items-end">
                                    <Button type="submit" className="h-9 w-full gap-2" disabled={savingCohortAssignment}>
                                        <Layers3 className="h-4 w-4" />
                                        {savingCohortAssignment ? t("common.saving") : t("enrollments.actions.assignCohortSelected")}
                                    </Button>
                                </div>
                            </form>

                            <div className={cn("mt-4 rounded-lg border bg-muted/20 p-4", dir === "rtl" ? "text-right" : "text-left")}>
                                {selectedStudent ? (
                                    <div className="flex flex-wrap items-center gap-2">
                                        <Badge variant="outline">
                                            {t("common.branch")}: {selectedStudentBranchId ? branchNameById.get(selectedStudentBranchId) ?? t("common.notAvailable") : t("common.notAvailable")}
                                        </Badge>
                                        <Badge variant="secondary">
                                            {t("enrollments.fields.currentCohort")}: {selectedStudentCohortId ? cohortNameById.get(selectedStudentCohortId) ?? t("common.notAvailable") : t("common.notAvailable")}
                                        </Badge>
                                    </div>
                                ) : (
                                    <div className="text-sm text-muted-foreground">{t("enrollments.messages.selectStudentForCohortHint")}</div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </>
            ) : null}
        </div>
    );
}
