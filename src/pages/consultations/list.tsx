import { useEffect, useState } from "react";
import { ListView, ListViewHeader } from "@/components/refine-ui/views/list-view";
import { DataTable } from "@/components/refine-ui/data-table/data-table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ShowButton } from "@/components/refine-ui/buttons/show";
import { useTable } from "@refinedev/react-table";
import { useGetIdentity, type HttpError } from "@refinedev/core";
import type { ColumnDef } from "@tanstack/react-table";
import { API_URL } from "@/providers/constants";
import { fetchWithAuth } from "@/providers/fetcher";

type ConsultationStatus = "open" | "in_progress" | "answered" | "closed";

type Consultation = {
    id: string;
    title: string;
    status: ConsultationStatus;
    createdAt: string;
    createdByName?: string | null;
    createdByEmail?: string | null;
    messageCount?: number;
    lastMessageAt?: string | null;
};

type ConsultationSummary = {
    total: number;
    openCount: number;
    inProgressCount: number;
    answeredCount: number;
    closedCount: number;
};

type Identity = {
    role?: "student" | "supervisor" | "management" | "donor" | "expert";
};

function formatDateTime(value?: string | null) {
    if (!value) return "—";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleString();
}

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

export default function ConsultationsList() {
    const { data: identity } = useGetIdentity<Identity>();
    const role = identity?.role;
    const [summary, setSummary] = useState<ConsultationSummary | null>(null);

    useEffect(() => {
        if (role !== "management" && role !== "supervisor") return;

        let active = true;

        async function loadSummary() {
            try {
                const response = await fetchWithAuth(`${API_URL}/advice-threads/summary`);
                if (!response.ok) throw new Error("Failed to load consultation summary");
                const json = (await response.json()) as ConsultationSummary;
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

    const table = useTable<Consultation, HttpError>({
        columns: [
            {
                accessorKey: "title",
                header: "Title",
            },
            {
                accessorKey: "status",
                header: "Status",
                cell: ({ getValue }) => {
                    const status = getValue<ConsultationStatus>();
                    return <Badge variant="outline">{status}</Badge>;
                },
            },
            {
                id: "student",
                header: "Student",
                cell: ({ row }) => {
                    return row.original.createdByName ?? row.original.createdByEmail ?? "—";
                },
            },
            {
                accessorKey: "messageCount",
                header: "Messages",
                cell: ({ getValue }) => {
                    const value = getValue<number | undefined>();
                    return value ?? 0;
                },
            },
            {
                accessorKey: "lastMessageAt",
                header: "Last Activity",
                cell: ({ getValue }) => formatDateTime(getValue<string | null | undefined>()),
            },
            {
                id: "actions",
                header: "",
                cell: ({ row }) => (
                    <div className="flex justify-end gap-2">
                        <ShowButton resource="advice-threads" recordItemId={row.original.id} />
                    </div>
                ),
            },
        ] as ColumnDef<Consultation>[],
        refineCoreProps: {
            resource: "advice-threads",
            pagination: { pageSize: 10 },
        },
    });

    return (
        <ListView className="space-y-6">
            {(role === "management" || role === "supervisor") && summary ? (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <SummaryCard
                        label="Total consultations"
                        value={summary.total}
                        hint="Visible in your current scope"
                    />
                    <SummaryCard
                        label="Open"
                        value={summary.openCount}
                        hint="Waiting for a first action"
                    />
                    <SummaryCard
                        label="In progress"
                        value={summary.inProgressCount}
                        hint="Currently being handled"
                    />
                    <SummaryCard
                        label="Answered"
                        value={summary.answeredCount}
                        hint="Replied but not closed yet"
                    />
                </div>
            ) : null}

            <div>
                <ListViewHeader resource="advice-threads" />
                <DataTable table={table} />
            </div>
        </ListView>
    );
}