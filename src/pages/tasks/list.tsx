import { useEffect, useState } from "react";
import { ListView, ListViewHeader } from "@/components/refine-ui/views/list-view";
import { DataTable } from "@/components/refine-ui/data-table/data-table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShowButton } from "@/components/refine-ui/buttons/show";
import { EditButton } from "@/components/refine-ui/buttons/edit";
import { DeleteButton } from "@/components/refine-ui/buttons/delete";
import { useTable } from "@refinedev/react-table";
import { useGetIdentity, type HttpError } from "@refinedev/core";
import type { ColumnDef } from "@tanstack/react-table";
import { API_URL } from "@/providers/constants";
import { fetchWithAuth } from "@/providers/fetcher";
import { useTranslation } from "react-i18next";

type TaskStatus =
    | "new"
    | "in_progress"
    | "submitted"
    | "needs_resubmission"
    | "completed";

type Task = {
    id: string;
    title: string;
    dueDate: string;
    assignedByName?: string | null;
    assignedByEmail?: string | null;
    createdBy?: string | null;
    status?: TaskStatus;
    assignees?: {
        studentId: string;
        name: string | null;
        email: string;
        status: TaskStatus;
    }[];
};

type TaskSummary = {
    totalTasks: number;
    submittedCount: number;
    needsResubmissionCount: number;
    completedCount: number;
    overdueTasks: number;
};

type Identity = {
    role?: "student" | "supervisor" | "management" | "donor" | "expert";
};

function SummaryCard({ label, value, hint }: { label: string; value: number; hint: string }) {
    return (
        <Card className="shadow-sm">
            <CardContent className="space-y-1 p-4">
                <div className="text-sm text-muted-foreground">{label}</div>
                <div className="text-2xl font-bold">{value}</div>
                <div className="text-xs text-muted-foreground">{hint}</div>
            </CardContent>
        </Card>
    );
}

export default function TasksList() {
    const { t } = useTranslation();
    const { data: identity } = useGetIdentity<Identity>();
    const role = identity?.role;
    const [summary, setSummary] = useState<TaskSummary | null>(null);

    useEffect(() => {
        if (role !== "management" && role !== "supervisor") return;

        let active = true;

        async function loadSummary() {
            try {
                const response = await fetchWithAuth(`${API_URL}/tasks/summary`);
                if (!response.ok) throw new Error(t("tasks.messages.failedToLoadSummary"));
                const json = (await response.json()) as TaskSummary;
                if (active) setSummary(json);
            } catch {
                if (active) setSummary(null);
            }
        }

        void loadSummary();

        return () => {
            active = false;
        };
    }, [role]);

    const table = useTable<Task, HttpError>({
        columns: [
            {
                accessorKey: "title",
                header: t("tasks.fields.title"),
            },
            {
                accessorKey: "dueDate",
                header: t("tasks.fields.dueDate"),
            },
            {
                id: "assignedBy",
                header: t("tasks.fields.assignedBy"),
                cell: ({ row }) => {
                    const assignedBy =
                        row.original.assignedByName?.trim() ||
                        row.original.assignedByEmail?.trim() ||
                        row.original.createdBy ||
                        t("common.notAvailable");

                    return <span>{assignedBy}</span>;
                },
            },
            {
                id: "assignedTo",
                header: t("tasks.fields.assignedTo"),
                cell: ({ row }) => {
                    const assignees = row.original.assignees ?? [];
                    if (assignees.length === 0) {
                        return <span className="text-muted-foreground">{t("common.notAvailable")}</span>;
                    }

                    const names = assignees.map((a) => a.name ?? a.email);
                    const first = names.slice(0, 2).join(", ");
                    const more = names.length > 2 ? ` +${names.length - 2}` : "";

                    return <span>{first}{more}</span>;
                },
            },
            {
                accessorKey: "status",
                header: t("common.status"),
                cell: ({ row, getValue }) => {
                    const directStatus = getValue<TaskStatus | undefined>();

                    if (directStatus) {
                        return <Badge variant="outline">{t(`tasks.status.${directStatus}`)}</Badge>;
                    }

                    const assignees = row.original.assignees ?? [];
                    if (assignees.length === 0) {
                        return <span className="text-muted-foreground">{t("common.notAvailable")}</span>;
                    }

                    const completed = assignees.filter((a) => a.status === "completed").length;
                    const submitted = assignees.filter((a) => a.status === "submitted").length;
                    const needsResubmission = assignees.filter(
                        (a) => a.status === "needs_resubmission",
                    ).length;

                    const summaryText = [
                        completed ? t("tasks.summary.completedCount", { count: completed }) : null,
                        submitted ? t("tasks.summary.submittedCount", { count: submitted }) : null,
                        needsResubmission ? t("tasks.summary.needsResubmissionCount", { count: needsResubmission }) : null,
                    ]
                        .filter(Boolean)
                        .join(" · ");

                    return (
                        <Badge variant="outline">
                            {summaryText || t("tasks.summary.assignedCount", { count: assignees.length })}
                        </Badge>
                    );
                },
            },
            {
                id: "actions",
                header: "",
                size: 240,
                minSize: 240,
                maxSize: 240,
                cell: ({ row }) => {
                    const id = row.original.id;
                    const isStudentRow = Boolean(row.original.status);

                    return (
                        <div className="flex min-w-[220px] justify-end gap-2 whitespace-nowrap">
                            <ShowButton resource="tasks" recordItemId={id} size="sm" />
                            {!isStudentRow ? (
                                <>
                                    <EditButton resource="tasks" recordItemId={id} size="sm" />
                                    <DeleteButton resource="tasks" recordItemId={id} size="sm" />
                                </>
                            ) : null}
                        </div>
                    );
                },
            },
        ] as ColumnDef<Task>[],
        refineCoreProps: {
            resource: "tasks",
            pagination: { pageSize: 10 },
        },
    });

    return (
        <ListView className="space-y-6">
            {(role === "management" || role === "supervisor") && summary ? (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <SummaryCard
                        label={t("tasks.summary.totalTasks")}
                        value={summary.totalTasks}
                        hint={t("tasks.summary.totalTasksHint")}
                    />
                    <SummaryCard
                        label={t("tasks.summary.overdue")}
                        value={summary.overdueTasks}
                        hint={t("tasks.summary.overdueHint")}
                    />
                    <SummaryCard
                        label={t("tasks.summary.pendingReview")}
                        value={summary.submittedCount}
                        hint={t("tasks.summary.pendingReviewHint")}
                    />
                    <SummaryCard
                        label={t("tasks.summary.needsResubmission")}
                        value={summary.needsResubmissionCount}
                        hint={t("tasks.summary.needsResubmissionHint")}
                    />
                </div>
            ) : null}

            <div className="space-y-5">
                <ListViewHeader wrapperClassName="pb-1" />
                <DataTable table={table} />
            </div>
        </ListView>
    );
}
