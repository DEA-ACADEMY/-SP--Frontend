import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { kyInstance } from "@/providers/data";
import { authProvider } from "@/providers/auth";
import type { Role } from "@/lib/rbac";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/components/refine-ui/language/language-provider";
import { cn } from "@/lib/utils";

type Branch = {
    id: string;
    name?: string | null;
    createdAt?: string | null;
};

type Program = {
    id: string;
    name?: string | null;
    branchId: string;
    createdAt?: string | null;
};

type Cohort = {
    id: string;
    name?: string | null;
    programId: string;
};

type Student = {
    id: string;
    name?: string | null;
    email?: string | null;
    branchId?: string | null;
    programId?: string | null;
    cohortId?: string | null;
};

export default function BranchShow() {
    const { t } = useTranslation();
    const { dir } = useLanguage();
    const { id } = useParams();

    const [item, setItem] = useState<Branch | null>(null);
    const [role, setRole] = useState<Role | null>(null);
    const [programs, setPrograms] = useState<Program[]>([]);
    const [cohorts, setCohorts] = useState<Cohort[]>([]);
    const [students, setStudents] = useState<Student[]>([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [newProgramName, setNewProgramName] = useState("");
    const [savingProgram, setSavingProgram] = useState(false);

    const [editingProgramId, setEditingProgramId] = useState<string | null>(null);
    const [editingProgramName, setEditingProgramName] = useState("");

    useEffect(() => {
        let cancelled = false;

        async function run() {
            try {
                setLoading(true);
                setError(null);

                const nextRole = (await authProvider.getPermissions?.()) as Role | null;

                const [branchJson, programsJson, cohortsJson, studentsJson] = await Promise.all([
                    kyInstance.get(`branches/${id}`).json<Branch>(),
                    kyInstance.get("programs", { searchParams: { _start: "0", _end: "1000" } }).json<any>(),
                    kyInstance.get("cohorts", { searchParams: { _start: "0", _end: "1000" } }).json<any>(),
                    kyInstance.get("students", { searchParams: { _start: "0", _end: "1000" } }).json<any>(),
                ]);

                const nextPrograms = Array.isArray(programsJson)
                    ? programsJson
                    : programsJson?.data ?? [];

                const nextCohorts = Array.isArray(cohortsJson)
                    ? cohortsJson
                    : cohortsJson?.data ?? [];
                const nextStudents = Array.isArray(studentsJson)
                    ? studentsJson
                    : studentsJson?.data ?? [];

                if (!cancelled) {
                    setRole(nextRole ?? null);
                    setItem(branchJson);
                    setPrograms(nextPrograms);
                    setCohorts(nextCohorts);
                    setStudents(nextStudents);
                }
            } catch (e: any) {
                if (!cancelled) {
                    setError(e?.message ?? t("branches.messages.failedToLoad"));
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        if (id) {
            run();
        }

        return () => {
            cancelled = true;
        };
    }, [id]);

    const canManage = role === "management";

    const branchPrograms = useMemo(() => {
        return programs.filter((program) => program.branchId === id);
    }, [programs, id]);

    const cohortCountByProgramId = useMemo(() => {
        const map = new Map<string, number>();

        for (const cohort of cohorts) {
            map.set(cohort.programId, (map.get(cohort.programId) ?? 0) + 1);
        }

        return map;
    }, [cohorts]);

    const programNameById = useMemo(() => {
        return new Map(programs.map((program) => [program.id, program.name ?? t("common.untitled")]));
    }, [programs, t]);

    const cohortNameById = useMemo(() => {
        return new Map(cohorts.map((cohort) => [cohort.id, cohort.name ?? t("common.untitled")]));
    }, [cohorts, t]);

    const branchStudents = useMemo(() => {
        return students.filter((student) => student.branchId === id);
    }, [students, id]);

    const formattedCreatedAt = useMemo(() => {
        if (!item?.createdAt) return t("common.notAvailable");
        const date = new Date(item.createdAt);
        if (Number.isNaN(date.getTime())) return item.createdAt;

        return new Intl.DateTimeFormat(dir === "rtl" ? "ar" : "en", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
        }).format(date);
    }, [item?.createdAt, dir, t]);

    async function reloadPrograms() {
        const programsJson = await kyInstance.get("programs").json<any>();
        const data = Array.isArray(programsJson) ? programsJson : programsJson?.data ?? [];
        setPrograms(data);
    }

    async function createProgram(e: React.FormEvent) {
        e.preventDefault();
        setError(null);

        if (!id) return;

        if (!newProgramName.trim()) {
            setError(t("branches.messages.programNameRequired"));
            return;
        }

        try {
            setSavingProgram(true);

            await kyInstance.post("programs", {
                json: {
                    name: newProgramName.trim(),
                    branchId: id,
                },
            });

            setNewProgramName("");
            await reloadPrograms();
        } catch (e: any) {
            setError(e?.message ?? t("branches.messages.failedToCreateProgram"));
        } finally {
            setSavingProgram(false);
        }
    }

    async function saveProgram(programId: string) {
        setError(null);

        if (!editingProgramName.trim()) {
            setError(t("branches.messages.programNameRequired"));
            return;
        }

        try {
            setSavingProgram(true);

            await kyInstance.patch(`programs/${programId}`, {
                json: {
                    name: editingProgramName.trim(),
                },
            });

            setEditingProgramId(null);
            setEditingProgramName("");
            await reloadPrograms();
        } catch (e: any) {
            setError(e?.message ?? t("branches.messages.failedToUpdateProgram"));
        } finally {
            setSavingProgram(false);
        }
    }

    if (loading) {
        return <div className="text-muted-foreground">{t("common.loading")}</div>;
    }

    if (error && !item) {
        return <div className="text-destructive">{error}</div>;
    }

    if (!item) {
        return <div className="text-muted-foreground">{t("branches.messages.notFound")}</div>;
    }

    return (
        <div className="w-full max-w-5xl space-y-6 p-4 md:p-6">
            <div className={cn("flex items-center justify-between gap-3", dir === "rtl" && "flex-row-reverse")}>
                <div className={dir === "rtl" ? "text-right" : "text-left"}>
                    <h1 className="text-2xl font-semibold">{t("branches.titles.show")}</h1>
                    <p className="text-sm text-muted-foreground">
                        {t("branches.messages.manageDescription")}
                    </p>
                </div>

                <Link
                    to="/branches"
                    className="px-3 py-2 rounded-md border hover:bg-muted"
                >
                    {t("branches.messages.backToBranches")}
                </Link>
            </div>

            <div className={cn("border rounded-lg p-6 space-y-5", dir === "rtl" ? "text-right" : "text-left")}>
                <div>
                    <div className="text-sm text-muted-foreground">{t("common.name")}</div>
                    <div className="font-medium">{item.name ?? t("common.notAvailable")}</div>
                </div>

                <div>
                    <div className="text-sm text-muted-foreground">{t("common.createdAt")}</div>
                    <div className="font-medium">{formattedCreatedAt}</div>
                </div>
            </div>

            <div className={cn("border rounded-lg p-6 space-y-4", dir === "rtl" ? "text-right" : "text-left")}>
                <div>
                    <h2 className="text-lg font-semibold">{t("branches.students.title")}</h2>
                    <p className="text-sm text-muted-foreground">
                        {t("branches.students.description")}
                    </p>
                </div>

                {branchStudents.length === 0 ? (
                    <div className="text-sm text-muted-foreground">
                        {t("branches.students.empty")}
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                        {branchStudents.map((student) => (
                            <div key={student.id} className="rounded-lg border p-5">
                                <div className="font-medium">
                                    {student.name ?? student.email ?? t("dashboard.report.unnamed.student")}
                                </div>
                                {student.email ? (
                                    <div className="text-sm text-muted-foreground">{student.email}</div>
                                ) : null}
                                <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                                    <div>
                                        <div className="text-muted-foreground">{t("common.program")}</div>
                                        <div>
                                            {student.programId
                                                ? programNameById.get(student.programId) ?? t("common.notAvailable")
                                                : t("common.notAvailable")}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-muted-foreground">{t("common.cohort")}</div>
                                        <div>
                                            {student.cohortId
                                                ? cohortNameById.get(student.cohortId) ?? t("common.notAvailable")
                                                : t("common.notAvailable")}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className={cn("border rounded-lg p-6 space-y-4", dir === "rtl" ? "text-right" : "text-left")}>
                <div className={cn("flex items-center justify-between gap-3", dir === "rtl" && "flex-row-reverse")}>
                    <div>
                        <h2 className="text-lg font-semibold">{t("programs.titles.list")}</h2>
                        <p className="text-sm text-muted-foreground">
                            {t("branches.messages.programsDescription")}
                        </p>
                    </div>
                </div>

                {canManage ? (
                    <form onSubmit={createProgram} className={cn("flex gap-2", dir === "rtl" && "flex-row-reverse")}>
                        <input
                            className="flex-1 border rounded-md px-3 py-2"
                            value={newProgramName}
                            onChange={(e) => setNewProgramName(e.target.value)}
                            placeholder={t("branches.placeholders.program")}
                        />
                        <button
                            type="submit"
                            disabled={savingProgram}
                            className="px-4 py-2 rounded-md border hover:bg-muted disabled:opacity-60"
                        >
                            {savingProgram ? t("common.saving") : t("branches.messages.addProgram")}
                        </button>
                    </form>
                ) : null}

                {error ? <p className="text-sm text-destructive">{error}</p> : null}

                {branchPrograms.length === 0 ? (
                    <div className="text-sm text-muted-foreground">
                        {t("branches.messages.noProgramsInBranch")}
                    </div>
                ) : (
                    <div className="space-y-3">
                        {branchPrograms.map((program) => {
                            const cohortCount = cohortCountByProgramId.get(program.id) ?? 0;
                            const isEditing = editingProgramId === program.id;

                            return (
                                <div
                                    key={program.id}
                                    className="border rounded-lg p-4 flex flex-col gap-3"
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <div className="font-medium">
                                                {program.name ?? t("common.untitled")}
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                {t("branches.messages.cohortCount", { count: cohortCount })}
                                            </div>
                                        </div>

                                        {canManage ? (
                                            <button
                                                type="button"
                                                className="px-3 py-1.5 rounded-md border hover:bg-muted text-sm"
                                                onClick={() => {
                                                    setEditingProgramId(program.id);
                                                    setEditingProgramName(program.name ?? "");
                                                }}
                                            >
                                                {t("buttons.edit")}
                                            </button>
                                        ) : null}
                                    </div>

                                    {isEditing ? (
                                        <div className="flex gap-2">
                                            <input
                                                className="flex-1 border rounded-md px-3 py-2"
                                                value={editingProgramName}
                                                onChange={(e) =>
                                                    setEditingProgramName(e.target.value)
                                                }
                                            />
                                            <button
                                                type="button"
                                                onClick={() => saveProgram(program.id)}
                                                disabled={savingProgram}
                                                className="px-4 py-2 rounded-md border hover:bg-muted disabled:opacity-60"
                                            >
                                                {t("common.save")}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setEditingProgramId(null);
                                                    setEditingProgramName("");
                                                }}
                                                className="px-4 py-2 rounded-md border hover:bg-muted"
                                            >
                                                {t("buttons.cancel")}
                                            </button>
                                        </div>
                                    ) : null}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
