import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { EditView } from "@/components/refine-ui/views/edit-view";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { CloudinaryDocumentUpload } from "@/components/document-upload-widget";
import { kyInstance } from "@/providers/data";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

type Task = {
    id: string;
    title: string;
    description?: string | null;
    documentUrl?: string | null;
    dueDate?: string | null;
};

export default function TaskEdit() {
    const { t } = useTranslation();
    const { id } = useParams();
    const navigate = useNavigate();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [documentUrl, setDocumentUrl] = useState("");
    const [dueDate, setDueDate] = useState("");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        async function run() {
            if (!id) return;

            try {
                setLoading(true);
                setError(null);

                const task = await kyInstance.get(`tasks/${id}`).json<Task>();

                if (!cancelled) {
                    setTitle(task.title ?? "");
                    setDescription(task.description ?? "");
                    setDocumentUrl(task.documentUrl ?? "");
                    setDueDate(task.dueDate ?? "");
                }
            } catch (e: any) {
                if (!cancelled) {
                    setError(e?.message ?? t("tasks.messages.failedToLoad"));
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        run();

        return () => {
            cancelled = true;
        };
    }, [id]);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (!id) return;

        setError(null);

        if (!title.trim()) {
            setError(t("tasks.messages.titleRequired"));
            return;
        }

        if (!dueDate) {
            setError(t("tasks.messages.dueDateRequired"));
            return;
        }

        try {
            setSaving(true);

            await kyInstance.patch(`tasks/${id}`, {
                json: {
                    title: title.trim(),
                    description: description.trim() || null,
                    documentUrl: documentUrl.trim() || null,
                    dueDate,
                },
            });

            navigate(`/tasks/show/${id}`);
        } catch (e: any) {
            setError(e?.message ?? t("tasks.messages.failedToUpdate"));
        } finally {
            setSaving(false);
        }
    }

    return (
        <EditView>
            <div className="flex flex-col gap-4">
                <div className="flex items-center relative gap-2">
                    <div className="bg-background z-[2] pr-4">
                        <Breadcrumb />
                    </div>
                    <Separator className="absolute left-0 right-0 z-[1]" />
                </div>

                <div className="flex items-center justify-between gap-4">
                    <h2 className="text-2xl font-bold">{t("tasks.titles.edit")}</h2>

                    <Button asChild variant="outline">
                        <Link to={id ? `/tasks/show/${id}` : "/tasks"}>{t("common.back")}</Link>
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">{t("common.details")}</CardTitle>
                </CardHeader>

                <CardContent>
                    {loading ? (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            {t("common.loading")}
                        </div>
                    ) : (
                        <form className="space-y-6" onSubmit={onSubmit}>
                            <div className="space-y-2">
                                <Label htmlFor="title">{t("tasks.fields.title")}</Label>
                                <Input
                                    id="title"
                                    placeholder={t("tasks.placeholders.title")}
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">{t("tasks.fields.description")}</Label>
                                <Textarea
                                    id="description"
                                    placeholder={t("tasks.placeholders.description")}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={6}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>{t("tasks.fields.taskDocument")}</Label>
                                <CloudinaryDocumentUpload
                                    value={documentUrl}
                                    onChange={setDocumentUrl}
                                    folder="snowball/tasks/instructions"
                                    disabled={saving}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="dueDate">{t("tasks.fields.dueDate")}</Label>
                                <Input
                                    id="dueDate"
                                    type="date"
                                    value={dueDate}
                                    onChange={(e) => setDueDate(e.target.value)}
                                />
                            </div>

                            {error ? (
                                <p className="text-sm text-destructive">{error}</p>
                            ) : null}

                            <div className="flex items-center justify-end gap-2">
                                <Button type="submit" disabled={saving}>
                                    {saving ? t("common.saving") : t("common.save")}
                                </Button>
                            </div>
                        </form>
                    )}
                </CardContent>
            </Card>
        </EditView>
    );
}
