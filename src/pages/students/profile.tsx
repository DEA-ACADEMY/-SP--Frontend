import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { kyInstance } from "@/providers/data";
import { useTranslation } from "react-i18next";
import { CloudinaryImageUpload } from "@/components/upload-widget";
import {
    afterConditionalStudentExtraFields,
    beforeConditionalStudentExtraFields,
    conditionalStudentExtraGroups,
    emptyStudentExtraForm,
    studentExtraFields,
    type StudentExtraField,
    type StudentExtraFieldName,
    type StudentExtraFormState,
} from "./student-profile-fields";

type ClassificationItem = {
    id: string;
    name: string | null;
} | null;

type StudentProfileResponse = {
    user: {
        id: string;
        name: string;
        email: string;
        role: string;
        image?: string | null;
    };
    profile: {
        userId: string;
        fullName?: string | null;
        phone?: string | null;
        city?: string | null;
        bio?: string | null;
        notes?: string | null;
        allowedEdit?: boolean | null;
        avatarUrl?: string | null;
        birthDate?: string | null;
        nationality?: string | null;
        residenceCountry?: string | null;
        gender?: string | null;
        studentStage?: string | null;
        iqTestScore?: string | null;
        maritalStatus?: string | null;
        familyMembersCount?: string | null;
        parentsMaritalStatus?: string | null;
        familyObligations?: string | null;
        familyObligationsDetails?: string | null;
        volunteeringExperience?: string | null;
        volunteeringDetails?: string | null;
        paidWorkExperience?: string | null;
        paidWorkDetails?: string | null;
        universityPhase?: string | null;
        major?: string | null;
        university?: string | null;
        academicNumber?: string | null;
        latestGpa?: string | null;
        annualTuitionFees?: string | null;
        lowIncomeFamily?: string | null;
        ataTrainingCost?: string | null;
        housingCost?: string | null;
        transportationCost?: string | null;
        medicalCost?: string | null;
        otherCosts?: string | null;
        classification?: {
            branch: ClassificationItem;
            program: ClassificationItem;
            cohort: ClassificationItem;
        };
    } | null;
};

type FormState = {
    fullName: string;
    phone: string;
    city: string;
    bio: string;
    avatarUrl: string;
    notes: string;
    allowedEdit: boolean;
    extra: StudentExtraFormState;
};

