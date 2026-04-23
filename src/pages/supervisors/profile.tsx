import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { kyInstance } from "@/providers/data";
import { useTranslation } from "react-i18next";
import { CloudinaryImageUpload } from "@/components/upload-widget";
import { Label } from "@/components/ui/label";

type SupervisorProfileResponse = {
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
};

export default function SupervisorProfilePage() {
    const { t } = useTranslation();
    const { id } = useParams();
    const [data, setData] = useState<SupervisorProfileResponse | null>(null);
    const [form, setForm] = useState<FormState>({
        fullName: "",
        phone: "",
        city: "",
        bio: "",
        avatarUrl: "",
        notes: "",
        allowedEdit: true,
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
                .get(`supervisors/${id}/profile`)
                .json<SupervisorProfileResponse>();

            setData(json);
            setForm({
                fullName: json.profile?.fullName ?? json.user?.name ?? "",
                phone: json.profile?.phone ?? "",
                city: json.profile?.city ?? "",
                bio: json.profile?.bio ?? "",
                avatarUrl: json.profile?.avatarUrl ?? json.user?.image ?? "",
                notes: json.profile?.notes ?? "",
                allowedEdit: json.profile?.allowedEdit ?? true,
            });
        } catch (e: any) {
            setError(e?.message ?? t("profilePage.messages.failedToLoadSupervisor"));
            setData(null);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        void loadProfile();
    }, [id]);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!id) return;

        setSaving(true);
        setError(null);
        setSuccess(null);

        try {
            await kyInstance.patch(`supervisors/${id}/profile/staff`, {
                json: form,
            });

            setSuccess(t("profilePage.supervisorUpdated"));
            await loadProfile();
        } catch (e: any) {
            setError(e?.message ?? t("profilePage.messages.failedToUpdateSupervisor"));
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
            await kyInstance.patch(`supervisors/${id}/profile/staff`, {
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
            setSuccess(t("profilePage.supervisorUpdated"));
        } catch (e: any) {
            setError(e?.message ?? t("profilePage.messages.failedToUpdateSupervisor"));
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return <div className="p-6 text-muted-foreground">{t("profilePage.loadingSupervisor")}</div>;
    }

    return (
        <div className="p-6 space-y-6 max-w-4xl">
            <Card>
                <CardHeader>
                    <CardTitle>{t("profilePage.supervisorProfile")}</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2 text-sm">
                    <div>
                        <div className="text-muted-foreground">{t("roles.supervisor")}</div>
                        <div className="font-medium">
                            {data?.profile?.fullName ?? data?.user?.name ?? t("common.notAvailable")}
                        </div>
                    </div>

                    <div>
                        <div className="text-muted-foreground">{t("common.email")}</div>
                        <div className="font-medium">{data?.user?.email ?? t("common.notAvailable")}</div>
                    </div>

                    <div>
                        <div className="text-muted-foreground">{t("common.role")}</div>
                        <div className="font-medium capitalize">{data?.user?.role ? t(`roles.${data.user.role}`, data.user.role) : t("common.notAvailable")}</div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>{t("profilePage.managementEdit")}</CardTitle>
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
                            <label className="text-sm font-medium">{t("profilePage.managementNotes")}</label>
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
                            {t("profilePage.supervisorCanEdit")}
                        </label>

                        {error ? <p className="text-sm text-destructive">{error}</p> : null}
                        {success ? <p className="text-sm text-primary">{success}</p> : null}

                        <Button type="submit" disabled={saving}>
                            {saving ? t("common.saving") : t("buttons.saveChanges")}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
