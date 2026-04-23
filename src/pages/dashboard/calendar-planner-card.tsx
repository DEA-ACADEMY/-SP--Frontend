import { FormEvent, useEffect, useMemo, useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/components/refine-ui/language/language-provider";
import { cn } from "@/lib/utils";
import { kyInstance } from "@/providers/data";
import {
    BellRing,
    CalendarDays,
    CalendarPlus,
    CheckSquare2,
    Clock3,
    FileCheck2,
    ListTodo,
    MessageSquareMore,
    Sparkles,
} from "lucide-react";
import type { PlannerEvent, PlannerEventKind, PlannerEventTag } from "./types";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

const kindIconMap: Record<PlannerEventKind, typeof ListTodo> = {
    task: ListTodo,
    todo: CheckSquare2,
    consultation: MessageSquareMore,
    review: FileCheck2,
    event: CalendarDays,
    reminder: BellRing,
};

const allowedKinds = ["task", "todo", "consultation", "review", "event", "reminder"] as const;
const allowedTags = ["urgent", "updated", "momentum", "event"] as const;
const customPlannerStorageKeyBase = "student-platform-custom-planner-events";

function formatDayKey(value: Date | undefined) {
    if (!value) return "";
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const day = String(value.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function isPlannerEventKind(value: string): value is PlannerEventKind {
    return allowedKinds.includes(value as PlannerEventKind);
}

function isPlannerEventTag(value: string): value is PlannerEventTag {
    return allowedTags.includes(value as PlannerEventTag);
}

function normalizePlannerEvent(event: PlannerEvent, t: (key: string) => string): PlannerEvent {
    return {
        ...event,
        id: String(event.id ?? `${event.date}-${event.title ?? "event"}`),
        title: String(event.title ?? "").trim() || t("dashboard.calendar.untitledEvent"),
        date: String(event.date ?? ""),
        description: String(event.description ?? "").trim() || t("dashboard.calendar.noDescription"),
        kind: isPlannerEventKind(String(event.kind)) ? event.kind : "event",
        tag: isPlannerEventTag(String(event.tag)) ? event.tag : "event",
    };
}

function readCustomPlannerEvents(storageKey: string) {
    if (typeof window === "undefined") return [];

    try {
        const parsed = JSON.parse(window.localStorage.getItem(storageKey) ?? "[]");
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

export function CalendarPlannerCard({ initialEvents, storageKeyId = "default" }: { initialEvents: PlannerEvent[]; storageKeyId?: string }) {
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const [customEvents, setCustomEvents] = useState<PlannerEvent[]>([]);
    const [formTitle, setFormTitle] = useState("");
    const [formKind, setFormKind] = useState<PlannerEventKind>("todo");
    const [formDate, setFormDate] = useState(formatDayKey(new Date()));
    const [formDescription, setFormDescription] = useState("");
    const [shouldNotify, setShouldNotify] = useState(true);
    const [saving, setSaving] = useState(false);
    const { dir } = useLanguage();
    const { t } = useTranslation();
    const customPlannerStorageKey = `${customPlannerStorageKeyBase}:${storageKeyId}`;

    const tagStyles: Record<PlannerEventTag, string> = {
        urgent: "bg-destructive text-destructive-foreground hover:bg-destructive",
        updated: "bg-secondary text-secondary-foreground hover:bg-secondary",
        momentum: "bg-primary text-primary-foreground hover:bg-primary",
        event: "bg-muted text-muted-foreground hover:bg-muted",
    };

    const tagLabels: Record<PlannerEventTag, string> = {
        urgent: t("dashboard.calendar.tags.urgent"),
        updated: t("dashboard.calendar.tags.updated"),
        momentum: t("dashboard.calendar.tags.momentum"),
        event: t("dashboard.calendar.tags.event"),
    };

    const kindLegend = [
        {
            kind: "task" as const,
            label: t("dashboard.calendar.kinds.task"),
            dotClassName: "bg-primary",
            badgeClassName: "border-primary/30 bg-primary/10 text-foreground",
        },
        {
            kind: "todo" as const,
            label: t("dashboard.calendar.kinds.todo"),
            dotClassName: "bg-chart-4",
            badgeClassName: "border-chart-4/30 bg-chart-4/10 text-foreground",
        },
        {
            kind: "consultation" as const,
            label: t("dashboard.calendar.kinds.consultation"),
            dotClassName: "bg-secondary",
            badgeClassName: "border-secondary/30 bg-secondary/10 text-foreground",
        },
        {
            kind: "review" as const,
            label: t("dashboard.calendar.kinds.review"),
            dotClassName: "bg-chart-5",
            badgeClassName: "border-chart-5/30 bg-chart-5/10 text-foreground",
        },
        {
            kind: "reminder" as const,
            label: t("dashboard.calendar.kinds.reminder"),
            dotClassName: "bg-chart-3",
            badgeClassName: "border-chart-3/30 bg-chart-3/10 text-foreground",
        },
        {
            kind: "event" as const,
            label: t("dashboard.calendar.kinds.event"),
            dotClassName: "bg-muted-foreground",
            badgeClassName: "border-border bg-muted text-muted-foreground",
        },
    ];

    useEffect(() => {
        setCustomEvents(readCustomPlannerEvents(customPlannerStorageKey).map((event) => normalizePlannerEvent(event, t)));
    }, [customPlannerStorageKey, t]);

    const liveEvents = useMemo(() => initialEvents.map((event) => normalizePlannerEvent(event, t)), [initialEvents, t]);
    const events = useMemo(() => [...liveEvents, ...customEvents], [liveEvents, customEvents]);
    const selectedKey = useMemo(() => formatDayKey(selectedDate), [selectedDate]);
    const todayKey = useMemo(() => formatDayKey(new Date()), []);

    useEffect(() => {
        if (selectedKey) setFormDate(selectedKey);
    }, [selectedKey]);

    const selectedEvents = useMemo(() => {
        if (!selectedKey) return [];
        return events.filter((item) => item.date === selectedKey);
    }, [events, selectedKey]);

    const dayKindMap = useMemo(() => {
        const next = new Map<string, Set<PlannerEventKind>>();
        for (const event of events) {
            if (!next.has(event.date)) next.set(event.date, new Set());
            next.get(event.date)?.add(event.kind);
        }
        return next;
    }, [events]);

    async function addPlannerItem(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const title = formTitle.trim();
        const date = formDate.trim();

        if (!title || !date) {
            toast.error(t("dashboard.calendar.form.missingRequired"));
            return;
        }

        const nextEvent: PlannerEvent = {
            id: `custom-${Date.now()}`,
            title,
            date,
            description: formDescription.trim() || t("dashboard.calendar.noDescription"),
            kind: formKind,
            tag: formKind === "todo" ? "urgent" : "event",
        };

        const nextCustomEvents = [...customEvents, nextEvent];
        setCustomEvents(nextCustomEvents);
        window.localStorage.setItem(customPlannerStorageKey, JSON.stringify(nextCustomEvents));
        setSelectedDate(new Date(`${date}T00:00:00`));
        setFormTitle("");
        setFormDescription("");

        if (!shouldNotify) {
            toast.success(t("dashboard.calendar.form.saved"));
            return;
        }

        try {
            setSaving(true);
            await kyInstance.post("notifications/calendar-item", {
                json: {
                    title,
                    description: nextEvent.description,
                    date,
                    kind: formKind,
                },
            });
            toast.success(t("dashboard.calendar.form.savedWithNotification"));
        } catch (e: any) {
            toast.error(e?.message ?? t("dashboard.calendar.form.notificationFailed"));
        } finally {
            setSaving(false);
        }
    }

    return (
        <Card className="shadow-lg">
            <CardHeader>
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className={dir === "rtl" ? "text-right" : "text-left"}>
                        <CardTitle className="text-2xl font-bold">{t("dashboard.calendar.title")}</CardTitle>
                        <p className="mt-2 text-sm text-muted-foreground">{t("dashboard.calendar.description")}</p>
                    </div>

                    <div className="inline-flex items-center gap-2 rounded-full border bg-accent px-3 py-2 text-sm font-medium text-accent-foreground">
                        <Sparkles className="h-4 w-4" />
                        {t("dashboard.calendar.today")}: {new Intl.DateTimeFormat(dir === "rtl" ? "ar" : "en", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                        }).format(new Date())}
                    </div>
                </div>
            </CardHeader>

            <CardContent className="grid items-start gap-6 xl:grid-cols-[1.15fr_1fr]">
                <div className="space-y-4 rounded-3xl border bg-card p-4 shadow-sm">
                    <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        className="w-full p-2 sm:p-4"
                        components={{
                            DayContent: ({ date }) => {
                                const dateKey = formatDayKey(date);
                                const dayKinds = Array.from(dayKindMap.get(dateKey) ?? []);
                                const isToday = dateKey === todayKey;

                                return (
                                    <div className="pointer-events-none flex h-full w-full flex-col items-center justify-center gap-1 py-1">
                                        <span className={isToday ? "font-bold " : ""}>{date.getDate()}</span>
                                        <div className="flex min-h-2 items-center gap-1">
                                            {dayKinds.slice(0, 3).map((kind) => {
                                                const legend = kindLegend.find((item) => item.kind === kind);
                                                return <span key={`${dateKey}-${kind}`} className={`h-1.5 w-1.5 rounded-full ${legend?.dotClassName ?? "bg-muted-foreground"}`} />;
                                            })}
                                        </div>
                                    </div>
                                );
                            },
                        }}
                    />

                    <div className="rounded-2xl border bg-muted px-4 py-3">
                        <div className={cn("mb-3 text-sm font-semibold text-foreground", dir === "rtl" ? "text-right" : "text-left")}>
                            {t("dashboard.calendar.legendTitle")}
                        </div>

                        <div className={cn("flex flex-wrap gap-2", dir === "rtl" && "justify-end")}>
                            {kindLegend.map((item) => {
                                const Icon = kindIconMap[item.kind];
                                return (
                                    <div key={item.kind} className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-medium ${item.badgeClassName}`}>
                                        <span className={`h-2.5 w-2.5 rounded-full ${item.dotClassName}`} />
                                        <Icon className="h-3.5 w-3.5" />
                                        <span>{item.label}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <Card className="border bg-card shadow-sm">
                        <CardContent className="p-4">
                            <form className="space-y-4" onSubmit={addPlannerItem}>
                                <div className={cn("flex items-center gap-2 font-semibold text-foreground", dir === "rtl" && "flex-row-reverse justify-end")}>
                                    <CalendarPlus className="h-5 w-5" />
                                    {t("dashboard.calendar.form.title")}
                                </div>

                                <div className="grid gap-3 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="planner-title">{t("dashboard.calendar.form.itemTitle")}</Label>
                                        <Input
                                            id="planner-title"
                                            value={formTitle}
                                            onChange={(event) => setFormTitle(event.target.value)}
                                            placeholder={t("dashboard.calendar.form.titlePlaceholder")}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="planner-date">{t("dashboard.calendar.form.date")}</Label>
                                        <Input
                                            id="planner-date"
                                            type="date"
                                            value={formDate}
                                            onChange={(event) => setFormDate(event.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>{t("dashboard.calendar.form.type")}</Label>
                                    <Select value={formKind} onValueChange={(value) => setFormKind(value as PlannerEventKind)}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {allowedKinds.map((kind) => (
                                                <SelectItem key={kind} value={kind}>
                                                    {t(`dashboard.calendar.kinds.${kind}`)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="planner-description">{t("dashboard.calendar.form.description")}</Label>
                                    <Textarea
                                        id="planner-description"
                                        value={formDescription}
                                        onChange={(event) => setFormDescription(event.target.value)}
                                        placeholder={t("dashboard.calendar.form.descriptionPlaceholder")}
                                    />
                                </div>

                                <div className={cn("flex items-center gap-2", dir === "rtl" && "flex-row-reverse justify-end")}>
                                    <Checkbox
                                        id="planner-notify"
                                        checked={shouldNotify}
                                        onCheckedChange={(checked) => setShouldNotify(checked === true)}
                                    />
                                    <Label htmlFor="planner-notify" className="text-sm font-normal">
                                        {t("dashboard.calendar.form.notify")}
                                    </Label>
                                </div>

                                <Button type="submit" className="w-full gap-2" disabled={saving}>
                                    <CalendarPlus className="h-4 w-4" />
                                    {saving ? t("dashboard.calendar.form.saving") : t("dashboard.calendar.form.submit")}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    <Card className="border bg-card shadow-sm">
                        <CardContent className="space-y-1 p-4">
                            <div className={cn("text-sm text-muted-foreground", dir === "rtl" ? "text-right" : "text-left")}>{t("dashboard.calendar.selectedDay")}</div>
                            <div className={cn("text-lg font-semibold text-foreground", dir === "rtl" ? "text-right" : "text-left")}>
                                {selectedDate
                                    ? new Intl.DateTimeFormat(dir === "rtl" ? "ar" : "en", {
                                        weekday: "long",
                                        month: "long",
                                        day: "numeric",
                                        year: "numeric",
                                    }).format(selectedDate)
                                    : t("dashboard.calendar.chooseDay")}
                            </div>
                        </CardContent>
                    </Card>

                    <div className="space-y-3">
                        {selectedEvents.length ? (
                            selectedEvents.map((item) => {
                                const Icon = kindIconMap[item.kind] ?? CalendarDays;
                                return (
                                    <Card key={item.id} className="border bg-card shadow-sm">
                                        <CardContent className="space-y-3 p-4">
                                            <div className={cn("flex items-center justify-between gap-3", dir === "rtl" && "flex-row-reverse")}>
                                                <div className={cn("flex items-center gap-2", dir === "rtl" && "flex-row-reverse")}>
                                                    <Badge className={tagStyles[item.tag]}>{tagLabels[item.tag]}</Badge>
                                                    <Badge variant="outline" className="gap-1 capitalize">
                                                        <Icon className="h-3.5 w-3.5" />
                                                        {t(`dashboard.calendar.kinds.${item.kind}`)}
                                                    </Badge>
                                                </div>

                                                <div className={cn("text-lg font-bold", dir === "rtl" ? "text-left" : "text-right")}>{item.title}</div>
                                            </div>

                                            <div className={cn("flex items-center gap-2 text-sm text-muted-foreground", dir === "rtl" && "flex-row-reverse")}>
                                                <Clock3 className="h-4 w-4" />
                                                {item.date}
                                            </div>

                                            <p className={cn("text-sm leading-7 text-muted-foreground", dir === "rtl" ? "text-right" : "text-left")}>{item.description}</p>
                                        </CardContent>
                                    </Card>
                                );
                            })
                        ) : (
                            <Card className="border-dashed shadow-none">
                                <CardContent className={cn("p-6 text-sm text-muted-foreground", dir === "rtl" ? "text-right" : "text-left")}>
                                    {t("dashboard.calendar.noEvents")}
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