export default function StudentStaffProfilePage() {
    const { t } = useTranslation();
    const { id } = useParams();
    const [data, setData] = useState<StudentProfileResponse | null>(null);
    const [form, setForm] = useState<FormState>({
        fullName: "",
        phone: "",
        city: "",
        bio: "",
        avatarUrl: "",
        notes: "",
        allowedEdit: true,
        extra: emptyStudentExtraForm,
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    async function loadProfile() {
        if (!id) return;

        setLoading(true);
        setError(null);

        try {
            const json = await kyInstance
                .get(`students/${id}/profile`)
                .json<StudentProfileResponse>();

            setData(json);
            setForm({
                fullName: json.profile?.fullName ?? json.user?.name ?? "",
                phone: json.profile?.phone ?? "",
                city: json.profile?.city ?? "",
                bio: json.profile?.bio ?? "",
                avatarUrl: json.profile?.avatarUrl ?? json.user?.image ?? "",
                notes: json.profile?.notes ?? "",
                allowedEdit: json.profile?.allowedEdit ?? true,
                extra: {
                    ...emptyStudentExtraForm,
                    ...Object.fromEntries(
                        studentExtraFields.map((field) => [
                            field.name,
                            String(json.profile?.[field.name as StudentExtraFieldName] ?? ""),
                        ]),
                    ) as StudentExtraFormState,
                },
            });
        } catch (e: any) {
            setError(e?.message ?? t("profilePage.messages.failedToLoadStudent"));
            setData(null);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        void loadProfile();
    }, [id]);

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
                        value={form.extra[field.name]}
                        onChange={(event) =>
                            setForm((prev) => ({
                                ...prev,
                                extra: {
                                    ...prev.extra,
                                    [field.name]: event.target.value,
                                },
                            }))
                        }
                        disabled={saving}
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
                        value={form.extra[field.name]}
                        onChange={(event) =>
                            setForm((prev) => ({
                                ...prev,
                                extra: {
                                    ...prev.extra,
                                    [field.name]: event.target.value,
                                },
                            }))
                        }
                        disabled={saving}
                    />
                )}
            </div>
        );
    }

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!id) return;

        setSaving(true);
        setError(null);
        setSuccess(null);

        try {
            await kyInstance.patch(`students/${id}/profile/staff`, {
                json: {
                    ...form,
                    ...form.extra,
                    extra: undefined,
                },
            });

            setSuccess(t("profilePage.studentUpdated"));
            await loadProfile();
        } catch (e: any) {
            setError(e?.message ?? t("profilePage.messages.failedToUpdateStudent"));
        } finally {
            setSaving(false);
        }
    }

    async function saveAvatar(url: string) {
        if (!id) return;

        setForm((prev) => ({ ...prev, avatarUrl: url }));
        setSaving(true);
        setError(null);
        setSuccess(null);

        try {
            await kyInstance.patch(`students/${id}/profile/staff`, {
                json: {
                    avatarUrl: url || null,
                },
            });

            setData((prev) =>
                prev
                    ? {
                        ...prev,
                        user: { ...prev.user, image: url || null },
                        profile: {
                            ...(prev.profile ?? { userId: id }),
                            avatarUrl: url || null,
                        },
                    }
                    : prev,
            );
            setSuccess(t("profilePage.studentUpdated"));
        } catch (e: any) {
            setError(e?.message ?? t("profilePage.messages.failedToUpdateStudent"));
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return <div className="p-6 text-muted-foreground">{t("profilePage.loadingStudent")}</div>;
    }

    const branchName = data?.profile?.classification?.branch?.name ?? t("common.notAvailable");
    const programName = data?.profile?.classification?.program?.name ?? t("common.notAvailable");
    const cohortName = data?.profile?.classification?.cohort?.name ?? t("common.notAvailable");

    return (
        <div className="p-6 space-y-6 max-w-4xl">
            <Card>
                <CardHeader>
                    <CardTitle>{t("profilePage.studentProfile")}</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2 text-sm">
                    <div>
                        <div className="text-muted-foreground">{t("roles.student")}</div>
                        <div className="font-medium">
                            {data?.profile?.fullName ?? data?.user?.name ?? t("common.notAvailable")}
                        </div>
                    </div>

                    <div>
                        <div className="text-muted-foreground">{t("common.email")}</div>
                        <div className="font-medium">{data?.user?.email ?? t("common.notAvailable")}</div>
                    </div>

                    <div>
                        <div className="text-muted-foreground">{t("common.branch")}</div>
                        <div className="font-medium">{branchName}</div>
                    </div>

                    <div>
                        <div className="text-muted-foreground">{t("common.program")}</div>
                        <div className="font-medium">{programName}</div>
                    </div>

                    <div>
                        <div className="text-muted-foreground">{t("common.cohort")}</div>
                        <div className="font-medium">{cohortName}</div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>{t("profilePage.staffEdit")}</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={onSubmit} className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">{t("common.fullName")}</label>
                                <Input
                                    value={form.fullName}
                                    onChange={(e) =>
                                        setForm((prev) => ({
                                            ...prev,
                                            fullName: e.target.value,
                                        }))
                                    }
                                    disabled={saving}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">{t("common.phone")}</label>
                                <Input
                                    value={form.phone}
                                    onChange={(e) =>
                                        setForm((prev) => ({
                                            ...prev,
                                            phone: e.target.value,
                                        }))
                                    }
                                    disabled={saving}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">{t("common.city")}</label>
                                <Input
                                    value={form.city}
                                    onChange={(e) =>
                                        setForm((prev) => ({
                                            ...prev,
                                            city: e.target.value,
                                        }))
                                    }
                                    disabled={saving}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>{t("students.fields.uploadPicture")}</Label>
                                <CloudinaryImageUpload
                                    value={form.avatarUrl}
                                    onChange={(url) => void saveAvatar(url)}
                                    disabled={saving}
                                    layout="row"
                                />
                            </div>
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
                            <label className="text-sm font-medium">{t("common.bio")}</label>
                            <Textarea
                                value={form.bio}
                                onChange={(e) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        bio: e.target.value,
                                    }))
                                }
                                disabled={saving}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">{t("profilePage.staffNotes")}</label>
                            <Textarea
                                value={form.notes}
                                onChange={(e) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        notes: e.target.value,
                                    }))
                                }
                                disabled={saving}
                            />
                        </div>

                        <label className="flex items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                checked={form.allowedEdit}
                                onChange={(e) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        allowedEdit: e.target.checked,
                                    }))
                                }
                                disabled={saving}
                            />
                            {t("profilePage.studentCanEdit")}
                        </label>

                        {error ? <p className="text-sm text-destructive">{error}</p> : null}
                        {success ? <p className="text-sm text-primary">{success}</p> : null}

                        <Button type="submit" disabled={saving}>
                            {saving ? t("common.saving") : t("profilePage.saveStaffChanges")}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
