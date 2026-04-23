import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { kyInstance } from "@/providers/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CloudinaryImageUpload } from "@/components/upload-widget.tsx";
import { useTranslation } from "react-i18next";
import { authProvider } from "@/providers/auth";
import type { Role } from "@/lib/rbac";
import {
    afterConditionalStudentExtraFields,
    beforeConditionalStudentExtraFields,
    conditionalStudentExtraGroups,
    emptyStudentExtraForm,
    orderedStudentExtraFields,
    type StudentExtraField,
    type StudentExtraFormState,
} from "./student-profile-fields";

type Branch = {
    id: string;
    name?: string | null;
};

type Cohort = {
    id: string;
    name?: string | null;
};

type Supervisor = {
    id: string;
    name?: string | null;
    email?: string | null;
};

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

export default function StudentCreatePage() {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const [branches, setBranches] = useState<Branch[]>([]);
    const [cohorts, setCohorts] = useState<Cohort[]>([]);
    const [supervisors, setSupervisors] = useState<Supervisor[]>([]);

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [avatarUrl, setAvatarUrl] = useState("");
    const [extraForm, setExtraForm] = useState<StudentExtraFormState>(emptyStudentExtraForm);
    const [role, setRole] = useState<Role | null>(null);

    const [branchId, setBranchId] = useState("");
    const [cohortId, setCohortId] = useState("");
    const [supervisorId, setSupervisorId] = useState("");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        let cancelled = false;

        (async () => {
            try {
                setLoading(true);
                setError(null);

                const nextRole = (await authProvider.getPermissions?.()) as Role | null;
                const requests: Promise<any>[] = [
                    kyInstance.get("branches", { searchParams: { _start: "0", _end: "1000" } }).json<any>(),
                    kyInstance.get("cohorts", { searchParams: { _start: "0", _end: "1000" } }).json<any>(),
                ];

                if (nextRole === "management") {
                    requests.push(kyInstance.get("supervisors", { searchParams: { _start: "0", _end: "1000" } }).json<any>());
                }

                const [branchesJson, cohortsJson, supervisorsJson] = await Promise.all(requests);

                const nextBranches = Array.isArray(branchesJson)
                    ? branchesJson
                    : branchesJson?.data ?? [];
                const nextCohorts = Array.isArray(cohortsJson)
                    ? cohortsJson
                    : cohortsJson?.data ?? [];
                const nextSupervisors = Array.isArray(supervisorsJson)
                    ? supervisorsJson
                    : supervisorsJson?.data ?? [];

                if (!cancelled) {
                    setRole(nextRole ?? null);
                    setBranches(nextBranches);
                    setCohorts(nextCohorts);
                    setSupervisors(nextSupervisors);
                }
            } catch (e: any) {
                if (!cancelled) {
                    setError(e?.message ?? t("students.messages.failedToLoadForm"));
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, []);

    function renderExtraField(field: StudentExtraField) {
        const options = field.optionsKey
            ? (t(`students.intake.options.${field.optionsKey}`, { returnObjects: true }) as string[])
            : [];

        return (
            <div key={field.name} className="space-y-2">
                <Label>{t(field.labelKey)}</Label>
                {field.optionsKey ? (
                    <select
                        className="h-9 w-full border rounded-md px-3 bg-background"
                        value={extraForm[field.name]}
                        onChange={(event) =>
                            setExtraForm((prev) => ({
                                ...prev,
                                [field.name]: event.target.value,
                            }))
                        }
                        aria-invalid={!!fieldErrors[field.name]}
                    >
                        <option value="">{t("students.intake.select")}</option>
                        {options.map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                ) : (
                    <Input
                        type={field.type ?? "text"}
                        value={extraForm[field.name]}
                        onChange={(event) =>
                            setExtraForm((prev) => ({
                                ...prev,
                                [field.name]: event.target.value,
                            }))
                        }
                        aria-invalid={!!fieldErrors[field.name]}
                    />
                )}
                {fieldErrors[field.name] ? <p className="text-xs text-destructive">{fieldErrors[field.name]}</p> : null}
            </div>
        );
    }

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setFieldErrors({});

        const nextFieldErrors: Record<string, string> = {};
        const requiredMessage = t("students.messages.fieldRequired");

        if (!firstName.trim()) nextFieldErrors.firstName = requiredMessage;
        if (!lastName.trim()) nextFieldErrors.lastName = requiredMessage;
        if (!email.trim()) nextFieldErrors.email = requiredMessage;
        if (!password.trim()) nextFieldErrors.password = requiredMessage;
        if (!confirmPassword.trim()) nextFieldErrors.confirmPassword = requiredMessage;
        if (!branchId) nextFieldErrors.branchId = requiredMessage;

        for (const field of orderedStudentExtraFields) {
            if (field.required && !extraForm[field.name].trim()) {
                nextFieldErrors[field.name] = requiredMessage;
            }
        }

        if (Object.keys(nextFieldErrors).length > 0) {
            setFieldErrors(nextFieldErrors);
            setError(t("students.messages.classificationRequired"));
            return;
        }

        if (password.length < 8) {
            setFieldErrors({ password: t("students.messages.passwordMin") });
            setError(t("students.messages.passwordMin"));
            return;
        }

        if (password !== confirmPassword) {
            setFieldErrors({ confirmPassword: t("students.messages.passwordMismatch") });
            setError(t("students.messages.passwordMismatch"));
            return;
        }

        try {
            setSaving(true);

            await kyInstance.post(role === "management" ? "students" : "students/supervisor-create", {
                json: {
                    firstName: firstName.trim(),
                    lastName: lastName.trim(),
                    name: `${firstName.trim()} ${lastName.trim()}`.trim(),
                    email: email.trim().toLowerCase(),
                    password: password.trim(),
                    avatarUrl,
                    ...extraForm,
                    branchId,
                    cohortId: cohortId || null,
                    supervisorId: role === "management" ? supervisorId || null : null,
                },
            });

            navigate("/students");
        } catch (e: any) {
            setError(e?.message ?? t("students.messages.failedToSubmitRequest"));
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="w-full max-w-4xl space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>{t("students.actions.addStudent")}</CardTitle>
                </CardHeader>

                <CardContent>
                    {loading ? (
                        <div className="text-sm text-muted-foreground">{t("students.messages.loadingForm")}</div>
                    ) : (
                        <form onSubmit={onSubmit} className="space-y-4">
                            <div className="rounded-md border bg-muted/30 p-3 text-sm text-muted-foreground">
                                {role === "management" ? t("students.messages.directCreateNotice") : t("students.messages.pendingRequestNotice")}
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>{t("common.firstName")}</Label>
                                    <Input
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        placeholder={t("students.placeholders.firstName")}
                                        aria-invalid={!!fieldErrors.firstName}
                                    />
                                    {fieldErrors.firstName ? <p className="text-xs text-destructive">{fieldErrors.firstName}</p> : null}
                                </div>

                                <div className="space-y-2">
                                    <Label>{t("common.lastName")}</Label>
                                    <Input
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        placeholder={t("students.placeholders.lastName")}
                                        aria-invalid={!!fieldErrors.lastName}
                                    />
                                    {fieldErrors.lastName ? <p className="text-xs text-destructive">{fieldErrors.lastName}</p> : null}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>{t("common.email")}</Label>
                                <Input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder={t("students.placeholders.email")}
                                    aria-invalid={!!fieldErrors.email}
                                />
                                {fieldErrors.email ? <p className="text-xs text-destructive">{fieldErrors.email}</p> : null}
                            </div>

                            <div className="space-y-2">
                                <Label>{t("common.password")}</Label>
                                <Input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder={t("students.placeholders.password")}
                                    aria-invalid={!!fieldErrors.password}
                                />
                                {fieldErrors.password ? <p className="text-xs text-destructive">{fieldErrors.password}</p> : null}
                            </div>

                            <div className="space-y-2">
                                <Label>{t("common.confirmPassword")}</Label>
                                <Input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder={t("students.placeholders.confirmPassword")}
                                    aria-invalid={!!fieldErrors.confirmPassword}
                                />
                                {fieldErrors.confirmPassword ? <p className="text-xs text-destructive">{fieldErrors.confirmPassword}</p> : null}
                            </div>

                            <div className="space-y-2">
                                <Label>{t("students.fields.uploadPicture")}</Label>
                                <CloudinaryImageUpload
                                    value={avatarUrl}
                                    onChange={setAvatarUrl}
                                    disabled={saving}
                                    layout="row"
                                />
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                {beforeConditionalStudentExtraFields.map(renderExtraField)}
                            </div>

                            <div className="grid gap-4 sm:grid-cols-3">
                                {conditionalStudentExtraGroups.map((group) => (
                                    <div key={group.question.name} className="space-y-3 rounded-md border bg-muted/20 p-3">
                                        {renderExtraField(group.question)}
                                        <div className="border-t pt-3">
                                            {renderExtraField(group.details)}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                {afterConditionalStudentExtraFields.map(renderExtraField)}
                            </div>

                            <div className="space-y-2">
                                <Label>{t("common.branch")}</Label>
                                <select
                                    className="h-9 w-full border rounded-md px-3 bg-background"
                                    value={branchId}
                                    onChange={(e) => {
                                        setBranchId(e.target.value);
                                    }}
                                    aria-invalid={!!fieldErrors.branchId}
                                >
                                    <option value="">{t("students.placeholders.selectBranch")}</option>
                                    {branches.map((branch) => (
                                        <option key={branch.id} value={branch.id}>
                                            {branch.name ?? t("dashboard.report.unnamed.branch")}
                                        </option>
                                    ))}
                                </select>
                                {fieldErrors.branchId ? <p className="text-xs text-destructive">{fieldErrors.branchId}</p> : null}
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>{t("common.cohort")}</Label>
                                    <select
                                        className="h-9 w-full border rounded-md px-3 bg-background"
                                        value={cohortId}
                                        onChange={(e) => setCohortId(e.target.value)}
                                    >
                                        <option value="">{t("students.placeholders.selectCohort")}</option>
                                        {getUniqueSortedCohorts(cohorts).map((cohort) => (
                                            <option key={cohort.id} value={cohort.id}>
                                                {cohort.name ?? t("dashboard.report.unnamed.cohort")}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {role === "management" ? (
                                    <div className="space-y-2">
                                        <Label>{t("students.fields.supervisor")}</Label>
                                        <select
                                            className="h-9 w-full border rounded-md px-3 bg-background"
                                            value={supervisorId}
                                            onChange={(e) => setSupervisorId(e.target.value)}
                                        >
                                            <option value="">{t("students.placeholders.selectSupervisor")}</option>
                                            {supervisors.map((supervisor) => (
                                                <option key={supervisor.id} value={supervisor.id}>
                                                    {supervisor.name ?? supervisor.email ?? t("dashboard.report.unnamed.supervisor")}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                ) : null}
                            </div>



                            {error ? <p className="text-sm text-destructive">{error}</p> : null}

                            <div className="flex gap-2">
                                <Button type="submit" disabled={saving}>
                                    {saving
                                        ? t("common.submitting")
                                        : role === "management"
                                            ? t("students.actions.addStudent")
                                            : t("students.actions.submitForApproval")}
                                </Button>

                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => navigate("/students")}
                                    disabled={saving}
                                >
                                    {t("buttons.cancel")}
                                </Button>
                            </div>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
