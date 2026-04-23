import { useCallback, useEffect, useMemo, useState } from "react";
import { ListView } from "@/components/refine-ui/views/list-view";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { kyInstance } from "@/providers/data";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/components/refine-ui/language/language-provider";
import { cn } from "@/lib/utils";

type ApiNotification = {
    id: string;
    type: string;
    title: string;
    body?: string | null;
    isRead: boolean;
    createdAt?: string | null;
    entityType?: string | null;
    entityId?: string | null;
};

type NotificationItem = {
    id: string;
    title: string;
    desc: string;
    type: "task" | "review" | "advice" | "system";
    time: string;
    unread: boolean;
};

function mapType(type: string): NotificationItem["type"] {
    if (type === "task_assigned") return "task";
    if (type === "submission_reviewed") return "review";
    if (type === "advice_replied") return "advice";
    return "system";
}

function TypeBadge({ type }: { type: NotificationItem["type"] }) {
    const { t } = useTranslation();

    const label =
        type === "task"
            ? t("notificationsPage.typeTask")
            : type === "review"
                ? t("notificationsPage.typeReview")
                : type === "advice"
                    ? t("notificationsPage.typeAdvice")
                    : t("notificationsPage.typeSystem");

    return <Badge variant="secondary">{label}</Badge>;
}

function translateNotificationTitle(title: string, t: (key: string) => string) {
    if (title === "Student approval requested") {
        return t("notificationsPage.templates.studentApprovalRequested");
    }

    if (title === "Task submitted for review") {
        return t("notificationsPage.templates.taskSubmittedForReview");
    }

    return title;
}

function translateNotificationBody(
    body: string,
    t: (key: string, options?: Record<string, string>) => string,
) {
    const approvalMatch = body.match(/^(.*) requested approval to add (.*)\.?$/i);
    if (approvalMatch) {
        return t("notificationsPage.templates.requestedApprovalToAdd", {
            requester: approvalMatch[1].trim(),
            student: approvalMatch[2].trim(),
        });
    }

    const submittedMatch = body.match(/^(.*) submitted (.*) for review\.?$/i);
    if (submittedMatch) {
        return t("notificationsPage.templates.submittedForReview", {
            student: submittedMatch[1].trim(),
            task: submittedMatch[2].trim(),
        });
    }

    return body;
}

