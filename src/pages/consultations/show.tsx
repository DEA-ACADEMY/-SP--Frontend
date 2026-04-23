import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";
import { ShowView } from "@/components/refine-ui/views/show-view";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { kyInstance } from "@/providers/data";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

type ConsultationStatus = "open" | "in_progress" | "answered" | "closed";
type Role = "student" | "supervisor" | "management" | "donor" | "expert";

type Consultation = {
    id: string;
    title: string;
    status: ConsultationStatus;
    createdAt: string;
    createdBy: string;
    createdByName?: string | null;
    createdByEmail?: string | null;
};

type ConsultationMessage = {
    id: string;
    threadId: string;
    senderId: string;
    senderName?: string | null;
    senderEmail?: string | null;
    senderRole?: Role | null;
    message: string;
    createdAt: string;
};

type SessionMe = {
    id: string;
    role: Role;
    name?: string | null;
    email?: string | null;
};

function formatDateTime(value?: string | null) {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString();
}

export default function ConsultationShow() {
    const { t } = useTranslation();
    const { id } = useParams<{ id: string }>();

    const [me, setMe] = useState<SessionMe | null>(null);
    const [thread, setThread] = useState<Consultation | null>(null);
    const [messages, setMessages] = useState<ConsultationMessage[]>([]);
    const [reply, setReply] = useState("");
    const [loading, setLoading] = useState(true);
    const [savingReply, setSavingReply] = useState(false);
    const [savingStatus, setSavingStatus] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isStaff = useMemo(() => {
        return me?.role === "supervisor" || me?.role === "management";
    }, [me]);

    const canReply = thread?.status !== "closed";

    async function load() {
        if (!id) return;

        setLoading(true);
        setError(null);

        try {
            const [session, threadRes, messagesRes] = await Promise.all([
                kyInstance.get("me").json<SessionMe>(),
                kyInstance.get(`advice-threads/${id}`).json<Consultation>(),
                kyInstance
                    .get("advice-messages", {
                        searchParams: {
                            threadId: id,
                            _start: "0",
                            _end: "200",
                        },
                    })
                    .json<ConsultationMessage[]>(),
            ]);

            setMe(session);
            setThread(threadRes);
            setMessages(Array.isArray(messagesRes) ? messagesRes : []);
        } catch (e: any) {
            setError(e?.message ?? t("advice-threads.messages.failedToLoad"));
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        void load();
    }, [id]);

    async function onReply() {
        if (!id) return;
        if (!reply.trim()) {
            setError(t("advice-threads.messages.replyRequired"));
            return;
        }

        setSavingReply(true);
        setError(null);

        try {
            await kyInstance.post("advice-messages", {
                json: {
                    threadId: id,
                    message: reply.trim(),
                },
            });

            setReply("");
            await load();
        } catch (e: any) {
            setError(e?.message ?? t("advice-threads.messages.failedToSendReply"));
        } finally {
            setSavingReply(false);
        }
    }

    async function onStatusChange(status: ConsultationStatus) {
        if (!id || !thread || !isStaff) return;

        setSavingStatus(true);
        setError(null);

        try {
            const updated = await kyInstance
                .patch(`advice-threads/${id}/status`, {
                    json: { status },
                })
                .json<Consultation>();

            setThread((prev) => (prev ? { ...prev, status: updated.status } : updated));
        } catch (e: any) {
            setError(e?.message ?? t("advice-threads.messages.failedToUpdateStatus"));
        } finally {
            setSavingStatus(false);
        }
    }

    return (
        <ShowView>
            <div className="flex flex-col gap-4">
                <div className="flex items-center relative gap-2">
                    <div className="bg-background z-[2] pr-4">
                        <Breadcrumb />
                    </div>
                    <Separator className="absolute left-0 right-0 z-[1]" />
                </div>

                <div className="flex items-center justify-between gap-4">
                    <h2 className="text-2xl font-bold">{t("advice-threads.titles.show")}</h2>

                    <div className="flex items-center gap-2">
                        <Button asChild variant="outline">
                            <Link to="/consultations">{t("common.back")}</Link>
                        </Button>
                    </div>
                </div>
            </div>

            {loading ? (
                <Card>
                    <CardContent className="py-8">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            {t("common.loading")}
                        </div>
                    </CardContent>
                </Card>
            ) : error && !thread ? (
                <Card>
                    <CardContent className="py-8 text-sm text-destructive">{error}</CardContent>
                </Card>
            ) : thread ? (
                <div className="grid gap-6 lg:grid-cols-3">
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <CardTitle className="text-base">{thread.title}</CardTitle>
                                    <div className="mt-1 text-sm text-muted-foreground">
                                        {t("advice-threads.fields.createdBy")} {thread.createdByName ?? thread.createdByEmail ?? t("common.notAvailable")}
                                    </div>
                                </div>
                                <Badge variant="outline">{t(`advice-threads.status.${thread.status}`)}</Badge>
                            </div>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            <div className="text-sm text-muted-foreground">
                                {t("advice-threads.fields.createdAt")}: {formatDateTime(thread.createdAt)}
                            </div>

                            <Separator />

                            <div className="space-y-4">
                                {messages.length === 0 ? (
                                    <div className="text-sm text-muted-foreground">
                                        {t("advice-threads.messages.noMessages")}
                                    </div>
                                ) : (
                                    messages.map((item) => {
                                        const mine = item.senderId === thread.createdBy;
                                        const senderLabel = item.senderName ?? item.senderEmail ?? t("advice-threads.messages.unknownUser");

                                        return (
                                            <div
                                                key={item.id}
                                                className="rounded-lg border p-4 space-y-2"
                                            >
                                                <div className="flex items-center justify-between gap-3">
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant={mine ? "secondary" : "default"}>
                                                            {mine ? t("roles.student") : t("advice-threads.messages.staff")}
                                                        </Badge>
                                                        <span className="text-sm font-medium">{senderLabel}</span>
                                                    </div>

                                                    <div className="text-xs text-muted-foreground">
                                                        {formatDateTime(item.createdAt)}
                                                    </div>
                                                </div>

                                                <div className="text-sm whitespace-pre-wrap">{item.message}</div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            <Separator />

                            <div className="space-y-3">
                                <Label htmlFor="reply">{t("advice-threads.fields.reply")}</Label>
                                <Textarea
                                    id="reply"
                                    rows={6}
                                    placeholder={canReply ? t("advice-threads.placeholders.reply") : t("advice-threads.placeholders.closed")}
                                    value={reply}
                                    onChange={(e) => setReply(e.target.value)}
                                    disabled={!canReply || savingReply}
                                />

                                {error ? <p className="text-sm text-destructive">{error}</p> : null}

                                <div className="flex justify-end">
                                    <Button onClick={onReply} disabled={!canReply || savingReply}>
                                        {savingReply ? t("advice-threads.messages.sending") : t("advice-threads.messages.sendReply")}
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="lg:col-span-1">
                        <CardHeader>
                            <CardTitle className="text-base">{t("common.meta")}</CardTitle>
                        </CardHeader>

                        <CardContent className="space-y-5 text-sm">
                            <div className="space-y-1">
                                <div className="text-muted-foreground">{t("roles.student")}</div>
                                <div>{thread.createdByName ?? thread.createdByEmail ?? t("common.notAvailable")}</div>
                            </div>

                            <div className="space-y-1">
                                <div className="text-muted-foreground">{t("advice-threads.fields.created")}</div>
                                <div>{formatDateTime(thread.createdAt)}</div>
                            </div>

                            <div className="space-y-2">
                                <Label>{t("common.status")}</Label>
                                {isStaff ? (
                                    <Select
                                        value={thread.status}
                                        onValueChange={(value) =>
                                            void onStatusChange(value as ConsultationStatus)
                                        }
                                        disabled={savingStatus}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder={t("advice-threads.placeholders.selectStatus")} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="open">{t("advice-threads.status.open")}</SelectItem>
                                            <SelectItem value="in_progress">{t("advice-threads.status.in_progress")}</SelectItem>
                                            <SelectItem value="answered">{t("advice-threads.status.answered")}</SelectItem>
                                            <SelectItem value="closed">{t("advice-threads.status.closed")}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                ) : (
                                    <Badge variant="outline">{t(`advice-threads.status.${thread.status}`)}</Badge>
                                )}
                            </div>

                            {isStaff ? (
                                <p className="text-xs text-muted-foreground">
                                    {t("advice-threads.notes.staffFlow")}
                                </p>
                            ) : (
                                <p className="text-xs text-muted-foreground">
                                    {t("advice-threads.notes.studentFlow")}
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            ) : null}
        </ShowView>
    );
}
