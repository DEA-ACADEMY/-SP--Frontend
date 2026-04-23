import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { kyInstance } from "@/providers/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useTranslation } from "react-i18next";
import { CloudinaryImageUpload } from "@/components/upload-widget";

export default function SupervisorCreatePage() {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [avatarUrl, setAvatarUrl] = useState("");

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);

        if (!name.trim() || !email.trim() || !password) {
            setError(t("supervisors.messages.allFieldsRequired"));
            return;
        }

        if (password.length < 8) {
            setError(t("supervisors.messages.passwordMin"));
            return;
        }

        try {
            setSaving(true);

            await kyInstance.post("supervisors", {
                json: {
                    name: name.trim(),
                    email: email.trim().toLowerCase(),
                    password,
                    avatarUrl,
                },
            });

            navigate("/supervisors");
        } catch (e: any) {
            setError(e?.message ?? t("supervisors.messages.failedToCreate"));
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="w-full max-w-4xl space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>{t("supervisors.titles.create")}</CardTitle>
                </CardHeader>

                <CardContent>
                    <form onSubmit={onSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label>{t("common.fullName")}</Label>
                            <Input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder={t("supervisors.placeholders.fullName")}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>{t("common.email")}</Label>
                            <Input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder={t("supervisors.placeholders.email")}
                            />
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
                            <Label>{t("supervisors.fields.temporaryPassword")}</Label>
                            <Input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder={t("supervisors.placeholders.password")}
                            />
                        </div>

                        {error ? <p className="text-sm text-destructive">{error}</p> : null}

                        <div className="flex gap-2">
                            <Button type="submit" disabled={saving}>
                                {saving ? t("common.creating") : t("supervisors.actions.create")}
                            </Button>

                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate("/supervisors")}
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
