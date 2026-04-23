import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";
import { CreateView } from "@/components/refine-ui/views/create-view";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { kyInstance } from "@/providers/data";
import { useTranslation } from "react-i18next";

type CreatedConsultation = {
    id: string;
};

export default function ConsultationCreate() {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const [title, setTitle] = useState("");
    const [message, setMessage] = useState("");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();

        setError(null);

        if (!title.trim()) {
            setError(t("advice-threads.messages.titleRequired"));
            return;
        }

        if (!message.trim()) {
            setError(t("advice-threads.messages.messageRequired"));
            return;
        }

        try {
            setSaving(true);

            const created = await kyInstance
                .post("advice-threads", {
                    json: {
                        title: title.trim(),
                        message: message.trim(),
                    },
                })
                .json<CreatedConsultation>();

            navigate(`/consultations/show/${created.id}`);
        } catch (e: any) {
            setError(e?.message ?? t("advice-threads.messages.failedToCreate"));
        } finally {
            setSaving(false);
        }
    }

    return (
        <CreateView>
            <div className="flex flex-col gap-4">
                <div className="flex items-center relative gap-2">
                    <div className="bg-background z-[2] pr-4">
                        <Breadcrumb />
                    </div>
                    <Separator className="absolute left-0 right-0 z-[1]" />
                </div>

                <div className="flex items-center justify-between gap-4">
                    <h2 className="text-2xl font-bold">{t("advice-threads.titles.create")}</h2>

                    <div className="flex items-center gap-2">
                        <Button asChild variant="outline">
                            <Link to="/consultations">{t("common.back")}</Link>
                        </Button>

                        <Button onClick={onSubmit} disabled={saving}>
                            {saving ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    {t("common.saving")}
                                </>
                            ) : (
                                t("common.save")
                            )}
                        </Button>
                    </div>
                </div>
            </div>

            <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-base">{t("common.details")}</CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="title">{t("common.title")}</Label>
                            <Input
                                id="title"
                                placeholder={t("advice-threads.placeholders.title")}
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="message">{t("advice-threads.fields.message")}</Label>
                            <Textarea
                                id="message"
                                placeholder={t("advice-threads.placeholders.message")}
                                rows={10}
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle className="text-base">{t("advice-threads.fields.notes")}</CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-3 text-sm text-muted-foreground">
                        <p>{t("advice-threads.notes.use")}</p>
                        <p>{t("advice-threads.notes.visibility")}</p>
                        <p>{t("advice-threads.notes.notification")}</p>

                        {error ? <p className="text-sm text-destructive">{error}</p> : null}
                    </CardContent>
                </Card>

                <button type="submit" className="hidden" />
            </form>
        </CreateView>
    );
}