export default function Notifications() {
    const { t, i18n } = useTranslation();
    const { dir } = useLanguage();

    const [rows, setRows] = useState<ApiNotification[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [unreadCount, setUnreadCount] = useState(0);
    const [markingAll, setMarkingAll] = useState(false);
    const [markingById, setMarkingById] = useState<Record<string, boolean>>({});

    const formatNotificationTime = useCallback(
        (value?: string | null) => {
            if (!value) return "—";

            const date = new Date(value);
            if (Number.isNaN(date.getTime())) return "—";

            return new Intl.DateTimeFormat(i18n.language === "ar" ? "ar" : "en", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
            }).format(date);
        },
        [i18n.language],
    );

    const loadNotifications = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const [list, unread] = await Promise.all([
                kyInstance
                    .get("notifications", {
                        searchParams: {
                            _start: "0",
                            _end: "50",
                        },
                    })
                    .json<ApiNotification[]>(),
                kyInstance
                    .get("notifications/unread-count")
                    .json<{ unreadCount: number }>(),
            ]);

            setRows(Array.isArray(list) ? list : []);
            setUnreadCount(Number(unread?.unreadCount ?? 0));
        } catch (e: any) {
            setError(e?.message ?? t("notificationsPage.failedToLoad"));
            setRows([]);
            setUnreadCount(0);
        } finally {
            setLoading(false);
        }
    }, [t]);

    useEffect(() => {
        void loadNotifications();
    }, [loadNotifications]);

    const items = useMemo<NotificationItem[]>(() => {
        return rows.map((row) => ({
            id: row.id,
            title:
                i18n.language === "ar"
                    ? translateNotificationTitle(row.title, t)
                    : row.title,
            desc:
                i18n.language === "ar"
                    ? translateNotificationBody(
                        row.body?.trim() || t("notificationsPage.noDetails"),
                        t,
                    )
                    : row.body?.trim() || t("notificationsPage.noDetails"),
            type: mapType(row.type),
            time: formatNotificationTime(row.createdAt),
            unread: !row.isRead,
        }));
    }, [rows, t, formatNotificationTime, i18n.language]);

    async function markOneAsRead(id: string) {
        setMarkingById((prev) => ({ ...prev, [id]: true }));

        try {
            await kyInstance.patch(`notifications/${id}/read`);
            setRows((prev) =>
                prev.map((row) =>
                    row.id === id ? { ...row, isRead: true } : row,
                ),
            );
            setUnreadCount((prev) => Math.max(0, prev - 1));
        } catch (e: any) {
            setError(e?.message ?? t("notificationsPage.failedToMarkRead"));
        } finally {
            setMarkingById((prev) => ({ ...prev, [id]: false }));
        }
    }

    async function markOneAsUnread(id: string) {
        setMarkingById((prev) => ({ ...prev, [id]: true }));

        try {
            await kyInstance.patch(`notifications/${id}/unread`);
            setRows((prev) =>
                prev.map((row) =>
                    row.id === id ? { ...row, isRead: false } : row,
                ),
            );
            setUnreadCount((prev) => prev + 1);
        } catch (e: any) {
            setError(e?.message ?? t("notificationsPage.failedToMarkUnread"));
        } finally {
            setMarkingById((prev) => ({ ...prev, [id]: false }));
        }
    }

    async function markAllAsRead() {
        setMarkingAll(true);
        setError(null);

        try {
            await kyInstance.patch("notifications/read-all");
            setRows((prev) => prev.map((row) => ({ ...row, isRead: true })));
            setUnreadCount(0);
        } catch (e: any) {
            setError(e?.message ?? t("notificationsPage.failedToMarkAllRead"));
        } finally {
            setMarkingAll(false);
        }
    }

    return (
        <ListView>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-3">
                    <div className={cn("space-y-1", dir === "rtl" ? "text-right" : "text-left")}>
                        <CardTitle className="text-base">
                            {t("notificationsPage.inbox")}
                        </CardTitle>
                        <div className="text-sm text-muted-foreground">
                            {t("notificationsPage.unread")}: {unreadCount}
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={markingAll || unreadCount === 0}
                            onClick={markAllAsRead}
                        >
                            {markingAll
                                ? t("notificationsPage.marking")
                                : t("notificationsPage.markAllAsRead")}
                        </Button>
                    </div>
                </CardHeader>

                <CardContent className="p-0">
                    {loading ? (
                        <div className="p-6 text-sm text-muted-foreground">
                            {t("notificationsPage.loading")}
                        </div>
                    ) : error ? (
                        <div className="p-6 text-sm text-destructive">{error}</div>
                    ) : items.length === 0 ? (
                        <div className="p-6 text-sm text-muted-foreground">
                            {t("notificationsPage.empty")}
                        </div>
                    ) : (
                        <div className="min-w-0">
                            {rows.map((row, idx) => {
                                const item = items[idx];

                                return (
                                    <div key={row.id}>
                                        <div className="flex flex-wrap items-start justify-between gap-4 p-4">
                                            <div className={cn("min-w-0 flex-1 space-y-1", dir === "rtl" ? "text-right" : "text-left")}>
                                                <div
                                                    className={cn(
                                                        "flex flex-wrap items-center gap-2",
                                                        dir === "rtl" ? "justify-end" : "justify-start",
                                                    )}
                                                >
                                                    <TypeBadge type={item.type} />
                                                    {!row.isRead ? (
                                                        <Badge variant="default">
                                                            {t("notificationsPage.new")}
                                                        </Badge>
                                                    ) : null}
                                                </div>

                                                <div className="font-medium">{item.title}</div>
                                                <div className="break-words text-sm text-muted-foreground">
                                                    {item.desc}
                                                </div>
                                            </div>

                                            <div className={cn("flex w-full max-w-40 shrink-0 flex-col gap-2", dir === "rtl" ? "items-end text-right" : "items-end text-right")}>
                                                <div className="text-xs text-muted-foreground">
                                                    {item.time}
                                                </div>

                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    disabled={!!markingById[row.id]}
                                                    onClick={() =>
                                                        row.isRead
                                                            ? markOneAsUnread(row.id)
                                                            : markOneAsRead(row.id)
                                                    }
                                                >
                                                    {markingById[row.id]
                                                        ? t("notificationsPage.saving")
                                                        : row.isRead
                                                            ? t("notificationsPage.markAsUnread")
                                                            : t("notificationsPage.markAsRead")}
                                                </Button>
                                            </div>
                                        </div>

                                        {idx !== rows.length - 1 ? <Separator /> : null}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </ListView>
    );
}
