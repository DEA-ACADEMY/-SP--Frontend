import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ShowView } from "@/components/refine-ui/views/show-view";
import { kyInstance } from "@/providers/data";
import { CloudinaryImageUpload } from "@/components/upload-widget.tsx";
import { useTranslation } from "react-i18next";

type ClassificationItem = {
    id: string;
    name: string | null;
} | null;

type ProfileRecord = {
    userId: string;
    fullName?: string | null;
    phone?: string | null;
    city?: string | null;
    bio?: string | null;
    notes?: string | null;
    allowedEdit?: boolean | null;
    avatarUrl?: string | null;
} | null;

type MeResponse = {
    user: {
        id: string;
        name: string;
        email: string;
        role: string;
        image?: string | null;
    };
    profile: ProfileRecord;
    classification?: {
        branch: ClassificationItem;
        program: ClassificationItem;
        cohort: ClassificationItem;
    };
    permissions?: {
        canSelfEdit?: boolean;
    };
};

type FormState = {
    fullName: string;
    phone: string;
    city: string;
    bio: string;
    avatarUrl: string;
};

export default function Profile() {
    const { t } = useTranslation();
    const [data, setData] = useState<MeResponse | null>(null);
    const [form, setForm] = useState<FormState>({
        fullName: "",
        phone: "",
        city: "",
        bio: "",
        avatarUrl: "",
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    async function loadMe() {
        setLoading(true);
        setError(null);

        try {
            const json = await kyInstance.get("me").json<MeResponse>();
            setData(json);

            setForm({
                fullName: json.profile?.fullName ?? json.user?.name ?? "",
                phone: json.profile?.phone ?? "",
                city: json.profile?.city ?? "",
                bio: json.profile?.bio ?? "",
                avatarUrl: json.profile?.avatarUrl ?? json.user?.image ?? "",
            });
        } catch (e: any) {
            setError(e?.message ?? t("profilePage.messages.failedToLoad"));
            setData(null);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        void loadMe();
    }, []);

    const isStaff = useMemo(() => {
        const role = data?.user?.role;
        return role === "management" || role === "supervisor";
    }, [data]);

    const canSelfEdit = data?.permissions?.canSelfEdit ?? true;

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        setError(null);
        setSuccess(null);

        try {
            await kyInstance.patch("me/profile", {
                json: {
                    fullName: form.fullName,
                    phone: form.phone,
                    city: form.city,
                    bio: form.bio,
                    avatarUrl: form.avatarUrl,
                },
            });

            setSuccess(t("profilePage.updated"));
            await loadMe();
        } catch (e: any) {
            setError(e?.message ?? t("profilePage.messages.failedToSave"));
        } finally {
            setSaving(false);
        }
    }

    async function saveAvatar(url: string) {
        setForm((prev) => ({ ...prev, avatarUrl: url }));
        setSaving(true);
        setError(null);
        setSuccess(null);

        try {
            await kyInstance.patch("me/profile", {
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
                            ...(prev.profile ?? { userId: prev.user.id }),
                            avatarUrl: url || null,
                        },
                    }
                    : prev,
            );
            setSuccess(t("profilePage.updated"));
        } catch (e: any) {
            setError(e?.message ?? t("profilePage.messages.failedToSave"));
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <ShowView>
                <div className="p-6 text-sm text-muted-foreground">{t("profilePage.loading")}</div>
            </ShowView>
        );
    }

    const branchName = data?.classification?.branch?.name ?? t("common.notAvailable");
    const programName = data?.classification?.program?.name ?? t("common.notAvailable");
    const cohortName = data?.classification?.cohort?.name ?? t("common.notAvailable");

    const displayName = data?.profile?.fullName ?? data?.user?.name ?? t("common.user");
    const displayEmail = data?.user?.email ?? t("common.notAvailable");
    const displayRole = data?.user?.role ? t(`roles.${data.user.role}`, data.user.role) : t("common.notAvailable");

    const folder =
        data?.user?.role === "student"
            ? "snowball/profiles/students"
            : "snowball/profiles/staff";

    return (
        <ShowView>
            <div className="space-y-6">
                <div className="grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
                    <Card className="rounded-[28px] border bg-card shadow-lg">
                        <CardHeader className="pb-0">
                            <CardTitle className="text-lg font-semibold uppercase tracking-wide text-foreground">
                                {t("profilePage.accountInfo")}
                            </CardTitle>
                        </CardHeader>

                        <CardContent className="flex flex-col items-center px-6 pb-8 pt-6 text-center">
                            <div className="w-full">
                                <CloudinaryImageUpload
                                    value={form.avatarUrl}
                                    onChange={(url) => void saveAvatar(url)}
                                    folder={folder}
                                    disabled={!canSelfEdit || saving}
                                    layout="column"
                                    previewClassName="h-40 w-40 rounded-full ring-4 ring-background shadow-lg"
                                />
                            </div>

                            <div className="mt-6 space-y-3">
                                <h2 className="text-4xl font-extrabold uppercase tracking-tight text-foreground">
                                    {displayName}
                                </h2>

                                <p className="break-all text-lg text-muted-foreground">
                                    {displayEmail}
                                </p>

                                <div className="space-y-2">
                                    <div className="text-sm text-muted-foreground">{t("common.role")}</div>
                                    <div className="flex justify-center">
                                        <Badge className="rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary">
                                            {displayRole}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-[28px] border bg-card shadow-lg">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg font-semibold uppercase tracking-wide text-foreground">
                                {t("profilePage.personalDetails")}
                            </CardTitle>
                        </CardHeader>

                        <CardContent className="space-y-5 px-5 pb-6 pt-2">
                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="rounded-2xl border bg-muted/60 p-4">
                                    <div className="text-sm text-muted-foreground">{t("common.branch")}</div>
                                    <div className="mt-2 text-base font-medium text-foreground">
                                        {branchName}
                                    </div>
                                </div>

                                <div className="rounded-2xl border bg-muted/60 p-4">
                                    <div className="text-sm text-muted-foreground">{t("common.program")}</div>
                                    <div className="mt-2 text-base font-medium text-foreground">
                                        {programName}
                                    </div>
                                </div>

                                <div className="rounded-2xl border bg-muted/60 p-4">
                                    <div className="text-sm text-muted-foreground">{t("common.cohort")}</div>
                                    <div className="mt-2 text-base font-medium text-foreground">
                                        {cohortName}
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            <form onSubmit={onSubmit} className="space-y-5">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-foreground">
                                            {t("common.fullName")}
                                        </label>
                                        <Input
                                            value={form.fullName}
                                            onChange={(e) =>
                                                setForm((prev) => ({
                                                    ...prev,
                                                    fullName: e.target.value,
                                                }))
                                            }
                                            disabled={!canSelfEdit || saving}
                                            className="h-12 rounded-full bg-background px-4 shadow-sm"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-foreground">
                                            {t("common.phone")}
                                        </label>
                                        <Input
                                            value={form.phone}
                                            onChange={(e) =>
                                                setForm((prev) => ({
                                                    ...prev,
                                                    phone: e.target.value,
                                                }))
                                            }
                                            disabled={!canSelfEdit || saving}
                                            className="h-12 rounded-full bg-background px-4 shadow-sm"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-foreground">
                                        {t("common.city")}
                                    </label>
                                    <Input
                                        value={form.city}
                                        onChange={(e) =>
                                            setForm((prev) => ({
                                                ...prev,
                                                city: e.target.value,
                                            }))
                                        }
                                        disabled={!canSelfEdit || saving}
                                        className="h-12 rounded-full bg-background px-4 shadow-sm"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-foreground">
                                        {t("common.bio")}
                                    </label>
                                    <Textarea
                                        value={form.bio}
                                        onChange={(e) =>
                                            setForm((prev) => ({
                                                ...prev,
                                                bio: e.target.value,
                                            }))
                                        }
                                        disabled={!canSelfEdit || saving}
                                        className="min-h-[140px] rounded-[22px] bg-background px-4 py-3 shadow-sm"
                                    />
                                </div>

                                {!canSelfEdit ? (
                                    <p className="text-sm text-muted-foreground">
                                        {t("profilePage.editingDisabled")}
                                    </p>
                                ) : null}

                                {error ? (
                                    <p className="text-sm text-destructive">{error}</p>
                                ) : null}

                                {success ? (
                                    <p className="text-sm font-medium text-primary">
                                        {success}
                                    </p>
                                ) : null}

                                <Button
                                    type="submit"
                                    disabled={!canSelfEdit || saving}
                                    className="h-14 w-full rounded-full bg-primary text-base font-medium text-primary-foreground shadow-lg transition hover:bg-primary/90"
                                >
                                    {saving ? t("common.saving") : t("buttons.saveChanges")}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                {isStaff ? (
                    <Card className="rounded-[28px] border bg-card shadow-lg">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg font-semibold uppercase tracking-wide text-foreground">
                                {t("profilePage.staffNotes")}
                            </CardTitle>
                        </CardHeader>

                        <CardContent className="pt-1">
                            <div className="rounded-2xl border bg-muted/60 p-5 text-sm text-muted-foreground shadow-sm">
                                {data?.profile?.notes?.trim() || t("profilePage.noStaffNotes")}
                            </div>
                        </CardContent>
                    </Card>
                ) : null}
            </div>
        </ShowView>
    );
}
