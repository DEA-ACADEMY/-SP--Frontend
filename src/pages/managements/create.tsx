import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CloudinaryImageUpload } from "@/components/upload-widget";
import { kyInstance } from "@/providers/data";
import { useTranslation } from "react-i18next";

export default function ManagementCreatePage() {
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

        const nextFieldErrors: Record<string, string> = {};
        const requiredMessage = t("students.messages.fieldRequired");

        if (!name.trim()) nextFieldErrors.name = requiredMessage;
        if (!email.trim()) nextFieldErrors.email = requiredMessage;
        if (!password) nextFieldErrors.password = requiredMessage;
        if (!confirmPassword) nextFieldErrors.confirmPassword = requiredMessage;

        if (Object.keys(nextFieldErrors).length > 0) {
            setFieldErrors(nextFieldErrors);
            setError(t("managements.messages.allFieldsRequired"));
            return;
        }

        if (password.length < 8) {
            setFieldErrors({ password: t("managements.messages.passwordMin") });
            setError(t("managements.messages.passwordMin"));
            return;
        }

        if (password !== confirmPassword) {
            setFieldErrors({ confirmPassword: t("students.messages.passwordMismatch") });
            setError(t("students.messages.passwordMismatch"));
            return;
        }

        try {
            setSaving(true);

            await kyInstance.post("managements", {
                json: {
                    name: name.trim(),
                    email: email.trim().toLowerCase(),
                    password,
                    avatarUrl,
                },
            });

            navigate("/managements");
        } catch (e: any) {
            setError(e?.message ?? t("managements.messages.failedToCreate"));
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="w-full max-w-4xl space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>{t("managements.titles.create")}</CardTitle>
                </CardHeader>

                <CardContent>
                    <form onSubmit={onSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label>{t("common.fullName")}</Label>
                            <Input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder={t("managements.placeholders.fullName")}
                                aria-invalid={!!fieldErrors.name}
                            />
                            {fieldErrors.name ? <p className="text-xs text-destructive">{fieldErrors.name}</p> : null}
                        </div>

                        <div className="space-y-2">
                            <Label>{t("common.email")}</Label>
                            <Input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder={t("managements.placeholders.email")}
                                aria-invalid={!!fieldErrors.email}
                            />
                            {fieldErrors.email ? <p className="text-xs text-destructive">{fieldErrors.email}</p> : null}
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

                        <div className="space-y-2">
                            <Label>{t("managements.fields.temporaryPassword")}</Label>
                            <Input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder={t("managements.placeholders.password")}
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

                        {error ? <p className="text-sm text-destructive">{error}</p> : null}

                        <div className="flex gap-2">
                            <Button type="submit" disabled={saving}>
                                {saving ? t("common.creating") : t("managements.actions.create")}
                            </Button>

                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate("/managements")}
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
