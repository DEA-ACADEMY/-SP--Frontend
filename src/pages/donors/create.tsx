import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { CloudinaryImageUpload } from "@/components/upload-widget";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { kyInstance } from "@/providers/data";
import { useTranslation } from "react-i18next";

export default function DonorCreatePage() {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [avatarUrl, setAvatarUrl] = useState("");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setFieldErrors({});

        const requiredMessage = t("students.messages.fieldRequired");
        const nextFieldErrors: Record<string, string> = {};
        if (!name.trim()) nextFieldErrors.name = requiredMessage;
        if (!email.trim()) nextFieldErrors.email = requiredMessage;
        if (!password) nextFieldErrors.password = requiredMessage;
        if (!confirmPassword) nextFieldErrors.confirmPassword = requiredMessage;

        if (Object.keys(nextFieldErrors).length > 0) {
            setFieldErrors(nextFieldErrors);
            setError(t("donors.messages.allFieldsRequired"));
            return;
        }

        if (password.length < 8) {
            setFieldErrors({ password: t("donors.messages.passwordMin") });
            setError(t("donors.messages.passwordMin"));
            return;
        }

        if (password !== confirmPassword) {
            setFieldErrors({ confirmPassword: t("students.messages.passwordMismatch") });
            setError(t("students.messages.passwordMismatch"));
            return;
        }

        try {
            setSaving(true);
            await kyInstance.post("donors", {
                json: {
                    name: name.trim(),
                    email: email.trim().toLowerCase(),
                    password,
                    avatarUrl,
                },
            });
            navigate("/donors");
        } catch (e: any) {
            setError(e?.message ?? t("donors.messages.failedToCreate"));
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="w-full max-w-4xl space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>{t("donors.titles.create")}</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={onSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label>{t("common.fullName")}</Label>
                            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={t("donors.placeholders.fullName")} aria-invalid={!!fieldErrors.name} />
                            {fieldErrors.name ? <p className="text-xs text-destructive">{fieldErrors.name}</p> : null}
                        </div>

                        <div className="space-y-2">
                            <Label>{t("common.email")}</Label>
                            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t("donors.placeholders.email")} aria-invalid={!!fieldErrors.email} />
                            {fieldErrors.email ? <p className="text-xs text-destructive">{fieldErrors.email}</p> : null}
                        </div>

                        <div className="space-y-2">
                            <Label>{t("students.fields.uploadPicture")}</Label>
                            <CloudinaryImageUpload value={avatarUrl} onChange={setAvatarUrl} disabled={saving} layout="row" />
                        </div>

                        <div className="space-y-2">
                            <Label>{t("donors.fields.temporaryPassword")}</Label>
                            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t("donors.placeholders.password")} aria-invalid={!!fieldErrors.password} />
                            {fieldErrors.password ? <p className="text-xs text-destructive">{fieldErrors.password}</p> : null}
                        </div>

                        <div className="space-y-2">
                            <Label>{t("common.confirmPassword")}</Label>
                            <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder={t("students.placeholders.confirmPassword")} aria-invalid={!!fieldErrors.confirmPassword} />
                            {fieldErrors.confirmPassword ? <p className="text-xs text-destructive">{fieldErrors.confirmPassword}</p> : null}
                        </div>

                        {error ? <p className="text-sm text-destructive">{error}</p> : null}

                        <div className="flex gap-2">
                            <Button type="submit" disabled={saving}>
                                {saving ? t("common.creating") : t("donors.actions.create")}
                            </Button>
                            <Button type="button" variant="outline" onClick={() => navigate("/donors")} disabled={saving}>
                                {t("buttons.cancel")}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
